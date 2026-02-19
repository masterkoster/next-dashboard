import { NextResponse } from 'next/server';

// Demo NOTAMs for when API is unavailable
const demoNotams: Record<string, Array<{
  id: string;
  category: 'TFR' | 'RUNWAY' | 'NAVAID' | 'OBSTACLE' | 'AIRSPACE' | 'GENERAL';
  title: string;
  description: string;
  startDate: string;
  endDate: string;
}>> = {
  'KJFK': [
    { id: '1', category: 'RUNWAY', title: 'RWY 4L/22R CLSD', description: 'Runway 4L/22R closed for maintenance until 28-Feb', startDate: '2026-02-15', endDate: '2026-02-28' },
    { id: '2', category: 'GENERAL', title: 'ARTS SITE', description: 'Beacon out of service', startDate: '2026-02-10', endDate: '2026-03-01' },
  ],
  'KLAX': [
    { id: '3', category: 'TFR', title: 'SPACE OPS', description: 'TFR - Space vehicle launch operations', startDate: '2026-02-20', endDate: '2026-02-20' },
    { id: '4', category: 'RUNWAY', title: 'RWY 25L CLSD', description: 'Runway 25L closed for construction', startDate: '2026-02-01', endDate: '2026-04-30' },
  ],
  'KORF': [
    { id: '5', category: 'AIRSPACE', title: 'MIL OPERS', description: 'Military operations in area', startDate: '2026-02-18', endDate: '2026-02-18' },
  ],
  'KDCA': [
    { id: '6', category: 'RUNWAY', title: 'RWY 1/19 CLSD', description: 'Runway closed - construction', startDate: '2026-02-15', endDate: '2026-03-01' },
  ],
  'KMIA': [
    { id: '7', category: 'OBSTACLE', title: 'CRANE', description: 'Crane in vicinity of airport - 150ft AGL', startDate: '2026-02-10', endDate: '2026-03-15' },
  ],
  'KORD': [
    { id: '8', category: 'TFR', title: 'VIP MOVEMENT', description: 'TFR - Presidential movement', startDate: '2026-02-22', endDate: '2026-02-22' },
  ],
};

// Default NOTAMs for unknown airports
const defaultNotams = [
  { id: 'demo1', category: 'GENERAL' as const, title: 'Check NOTAMs', description: 'Contact FBO or Flight Service for current NOTAMs', startDate: '', endDate: '' },
];

interface ParsedNotam {
  id: string;
  icao: string;
  category: 'TFR' | 'RUNWAY' | 'NAVAID' | 'OBSTACLE' | 'AIRSPACE' | 'GENERAL';
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
}

// GET /api/notams?icaos=KJFK,KLAX
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const icaos = searchParams.get('icaos');
    
    if (!icaos) {
      return NextResponse.json(
        { error: 'Missing icaos parameter' },
        { status: 400 }
      );
    }
    
    const icaoList = icaos.split(',').map(i => i.trim().toUpperCase()).filter(i => i && i.startsWith('K'));
    
    if (icaoList.length === 0) {
      return NextResponse.json({
        notams: [],
        count: 0,
        message: 'No valid US airport ICAOs provided (must start with K)',
        timestamp: new Date().toISOString()
      });
    }
    
    // Limit to 10 airports per request
    const limitedIcaos = icaoList.slice(0, 10);
    
    const allNotams: ParsedNotam[] = [];
    
    // First try to fetch from FAA NOTAM API
    // If that fails, use demo data
    let apiSuccess = false;
    
    for (const icao of limitedIcaos) {
      try {
        // Try FAA's public NOTAM API
        const response = await fetch(
          `https://notams.aim.aero/api/v1/notams/search?location=${icao}&format=json`,
          {
            headers: {
              'Accept': 'application/json',
            },
            next: { revalidate: 300 }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          apiSuccess = true;
          
          // Parse FAA response
          const notamList = data?.notamList || data?.notams || [];
          for (const notam of notamList) {
            const summary = notam.summary || notam.text || '';
            const lower = summary.toLowerCase();
            
            let category: ParsedNotam['category'] = 'GENERAL';
            if (lower.includes('tfr') || lower.includes('temporary flight restriction')) category = 'TFR';
            else if (lower.includes('runway') || lower.includes('rw') || lower.includes('rwy')) category = 'RUNWAY';
            else if (lower.includes('navaid') || lower.includes('vor') || lower.includes('ils')) category = 'NAVAID';
            else if (lower.includes('obstacle') || lower.includes('tower') || lower.includes('crane')) category = 'OBSTACLE';
            else if (lower.includes('airspace') || lower.includes('moa') || lower.includes('restricted')) category = 'AIRSPACE';
            
            allNotams.push({
              id: notam.id || Math.random().toString(36).substring(7),
              icao,
              category,
              title: summary.substring(0, 50) || 'NOTAM',
              description: summary,
              startDate: notam.startDate || notam.effective || '',
              endDate: notam.endDate || notam.expiration || '',
              location: notam.location || '',
              coordinates: notam.coordinates
            });
          }
        }
      } catch (error) {
        // Continue to demo data
        console.log(`Using demo data for ${icao}`);
      }
    }
    
    // If API didn't work, use demo data
    if (!apiSuccess || allNotams.length === 0) {
      for (const icao of limitedIcaos) {
        const demoForAirport = demoNotams[icao] || defaultNotams;
        for (const notam of demoForAirport) {
          allNotams.push({
            ...notam,
            icao
          });
        }
      }
    }
    
    // Sort by category priority
    const categoryOrder: Record<ParsedNotam['category'], number> = {
      'TFR': 0,
      'RUNWAY': 1,
      'OBSTACLE': 2,
      'AIRSPACE': 3,
      'NAVAID': 4,
      'GENERAL': 5
    };
    
    allNotams.sort((a, b) => categoryOrder[a.category] - categoryOrder[b.category]);
    
    return NextResponse.json({
      notams: allNotams,
      count: allNotams.length,
      fetched: limitedIcaos,
      source: apiSuccess ? 'faa' : 'demo',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('NOTAM API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NOTAMs' },
      { status: 500 }
    );
  }
}
