import { NextResponse } from 'next/server'
import { prisma } from '@/lib/auth'

const AIRNAV_SOURCE_URL = 'https://www.airnav.com'

function parseAirNavDate(dateStr?: string | null) {
  if (!dateStr) return null
  const match = dateStr.match(/(\d{1,2})-([A-Z]{3})-(\d{4})/i)
  if (!match) return null
  const [, day, mon, year] = match
  const formatted = `${mon.toUpperCase()} ${day}, ${year}`
  const parsed = new Date(formatted)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

function scrapeFuelFromAirNav(html: string, icao: string) {
  const lines = html.split('\n')
  let inFuelSection = false
  let lastReported: string | null = null
  const prices: { price100ll?: number; priceJetA?: number } = {}

  for (const line of lines) {
    const dateMatch = line.match(/Updated\s+(\d{1,2}-[A-Z]{3}-\d{4})/i)
    if (dateMatch) lastReported = dateMatch[1]

    if (line.includes('100LL') || line.includes('Jet A')) {
      inFuelSection = true
    }

    if (!inFuelSection) continue

    const priceMatch = line.match(/\$([0-9]+\.?[0-9]*)/g)
    if (!priceMatch) continue

    for (const priceStr of priceMatch) {
      const price = parseFloat(priceStr.replace('$', ''))
      if (Number.isNaN(price) || price <= 0 || price > 20) continue
      if (!prices.price100ll) {
        prices.price100ll = price
      } else if (!prices.priceJetA) {
        prices.priceJetA = price
      }
    }
  }

  return {
    icao,
    price100ll: prices.price100ll ?? null,
    priceJetA: prices.priceJetA ?? null,
    lastReported: lastReported ? parseAirNavDate(lastReported) : null,
    sourceUrl: `${AIRNAV_SOURCE_URL}/airport/${icao}`,
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const icaoParam = url.searchParams.get('icao')
    if (!icaoParam) {
      return NextResponse.json({ error: 'ICAO code required' }, { status: 400 })
    }

    const icao = icaoParam.toUpperCase()

    let cached = await prisma.fuelPriceCache.findUnique({ where: { icao } })

    if (cached && (cached.price100ll || cached.priceJetA)) {
      return NextResponse.json({
        icao,
        price100ll: cached.price100ll ? Number(cached.price100ll) : null,
        priceJetA: cached.priceJetA ? Number(cached.priceJetA) : null,
        source: cached.source ?? 'cache',
        sourceUrl: cached.source_url,
        lastReported: cached.last_reported,
        updatedAt: cached.updated_at,
      })
    }

    const response = await fetch(`${AIRNAV_SOURCE_URL}/airport/${icao}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch AirNav data' }, { status: 502 })
    }

    const html = await response.text()
    const scraped = scrapeFuelFromAirNav(html, icao)

    if (!scraped.price100ll && !scraped.priceJetA) {
      return NextResponse.json({ error: 'No fuel prices found' }, { status: 404 })
    }

    cached = await prisma.fuelPriceCache.upsert({
      where: { icao },
      create: {
        icao,
        price100ll: scraped.price100ll,
        priceJetA: scraped.priceJetA,
        source: 'airnav',
        source_url: scraped.sourceUrl,
        last_reported: scraped.lastReported ?? undefined,
        attribution: 'AirNav',
        scraped_at: new Date(),
      },
      update: {
        price100ll: scraped.price100ll,
        priceJetA: scraped.priceJetA,
        source: 'airnav',
        source_url: scraped.sourceUrl,
        last_reported: scraped.lastReported ?? undefined,
        attribution: 'AirNav',
        scraped_at: new Date(),
      },
    })

    return NextResponse.json({
      icao,
      price100ll: cached.price100ll ? Number(cached.price100ll) : null,
      priceJetA: cached.priceJetA ? Number(cached.priceJetA) : null,
      source: cached.source ?? 'airnav',
      sourceUrl: cached.source_url,
      lastReported: cached.last_reported,
      updatedAt: cached.updated_at,
    })
  } catch (error) {
    console.error('Failed to fetch fuel price', error)
    return NextResponse.json({ error: 'Failed to fetch fuel price' }, { status: 500 })
  }
}
