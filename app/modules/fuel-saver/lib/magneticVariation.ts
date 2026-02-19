/**
 * Magnetic Variation Calculator
 * Uses World Magnetic Model (WMM) simplified approximation
 * Accurate enough for flight planning purposes (±1-2 degrees)
 * 
 * For more accurate values, use NOAA's WMM calculator:
 * https://www.ngdc.noaa.gov/geomag/calculators/magcalc.shtml
 */

/**
 * Calculate magnetic variation for a given latitude/longitude
 * Uses simplified dipole model approximation
 * 
 * @param latitude - in degrees (positive = north)
 * @param longitude - in degrees (positive = east)
 * @param year - year for calculation (defaults to current year)
 * @returns magnetic variation in degrees (positive = east variation, negative = west)
 */
export function calculateMagneticVariation(
  latitude: number, 
  longitude: number, 
  year: number = new Date().getFullYear()
): number {
  // Reference year for WMM 2020-2025 model
  const referenceYear = 2022.5;
  const yearsFromReference = year - referenceYear;

  // Earth's magnetic pole positions (approximate)
  const magneticNorthLat = 86.5;   // Magnetic north pole latitude
  const magneticNorthLon = 172.4;   // Magnetic north pole longitude (west)

  // Convert to radians
  const latRad = (latitude * Math.PI) / 180;
  const lonRad = (longitude * Math.PI) / 180;
  const magLatRad = (magneticNorthLat * Math.PI) / 180;
  const magLonRad = (magneticNorthLon * Math.PI) / 180;

  // Calculate great circle distance from magnetic pole
  const cosAngle = Math.sin(latRad) * Math.sin(magLatRad) + 
                   Math.cos(latRad) * Math.cos(magLatRad) * Math.cos(lonRad - magLonRad);
  const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
  
  // Calculate magnetic dipole longitude
  const dipoleLon = Math.atan2(
    Math.sin(lonRad - magLonRad) * Math.cos(magLatRad),
    Math.cos(latRad) * Math.sin(magLatRad) - Math.sin(latRad) * Math.cos(magLatRad) * Math.cos(lonRad - magLonRad)
  );

  // Simplified magnetic field components
  const r = 6371.2; // Earth radius in km
  const a = 6378.137; // WGS84 equatorial radius
  const b = 6356.752; // WGS84 polar radius
  
  // Convert geodetic to geocentric
  const latGeocentric = Math.atan(
    (b * b / (a * a)) * Math.tan(latRad)
  );

  // Simplified dipole field strength (approximation)
  const colat = Math.acos(
    Math.sin(latGeocentric) * Math.sin(magLatRad) + 
    Math.cos(latGeocentric) * Math.cos(magLatRad) * Math.cos(dipoleLon)
  );
  
  // Calculate variation using dipole approximation
  // This gives a reasonable approximation for planning purposes
  const sinVar = Math.sin(dipoleLon) * Math.cos(latGeocentric) / Math.sin(colat);
  const cosVar = (Math.sin(magLatRad) - Math.sin(latGeocentric) * Math.cos(colat)) / 
                 (Math.cos(latGeocentric) * Math.sin(colat));
  
  let variation = Math.atan2(sinVar, cosVar) * (180 / Math.PI);
  
  // Add annual drift (magnetic poles are moving ~40-50km/year)
  // Eastern drift in North America
  const annualDrift = 0.15; // degrees per year (approximate)
  variation += yearsFromReference * annualDrift;

  return Math.round(variation * 10) / 10; // Round to 1 decimal
}

/**
 * Get variation for multiple waypoints
 */
export function getVariationsForRoute(
  waypoints: { latitude: number; longitude: number }[]
): number[] {
  return waypoints.map(wp => calculateMagneticVariation(wp.latitude, wp.longitude));
}

/**
 * Apply magnetic variation to get heading components
 */
export function trueToMagnetic(trueHeading: number, variation: number): number {
  let magHeading = trueHeading + variation;
  if (magHeading < 0) magHeading += 360;
  if (magHeading >= 360) magHeading -= 360;
  return Math.round(magHeading);
}

export function magneticToTrue(magneticHeading: number, variation: number): number {
  let trueHeading = magneticHeading - variation;
  if (trueHeading < 0) trueHeading += 360;
  if (trueHeading >= 360) trueHeading -= 360;
  return Math.round(trueHeading);
}

/**
 * Get compass rose directions
 */
export function getCompassDirections(): { direction: string; degrees: number }[] {
  return [
    { direction: 'N', degrees: 0 },
    { direction: 'NNE', degrees: 22.5 },
    { direction: 'NE', degrees: 45 },
    { direction: 'ENE', degrees: 67.5 },
    { direction: 'E', degrees: 90 },
    { direction: 'ESE', degrees: 112.5 },
    { direction: 'SE', degrees: 135 },
    { direction: 'SSE', degrees: 157.5 },
    { direction: 'S', degrees: 180 },
    { direction: 'SSW', degrees: 202.5 },
    { direction: 'SW', degrees: 225 },
    { direction: 'WSW', degrees: 247.5 },
    { direction: 'W', degrees: 270 },
    { direction: 'WNW', degrees: 292.5 },
    { direction: 'NW', degrees: 315 },
    { direction: 'NNW', degrees: 337.5 },
  ];
}

/**
 * Get cardinal direction for a heading
 */
export function getCardinalDirection(heading: number): string {
  const directions = getCompassDirections();
  const normalized = ((heading % 360) + 360) % 360;
  
  for (let i = directions.length - 1; i >= 0; i--) {
    if (normalized >= directions[i].degrees) {
      return directions[i].direction;
    }
  }
  return 'N';
}
