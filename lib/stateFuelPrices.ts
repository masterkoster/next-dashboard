/**
 * State Fuel Price Calculator
 * 
 * Calculates representative fuel prices per state from airport fuel data.
 * Uses 5 airports per state (N, S, E, W, Center) → median price
 */

import { getStateCode } from './usStates';

// State to airports mapping (ICAO prefix to state)
// This maps FAA location identifiers (first 2 chars of ICAO) to states
// Note: This is approximate - some airports don't follow this pattern exactly
const ICAO_TO_STATE: Record<string, string> = {
  'K': 'FEDERAL', // Federal airports (use state field)
  'PA': 'PA', 'PC': 'HI', 'PH': 'HI', 'PM': 'HI', 'PW': 'HI', // Pacific
  'LA': 'LA', // Louisiana
  'NK': 'NY', // New York (non-federal)
  'AK': 'AK', 'AL': 'AL', 'AR': 'AR', 'AZ': 'AZ', 'CA': 'CA',
  'CO': 'CO', 'CT': 'CT', 'DC': 'DC', 'DE': 'DE', 'FL': 'FL', 'GA': 'GA',
  'IA': 'IA', 'ID': 'ID', 'IL': 'IL', 'IN': 'IN', 'KS': 'KS', 'KY': 'KY',
  'MA': 'MA', 'MD': 'MD', 'ME': 'ME', 'MI': 'MI', 'MN': 'MN', 'MO': 'MO',
  'MS': 'MS', 'MT': 'MT', 'NC': 'NC', 'ND': 'ND', 'NE': 'NE', 'NH': 'NH',
  'NJ': 'NJ', 'NM': 'NM', 'NV': 'NV', 'NY': 'NY', 'OH': 'OH', 'OK': 'OK',
  'OR': 'OR', 'RI': 'RI', 'SC': 'SC', 'SD': 'SD', 'TN': 'TN',
  'TX': 'TX', 'UT': 'UT', 'VA': 'VA', 'VT': 'VT', 'WA': 'WA', 'WI': 'WI',
  'WV': 'WV', 'WY': 'WY'
};

