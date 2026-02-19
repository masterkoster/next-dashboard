import { NextResponse } from 'next/server';

// Demo PIREPs data - In production, fetch from aviationweather.gov
const demoPireps = [
  {
    id: 'p1',
    icao: 'KJFK',
    reportType: 'PIREP',
    flightLevel: 350,
    aircraft: 'B737',
    skyCondition: 'OVC045',
    visibility: 10,
    wxString: 'NVG',
    turbulence: 'NIL',
    icing: 'NIL',
    temperature: -48,
    windDirection: 270,
    windSpeed: 45,
    time: '2026-02-18T20:15:00Z',
    latitude: 40.5,
    longitude: -73.5,
    reportText: 'KJFK JFK UUA /OV KJFK/TM 2015Z/FL350/TP B737/SK OVC045/TB NIL/IC NIL'
  },
  {
    id: 'p2',
    icao: 'KORD',
    reportType: 'PIREP',
    flightLevel: 280,
    aircraft: 'A320',
    skyCondition: 'SCT040',
    visibility: 10,
    wxString: 'FZRA',
    turbulence: 'LGT',
    icing: 'LGT-MOD',
    temperature: -32,
    windDirection: 250,
    windSpeed: 35,
    time: '2026-02-18T19:45:00Z',
    latitude: 41.5,
    longitude: -88.0,
    reportText: 'KORD ORD UUA /OV KORD/TM 1945Z/FL280/TP A320/SK SCT040/FZRA/TB LGT/IC LGT-MOD'
  },
  {
    id: 'p3',
    icao: 'KLAX',
    reportType: 'PIREP',
    flightLevel: 390,
    aircraft: 'B777',
    skyCondition: 'CLR',
    visibility: 10,
    wxString: 'SKC',
    turbulence: 'MOD',
    icing: 'NIL',
    temperature: -52,
    windDirection: 220,
    windSpeed: 60,
    time: '2026-02-18T18:30:00Z',
    latitude: 33.5,
    longitude: -118.0,
    reportText: 'KLAX LAX UUA /OV KLAX/TM 1830Z/FL390/TP B777/SK CLR/SKC/TB MOD/IC NIL'
  },
  {
    id: 'p4',
    icao: 'KMIA',
    reportType: 'PIREP',
    flightLevel: 100,
    aircraft: 'C172',
    skyCondition: 'BKN020',
    visibility: 5,
    wxString: 'BR',
    turbulence: 'SEV',
    icing: 'NIL',
    temperature: 22,
    windDirection: 90,
    windSpeed: 15,
    time: '2026-02-18T17:00:00Z',
    latitude: 25.5,
    longitude: -80.0,
    reportText: 'KMIA MIA UUA /OV KMIA/TM 1700Z/FL100/TP C172/SK BKN020/BR/TB SEV/IC NIL'
  }
];

interface PIREP {
  id: string;
  icao: string;
  reportType: string;
  flightLevel: number;
  aircraft: string;
  skyCondition: string;
  visibility: number;
  wxString: string;
  turbulence: string;
  icing: string;
  temperature: number;
  windDirection: number;
  windSpeed: number;
  time: string;
  latitude: number;
  longitude: number;
  reportText: string;
}

// GET /api/pireps?bounds=minLat,maxLat,minLon,maxLon
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bounds = searchParams.get('bounds');
    
    // Try to fetch from aviationweather.gov first
    let pireps: PIREP[] = [];
    let source = 'demo';
    
    if (bounds) {
      const [minLat, maxLat, minLon, maxLon] = bounds.split(',').map(Number);
      
      try {
        const response = await fetch(
          `https://aviationweather.gov/api/data/pirep?format=json&bbox=${minLon},${minLat},${maxLon},${maxLat}`,
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
          
          // Parse aviationweather.gov response
          if (Array.isArray(data)) {
            pireps = data.map((p: any) => ({
              id: p.pirepId || Math.random().toString(36).substring(7),
              icao: p.icaoId || '',
              reportType: p.rptType || 'PIREP',
              flightLevel: parseInt(p.flightLevel) || 0,
              aircraft: p.acType || 'UNKNOWN',
              skyCondition: p.skyCond || '',
              visibility: p.vis || 10,
              wxString: p.wxString || '',
              turbulence: p.turbulence || 'NIL',
              icing: p.icing || 'NIL',
              temperature: parseInt(p.temp) || 0,
              windDirection: parseInt(p.wdir) || 0,
              windSpeed: parseInt(p.wspd) || 0,
              time: p.time || '',
              latitude: p.lat || 0,
              longitude: p.lon || 0,
              reportText: p.rawOb || ''
            }));
          }
        }
      } catch (error) {
        console.log('PIREP API unavailable, using demo data');
      }
    }
    
    // If no data from API, use demo data
    if (pireps.length === 0) {
      // Filter demo data by bounds if provided
      if (bounds) {
        const [minLat, maxLat, minLon, maxLon] = bounds.split(',').map(Number);
        pireps = demoPireps.filter(p => 
          p.latitude >= minLat && 
          p.latitude <= maxLat && 
          p.longitude >= minLon && 
          p.longitude <= maxLon
        );
      } else {
        pireps = demoPireps;
      }
    }
    
    return NextResponse.json({
      pireps,
      count: pireps.length,
      source,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('PIREP API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PIREPs' },
      { status: 500 }
    );
  }
}
