import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
      }
    })
  } catch (error) {
    console.error("Aircraft lookup error:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
