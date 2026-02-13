"use server";

import { headers } from "next/headers";
import { getDemoAircraft } from "@/lib/demo-aircraft";

const FUNCTION_URL =
  process.env.NEXT_PUBLIC_TAILHISTORY_FUNCTION_URL ||
  process.env.TAILHISTORY_FUNCTION_URL;

export type TailHistoryActionResult = {
  data?: unknown;
  error?: string;
  remainingCredits?: number;
  needsCredits?: boolean;
};

export async function checkTailHistory(nNumberRaw: string): Promise<TailHistoryActionResult> {
  const nNumber = (nNumberRaw || "").trim().toUpperCase();
  if (!nNumber) return { error: "N-Number is required." };
  
  // Demo mode: return mock data when function URL is not configured
  if (!FUNCTION_URL) {
    const demoData = getDemoAircraft();
    const demoWithSearch = {
      ...demoData,
      nNumber: nNumber,
    };
    return { 
      data: demoWithSearch, 
      remainingCredits: 999,
      error: "Demo mode - using sample data."
    };
  }

  // Fetch from Azure Function
  let response;
  try {
    response = await fetch(`${FUNCTION_URL}?nNumber=${encodeURIComponent(nNumber)}`, {
      cache: "no-store",
    });
  } catch (fetchError) {
    return { 
      error: `Failed to connect to FAA service: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`,
      remainingCredits: 999
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

  if (error && !data) {
    return { error, remainingCredits: 999 };
  }

  return { data, remainingCredits: 999 };
}
