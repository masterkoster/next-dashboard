/**
 * GPX Export - Generate GPX 1.1 format for flight plans
 * Compatible with ForeFlight, Garmin Pilot, SkyDemon, OpenCPN, etc.
 */

export interface Waypoint {
  icao: string;
  name?: string;
  latitude: number;
  longitude: number;
}

export interface FlightPlanData {
  name?: string;
  waypoints: Waypoint[];
  aircraftType?: string;
  cruisingAltitude?: number;
  departureTime?: string;
  fuelCapacity?: number;
  fuelBurnRate?: number;
}

export function generateGPX(plan: FlightPlanData): string {
  const { name = 'Flight Plan', waypoints, aircraftType, cruisingAltitude } = plan;
  
  const gpxHeader = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" 
     creator="FuelSaver - Flight Planning Tool"
     xmlns="http://www.topografix.com/GPX/1/1"
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${escapeXML(name)}</name>
    <desc>Flight plan created with FuelSaver</desc>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <rte>
    <name>${escapeXML(name)}</name>`;
  
  const gpxFooter = `
  </rte>
</gpx>`;
  
  const routePoints = waypoints.map((wp, idx) => {
    const isDeparture = idx === 0;
    const isArrival = idx === waypoints.length - 1;
    let type = 'AIRPORT';
    
    if (isDeparture) type = 'DEPARTURE';
    else if (isArrival) type = 'ARRIVAL';
    else type = 'WAYPOINT';
    
    return `
    <rtept lat="${wp.latitude.toFixed(6)}" lon="${wp.longitude.toFixed(6)}">
      <name>${escapeXML(wp.icao)}</name>
      <type>${type}</type>
      <extensions>
        <waypointType>${type}</waypointType>
        ${wp.name ? `<waypointName>${escapeXML(wp.name)}</waypointName>` : ''}
        ${aircraftType ? `<aircraftType>${escapeXML(aircraftType)}</aircraftType>` : ''}
        ${cruisingAltitude ? `<cruisingAltitude>${cruisingAltitude}</cruisingAltitude>` : ''}
      </extensions>
    </rtept>`;
  }).join('');
  
  return gpxHeader + routePoints + gpxFooter;
}

export function downloadGPX(plan: FlightPlanData): void {
  const gpx = generateGPX(plan);
  const filename = (plan.name || 'flight-plan').replace(/[^a-z0-9]/gi, '-').toLowerCase();
  
  downloadFile(gpx, `${filename}.gpx`, 'application/gpx+xml');
}

/**
 * FPL Format - Simple text format for Garmin 430/530/G1000
 * One ICAO code per line
 */
export function generateFPL(waypoints: Waypoint[]): string {
  return waypoints.map(wp => wp.icao).join('\n');
}

export function downloadFPL(waypoints: Waypoint[]): void {
  const fpl = generateFPL(waypoints);
  const filename = 'flight-plan';
  
  downloadFile(fpl, `${filename}.fpl`, 'text/plain');
}

/**
 * JSON Export - Full flight plan data
 */
export function downloadJSON(plan: FlightPlanData): void {
  const json = JSON.stringify(plan, null, 2);
  const filename = (plan.name || 'flight-plan').replace(/[^a-z0-9]/gi, '-').toLowerCase();
  
  downloadFile(json, `${filename}.json`, 'application/json');
}

// Helper function to escape XML special characters
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Helper function to trigger file download
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
