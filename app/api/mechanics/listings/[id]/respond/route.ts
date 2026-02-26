import { NextRequest, NextResponse } from 'next/server'
import { auth, prisma } from '@/lib/auth'
import { sendMechanicResponseEmail } from '@/lib/email'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'mechanic' && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Mechanic access only' }, { status: 403 })
    }

    const body = await request.json()
    const { message, quoteAmount, estimatedDays, availableDate } = body || {}

    if (!message && !quoteAmount) {
      return NextResponse.json({ error: 'Message or quote required' }, { status: 400 })
    }

    const listing = await prisma.maintenanceRequest.findUnique({
      where: { id },
      include: { postedBy: true },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const mechanic = await prisma.mechanic.findUnique({
      where: { userId: session.user.id },
    })

    if (!mechanic) {
      return NextResponse.json({ error: 'Mechanic profile not found' }, { status: 404 })
    }

    const quote = await prisma.mechanicQuote.create({
      data: {
        maintenanceRequestId: listing.id,
        mechanicId: mechanic.id,
        amount: typeof quoteAmount === 'number' ? quoteAmount : null,
        description: message ?? '',
        estimatedDays: typeof estimatedDays === 'number' ? estimatedDays : null,
        availableDate: availableDate ? new Date(availableDate) : null,
        contactMethod: 'both',
        status: 'PENDING',
      },
      include: {
        maintenanceRequest: true,
      },
    })

    if (listing.postedByEmail) {
      await sendMechanicResponseEmail(listing.postedByEmail, listing.title)
    }

    return NextResponse.json({ quote })
  } catch (error) {
    console.error('Failed to respond to listing', error)
    return NextResponse.json({ error: 'Failed to respond' }, { status: 500 })
  }
}
