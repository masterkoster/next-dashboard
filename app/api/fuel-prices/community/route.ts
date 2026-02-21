import { NextResponse } from 'next/server';
import { auth, prisma } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    const body = await request.json();
    const { icao, fbo, fuelType, price, purchaseDate } = body;

    // Validate required fields
    if (!icao || !fuelType || !price || !purchaseDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['100LL', 'JetA'].includes(fuelType)) {
      return NextResponse.json({ error: 'Invalid fuel type' }, { status: 400 });
    }

    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum <= 0 || priceNum > 50) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
    }

    const date = new Date(purchaseDate);
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
    }

    // Don't allow future dates or dates more than 2 years ago
    const now = new Date();
    const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
    if (date > now || date < twoYearsAgo) {
      return NextResponse.json({ error: 'Date must be within the last 2 years' }, { status: 400 });
    }

    // Store the community fuel price
    const communityPrice = await prisma.communityFuelPrice.create({
      data: {
        icao: icao.toUpperCase(),
        fbo: fbo?.trim() || null,
        fuelType,
        price: priceNum,
        purchaseDate: date,
        userId: session?.user?.id || null,
      },
    });

    return NextResponse.json({ success: true, id: communityPrice.id });
  } catch (error) {
    console.error('Community fuel price submission failed', error);
    return NextResponse.json({ error: 'Failed to submit price' }, { status: 500 });
  }
}

// GET - fetch community prices for an airport or multiple airports
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const icaos = url.searchParams.get('icaos')?.split(',').map(i => i.trim().toUpperCase()).filter(Boolean);

    if (!icaos || icaos.length === 0) {
      return NextResponse.json({ error: 'No airports specified' }, { status: 400 });
    }

    // Get the latest community price for each fuel type at each airport
    const communityPrices = await prisma.communityFuelPrice.findMany({
      where: {
        icao: { in: icaos },
      },
      orderBy: { purchaseDate: 'desc' },
    });

    // Group by airport and fuel type, keeping only the most recent
    const latestByAirportAndType: Record<string, any> = {};
    for (const p of communityPrices) {
      const key = `${p.icao}-${p.fuelType}`;
      if (!latestByAirportAndType[key]) {
        latestByAirportAndType[key] = {
          ...p,
          price: Number(p.price)
        };
      }
    }

    return NextResponse.json({ prices: Object.values(latestByAirportAndType) });
  } catch (error) {
    console.error('Failed to fetch community prices', error);
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 });
  }
}

type CommunityFuelPrice = {
  id: string;
  icao: string;
  fbo: string | null;
  fuelType: string;
  price: number;
  purchaseDate: Date;
  userId: string | null;
  createdAt: Date;
};
