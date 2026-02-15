'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// Types
interface Airport {
  icao: string;
  iata: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface FuelPrice {
  icao: string;
  price100ll: number | null;
  priceJetA: number | null;
  priceMogas: number | null;
  lastUpdated: string;
}

interface AircraftProfile {
  fuelCapacity: number; // gallons
  fuelBurnRate: number; // GPH
  cruiseSpeed: number; // KTS
  fuelType: '100LL' | 'JET-A' | 'MOGAS';
}

interface RoutePoint {
  airport: Airport;
  fuelNeeded: number;
  fuelAvailable: number;
  distanceFromPrevious: number;
}

// Demo fuel prices (will connect to API later)
const DEMO_FUEL_PRICES: FuelPrice[] = [
  { icao: 'KORD', price100ll: 5.89, priceJetA: 4.99, priceMogas: null, lastUpdated: '2026-02-15' },
  { icao: 'KLAX', price100ll: 6.49, priceJetA: 5.59, priceMogas: null, lastUpdated: '2026-02-15' },
  { icao: 'KJFK', price100ll: 6.99, priceJetA: 5.79, priceMogas: null, lastUpdated: '2026-02-15' },
  { icao: 'KATL', price100ll: 5.49, priceJetA: 4.59, priceMogas: null, lastUpdated: '2026-02-15' },
  { icao: 'KDEN', price100ll: 5.29, priceJetA: 4.39, priceMogas: null, lastUpdated: '2026-02-15' },
  { icao: 'KSFO', price100ll: 6.79, priceJetA: 5.89, priceMogas: null, lastUpdated: '2026-02-15' },
  { icao: 'KLAS', price100ll: 5.59, priceJetA: 4.79, priceMogas: null, lastUpdated: '2026-02-15' },
  { icao: 'KSEA', price100ll: 6.19, priceJetA: 5.29, priceMogas: null, lastUpdated: '2026-02-15' },
  { icao: 'KMIA', price100ll: 5.79, priceJetA: 4.89, priceMogas: null, lastUpdated: '2026-02-15' },
  { icao: 'KDFW', price100ll: 5.39, priceJetA: 4.49, priceMogas: null, lastUpdated: '2026-02-15' },
  { icao: 'KPHX', price100ll: 5.49, priceJetA: 4.69, priceMogas: null, lastUpdated: '2026-02-15' },
  { icao: 'KIAH', price100ll: 5.29, priceJetA: 4.39, priceMogas: null, lastUpdated: '2026-02-15' },
  { icao: 'KBOS', price100ll: 6.49, priceJetA: 5.59, priceMogas: null, lastUpdated: '2026-02-15' },
  { icao: 'KMSP', price100ll: 5.59, priceJetA: 4.79, priceMogas: null, lastUpdated: '2026-02-15' },
  { icao: 'KDCA', price100ll: 6.29, priceJetA: 5.39, priceMogas: null, lastUpdated: '2026-02-15' },
];

// Demo airports for search
const DEMO_AIRPORTS: Airport[] = [
  { icao: 'KORD', iata: 'ORD', name: "Chicago O'Hare International", city: 'Chicago', country: 'United States', latitude: 41.9742, longitude: -87.9073 },
  { icao: 'KLAX', iata: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'United States', latitude: 33.9425, longitude: -118.4081 },
  { icao: 'KJFK', iata: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'United States', latitude: 40.6413, longitude: -73.7781 },
  { icao: 'KATL', iata: 'ATL', name: 'Hartsfield-Jackson Atlanta International', city: 'Atlanta', country: 'United States', latitude: 33.6407, longitude: -84.4277 },
  { icao: 'KDEN', iata: 'DEN', name: 'Denver International', city: 'Denver', country: 'United States', latitude: 39.8561, longitude: -104.6737 },
  { icao: 'KSFO', iata: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'United States', latitude: 37.6213, longitude: -122.3790 },
  { icao: 'KLAS', iata: 'LAS', name: 'Harry Reid International', city: 'Las Vegas', country: 'United States', latitude: 36.0840, longitude: -115.1537 },
  { icao: 'KSEA', iata: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle', country: 'United States', latitude: 47.4502, longitude: -122.3088 },
  { icao: 'KMIA', iata: 'MIA', name: 'Miami International', city: 'Miami', country: 'United States', latitude: 25.7959, longitude: -80.2870 },
  { icao: 'KDFW', iata: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'United States', latitude: 32.8998, longitude: -97.0403 },
  { icao: 'KPHX', iata: 'PHX', name: 'Phoenix Sky Harbor International', city: 'Phoenix', country: 'United States', latitude: 33.4352, longitude: -112.0101 },
  { icao: 'KIAH', iata: 'IAH', name: 'George Bush Intercontinental', city: 'Houston', country: 'United States', latitude: 29.9902, longitude: -95.3368 },
  { icao: 'KBOS', iata: 'BOS', name: 'Boston Logan International', city: 'Boston', country: 'United States', latitude: 42.3656, longitude: -71.0096 },
  { icao: 'KMSP', iata: 'MSP', name: 'Minneapolis-St Paul International', city: 'Minneapolis', country: 'United States', latitude: 44.8820, longitude: -93.2218 },
  { icao: 'KDCA', iata: 'DCA', name: 'Ronald Reagan Washington National', city: 'Washington', country: 'United States', latitude: 38.8512, longitude: -77.0402 },
  { icao: 'KSNA', iata: 'SNA', name: 'John Wayne Airport', city: 'Santa Ana', country: 'United States', latitude: 33.6762, longitude: -117.8682 },
  { icao: 'KTUS', iata: 'TUS', name: 'Tucson International', city: 'Tucson', country: 'United States', latitude: 32.1143, longitude: -110.9381 },
  { icao: 'KABQ', iata: 'ABQ', name: 'Albuquerque International Sunport', city: 'Albuquerque', country: 'United States', latitude: 35.0402, longitude: -106.6092 },
  { icao: 'KSAN', iata: 'SAN', name: 'San Diego International', city: 'San Diego', country: 'United States', latitude: 32.7336, longitude: -117.1897 },
  { icao: 'KPBI', iata: 'PBI', name: 'Palm Beach International', city: 'West Palm Beach', country: 'United States', latitude: 26.6832, longitude: -80.0959 },
  { icao: 'KORD', iata: 'ORD', name: "Chicago O'Hare International", city: 'Chicago', country: 'United States', latitude: 41.9742, longitude: -87.9073 },
  { icao: 'KCLT', iata: 'CLT', name: 'Charlotte Douglas International', city: 'Charlotte', country: 'United States', latitude: 35.2144, longitude: -80.9473 },
  { icao: 'KSTL', iata: 'STL', name: 'St. Louis Lambert International', city: 'St. Louis', country: 'United States', latitude: 38.7499, longitude: -90.3742 },
  { icao: 'KPHL', iata: 'PHL', name: 'Philadelphia International', city: 'Philadelphia', country: 'United States', latitude: 39.8744, longitude: -75.2424 },
  { icao: 'KSLC', iata: 'SLC', name: 'Salt Lake City International', city: 'Salt Lake City', country: 'United States', latitude: 40.7899, longitude: -111.9791 },
  { icao: 'KIND', iata: 'IND', name: 'Indianapolis International', city: 'Indianapolis', country: 'United States', latitude: 39.7173, longitude: -86.2944 },
  { icao: 'KCVG', iata: 'CVG', name: 'Cincinnati/Northern Kentucky International', city: 'Cincinnati', country: 'United States', latitude: 39.0533, longitude: -84.6630 },
  { icao: 'KCMH', iata: 'CMH', name: 'John Glenn Columbus International', city: 'Columbus', country: 'United States', latitude: 39.9980, longitude: -82.8919 },
  { icao: 'KPDX', iata: 'PDX', name: 'Portland International', city: 'Portland', country: 'United States', latitude: 45.5898, longitude: -122.5951 },
  { icao: 'KSMF', iata: 'SMF', name: 'Sacramento International', city: 'Sacramento', country: 'United States', latitude: 38.6954, longitude: -121.5908 },
  { icao: 'KRDU', iata: 'RDU', name: 'Raleigh-Durham International', city: 'Raleigh', country: 'United States', latitude: 35.8801, longitude: -78.7880 },
  { icao: 'KOMA', iata: 'OMA', name: 'Eppley Airfield', city: 'Omaha', country: 'United States', latitude: 41.3032, longitude: -95.8941 },
  { icao: 'KMCI', iata: 'MCI', name: 'Kansas City International', city: 'Kansas City', country: 'United States', latitude: 39.2976, longitude: -94.7139 },
  { icao: 'KMSY', iata: 'MSY', name: 'Louis Armstrong New Orleans International', city: 'New Orleans', country: 'United States', latitude: 29.9934, longitude: -90.2580 },
  { icao: 'KBDL', iata: 'BDL', name: 'Bradley International', city: 'Windsor Locks', country: 'United States', latitude: 41.9389, longitude: -72.6832 },
  { icao: 'KSWF', iata: 'SWF', name: 'Stewart International', city: 'Newburgh', country: 'United States', latitude: 41.5042, longitude: -74.1049 },
  { icao: 'KMAF', iata: 'MAF', name: 'Midland International Air & Space Port', city: 'Midland', country: 'United States', latitude: 31.9425, longitude: -102.2019 },
  { icao: 'KABQ', iata: 'ABQ', name: 'Albuquerque International Sunport', city: 'Albuquerque', country: 'United States', latitude: 35.0402, longitude: -106.6092 },
  { icao: 'KTUL', iata: 'TUL', name: 'Tulsa International', city: 'Tulsa', country: 'United States', latitude: 36.1989, longitude: -95.8881 },
  { icao: 'KOKC', iata: 'OKC', name: 'Will Rogers World Airport', city: 'Oklahoma City', country: 'United States', latitude: 35.4264, longitude: -97.6008 },
  { icao: 'KELP', iata: 'ELP', name: 'El Paso International', city: 'El Paso', country: 'United States', latitude: 31.8072, longitude: -106.3773 },
  { icao: 'KRIC', iata: 'RIC', name: 'Richmond International', city: 'Richmond', country: 'United States', latitude: 37.5052, longitude: -77.3197 },
  { icao: 'KBNA', iata: 'BNA', name: 'Nashville International', city: 'Nashville', country: 'United States', latitude: 36.1263, longitude: -86.6774 },
  { icao: 'KJAX', iata: 'JAX', name: 'Jacksonville International', city: 'Jacksonville', country: 'United States', latitude: 30.4941, longitude: -81.6879 },
  { icao: 'KCMI', iata: 'CMH', name: 'University of Illinois Willard', city: 'Champaign', country: 'United States', latitude: 40.0392, longitude: -88.2780 },
  { icao: 'KBMI', iata: 'BMI', name: 'Central Illinois Regional', city: 'Bloomington', country: 'United States', latitude: 40.4779, longitude: -88.9159 },
  { icao: 'KSPI', iata: 'SPI', name: 'Abraham Lincoln Capital', city: 'Springfield', country: 'United States', latitude: 39.8441, longitude: -89.6779 },
  { icao: 'KLAF', iata: 'LAF', name: 'Purdue University', city: 'Lafayette', country: 'United States', latitude: 40.4123, longitude: -86.9368 },
  { icao: 'KEWR', iata: 'EWR', name: 'Newark Liberty International', city: 'Newark', country: 'United States', latitude: 40.6895, longitude: -74.1745 },
  { icao: 'KLGA', iata: 'LGA', name: 'LaGuardia International', city: 'New York', country: 'United States', latitude: 40.7769, longitude: -73.8740 },
  { icao: 'KTTN', iata: 'TTN', name: 'Trenton-Mercer', city: 'Trenton', country: 'United States', latitude: 40.2766, longitude: -74.8135 },
  { icao: 'KHPN', iata: 'HPN', name: 'Westchester County', city: 'White Plains', country: 'United States', latitude: 41.0670, longitude: -73.7076 },
  { icao: 'KTEB', iata: 'TEB', name: 'Teterboro', city: 'Teterboro', country: 'United States', latitude: 40.8503, longitude: -74.0608 },
  { icao: 'KDCA', iata: 'DCA', name: 'Ronald Reagan Washington National', city: 'Washington', country: 'United States', latitude: 38.8512, longitude: -77.0402 },
  { icao: 'KIAD', iata: 'IAD', name: 'Washington Dulles International', city: 'Washington', country: 'United States', latitude: 38.9531, longitude: -77.4565 },
  { icao: 'KBWI', iata: 'BWI', name: 'Baltimore/Washington International', city: 'Baltimore', country: 'United States', latitude: 39.1774, longitude: -76.6684 },
];

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3440.065; // Earth radius in nautical miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Returns distance in NM
}

// Get fuel price for an airport
function getFuelPrice(icao: string): FuelPrice | undefined {
  return DEMO_FUEL_PRICES.find(f => f.icao === icao);
}

// Calculate fuel needed
function calculateFuelNeeded(distanceNM: number, burnRateGPH: number, cruiseSpeedKTS: number, reservesPercent: number = 0.25): number {
  const flightHours = distanceNM / cruiseSpeedKTS;
  const fuelNeeded = flightHours * burnRateGPH;
  const reserves = fuelNeeded * reservesPercent;
  return fuelNeeded + reserves;
}

export default function FuelSaverPage() {
  // State
  const [aircraft, setAircraft] = useState<AircraftProfile>({
    fuelCapacity: 56, // Default for C172
    fuelBurnRate: 8.5, // C172 GPH
    cruiseSpeed: 120, // C172 cruise KTS
    fuelType: '100LL',
  });
  
  const [departure, setDeparture] = useState<Airport | null>(null);
  const [destination, setDestination] = useState<Airport | null>(null);
  const [departureFuel, setDepartureFuel] = useState<number>(100); // Percentage
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [fromResults, setFromResults] = useState<Airport[]>([]);
  const [toResults, setToResults] = useState<Airport[]>([]);
  const [showFromResults, setShowFromResults] = useState(false);
  const [showToResults, setShowToResults] = useState(false);
  const [route, setRoute] = useState<RoutePoint[]>([]);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [totalFuelNeeded, setTotalFuelNeeded] = useState<number>(0);
  const [fuelStops, setFuelStops] = useState<RoutePoint[]>([]);
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Search airports
  const searchAirports = (query: string): Airport[] => {
    if (!query || query.length < 2) return [];
    const q = query.toUpperCase();
    return DEMO_AIRPORTS.filter(a => 
      a.icao.includes(q) || 
      a.iata?.includes(q) || 
      a.name.toUpperCase().includes(q) ||
      a.city.toUpperCase().includes(q)
    ).slice(0, 8);
  };

  // Handle search input
  useEffect(() => {
    if (searchFrom.length >= 2) {
      setFromResults(searchAirports(searchFrom));
      setShowFromResults(true);
    } else {
      setFromResults([]);
      setShowFromResults(false);
    }
  }, [searchFrom]);

  useEffect(() => {
    if (searchTo.length >= 2) {
      setToResults(searchAirports(searchTo));
      setShowToResults(true);
    } else {
      setToResults([]);
      setShowToResults(false);
    }
  }, [searchTo]);

  // Calculate route
  const calculateRoute = () => {
    if (!departure || !destination) return;

    const distance = calculateDistance(
      departure.latitude, departure.longitude,
      destination.latitude, destination.longitude
    );
    
    setTotalDistance(distance);
    
    const fuelNeeded = calculateFuelNeeded(distance, aircraft.fuelBurnRate, aircraft.cruiseSpeed);
    setTotalFuelNeeded(fuelNeeded);
    
    const fuelCapacityGal = aircraft.fuelCapacity;
    const fuelAtStart = (departureFuel / 100) * fuelCapacityGal;
    
    // Determine if we need fuel stops
    const stops: RoutePoint[] = [];
    let currentFuel = fuelAtStart;
    let currentLat = departure.latitude;
    let currentLon = departure.longitude;
    let remainingDistance = distance;
    
    // Simple algorithm: check for fuel stops every ~2 hours of flight
    const maxRange = (fuelCapacityGal / aircraft.fuelBurnRate) * aircraft.cruiseSpeed * 0.8; // 80% of max range
    
    // For demo, find airports along the route (simplified)
    const airportsAlongRoute = DEMO_AIRPORTS.filter(a => {
      if (a.icao === departure.icao || a.icao === destination.icao) return false;
      const distFromRoute = calculateDistance(
        (departure.latitude + destination.latitude) / 2,
        (departure.longitude + destination.longitude) / 2,
        a.latitude, a.longitude
      );
      return distFromRoute < 150; // Within 150 NM of route center
    }).sort((a, b) => {
      const distA = calculateDistance(departure.latitude, departure.longitude, a.latitude, a.longitude);
      const distB = calculateDistance(departure.latitude, departure.longitude, b.latitude, b.longitude);
      return distA - distB;
    });

    // Add departure point
    stops.push({
      airport: departure,
      fuelNeeded: 0,
      fuelAvailable: fuelAtStart,
      distanceFromPrevious: 0,
    });

    // Check if we can make it direct
    if (fuelAtStart >= fuelNeeded) {
      // Direct flight possible
      stops.push({
        airport: destination,
        fuelNeeded: fuelNeeded,
        fuelAvailable: 0,
        distanceFromPrevious: distance,
      });
    } else {
      // Need fuel stops - simplify for demo
      const numStops = Math.ceil(fuelNeeded / (fuelCapacityGal * 0.8));
      const segmentDistance = distance / (numStops + 1);
      
      for (let i = 0; i < numStops && i < 3; i++) {
        // Find best airport for this segment
        const targetDist = (i + 1) * segmentDistance;
        const bestStop = airportsAlongRoute.find(a => {
          const dist = calculateDistance(departure.latitude, departure.longitude, a.latitude, a.longitude);
          return dist >= targetDist - 50 && dist <= targetDist + 100;
        });
        
        if (bestStop) {
          const distFromDep = calculateDistance(departure.latitude, departure.longitude, bestStop.latitude, bestStop.longitude);
          const segFuel = calculateFuelNeeded(distFromDep, aircraft.fuelBurnRate, aircraft.cruiseSpeed);
          
          stops.push({
            airport: bestStop,
            fuelNeeded: segFuel,
            fuelAvailable: fuelCapacityGal,
            distanceFromPrevious: distFromDep,
          });
        }
      }
      
      // Add destination
      const lastStop = stops[stops.length - 1];
      const finalDist = calculateDistance(lastStop.airport.latitude, lastStop.airport.longitude, destination.latitude, destination.longitude);
      const finalFuel = calculateFuelNeeded(finalDist, aircraft.fuelBurnRate, aircraft.cruiseSpeed);
      
      stops.push({
        airport: destination,
        fuelNeeded: finalFuel,
        fuelAvailable: 0,
        distanceFromPrevious: finalDist,
      });
    }
    
    setFuelStops(stops.slice(1, -1));
    setRoute(stops);
    
    // Calculate estimated cost
    const avgPrice = DEMO_FUEL_PRICES.length > 0 
      ? DEMO_FUEL_PRICES.reduce((sum, f) => sum + (f.price100ll || 0), 0) / DEMO_FUEL_PRICES.length
      : 5.50;
    setEstimatedCost(fuelNeeded * avgPrice);
    
    // Draw on map
    setTimeout(() => drawRouteOnMap(stops), 100);
  };

  // Draw route on map (simplified - will use Leaflet later)
  const drawRouteOnMap = (stops: RoutePoint[]) => {
    if (!mapRef.current) return;
    
    // Clear previous
    mapRef.current.innerHTML = '';
    
    // Create canvas for simple route visualization
    const canvas = document.createElement('canvas');
    const canvasWidth = mapRef.current!.clientWidth || 600;
    const canvasHeight = 400;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.width = '100%';
    canvas.style.height = '400px';
    canvas.style.borderRadius = '12px';
    canvas.style.background = '#1e293b';
    mapRef.current!.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    if (!ctx || stops.length < 2 || canvasWidth === 0) {
      mapRef.current.innerHTML = '<p class="text-slate-500 text-center py-16">Unable to render map</p>';
      return;
    }
    
    // Draw simple route line
    const padding = 40;
    const width = canvasWidth - padding * 2;
    const height = canvasHeight - padding * 2;
    
    // Find bounds
    const lats = stops.map(s => s.airport.latitude);
    const lons = stops.map(s => s.airport.longitude);
    const minLat = Math.min(...lats) - 2;
    const maxLat = Math.max(...lats) + 2;
    const minLon = Math.min(...lons) - 2;
    const maxLon = Math.max(...lons) + 2;
    
    const scaleX = (lon: number) => padding + ((lon - minLon) / (maxLon - minLon)) * width;
    const scaleY = (lat: number) => padding + ((maxLat - lat) / (maxLat - minLat)) * height;
    
    // Draw route
    ctx.beginPath();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    
    stops.forEach((stop, i) => {
      const x = scaleX(stop.airport.longitude);
      const y = scaleY(stop.airport.latitude);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw airports
    stops.forEach((stop, i) => {
      const x = scaleX(stop.airport.longitude);
      const y = scaleY(stop.airport.latitude);
      
      // Dot
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? '#22c55e' : i === stops.length - 1 ? '#ef4444' : '#f59e0b';
      ctx.fill();
      
      // Label
      ctx.fillStyle = '#fff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(stop.airport.icao, x, y - 15);
      
      // Fuel price if available
      const fuelPrice = getFuelPrice(stop.airport.icao);
      if (fuelPrice && fuelPrice.price100ll) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px sans-serif';
        ctx.fillText(`$${fuelPrice.price100ll.toFixed(2)}/gal`, x, y + 25);
      }
    });
    
    setMapLoaded(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-sky-400">Fuel Saver</h1>
          <p className="text-slate-400">Plan your route, find the best fuel prices, and save money</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Inputs */}
          <div className="lg:col-span-1 space-y-6">
            {/* Aircraft Profile */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-lg font-semibold mb-4">✈️ Aircraft Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Fuel Capacity (gallons)</label>
                  <input
                    type="number"
                    value={aircraft.fuelCapacity}
                    onChange={(e) => setAircraft({ ...aircraft, fuelCapacity: Number(e.target.value) })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Fuel Burn Rate (GPH)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={aircraft.fuelBurnRate}
                    onChange={(e) => setAircraft({ ...aircraft, fuelBurnRate: Number(e.target.value) })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Cruise Speed (KTS)</label>
                  <input
                    type="number"
                    value={aircraft.cruiseSpeed}
                    onChange={(e) => setAircraft({ ...aircraft, cruiseSpeed: Number(e.target.value) })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Fuel Type</label>
                  <select
                    value={aircraft.fuelType}
                    onChange={(e) => setAircraft({ ...aircraft, fuelType: e.target.value as any })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="100LL">100LL (Avgas)</option>
                    <option value="JET-A">JET-A</option>
                    <option value="MOGAS">MOGAS</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Route Input */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-lg font-semibold mb-4">🗺️ Flight Plan</h2>
              <div className="space-y-4">
                {/* Departure */}
                <div className="relative">
                  <label className="block text-sm text-slate-400 mb-1">From</label>
                  <input
                    type="text"
                    placeholder="Airport code (e.g., KORD)"
                    value={searchFrom}
                    onChange={(e) => setSearchFrom(e.target.value)}
                    onFocus={() => setShowFromResults(true)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white uppercase"
                  />
                  {showFromResults && fromResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {fromResults.map((airport) => (
                        <button
                          key={airport.icao}
                          onClick={() => {
                            setDeparture(airport);
                            setSearchFrom(airport.icao);
                            setShowFromResults(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-600 text-white"
                        >
                          <span className="font-medium">{airport.icao}</span>
                          <span className="text-slate-400 text-sm ml-2">{airport.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Destination */}
                <div className="relative">
                  <label className="block text-sm text-slate-400 mb-1">To</label>
                  <input
                    type="text"
                    placeholder="Airport code (e.g., KLAX)"
                    value={searchTo}
                    onChange={(e) => setSearchTo(e.target.value)}
                    onFocus={() => setShowToResults(true)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white uppercase"
                  />
                  {showToResults && toResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {toResults.map((airport) => (
                        <button
                          key={airport.icao}
                          onClick={() => {
                            setDestination(airport);
                            setSearchTo(airport.icao);
                            setShowToResults(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-600 text-white"
                        >
                          <span className="font-medium">{airport.icao}</span>
                          <span className="text-slate-400 text-sm ml-2">{airport.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Fuel at start */}
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Fuel at Departure (% of tank)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={departureFuel}
                    onChange={(e) => setDepartureFuel(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center text-sky-400 font-medium">{departureFuel}%</div>
                </div>

                {/* Calculate Button */}
                <button
                  onClick={calculateRoute}
                  disabled={!departure || !destination}
                  className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition"
                >
                  Calculate Route
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-lg font-semibold mb-4">🗺️ Route Map</h2>
              <div 
                ref={mapRef} 
                className="w-full h-64 bg-slate-900 rounded-xl flex items-center justify-center"
              >
                {!mapLoaded && (
                  <p className="text-slate-500">
                    {departure && destination 
                      ? 'Enter airports and click Calculate to see route'
                      : 'Enter departure and destination airports'}
                  </p>
                )}
              </div>
            </div>

            {/* Results Summary */}
            {route.length > 0 && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h2 className="text-lg font-semibold mb-4">📊 Trip Summary</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-sky-400">{Math.round(totalDistance)}</div>
                    <div className="text-sm text-slate-400">NM Distance</div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-amber-400">{totalFuelNeeded.toFixed(1)}</div>
                    <div className="text-sm text-slate-400">Gal Fuel Needed</div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">{fuelStops.length}</div>
                    <div className="text-sm text-slate-400">Fuel Stops</div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-400">${estimatedCost.toFixed(0)}</div>
                    <div className="text-sm text-slate-400">Est. Fuel Cost</div>
                  </div>
                </div>

                {/* Fuel Stops */}
                {fuelStops.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">⛽ Recommended Fuel Stops</h3>
                    <div className="space-y-2">
                      {fuelStops.map((stop, i) => {
                        const fuelPrice = getFuelPrice(stop.airport.icao);
                        return (
                          <div key={i} className="flex justify-between items-center bg-slate-700 rounded-lg p-3">
                            <div>
                              <span className="font-medium">{stop.airport.icao}</span>
                              <span className="text-slate-400 text-sm ml-2">{stop.airport.name}</span>
                            </div>
                            <div className="text-right">
                              {fuelPrice?.price100ll ? (
                                <>
                                  <div className="text-emerald-400 font-medium">${fuelPrice.price100ll.toFixed(2)}/gal</div>
                                  <div className="text-xs text-slate-500">Last updated: {fuelPrice.lastUpdated}</div>
                                </>
                              ) : (
                                <div className="text-slate-500">Price N/A</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {fuelStops.length === 0 && route.length > 0 && (
                  <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-4 text-center">
                    <span className="text-emerald-400 font-medium">✅ Direct flight possible!</span>
                    <p className="text-sm text-slate-400 mt-1">You have enough fuel to make the trip without stopping.</p>
                  </div>
                )}
              </div>
            )}

            {/* Demo Notice */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <p className="text-amber-200 text-sm">
                <span className="font-medium">Demo Mode:</span> This is using placeholder data. 
                We're working on connecting real fuel price APIs. 
                <Link href="/contact" className="underline ml-1">Contact us</Link> to help prioritize features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
