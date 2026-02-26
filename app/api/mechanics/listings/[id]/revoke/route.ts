import { NextResponse } from 'next/server'
import { auth, prisma } from '@/lib/auth'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const listing = await prisma.maintenanceRequest.findUnique({ where: { id } })

    if (!listing || listing.postedByUserId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: { status: 'REVOKED' },
    })

    return NextResponse.json({ listing: updated })
  } catch (error) {
    console.error('Failed to revoke listing', error)
    return NextResponse.json({ error: 'Failed to revoke listing' }, { status: 500 })
  }
}
