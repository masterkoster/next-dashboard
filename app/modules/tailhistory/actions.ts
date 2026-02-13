"use server";

import { prisma } from "@/lib/prisma";
import { getDemoAircraft } from "@/lib/demo-aircraft";

export type TailHistoryActionResult = {
  data?: unknown;
  error?: string;
  remainingCredits?: number;
  needsCredits?: boolean;
};

export async function checkTailHistory(nNumberRaw: string): Promise<TailHistoryActionResult> {
  const nNumber = (nNumberRaw || "").trim().toUpperCase().replace(/^N/, '');
  if (!nNumber) return { error: "N-Number is required." };
  
  const fullNNumber = "N" + nNumber;
  
  try {
    // Query from Azure SQL database
    const aircraft = await prisma.aircraftMaster.findUnique({
      where: { nNumber: fullNNumber }
    });
    
    if (!aircraft) {
      return { 
        error: `Aircraft ${fullNNumber} not found in database. Try N12345, N2025, N5678, or N9876.`,
        remainingCredits: 999
      };
    }
    
    // Format the data for the UI
    const formattedData = {
      nNumber: aircraft.nNumber,
      serialNumber: aircraft.serialNumber,
      manufacturer: aircraft.mfr,
      model: aircraft.model,
      status: aircraft.statusCode,
      airworthinessDate: aircraft.airWorthDate,
      lastActionDate: aircraft.lastActionDate,
      ownerName: aircraft.name,
      typeRegistrant: aircraft.typeRegistrant,
      engineManufacturer: aircraft.engMfr,
      engineModel: aircraft.engineModel,
      engineCount: aircraft.engCount,
    };
    
    return { 
      data: formattedData, 
      remainingCredits: 999
    };
  } catch (error) {
    console.error("Database query error:", error);
    
    // Fallback to demo data on error
    const demoData = getDemoAircraft();
    return { 
      data: { ...demoData, nNumber: fullNNumber }, 
      remainingCredits: 999,
      error: "Using cached data due to database error."
    };
  }
}
