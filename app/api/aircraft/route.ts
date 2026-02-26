import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const aircraft = await prisma.aircraftProfile.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ aircraft })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json()
  if (!body.nNumber) return NextResponse.json({ error: 'N-Number required' }, { status: 400 })

  const created = await prisma.aircraftProfile.create({
    data: {
      userId: session.user.id,
      nNumber: body.nNumber,
      nickname: body.nickname || null,
      categoryClass: body.categoryClass || null,
      engineType: body.engineType || null,
      notes: body.notes || null,
    },
  })

  return NextResponse.json({ aircraft: created })
}
