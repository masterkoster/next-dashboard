import { NextResponse } from 'next/server';

// Demo TFRs data - In production, fetch from FAA API
const demoTfrs = [
  {
    id: 'tfr1',
    icao: 'KJFK',
    title: 'VIP Movement',
    description: 'Temporary Flight Restriction - Presidential movement',
    type: 'VIP',
    facility: 'KJFK',
    city: 'New York',
    state: 'NY',
    lowerAltitude: 'SURFACE',
    upperAltitude: '10000ft MSL',
    radius: 30,
    latitude: 40.6413,
    longitude: -73.7781,
    startDate: '2026-02-22T14:00:00Z',
    endDate: '2026-02-22T18:00:00Z',
    hazard: true,
    protection: true
  },
  {
    id: 'tfr2',
    icao: 'KLAX',
    title: 'Space Operations',
    description: 'Space vehicle launch/reentry operations',
    type: 'SPACE OPS',
    facility: 'KLAX',
    city: 'Los Angeles',
    state: 'CA',
    lowerAltitude: 'SURFACE',
    upperAltitude: 'UNLIMITED',
    radius: 10,
    latitude: 33.9425,
    longitude: -118.4081,
    startDate: '2026-02-20T10:00:00Z',
    endDate: '2026-02-20T14:00:00Z',
    hazard: true,
    protection: true
  },
  {
    id: 'tfr3',
    icao: 'KMIA',
    title: 'Stadium',
    description: 'TFR - Special events at stadium',
    type: 'STADIUM',
    facility: 'KMIA',
    city: 'Miami',
    state: 'FL',
    lowerAltitude: 'SURFACE',
    upperAltitude: '3000ft AGL',
    radius: 3,
    latitude: 25.7959,
    longitude: -80.2870,
    startDate: '2026-02-21T18:00:00Z',
    endDate: '2026-02-21T23:00:00Z',
    hazard: false,
    protection: true
  },
  {
    id: 'tfr4',
    icao: 'KDCA',
    title: 'Military Operations',
    description: 'U.S. Government/DoD flight operations',
    type: 'MILITARY',
    facility: 'KDCA',
    city: 'Washington',
    state: 'DC',
    lowerAltitude: 'SURFACE',
    upperAltitude: '15000ft MSL',
    radius: 20,
    latitude: 38.8512,
    longitude: -77.0402,
    startDate: '2026-02-19T12:00:00Z',
    endDate: '2026-02-19T20:00:00Z',
    hazard: true,
    protection: true
  }
];

interface TFR {
  id: string;
  icao: string;
  title: string;
  description: string;
  type: string;
  facility: string;
  city: string;
  state: string;
  lowerAltitude: string;
  upperAltitude: string;
  radius: number;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  hazard: boolean;
  protection: boolean;
}

// GET /api/tfrs?bounds=minLat,maxLat,minLon,maxLon
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bounds = searchParams.get('bounds');
    
    let filteredTfrs = [...demoTfrs];
    
    // Filter by bounds if provided
    if (bounds) {
      const [minLat, maxLat, minLon, maxLon] = bounds.split(',').map(Number);
      
      filteredTfrs = demoTfrs.filter(tfr => 
        tfr.latitude >= minLat && 
        tfr.latitude <= maxLat && 
        tfr.longitude >= minLon && 
        tfr.longitude <= maxLon
      );
    }
    
    // Filter out expired TFRs
    const now = new Date();
    filteredTfrs = filteredTfrs.filter(tfr => {
      const endDate = new Date(tfr.endDate);
      return endDate > now;
    });
    
    return NextResponse.json({
      tfrs: filteredTfrs,
      count: filteredTfrs.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('TFR API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch TFRs' },
      { status: 500 }
    );
  }
}
