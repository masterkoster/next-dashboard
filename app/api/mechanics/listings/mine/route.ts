import { NextResponse } from 'next/server'
import { auth, prisma } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const listings = await prisma.maintenanceRequest.findMany({
      where: { postedByUserId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ listings })
  } catch (error) {
    console.error('Failed to fetch user listings', error)
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }
}
