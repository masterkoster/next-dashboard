import { NextResponse } from 'next/server';

// Demo SIGMETs data - In production, fetch from aviationweather.gov
const demoSigmets = [
  {
    id: 'sigmet1',
    type: 'SIGMET',
    hazard: 'CONVECTIVE',
    severity: 'SEVERE',
    title: 'Severe Thunderstorm',
    description: 'Severe thunderstorm extending from FL250 to FL450. Moving from 260 at 25 knots.',
    area: 'CO, KS, NE',
    validStart: '2026-02-18T18:00:00Z',
    validEnd: '2026-02-18T22:00:00Z',
    coordinates: [
      { lat: 40.0, lon: -105.0 },
      { lat: 40.0, lon: -100.0 },
      { lat: 38.0, lon: -100.0 },
      { lat: 38.0, lon: -105.0 }
    ]
  },
  {
    id: 'sigmet2',
    type: 'SIGMET',
    hazard: 'TURBULENCE',
    severity: 'SEVERE',
    title: 'Severe Turbulence',
    description: 'Severe turbulence below FL350. Moving from 270 at 15 knots.',
    area: 'IL, IN, OH',
    validStart: '2026-02-18T16:00:00Z',
    validEnd: '2026-02-18T20:00:00Z',
    coordinates: [
      { lat: 42.0, lon: -88.0 },
      { lat: 42.0, lon: -82.0 },
      { lat: 39.0, lon: -82.0 },
      { lat: 39.0, lon: -88.0 }
    ]
  },
  {
    id: 'sigmet3',
    type: 'AIRMET',
    hazard: 'ICING',
    severity: 'MODERATE',
    title: 'Moderate Icing',
    description: 'Moderate rime icing in clouds from FL180 to FL280. Temperature -8C to -15C.',
    area: 'WA, OR, ID',
    validStart: '2026-02-18T14:00:00Z',
    validEnd: '2026-02-18T18:00:00Z',
    coordinates: [
      { lat: 49.0, lon: -125.0 },
      { lat: 49.0, lon: -116.0 },
      { lat: 44.0, lon: -116.0 },
      { lat: 44.0, lon: -125.0 }
    ]
  },
  {
    id: 'sigmet4',
    type: 'AIRMET',
    hazard: 'IFR',
    severity: 'MODERATE',
    title: 'IFR Conditions',
    description: 'MVFR to IFR conditions in rain. Ceiling 1000ft, visibility 3SM in moderate rain.',
    area: 'FL, GA, SC',
    validStart: '2026-02-18T12:00:00Z',
    validEnd: '2026-02-18T18:00:00Z',
    coordinates: [
      { lat: 33.0, lon: -85.0 },
      { lat: 33.0, lon: -79.0 },
      { lat: 29.0, lon: -79.0 },
      { lat: 29.0, lon: -85.0 }
    ]
  }
];

interface SIGMET {
  id: string;
  type: string;
  hazard: string;
  severity: string;
  title: string;
  description: string;
  area: string;
  validStart: string;
  validEnd: string;
  coordinates: Array<{ lat: number; lon: number }>;
}

// GET /api/sigmets
export async function GET(request: Request) {
  try {
    let sigmets = [...demoSigmets];
    
    // Try to fetch from aviationweather.gov
    let source = 'demo';
    
    try {
      const response = await fetch(
        'https://aviationweather.gov/api/data/gairmet?format=json',
        {
          headers: {
            'Accept': 'application/json',
          },
          next: { revalidate: 300 }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        source = 'aviationweather.gov';
        
        if (Array.isArray(data)) {
          sigmets = data.map((s: any) => ({
            id: s.forecastId || Math.random().toString(36).substring(7),
            type: 'AIRMET',
            hazard: s.hazard || 'UNKNOWN',
            severity: s.severity || 'MODERATE',
            title: s.hazard || 'Weather Advisory',
            description: s.rawBrie || s.hazard || '',
            area: s.area || '',
            validStart: s.validTimeStart || '',
            validEnd: s.validTimeEnd || '',
            coordinates: s.geometry?.features?.[0]?.geometry?.coordinates?.[0] || []
          }));
        }
      }
    } catch (error) {
      console.log('SIGMET API unavailable, using demo data');
    }
    
    // Filter out expired sigmets
    const now = new Date();
    sigmets = sigmets.filter(sig => {
      const validEnd = new Date(sig.validEnd);
      return validEnd > now;
    });
    
    return NextResponse.json({
      sigmets,
      count: sigmets.length,
      source,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('SIGMET API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SIGMETs' },
      { status: 500 }
    );
  }
}
