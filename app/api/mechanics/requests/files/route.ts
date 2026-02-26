import { NextResponse } from 'next/server'
import { auth, prisma } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const requests = await prisma.mechanicFileRequest.findMany({
      where: {
        maintenanceRequest: {
          postedByUserId: session.user.id,
        },
      },
      include: {
        mechanic: true,
        maintenanceRequest: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Failed to load file requests', error)
    return NextResponse.json({ error: 'Failed to load file requests' }, { status: 500 })
  }
}
