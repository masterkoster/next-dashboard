import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const res = await fetch('https://api.rainviewer.com/public/weather-maps.json', {
      // Avoid caching issues across regions.
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Upstream unavailable' }, { status: 502 });
    }

    const data = await res.json();
    const past = Array.isArray(data?.radar?.past) ? data.radar.past : [];
    const nowcast = Array.isArray(data?.radar?.nowcast) ? data.radar.nowcast : [];

    const frames = [...past, ...nowcast]
      .filter((t: any) => typeof t?.time === 'number')
      .map((t: any) => ({ time: t.time as number }));

    return NextResponse.json(
      {
        provider: 'rainviewer',
        frames,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
        },
      }
    );
  } catch (error) {
    console.error('Radar frames proxy failed', error);
    return NextResponse.json({ error: 'Failed to load radar frames' }, { status: 500 });
  }
}
