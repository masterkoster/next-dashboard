"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { getDemoAircraft } from "@/lib/demo-aircraft";

const FUNCTION_URL =
  process.env.NEXT_PUBLIC_TAILHISTORY_FUNCTION_URL ||
  process.env.TAILHISTORY_FUNCTION_URL;

const STARTER_CREDITS = 50;

export type TailHistoryActionResult = {
  data?: unknown;
  error?: string;
  remainingCredits?: number;
  needsCredits?: boolean;
};

const EMAIL_CLAIMS = [
  "emails",
  "email",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
];

type ClientPrincipal = {
  claims?: { typ?: string; val?: string }[];
};

async function getEmailFromStaticWebApps(): Promise<string | null> {
  const headerList = await headers();
  const principalHeader = headerList.get("x-ms-client-principal");
  if (!principalHeader) return null;

  try {
    const decoded = Buffer.from(principalHeader, "base64").toString("utf8");
    const principal = JSON.parse(decoded) as ClientPrincipal;
    const claims = Array.isArray(principal.claims) ? principal.claims : [];
    const match = claims.find((c) => c.typ && EMAIL_CLAIMS.includes(c.typ));
    return match?.val ?? null;
  } catch {
    return null;
  }
}

export async function checkTailHistory(nNumberRaw: string): Promise<TailHistoryActionResult> {
  const nNumber = (nNumberRaw || "").trim().toUpperCase();
  if (!nNumber) return { error: "N-Number is required." };
  
  // Demo mode: return mock data when function URL is not configured
  if (!FUNCTION_URL) {
    const demoData = getDemoAircraft();
    // Override with searched N-Number for demo purposes
    const demoWithSearch = {
      ...demoData,
      nNumber: nNumber,
    };
    return { 
      data: demoWithSearch, 
      remainingCredits: 999,
      error: "Demo mode - using sample data. Deploy Azure Function for real FAA data."
    };
  }

  const email = await getEmailFromStaticWebApps();
  
  // For local development, use a default email if not authenticated
  const isLocalDev = !process.env.PRODUCTION && (
    process.env.NODE_ENV === "development" || 
    process.env.TAILHISTORY_FUNCTION_URL?.includes("localhost") ||
    !process.env.NEXT_PUBLIC_AZURE_STATIC_WEB_APPS
  );
  
  const userEmail = email || (isLocalDev ? "dev@local.test" : null);
  if (!userEmail) return { error: "No authenticated user email found." };

  // Get existing user or prepare to create
  const existingUser = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { credits: true },
  });

  // Auto top-up credits if low
  const needsTopUp = existingUser && (existingUser.credits ?? 0) < 5;

  // Upsert user, granting starter credits on first lookup or top-up
  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: needsTopUp ? { credits: { increment: STARTER_CREDITS } } : {},
    create: {
      email: userEmail,
      name: userEmail,
      purchasedModules: "[]",
      credits: STARTER_CREDITS,
    },
    select: { credits: true, email: true },
  });

  if ((user.credits ?? 0) <= 0) {
    return { needsCredits: true, remainingCredits: 0, error: "No credits remaining." };
  }

  // Decrement credits and fetch data
  const updated = await prisma.user.update({
    where: { email: userEmail },
    data: { credits: { decrement: 1 } },
    select: { credits: true },
  });

  let response;
  try {
    response = await fetch(`${FUNCTION_URL}?nNumber=${encodeURIComponent(nNumber)}`, {
      cache: "no-store",
    });
  } catch (fetchError) {
    return { 
      error: `Failed to connect to FAA service. Is the Azure Function running? Error: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`,
      remainingCredits: updated.credits 
    };
  }

  let json: unknown = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  const parsed = (json || {}) as { error?: string; data?: unknown };
  const error = parsed.error || (!response.ok ? `Request failed (${response.status})` : undefined);
  const data = parsed.data;

  return { data, error, remainingCredits: updated.credits };
}
