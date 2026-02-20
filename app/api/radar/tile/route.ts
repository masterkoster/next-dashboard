import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function isValidInt(value: string | null) {
  if (!value) return false;
  return /^\d+$/.test(value);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const time = url.searchParams.get('time');
    const z = url.searchParams.get('z');
    const x = url.searchParams.get('x');
    const y = url.searchParams.get('y');

    if (!isValidInt(time) || !isValidInt(z) || !isValidInt(x) || !isValidInt(y)) {
      return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
    }

    const upstreamUrl = `https://tilecache.rainviewer.com/v2/radar/${time}/${z}/${x}/${y}/2/1_1.png`;
    const upstream = await fetch(upstreamUrl, {
      cache: 'force-cache',
      next: { revalidate: 3600 },
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: 'Tile unavailable' }, { status: 502 });
    }

    const contentType = upstream.headers.get('content-type') || 'image/png';
    const arrayBuffer = await upstream.arrayBuffer();

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Cache at edge and in browser to reduce tile proxy load.
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Radar tile proxy failed', error);
    return NextResponse.json({ error: 'Failed to load tile' }, { status: 500 });
  }
}
