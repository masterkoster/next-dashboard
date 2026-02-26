import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const templates = await prisma.logbookTemplate.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ templates })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json()
  const template = await prisma.logbookTemplate.create({
    data: {
      userId: session.user.id,
      name: body.name,
      description: body.description || null,
      fieldsJson: body.fieldsJson || null,
    },
  })

  return NextResponse.json({ template })
}
