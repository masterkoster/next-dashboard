import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const manufacturer = searchParams.get("manufacturer") || "";
  const model = searchParams.get("model") || "";
  const yearFrom = searchParams.get("yearFrom") || "";
  const yearTo = searchParams.get("yearTo") || "";
  const status = searchParams.get("status") || "";
  const typeRegistrant = searchParams.get("typeRegistrant") || "";

  try {
    // Build where clause
    const where: any = {};
    
    if (manufacturer) {
      where.MFR = { contains: manufacturer.toUpperCase() };
    }
    
    if (model) {
      where.MODEL = { contains: model.toUpperCase() };
    }
    
    if (status) {
      where.STATUS_CODE = status;
    }
    
    if (typeRegistrant) {
      where.TYPE_REGISTRANT = typeRegistrant;
    }
    
    // Note: YEAR MFR field would need to be added to database for year filtering
    
    const results = await prisma.aircraftMaster.findMany({
      where,
      take: 100,
      orderBy: { nNumber: 'asc' }
    });

    return NextResponse.json({
      results: results.map(r => ({
        nNumber: r.nNumber,
        serialNumber: r.serialNumber,
        manufacturer: r.mfr,
        model: r.model,
        status: r.statusCode,
        typeRegistrant: r.typeRegistrant,
        lastActionDate: r.lastActionDate,
        airWorthDate: r.airWorthDate,
        name: r.name,
      }))
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
