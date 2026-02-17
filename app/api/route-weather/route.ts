import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'aviation_hub.db');

function httpGet(url: string): Promise<{ status: number; data: string }> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? require('https') : require('http');
    const req = protocol.get(url, { 
      headers: { 'User-Agent': 'AviationHub/1.0' },
      timeout: 15000 
    }, (res: any) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode || 500, data }));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3440.065; // Earth radius in NM
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Interpolate waypoints along a route to get more weather data points
function interpolateWaypoints(waypoints: { lat: number; lon: number }[], numPoints: number = 5): { lat: number; lon: number }[] {
  if (waypoints.length < 2) return waypoints;
  
  const result: { lat: number; lon: number }[] = [];
  
  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = waypoints[i];
    const end = waypoints[i + 1];
    const segmentDist = calculateDistance(start.lat, start.lon, end.lat, end.lon);
    const pointsForSegment = Math.max(1, Math.ceil((segmentDist / 50) * numPoints));
    
    for (let j = 0; j < pointsForSegment; j++) {
      const fraction = j / pointsForSegment;
      result.push({
        lat: start.lat + (end.lat - start.lat) * fraction,
        lon: start.lon + (end.lon - start.lon) * fraction
      });
    }
  }
  
  // Add final point
  result.push(waypoints[waypoints.length - 1]);
  
  return result;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { waypoints, altitude = 34000, aircraftTAS = 120 } = await request.json();
    
    if (!waypoints || waypoints.length < 2) {
      return NextResponse.json({ error: 'Need at least 2 waypoints' }, { status: 400 });
    }

    // Get interpolation points along route
    const routePoints = interpolateWaypoints(waypoints, 5);
    
    // Fetch winds aloft for the region (using first and last waypoints to determine region)
    const centerLat = (waypoints[0].lat + waypoints[waypoints.length - 1].lat) / 2;
    const centerLon = (waypoints[0].lon + waypoints[waypoints.length - 1].lon) / 2;
    
    // Determine region code based on longitude
    let region = 'chi'; // default
    if (centerLon < -120) region = 'sfo';
    else if (centerLon < -100) region = 'slc';
    else if (centerLon < -90) region = 'dfw';
    else if (centerLon < -80) region = 'mia';
    else if (centerLon < -70) region = 'bos';
    
    // Try to get winds aloft data
    let windData: any = null;
    try {
      const url = `https://aviationweather.gov/api/data/windtemp?region=${region}&format=json`;
      const response = await httpGet(url);
      
      if (response.status === 200) {
        windData = JSON.parse(response.data);
      }
    } catch (e) {
      console.log('Wind data fetch error:', e);
    }

    // Calculate segment impacts
    const segments: any[] = [];
    let totalDistance = 0;
    let totalTimeWithWind = 0;
    let totalTimeStillAir = 0;
    
    for (let i = 0; i < waypoints.length - 1; i++) {
      const from = waypoints[i];
      const to = waypoints[i + 1];
      const distance = calculateDistance(from.lat, from.lon, to.lat, to.lon);
      
      // Calculate heading
      const heading = Math.atan2(
        (to.lon - from.lon) * Math.cos(to.lat * Math.PI / 180),
        to.lat - from.lat
      ) * 180 / Math.PI;
      
      // Estimate wind (simplified - in real app would use actual winds aloft data)
      // Use a simplified wind model based on latitude (typical jet stream patterns)
      const avgLat = (from.lat + to.lat) / 2;
      const windSpeed = Math.max(0, 30 - Math.abs(avgLat - 40) * 0.5); // Simplified model
      const windFrom = 270 + (avgLat > 40 ? 20 : -20); // Generally from west
      
      // Calculate wind correction angle
      const windRad = (windFrom - heading) * Math.PI / 180;
      const headwind = windSpeed * Math.cos(windRad);
      const crosswind = windSpeed * Math.sin(windRad);
      
      // Ground speed with wind
      const groundSpeed = Math.sqrt(
        Math.pow(aircraftTAS + headwind, 2) + Math.pow(crosswind, 2)
      );
      
      // Time in still air vs with wind
      const timeStillAir = distance / aircraftTAS;
      const timeWithWind = distance / groundSpeed;
      
      // Fuel impact (based on time difference)
      const fuelFlow = 8; // gallons per hour (typical GA jet)
      const fuelDiff = (timeWithWind - timeStillAir) * fuelFlow;
      const fuelImpactPercent = (fuelDiff / (timeStillAir * fuelFlow)) * 100;
      
      segments.push({
        from: { icao: from.icao || `WP${i}`, lat: from.lat, lon: from.lon },
        to: { icao: to.icao || `WP${i+1}`, lat: to.lat, lon: to.lon },
        distance: Math.round(distance),
        heading: Math.round(heading),
        windFrom: Math.round(windFrom),
        windSpeed: Math.round(windSpeed),
        tas: aircraftTAS,
        groundSpeed: Math.round(groundSpeed),
        timeStillAir: Math.round(timeStillAir * 60), // minutes
        timeWithWind: Math.round(timeWithWind * 60),
        fuelImpact: Math.round(fuelDiff * 10) / 10,
        fuelImpactPercent: Math.round(fuelImpactPercent * 10) / 10,
        significant: Math.abs(fuelImpactPercent) >= 10
      });
      
      totalDistance += distance;
      totalTimeWithWind += timeWithWind;
      totalTimeStillAir += timeStillAir;
    }
    
    const totalFuelStillAir = totalTimeStillAir * 8;
    const totalFuelWithWind = totalTimeWithWind * 8;
    const overallFuelImpact = totalFuelWithWind - totalFuelStillAir;
    const overallImpactPercent = (overallFuelImpact / totalFuelStillAir) * 100;
    
    return NextResponse.json({
      segments,
      summary: {
        totalDistance: Math.round(totalDistance),
        totalTimeStillAir: Math.round(totalTimeStillAir * 60),
        totalTimeWithWind: Math.round(totalTimeWithWind * 60),
        fuelStillAir: Math.round(totalFuelStillAir),
        fuelWithWind: Math.round(totalFuelWithWind),
        fuelImpact: Math.round(overallFuelImpact * 10) / 10,
        fuelImpactPercent: Math.round(overallImpactPercent * 10) / 10,
        significant: Math.abs(overallImpactPercent) >= 10
      },
      altitude,
      region,
      windDataAvailable: !!windData
    });
    
  } catch (error: any) {
    console.error('Route weather calculation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
