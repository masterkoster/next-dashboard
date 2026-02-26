import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const rules = await prisma.logbookCustomRule.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ rules })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json()
  const rule = await prisma.logbookCustomRule.create({
    data: {
      userId: session.user.id,
      name: body.name,
      ruleJson: body.ruleJson,
    },
  })

  return NextResponse.json({ rule })
}