// Approximate state boundaries (for finding N/S/E/W airports)
const STATE_BOUNDS: Record<string, { minLat: number; maxLat: number; minLon: number; maxLon: number }> = {
  'AL': { minLat: 30.2, maxLat: 35.0, minLon: -88.5, maxLon: -84.9 },
  'AK': { minLat: 51.8, maxLat: 71.4, minLon: -180, maxLon: -130 },
  'AZ': { minLat: 31.3, maxLat: 37.0, minLon: -114.7, maxLon: -109.0 },
  'AR': { minLat: 33.0, maxLat: 36.5, minLon: -94.6, maxLon: -89.6 },
  'CA': { minLat: 32.5, maxLat: 42.0, minLon: -124.4, maxLon: -114.6 },
  'CO': { minLat: 37.0, maxLat: 41.0, minLon: -109.1, maxLon: -102.0 },
  'CT': { minLat: 41.0, maxLat: 42.1, minLon: -73.7, maxLon: -71.8 },
  'DE': { minLat: 38.5, maxLat: 39.8, minLon: -75.8, maxLon: -75.0 },
  'FL': { minLat: 24.5, maxLat: 31.0, minLon: -87.6, maxLon: -80.0 },
  'GA': { minLat: 30.4, maxLat: 35.0, minLon: -85.6, maxLon: -80.8 },
  'HI': { minLat: 18.9, maxLat: 22.5, minLon: -160.2, maxLon: -154.7 },
  'ID': { minLat: 42.0, maxLat: 49.0, minLon: -117.2, maxLon: -111.0 },
  'IL': { minLat: 37.0, maxLat: 42.5, minLon: -91.5, maxLon: -87.0 },
  'IN': { minLat: 38.0, maxLat: 41.8, minLon: -88.1, maxLon: -84.8 },
  'IA': { minLat: 40.4, maxLat: 43.5, minLon: -96.6, maxLon: -90.1 },
  'KS': { minLat: 37.0, maxLat: 40.0, minLon: -102.1, maxLon: -94.6 },
  'KY': { minLat: 36.5, maxLat: 39.2, minLon: -89.6, maxLon: -81.9 },
  'LA': { minLat: 29.0, maxLat: 33.0, minLon: -94.1, maxLon: -88.8 },
  'ME': { minLat: 43.1, maxLat: 47.5, minLon: -71.1, maxLon: -66.9 },
  'MD': { minLat: 37.9, maxLat: 39.7, minLon: -79.5, maxLon: -75.0 },
  'MA': { minLat: 41.2, maxLat: 42.9, minLon: -73.5, maxLon: -69.9 },
  'MI': { minLat: 41.7, maxLat: 48.2, minLon: -90.4, maxLon: -82.1 },
  'MN': { minLat: 43.5, maxLat: 49.4, minLon: -97.2, maxLon: -89.5 },
  'MS': { minLat: 30.2, maxLat: 35.0, minLon: -91.7, maxLon: -88.1 },
  'MO': { minLat: 36.0, maxLat: 40.6, minLon: -95.8, maxLon: -89.1 },
  'MT': { minLat: 44.4, maxLat: 49.0, minLon: -116.0, maxLon: -104.0 },
  'NE': { minLat: 40.0, maxLat: 43.0, minLon: -104.1, maxLon: -95.3 },
  'NV': { minLat: 35.0, maxLat: 42.0, minLon: -120.0, maxLon: -114.0 },
  'NH': { minLat: 42.7, maxLat: 45.3, minLon: -72.6, maxLon: -70.7 },
  'NJ': { minLat: 38.9, maxLat: 41.4, minLon: -75.6, maxLon: -73.9 },
  'NM': { minLat: 31.3, maxLat: 37.0, minLon: -109.1, maxLon: -103.0 },
  'NY': { minLat: 40.5, maxLat: 45.0, minLon: -79.8, maxLon: -71.8 },
  'NC': { minLat: 33.8, maxLat: 36.5, minLon: -84.3, maxLon: -75.4 },
  'ND': { minLat: 45.9, maxLat: 49.0, minLon: -104.1, maxLon: -96.6 },
  'OH': { minLat: 38.4, maxLat: 41.7, minLon: -84.8, maxLon: -80.5 },
  'OK': { minLat: 33.6, maxLat: 37.0, minLon: -103.0, maxLon: -94.4 },
  'OR': { minLat: 42.0, maxLat: 46.3, minLon: -124.6, maxLon: -116.5 },
  'PA': { minLat: 39.7, maxLat: 42.3, minLon: -80.5, maxLon: -74.7 },
  'RI': { minLat: 41.1, maxLat: 42.0, minLon: -71.9, maxLon: -71.1 },
  'SC': { minLat: 32.0, maxLat: 35.2, minLon: -83.4, maxLon: -78.5 },
  'SD': { minLat: 42.5, maxLat: 45.9, minLon: -104.1, maxLon: -96.4 },
  'TN': { minLat: 35.0, maxLat: 36.5, minLon: -90.3, maxLon: -81.6 },
  'TX': { minLat: 25.8, maxLat: 36.5, minLon: -106.7, maxLon: -93.5 },
  'UT': { minLat: 37.0, maxLat: 42.0, minLon: -114.1, maxLon: -109.0 },
  'VT': { minLat: 42.7, maxLat: 45.0, minLon: -73.5, maxLon: -71.5 },
  'VA': { minLat: 36.5, maxLat: 39.5, minLon: -83.7, maxLon: -75.2 },
  'WA': { minLat: 45.5, maxLat: 49.0, minLon: -124.8, maxLon: -116.9 },
  'WV': { minLat: 37.2, maxLat: 40.6, minLon: -82.6, maxLon: -77.7 },
  'WI': { minLat: 42.5, maxLat: 47.1, minLon: -92.9, maxLon: -86.8 },
  'WY': { minLat: 41.0, maxLat: 45.0, minLon: -111.1, maxLon: -104.1 },
};

export interface FuelPrice {
  icao: string;
  price100ll: number | null;
  priceJetA: number | null;
  lastUpdated?: string;
  source?: string;
  lat?: number;
  lon?: number;
  state?: string;
}

export interface StateAverage {
  state: string;
  stateName: string;
  medianPrice: number | null;
  sampleCount: number;
}

/**
 * Get state from ICAO code
 * Most US airports use ICAO starting with 'K' followed by 3-letter code
 * The 3-letter code often relates to the city (e.g., KJFK = JFK = New York)
 * This uses a simplified mapping based on common patterns
 */
