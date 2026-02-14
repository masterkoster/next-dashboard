import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET /api/aircraft/search/options
// Returns list of manufacturers and models for dropdowns
export async function GET() {
  try {
    // Get distinct manufacturers
    const manufacturers = await prisma.aircraftMaster.findMany({
      select: { mfr: true },
      distinct: ['mfr'],
      where: { mfr: { not: null } },
      orderBy: { mfr: 'asc' }
    });

    const mfrList = manufacturers
      .map(m => m.mfr)
      .filter(Boolean)
      .sort();

    return NextResponse.json({
      manufacturers: mfrList
    });
  } catch (error) {
    console.error("Options error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
