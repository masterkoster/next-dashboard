import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
    include: { certificates: true },
  })

  return NextResponse.json({ profile })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await request.json()

  const profile = await prisma.instructorProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      certificateNumber: body.certificateNumber,
      certificateType: body.certificateType,
      certificateIssuer: body.certificateIssuer,
      certificateExpires: body.certificateExpires ? new Date(body.certificateExpires) : null,
    },
    update: {
      certificateNumber: body.certificateNumber,
      certificateType: body.certificateType,
      certificateIssuer: body.certificateIssuer,
      certificateExpires: body.certificateExpires ? new Date(body.certificateExpires) : null,
    },
  })

  return NextResponse.json({ profile })
}
