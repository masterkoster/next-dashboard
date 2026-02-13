import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getDemoAircraft } from "../demo-aircraft";

const prisma = new PrismaClient();

async function handler(req: NextRequest): Promise<NextResponse> {
    if (req.method !== "GET") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const { nNumber } = req.query;
  if (!nNumber || typeof nNumber !== "string") {
    return NextResponse.json({ error: "nNumber query param required" }), { status: 400 });
  }

  // Try to load real AircraftMaster row from database; fall back to demo if none
  const record = await prisma.aircraftMaster.findUnique({
    where: { nNumber: nNumber.toUpperCase() },
  });

  const data = record || getDemoAircraft(nNumber);

  return NextResponse.json({ data });
}

export { GET, POST } handler;