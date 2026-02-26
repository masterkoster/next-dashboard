import { NextResponse } from 'next/server'
import { prisma } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')?.trim() || ''
    const cert = url.searchParams.get('cert')?.trim() || ''

    const mechanics = await prisma.mechanic.findMany({
      where: {
        isActive: true,
        ...(query
          ? {
              OR: [
                { city: { contains: query, mode: 'insensitive' } },
                { state: { contains: query, mode: 'insensitive' } },
                { locationIcao: { contains: query, mode: 'insensitive' } },
                { businessName: { contains: query, mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(cert
          ? {
              certifications: { contains: cert, mode: 'insensitive' },
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        businessName: true,
        city: true,
        state: true,
        locationIcao: true,
        locationLat: true,
        locationLng: true,
        locationPrivacy: true,
        certifications: true,
        specialties: true,
        rating: true,
        reviewCount: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 200,
    })

    return NextResponse.json({ mechanics })
  } catch (error) {
    console.error('Failed to search mechanics', error)
    return NextResponse.json({ error: 'Failed to search mechanics' }, { status: 500 })
  }
}
