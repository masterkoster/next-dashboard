import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const deadlines = await prisma.logbookDeadline.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ deadlines })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json()
  const deadline = await prisma.logbookDeadline.create({
    data: {
      userId: session.user.id,
      name: body.name,
      aircraftId: body.aircraftId || null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      dueHours: body.dueHours || null,
      hourType: body.hourType || null,
      notes: body.notes || null,
    },
  })

  return NextResponse.json({ deadline })
}