function getStateFromICAO(icao: string): string | null {
  if (!icao || icao.length < 3) return null;
  
  const prefix = icao.substring(0, 2);
  
  // Federal airports (K prefix) - need to look up by specific airport
  if (prefix === 'K') {
    // For K-prefixed airports, use a lookup table for major airports
    const kLookup: Record<string, string> = {
      'KJFK': 'NY', 'KEWR': 'NJ', 'KLGA': 'NY', 'KJNB': 'GA',
      'KATL': 'GA', 'KORD': 'IL', 'KMDW': 'IL', 'KDCA': 'DC',
      'KIAD': 'VA', 'KMCO': 'FL', 'KTPA': 'FL', 'KMIA': 'FL',
      'KDFW': 'TX', 'KIAH': 'TX', 'KLAS': 'NV', 'KPHX': 'AZ',
      'KLAX': 'CA', 'KSFO': 'CA', 'KSAN': 'CA', 'KSEA': 'WA',
      'KPDX': 'OR', 'KDEN': 'CO', 'KMSP': 'MN', 'KMEM': 'TN',
      'KBNA': 'TN', 'KSTL': 'MO', 'KCLE': 'OH', 'KCincinnati': 'OH',
      'KPIT': 'PA', 'KPHL': 'PA', 'KBWI': 'MD', 'KSJC': 'CA',
      'KDAL': 'TX', 'KHOU': 'TX', 'KOKC': 'OK', 'KTUL': 'OK',
      'KLIT': 'AR', 'KABQ': 'NM', 'KSLC': 'UT', 'KBOI': 'ID',
      'KGEG': 'WA', 'KTUS': 'AZ',
    };
    return kLookup[icao] || 'CA'; // Default to CA for unknown K-prefixed
  }
  
  return ICAO_TO_STATE[prefix] || null;
}

/**
 * Calculate median of array of numbers
 */
function getMedian(values: number[]): number | null {
  if (values.length === 0) return null;
  
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * Calculate state averages from fuel prices
 * Uses N, S, E, W, Center airports → median price
 */
export function calculateStateAverages(fuelPrices: Record<string, FuelPrice>): Record<string, StateAverage> {
  // Group airports by state
  const stateAirports: Record<string, FuelPrice[]> = {};
  
  for (const [icao, priceData] of Object.entries(fuelPrices)) {
    if (!priceData.price100ll) continue;
    
    const state = getStateFromICAO(icao);
    if (!state) continue;
    
    if (!stateAirports[state]) {
      stateAirports[state] = [];
    }
    stateAirports[state].push({ ...priceData, icao });
  }
  
  // Calculate median for each state
  const stateAverages: Record<string, StateAverage> = {};
  
  for (const [state, airports] of Object.entries(stateAirports)) {
    if (airports.length === 0) continue;
    
    // Get bounds for this state
    const bounds = STATE_BOUNDS[state];
    if (!bounds) continue;
    
    // Find N, S, E, W, Center airports
    let north = airports[0];
    let south = airports[0];
    let east = airports[0];
    let west = airports[0];
    let center = airports[0];
    
    // Calculate center point
    const centerLat = (bounds.minLat + bounds.maxLat) / 2;
    const centerLon = (bounds.minLon + bounds.maxLon) / 2;
    
    let minDistToCenter = Infinity;
    
    for (const airport of airports) {
      if (!airport.lat || !airport.lon) continue;
      
      // North = max lat
      if (!north.lat || airport.lat > north.lat) north = airport;
      // South = min lat
      if (!south.lat || airport.lat < south.lat) south = airport;
      // East = max lon (handle Alaska which crosses -180)
      let lon = airport.lon;
      if (state === 'AK') {
        if (!east.lon || lon > east.lon) east = airport;
        if (!west.lon || lon < west.lon) west = airport;
      } else {
        if (!east.lon || lon > east.lon) east = airport;
        if (!west.lon || lon < west.lon) west = airport;
      }
      // Center = closest to center point
      const dist = Math.abs(airport.lat - centerLat) + Math.abs(airport.lon - centerLon);
      if (dist < minDistToCenter) {
        minDistToCenter = dist;
        center = airport;
      }
    }
    
    // Get unique prices from these 5 airports
    const samplePrices = [
      north?.price100ll,
      south?.price100ll,
      east?.price100ll,
      west?.price100ll,
      center?.price100ll,
    ].filter((p): p is number => p !== null && p > 0);
    
    // Calculate median
    const medianPrice = getMedian(samplePrices);
    
    if (medianPrice !== null) {
      const stateNames: Record<string, string> = {
        'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
        'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
        'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
        'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
        'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
        'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
        'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
        'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
        'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
        'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
        'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
        'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
        'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'Washington DC'
      };
      
      stateAverages[state] = {
        state,
        stateName: stateNames[state] || state,
        medianPrice: Math.round(medianPrice * 100) / 100, // Round to 2 decimals
        sampleCount: samplePrices.length,
      };
    }
  }
  
  return stateAverages;
}

/**
 * Quick lookup - get price for a state
 */
export function getStatePrice(stateCode: string, stateAverages: Record<string, StateAverage>): StateAverage | null {
  return stateAverages[stateCode] || null;
}
