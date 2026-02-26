import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await request.json()
  const hash = crypto.createHash('sha256').update(`${body.typedName || ''}${body.svgData || ''}${Date.now()}`).digest('hex')

  const signature = await prisma.signature.create({
    data: {
      userId: session.user.id,
      type: body.type || 'drawn',
      svgData: body.svgData || null,
      typedName: body.typedName || null,
      certNumber: body.certNumber || null,
      ipAddress: body.ipAddress || null,
      userAgent: body.userAgent || null,
      hash,
    },
  })

  const endorsement = await prisma.endorsement.create({
    data: {
      templateId: body.templateId,
      studentId: body.studentId,
      instructorId: session.user.id,
      signatureId: signature.id,
      logbookEntryId: body.logbookEntryId || null,
      notes: body.notes || null,
    },
  })

  return NextResponse.json({ endorsement })
}
