import { NextResponse } from 'next/server';

// FAA API endpoint for aircraft registration lookup
const FAA_REGISTRY_URL = 'https://registry.faa.gov/aircraftinquiry/api/v1/nnumber';

/**
 * Fetch aircraft registration data from FAA
 * N-number should be provided without the 'N' prefix (e.g., "123AB" for N123AB)
 */
async function fetchFAAData(nNumber: string): Promise<FAAAircraftData | null> {
  try {
    const normalized = nNumber.toUpperCase().replace(/^N/i, '').trim();
    
    const response = await fetch(`${FAA_REGISTRY_URL}/${normalized}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('FAA API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    
    // Check if we got valid data
    if (!data || !data.results || data.results.length === 0) {
      return null;
    }

    const result = data.results[0];
    const r = result as any;
    
    return {
      nNumber: `N${r.nNumber || normalized}`,
      serialNumber: r.serialNumber || null,
      manufacturer: r.mfrModelCode ? getManufacturerFromCode(r.mfrModelCode) : null,
      model: r.mfrModelCode ? getModelFromCode(r.mfrModelCode) : null,
      year: r.yearMfr ? parseInt(r.yearMfr) : null,
      category: r.aircraftType || null,
      engineType: r.engineType || null,
      registrationStatus: r.statusCode || null,
      ownerName: r.name || null,
      ownerCity: r.city || null,
      ownerState: r.state || null,
      expirationDate: r.expirationDate || null,
    };
  } catch (error) {
    console.error('FAA fetch error:', error);
    return null;
  }
}

// Helper functions to parse FAA codes (simplified - FAA uses codes for efficiency)
function getManufacturerFromCode(code: string): string | null {
  // Common manufacturer codes
  const codes: Record<string, string> = {
    'CESSNA': 'Cessna',
    'PIPER': 'Piper',
    'BEECH': 'Beechcraft',
    'BOEING': 'Boeing',
    'AIRBUS': 'Airbus',
    'LOCKHEED': 'Lockheed',
    'BELL': 'Bell',
    'ROBINSON': 'Robinson',
    'MOONEY': 'Mooney',
    'GRUMMAN': 'Grumman',
    'AERO': 'Aero',
    'CHAMPION': 'Champion',
    'MAULE': 'Maule',
    'AYRES': 'Ayres',
  };
  
  // Try to match prefix
  for (const [key, value] of Object.entries(codes)) {
    if (code.toUpperCase().startsWith(key)) {
      return value;
    }
  }
  
  return null;
}

function getModelFromCode(code: string): string | null {
  // This would need a full database for accurate mapping
  // For now, return null and let user fill in
  return null;
}

interface FAAAircraftData {
  nNumber: string;
  serialNumber: string | null;
  manufacturer: string | null;
  model: string | null;
  year: number | null;
  category: string | null;
  engineType: string | null;
  registrationStatus: string | null;
  ownerName: string | null;
  ownerCity: string | null;
  ownerState: string | null;
  expirationDate: string | null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ nNumber: string }> }
) {
  try {
    const { nNumber } = await params;
    
    if (!nNumber || nNumber.length < 1 || nNumber.length > 5) {
      return NextResponse.json(
        { error: 'Invalid N-number. Must be 1-5 characters.' },
        { status: 400 }
      );
    }

    const faaData = await fetchFAAData(nNumber);
    
    if (!faaData) {
      return NextResponse.json(
        { error: 'Aircraft not found in FAA registry' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: faaData,
    });
  } catch (error) {
    console.error('FAA lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to lookup aircraft' },
      { status: 500 }
    );
  }
}
