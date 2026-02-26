import { NextResponse } from 'next/server'
import { auth, prisma } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'mechanic') {
      return NextResponse.json({ error: 'Mechanic access only' }, { status: 403 })
    }

    const mechanic = await prisma.mechanic.findUnique({
      where: { userId: session.user.id },
    })

    if (!mechanic) {
      return NextResponse.json({ error: 'Mechanic profile not found' }, { status: 404 })
    }

    return NextResponse.json(mechanic)
  } catch (error) {
    console.error('Failed to fetch mechanic profile', error)
    return NextResponse.json({ error: 'Failed to fetch mechanic profile' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'mechanic') {
      return NextResponse.json({ error: 'Mechanic access only' }, { status: 403 })
    }

    const body = await request.json()
    const {
      businessName,
      phone,
      city,
      state,
      locationIcao,
      locationLat,
      locationLng,
      locationPrivacy,
      serviceRadiusNm,
      serviceArea,
      specialties,
      bio,
      yearsExperience,
      certifications,
      certificateNumber,
      iaNumber,
      a_pLicense,
      expiryDate,
      hourlyRate,
      travelFee,
    } = body || {}

    const mechanic = await prisma.mechanic.upsert({
      where: { userId: session.user.id },
      update: {
        businessName: businessName ?? null,
        phone: phone ?? null,
        city: city ?? null,
        state: state ?? null,
        locationIcao: locationIcao ?? null,
        locationLat: typeof locationLat === 'number' ? locationLat : null,
        locationLng: typeof locationLng === 'number' ? locationLng : null,
        locationPrivacy: locationPrivacy ?? 'CITY',
        serviceRadiusNm: typeof serviceRadiusNm === 'number' ? serviceRadiusNm : null,
        serviceArea: serviceArea ?? null,
        specialties: specialties ?? null,
        bio: bio ?? null,
        yearsExperience: typeof yearsExperience === 'number' ? yearsExperience : 0,
        certifications: certifications ?? null,
        certificateNumber: certificateNumber ?? null,
        iaNumber: iaNumber ?? null,
        a_pLicense: a_pLicense ?? null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        hourlyRate: typeof hourlyRate === 'number' ? hourlyRate : null,
        travelFee: typeof travelFee === 'number' ? travelFee : null,
      },
      create: {
        userId: session.user.id,
        email: session.user.email || '',
        name: session.user.name || session.user.email || 'Mechanic',
        businessName: businessName ?? null,
        phone: phone ?? null,
        city: city ?? null,
        state: state ?? null,
        locationIcao: locationIcao ?? null,
        locationLat: typeof locationLat === 'number' ? locationLat : null,
        locationLng: typeof locationLng === 'number' ? locationLng : null,
        locationPrivacy: locationPrivacy ?? 'CITY',
        serviceRadiusNm: typeof serviceRadiusNm === 'number' ? serviceRadiusNm : null,
        serviceArea: serviceArea ?? null,
        specialties: specialties ?? null,
        bio: bio ?? null,
        yearsExperience: typeof yearsExperience === 'number' ? yearsExperience : 0,
        certifications: certifications ?? null,
        certificateNumber: certificateNumber ?? null,
        iaNumber: iaNumber ?? null,
        a_pLicense: a_pLicense ?? null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        hourlyRate: typeof hourlyRate === 'number' ? hourlyRate : null,
        travelFee: typeof travelFee === 'number' ? travelFee : null,
      },
    })

    return NextResponse.json(mechanic)
  } catch (error) {
    console.error('Failed to save mechanic profile', error)
    return NextResponse.json({ error: 'Failed to save mechanic profile' }, { status: 500 })
  }
}
