import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const prefs = await prisma.logbookPreferences.findUnique({
    where: { userId: session.user.id },
  })

  return NextResponse.json({ preferences: prefs })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await request.json()

  const prefs = await prisma.logbookPreferences.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      ...body,
    },
    update: {
      ...body,
    },
  })

  return NextResponse.json({ preferences: prefs })
}
