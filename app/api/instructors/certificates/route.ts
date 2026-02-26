import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await request.json()
  if (!body.fileUrl || !body.fileName) {
    return NextResponse.json({ error: 'Missing file info' }, { status: 400 })
  }

  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!profile) {
    return NextResponse.json({ error: 'Instructor profile not found' }, { status: 404 })
  }

  const cert = await prisma.instructorCertificate.create({
    data: {
      instructorId: profile.id,
      fileUrl: body.fileUrl,
      fileName: body.fileName,
      mimeType: body.mimeType,
    },
  })

  return NextResponse.json({ certificate: cert })
}
