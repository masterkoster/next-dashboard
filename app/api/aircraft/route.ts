import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Convert FAA model to FAST designation format for matching
function convertToFASTDesignation(mfr: string, model: string): string | null {
  if (!mfr || !model) return null
  
  const mfrUpper = mfr.toUpperCase()
  const modelUpper = model.toUpperCase().replace(/\s+/g, '')
  
  // Remove common suffixes
  let cleanModel = modelUpper
    .replace(/-\d+$/, '')  // Remove trailing numbers like -200
    .replace(/\(PT17\)/, '')
    .replace(/N1$/, 'N1')
    .replace(/N1$/, 'N1')
  
  // Create possible FAST designation formats
  const formats: string[] = []
  
  // Format: B737_800, B757_200, B767_300, etc.
  if (mfrUpper.includes('BOEING')) {
    // 737-800 -> B737_800
    const match737 = cleanModel.match(/(\d{3})-(\d+)/)
    if (match737) {
      formats.push(`B${match737[1]}_${match737[2]}`)
      formats.push(`B73${match737[2]}`)
    }
    // 757-200 -> B757_200
    const match757 = cleanModel.match(/(\d{3})-(\d+)/)
    if (match757) {
      formats.push(`B${match757[1]}_${match757[2]}`)
    }
    // 767-300 -> B767_300
    const match767 = cleanModel.match(/(\d{3})-(\d+)/)
    if (match767) {
      formats.push(`B${match767[1]}_${match767[2]}`)
    }
    // 777-200 -> B772_200
    const match777 = cleanModel.match(/(\d{3})-(\d+)/)
    if (match777) {
      formats.push(`B77${match777[2]}_${match777[2]}`)
      formats.push(`B${match777[1]}_${match777[2]}`)
    }
    // 787-10 -> B788_10 (or similar)
    const match787 = cleanModel.match(/(\d{3})-(\d+)/)
    if (match787) {
      formats.push(`B78${match787[2]}_${match787[2]}`)
    }
    // 747-400 -> B744
    const match747 = cleanModel.match(/(\d{3})-(\d+)/)
    if (match747) {
      formats.push(`B74${match747[2]}`)
    }
    // 717 -> B712
    if (cleanModel.includes('717')) {
      formats.push('B712')
    }
  }
  
  // Airbus format: A320-251N -> A320_251N
  if (mfrUpper.includes('AIRBUS')) {
    const match = cleanModel.match(/A(\d{3})-(\d+)/)
    if (match) {
      formats.push(`A${match[1]}_${match[2]}`)
    }
    // A321-271NX -> A321_271NX
    const matchNX = cleanModel.match(/A(\d{3})-(\d+)(.*)/)
    if (matchNX) {
      formats.push(`A${matchNX[1]}_${matchNX[2]}${matchNX[3]}`)
    }
    // A380 -> A380
    if (cleanModel.startsWith('A380')) {
      formats.push('A380_841')
      formats.push('A380_842')
    }
    // A350 -> A350
    if (cleanModel.startsWith('A350')) {
      const match = cleanModel.match(/A350[-_]?(\d+)/)
      if (match) {
        formats.push(`A350_${match[1]}`)
      }
    }
  }
  
  // Embraer: EMB-145XR -> ERJ_145
  if (mfrUpper.includes('EMBRAER')) {
    if (cleanModel.includes('ERJ145') || cleanModel.includes('EMB145')) {
      formats.push('ERJ_145')
      if (cleanModel.includes('XR')) {
        formats.push('ERJ_145XR')
      }
    }
    if (cleanModel.includes('ERJ190') || cleanModel.includes('EMB190')) {
      formats.push('ERJ_190')
    }
    if (cleanModel.includes('ERJ170') || cleanModel.includes('EMB170')) {
      formats.push('ERJ_170')
    }
  }
  
  // Bombardier: CRJ-200 -> CRJ_200
  if (mfrUpper.includes('BOMBARDIER')) {
    const match = cleanModel.match(/CRJ[-_]?(\d+)/)
    if (match) {
      formats.push(`CRJ_${match[1]}`)
    }
  }
  
  return formats.length > 0 ? formats.join('|') : null
}

