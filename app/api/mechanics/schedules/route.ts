import { NextResponse } from 'next/server'
import { auth, prisma } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'mechanic' && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Mechanic access only' }, { status: 403 })
    }

    const body = await request.json()
    const { maintenanceRequestId, mechanicQuoteId, scheduledFor, estimatedHours, location, notes } = body || {}

    if (!maintenanceRequestId || !mechanicQuoteId || !scheduledFor) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const schedule = await prisma.mechanicJobSchedule.create({
      data: {
        maintenanceRequestId,
        mechanicQuoteId,
        scheduledFor: new Date(scheduledFor),
        estimatedHours: typeof estimatedHours === 'number' ? estimatedHours : null,
        location: location ?? null,
        notes: notes ?? null,
      },
    })

    await prisma.maintenanceRequest.update({
      where: { id: maintenanceRequestId },
      data: { status: 'IN_PROGRESS' },
    })

    return NextResponse.json({ schedule })
  } catch (error) {
    console.error('Failed to create schedule', error)
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 })
  }
}
