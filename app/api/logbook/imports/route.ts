import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const imports = await prisma.logbookImport.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ imports })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json()
  const created = await prisma.logbookImport.create({
    data: {
      userId: session.user.id,
      source: body.source || 'CSV',
      fileUrl: body.fileUrl || null,
      summaryJson: body.summaryJson || null,
    },
  })

  return NextResponse.json({ import: created })
}
