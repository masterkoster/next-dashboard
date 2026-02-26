import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const requests = await prisma.endorsementRequest.findMany({
    where: {
      OR: [
        { studentId: session.user.id },
        { instructorId: session.user.id },
      ],
    },
    include: { template: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ requests })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await request.json()
  const created = await prisma.endorsementRequest.create({
    data: {
      studentId: session.user.id,
      instructorId: body.instructorId,
      templateId: body.templateId || null,
      message: body.message || null,
    },
  })

  return NextResponse.json({ request: created })
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await request.json()
  const updated = await prisma.endorsementRequest.update({
    where: { id: body.id },
    data: { status: body.status },
  })

  return NextResponse.json({ request: updated })
}
