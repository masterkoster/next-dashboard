import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const count = await prisma.aircraftMaster.count()
    const sample = await prisma.aircraftMaster.findMany({ take: 5 })
    
    return NextResponse.json({
      totalAircraft: count,
      sample: sample.map(a => ({
        nNumber: a.nNumber,
        mfr: a.mfr,
        model: a.model
      }))
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