// Get performance data from FAST AEROBASE
async function getPerformanceData(mfr: string, model: string) {
  if (!mfr || !model) return null
  
  const mfrUpper = mfr.toUpperCase()
  const modelUpper = model.toUpperCase()
  
  // For now, let's try simple partial matching since FAST data is limited
  // Build search patterns based on manufacturer and model family
  
  let searchPatterns: string[] = []
  
  if (mfrUpper.includes('BOEING')) {
    // Extract model family: 737-824 -> 737, 757-222 -> 757
    const familyMatch = modelUpper.match(/(\d{3})/)
    if (familyMatch) {
      const family = familyMatch[1]  // e.g., 737, 757, 767
      // Try common variants
      searchPatterns.push(`B${family}%`)  // B737%
      searchPatterns.push(`B73${family.slice(-1)}%`)  // B738%
    }
    
    // Also try MAX variants
    if (modelUpper.includes('MAX')) {
      const maxMatch = modelUpper.match(/(\d{3})-MAX/i)
      if (maxMatch) {
        searchPatterns.push(`B73MAX%`)
      }
    }
  }
  
  if (mfrUpper.includes('AIRBUS')) {
    const familyMatch = modelUpper.match(/A(\d{3})/)
    if (familyMatch) {
      searchPatterns.push(`A${familyMatch[1]}%`)
    }
    if (modelUpper.includes('A380')) {
      searchPatterns.push('A380%')
    }
    if (modelUpper.includes('A350')) {
      searchPatterns.push('A350%')
    }
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
      const crjMatch = modelUpper.match(/CRJ[-_]?(\d+)/i)
      if (crjMatch) {
        searchPatterns.push(`CRJ_${crjMatch[1]}%`)
      }
      searchPatterns.push('CRJ_%')
    }
    if (modelUpper.includes('GLOBAL') || modelUpper.includes('CHALLENGER')) {
      searchPatterns.push('BD_%')
    }
  }
  
  // Try each pattern
  for (const pattern of searchPatterns) {
    try {
      const perf = await prisma.$queryRawUnsafe(`
        SELECT TOP 1 * FROM AircraftPerformance 
        WHERE designation LIKE @pattern
      `, { pattern })
      
      if (perf && (perf as any[]).length > 0) {
        return (perf as any[])[0]
      }
    } catch (e) {
      console.log('Query error:', e)
    }
  }
  
  return null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const nNumber = searchParams.get("nNumber")?.trim().toUpperCase()

  if (!nNumber) {
    return NextResponse.json({ error: "N-Number is required" }, { status: 400 })
  }

  try {
    const aircraft = await prisma.aircraftMaster.findUnique({
      where: { nNumber }
    })

    if (!aircraft) {
      return NextResponse.json({ 
        error: "Aircraft not found",
        searched: nNumber
      }, { status: 404 })
    }

    // Get performance data from FAST AEROBASE
    const performance = await getPerformanceData(aircraft.mfr || '', aircraft.model || '')

    return NextResponse.json({
      data: {
        nNumber: aircraft.nNumber,
        manufacturer: aircraft.mfr,
        model: aircraft.model,
        serialNumber: aircraft.serialNumber,
        status: aircraft.statusCode,
        airworthinessDate: aircraft.airWorthDate,
        lastActionDate: aircraft.lastActionDate,
        ownerName: aircraft.name,
        typeRegistrant: aircraft.typeRegistrant,
        engineManufacturer: aircraft.engMfr,
        engineModel: aircraft.engineModel,
        engineCount: aircraft.engCount,
      },
      performance: performance ? {
        designation: performance.designation,
        manufacturer: performance.manufacturer,
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
      } : null
    })
  } catch (error) {
    console.error("Aircraft lookup error:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
