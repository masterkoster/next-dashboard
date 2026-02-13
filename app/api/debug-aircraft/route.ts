import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Try to get table info via raw query
    const result = await prisma.$queryRaw`SELECT TOP 5 * FROM AircraftMaster`
    
    return NextResponse.json({ 
      success: true, 
      data: result 
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || String(error),
      hint: "Table may not exist"
    }, { status: 500 })
  }
}
