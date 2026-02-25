import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/engine/anomalies
// Get engine anomalies for user's aircraft
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const aircraftId = searchParams.get('aircraftId')
    const severity = searchParams.get('severity') // CRITICAL, WARNING, INFO
    const acknowledged = searchParams.get('acknowledged') // true, false
    
    const where: any = {
      userId: session.user.id,
    }
    
    if (aircraftId) {
      where.aircraftId = aircraftId
    }
    
    if (severity) {
      where.severity = severity
    }
    
    if (acknowledged !== null) {
      where.acknowledged = acknowledged === 'true'
    }
    
    const anomalies = await prisma.engineAnomaly.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    
    // Get counts by severity
    const counts = await prisma.engineAnomaly.groupBy({
      by: ['severity', 'acknowledged'],
      where: {
        userId: session.user.id,
        aircraftId: aircraftId || undefined,
      },
      _count: true,
    })
    
    return NextResponse.json({
      anomalies,
      counts: {
        critical: counts.find(c => c.severity === 'CRITICAL' && !c.acknowledged)?._count || 0,
        warning: counts.find(c => c.severity === 'WARNING' && !c.acknowledged)?._count || 0,
        info: counts.find(c => c.severity === 'INFO' && !c.acknowledged)?._count || 0,
      }
    })
  } catch (error) {
    console.error('Error fetching anomalies:', error)
    return NextResponse.json({ error: 'Failed to fetch anomalies' }, { status: 500 })
  }
}

// PATCH /api/engine/anomalies
// Acknowledge an anomaly
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { anomalyId, acknowledge } = body
    
    if (!anomalyId) {
      return NextResponse.json({ error: 'anomalyId required' }, { status: 400 })
    }
    
    const anomaly = await prisma.engineAnomaly.update({
      where: { id: anomalyId },
      data: {
        acknowledged: acknowledge,
        acknowledgedBy: session.user.id,
        acknowledgedAt: acknowledge ? new Date() : null,
      }
    })
    
    return NextResponse.json(anomaly)
  } catch (error) {
    console.error('Error updating anomaly:', error)
    return NextResponse.json({ error: 'Failed to update anomaly' }, { status: 500 })
  }
}
