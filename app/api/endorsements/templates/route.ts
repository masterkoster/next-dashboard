import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ENDORSEMENT_TEMPLATES } from '@/lib/endorsements/templates'

export async function POST() {
  try {
    const existing = await prisma.endorsementTemplate.findFirst()
    if (existing) {
      return NextResponse.json({ message: 'Templates already seeded' })
    }

    await prisma.endorsementTemplate.createMany({
      data: ENDORSEMENT_TEMPLATES.map((tpl) => ({
        authority: tpl.authority,
        name: tpl.name,
        code: tpl.code,
        category: tpl.category,
        text: tpl.text,
      })),
    })

    return NextResponse.json({ message: 'Templates seeded' })
  } catch (error) {
    console.error('Failed to seed endorsements', error)
    return NextResponse.json({ error: 'Failed to seed templates' }, { status: 500 })
  }
}

export async function GET() {
  const templates = await prisma.endorsementTemplate.findMany({
    orderBy: [{ authority: 'asc' }, { name: 'asc' }],
  })
  return NextResponse.json({ templates })
}
