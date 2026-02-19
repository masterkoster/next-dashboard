import { NextResponse } from 'next/server';

// FAA NOTAM API endpoint
const FAA_NOTAM_BASE = 'https://notams.aim.aero/api/v1';

interface NotamResponse {
  icao: string;
  notamList: Array<{
    id: string;
    type: string;
    summary: string;
    startDate: string;
    endDate: string;
    location: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  }>;
}

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

// Categorize NOTAM based on content
function categorizeNotam(notam: string): ParsedNotam['category'] {
  const lower = notam.toLowerCase();
  if (lower.includes('tfr') || lower.includes('temporary flight restriction')) return 'TFR';
  if (lower.includes('runway') || lower.includes('rw') || lower.includes('rwy')) return 'RUNWAY';
  if (lower.includes('navaid') || lower.includes('vor') || lower.includes('ils') || lower.includes('ndb')) return 'NAVAID';
  if (lower.includes('obstacle') || lower.includes('tower') || lower.includes('crane')) return 'OBSTACLE';
  if (lower.includes('airspace') || lower.includes('moa') || lower.includes('restricted')) return 'AIRSPACE';
  return 'GENERAL';
}

// Parse NOTAM response from various sources
function parseNotamData(icao: string, data: any): ParsedNotam[] {
  const notams: ParsedNotam[] = [];
  
  // Handle FAA NOTAM API response format
  const notamList = data?.notamList || data?.notams || [];
  
  for (const notam of notamList) {
    const category = categorizeNotam(notam.summary || notam.text || '');
    
    notams.push({
      id: notam.id || Math.random().toString(36).substring(7),
      icao,
      category,
      title: notam.summary?.substring(0, 50) || 'NOTAM',
      description: notam.summary || notam.text || '',
      startDate: notam.startDate || notam.effective || '',
      endDate: notam.endDate || notam.expiration || '',
      location: notam.location || '',
      coordinates: notam.coordinates || undefined
    });
  }
  
  return notams;
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
    
    const icaoList = icaos.split(',').map(i => i.trim().toUpperCase()).filter(i => i);
    
    if (icaoList.length === 0) {
      return NextResponse.json(
        { error: 'No valid ICAOs provided' },
        { status: 400 }
      );
    }
    
    // Limit to 10 airports per request to avoid rate limiting
    const limitedIcaos = icaoList.slice(0, 10);
    
    const allNotams: ParsedNotam[] = [];
    
    // Fetch NOTAMs for each airport
    // Using FAA's public NOTAM API (no auth required for basic queries)
    for (const icao of limitedIcaos) {
      try {
        const response = await fetch(
          `https://notams.aim.aero/api/v1/notams/search?location=${icao}&format=json`,
          {
            headers: {
              'Accept': 'application/json',
            },
            next: { revalidate: 300 } // Cache for 5 minutes
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          const parsedNotams = parseNotamData(icao, data);
          allNotams.push(...parsedNotams);
        }
      } catch (error) {
        console.error(`Error fetching NOTAMs for ${icao}:`, error);
        // Continue with other airports if one fails
      }
    }
    
    // Sort by category priority (TFR first, then RUNWAY, etc.)
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
