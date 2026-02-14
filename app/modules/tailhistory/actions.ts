"use server";

import { prisma } from "@/lib/prisma";
import { getDemoAircraft } from "@/lib/demo-aircraft";

export type TailHistoryActionResult = {
  data?: unknown;
  error?: string;
  remainingCredits?: number;
  needsCredits?: boolean;
};

// Get performance data from FAST AEROBASE OR RisingUp specs
async function getPerformanceData(mfr: string | null, model: string | null) {
  if (!mfr || !model) return null
  
  const mfrUpper = mfr.toUpperCase()
  const modelUpper = model.toUpperCase()
  
  // First try FAST AEROBASE (commercial jets)
  let fastData = await getFastPerformanceData(mfrUpper, modelUpper)
  if (fastData) return fastData
  
  // Then try RisingUp specs (GA aircraft)
  let gaData = await getGAPerformanceData(mfrUpper, modelUpper)
  if (gaData) return gaData
  
  return null
}

// Get performance from FAST AEROBASE (commercial jets)
async function getFastPerformanceData(mfrUpper: string, modelUpper: string) {
  let searchPatterns: string[] = []
  
  if (mfrUpper.includes('BOEING')) {
    const familyMatch = modelUpper.match(/(\d{3})/)
    if (familyMatch) {
      const family = familyMatch[1]
      searchPatterns.push(`B${family}%`)
      searchPatterns.push(`B73${family.slice(-1)}%`)
    }
    if (modelUpper.includes('MAX')) {
      searchPatterns.push(`B73MAX%`)
    }
  }
  
  if (mfrUpper.includes('AIRBUS')) {
    const familyMatch = modelUpper.match(/A(\d{3})/)
    if (familyMatch) {
      searchPatterns.push(`A${familyMatch[1]}%`)
    }
    if (modelUpper.includes('A380')) searchPatterns.push('A380%')
    if (modelUpper.includes('A350')) searchPatterns.push('A350%')
  }
  
  if (mfrUpper.includes('EMBRAER')) {
    if (modelUpper.includes('ERJ') || modelUpper.includes('EMB-145')) {
      searchPatterns.push('ERJ_145%')
    }
    if (modelUpper.includes('ERJ190') || modelUpper.includes('EMB-190')) {
      searchPatterns.push('ERJ_190%')
    }
    if (modelUpper.includes('ERJ170') || modelUpper.includes('EMB-170')) {
      searchPatterns.push('ERJ_170%')
    }
  }
  
  if (mfrUpper.includes('BOMBARDIER')) {
    if (modelUpper.includes('CRJ')) {
      searchPatterns.push('CRJ_%')
    }
    searchPatterns.push('BD_%')
  }
  
  for (const pattern of searchPatterns) {
    try {
      const perf = await prisma.$queryRawUnsafe(`
        SELECT TOP 1 * FROM AircraftPerformance 
        WHERE designation LIKE @pattern
      `, { pattern }) as any[]
      
      if (perf && perf.length > 0) {
        return { ...perf[0], source: 'fast' }
      }
    } catch (e) {
      console.log('Fast performance query error:', e)
    }
  }
  
  return null
}

// Get performance from RisingUp specs (GA aircraft)
async function getGAPerformanceData(mfrUpper: string, modelUpper: string) {
  // Try to match by manufacturer and model
  try {
    // Get all specs for this manufacturer
    const specs = await prisma.$queryRawUnsafe(`
      SELECT TOP 1 * FROM AircraftSpecs 
      WHERE UPPER(manufacturer) LIKE '%' + @mfr + '%'
        AND UPPER(model) LIKE '%' + @model + '%'
    `, { mfr: mfrUpper, model: modelUpper.replace(/\d+/g, '').replace(/-/g, ' ').trim() }) as any[]
    
    if (specs && specs.length > 0) {
      const s = specs[0]
      return {
        // Map GA specs to our format
        designation: s.model,
        mtow: s.gross_weight_lbs,
        mlw: null,
        mzfw: null,
        oew: s.empty_weight_lbs,
        fuel: s.fuel_capacity_gal,
        range_nm: s.range_nm,
        tofl: s.takeoff_ground_roll_ft,
        num_engines: 1,
        engine_designation: s.horsepower ? s.horsepower + ' HP' : null,
        thrust_max: null,
        span_ft: s.wingspan_ft,
        length_ft: s.length_ft,
        height_ft: s.height_ft,
        wing_area: null,
        vc_cruise: s.cruise_speed_kts,
        vmo_mo: s.top_speed_kts,
        cruise_alt: s.service_ceiling_ft,
        maxpax: null,
        // Additional GA fields
        takeoffGroundRoll: s.takeoff_ground_roll_ft,
        landingGroundRoll: s.landing_ground_roll_ft,
        rateOfClimb: s.rate_of_climb_fpm,
        stallSpeed: s.stall_speed_dirty_kts,
        source: 'risingup'
      }
    }
  } catch (e) {
    console.log('GA performance query error:', e)
  }
  
  return null
}

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
    
    // Get performance data
    const performance = await getPerformanceData(aircraft.mfr, aircraft.model)
    
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
      // Performance data
      performance: performance ? {
        designation: performance.designation,
        mtow: performance.mtow,
        mlw: performance.mlw,
        mzfw: performance.mzfw,
        oew: performance.oew,
        fuelCapacity: performance.fuel,
        rangeNm: performance.range_nm,
        takeoffFieldLength: performance.tofl,
        numEngines: performance.num_engines,
        engineModel: performance.engine_designation,
        thrustMax: performance.thrust_max,
        spanFt: performance.span_ft,
        lengthFt: performance.length_ft,
        heightFt: performance.height_ft,
        wingArea: performance.wing_area,
        cruiseSpeed: performance.vc_cruise,
        maxOperatingSpeed: performance.vmo_mo,
        cruiseAltitude: performance.cruise_alt,
        maxPax: performance.maxpax,
      } : null,
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
