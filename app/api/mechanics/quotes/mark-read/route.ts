import { NextResponse } from 'next/server'
import { auth, prisma } from '@/lib/auth'

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: { mechanicInboxLastViewed: new Date() },
      create: {
        userId: session.user.id,
        mechanicInboxLastViewed: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to mark mechanic inbox read', error)
    return NextResponse.json({ error: 'Failed to update inbox read status' }, { status: 500 })
  }
}
