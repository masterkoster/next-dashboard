'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import useSWR from 'swr';

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
  source?: string;
}

interface AircraftProfile {
  fuelCapacity: number;
  fuelBurnRate: number;
  cruiseSpeed: number;
  fuelType: '100LL' | 'JET-A' | 'MOGAS';
}

interface RoutePoint {
  airport: Airport;
  fuelNeeded: number;
  fuelAvailable: number;
  distanceFromPrevious: number;
}

// Fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

// Default fallback prices
const DEFAULT_FUEL_PRICE = 6.50;

// Demo fuel prices
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

// Demo airports
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
  { icao: 'KCLT', iata: 'CLT', name: 'Charlotte Douglas International', city: 'Charlotte', country: 'United States', latitude: 35.2144, longitude: -80.9473 },
  { icao: 'KSTL', iata: 'STL', name: 'St. Louis Lambert International', city: 'St. Louis', country: 'United States', latitude: 38.7499, longitude: -90.3742 },
  { icao: 'KPDX', iata: 'PDX', name: 'Portland International', city: 'Portland', country: 'United States', latitude: 45.5898, longitude: -122.5951 },
  { icao: 'KRDU', iata: 'RDU', name: 'Raleigh-Durham International', city: 'Raleigh', country: 'United States', latitude: 35.8801, longitude: -78.7880 },
  { icao: 'KSMF', iata: 'SMF', name: 'Sacramento International', city: 'Sacramento', country: 'United States', latitude: 38.6954, longitude: -121.5908 },
  { icao: 'KIND', iata: 'IND', name: 'Indianapolis International', city: 'Indianapolis', country: 'United States', latitude: 39.7173, longitude: -86.2944 },
  { icao: 'KCMH', iata: 'CMH', name: 'John Glenn Columbus International', city: 'Columbus', country: 'United States', latitude: 39.9980, longitude: -82.8919 },
  { icao: 'KOMA', iata: 'OMA', name: 'Eppley Airfield', city: 'Omaha', country: 'United States', latitude: 41.3032, longitude: -95.8941 },
  { icao: 'KMCI', iata: 'MCI', name: 'Kansas City International', city: 'Kansas City', country: 'United States', latitude: 39.2976, longitude: -94.7139 },
  { icao: 'KMSY', iata: 'MSY', name: 'Louis Armstrong New Orleans International', city: 'New Orleans', country: 'United States', latitude: 29.9934, longitude: -90.2580 },
  { icao: 'KSLC', iata: 'SLC', name: 'Salt Lake City International', city: 'Salt Lake City', country: 'United States', latitude: 40.7899, longitude: -111.9791 },
  { icao: 'KABQ', iata: 'ABQ', name: 'Albuquerque International Sunport', city: 'Albuquerque', country: 'United States', latitude: 35.0402, longitude: -106.6092 },
  { icao: 'KSAN', iata: 'SAN', name: 'San Diego International', city: 'San Diego', country: 'United States', latitude: 32.7336, longitude: -117.1897 },
  { icao: 'KTUS', iata: 'TUS', name: 'Tucson International', city: 'Tucson', country: 'United States', latitude: 32.1143, longitude: -110.9381 },
  { icao: 'KPBI', iata: 'PBI', name: 'Palm Beach International', city: 'West Palm Beach', country: 'United States', latitude: 26.6832, longitude: -80.0959 },
];

// Calculate distance (NM)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3440.065;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Cache for fuel prices
const fuelPriceCache: Record<string, FuelPrice> = {};

async function getFuelPriceFromAPI(icao: string): Promise<FuelPrice | undefined> {
  // Check cache first
  if (fuelPriceCache[icao]) {
    return fuelPriceCache[icao];
  }
  
  // Check demo prices as fallback
  const demoPrice = DEMO_FUEL_PRICES.find(f => f.icao === icao);
  if (demoPrice) {
    return demoPrice;
  }
  
  // Try to fetch from API
  try {
    const res = await fetch(`/api/fuel?icao=${icao}`);
    if (res.ok) {
      const data = await res.json();
      if (data.price100ll) {
        const fuelPrice: FuelPrice = {
          icao: data.icao,
          price100ll: data.price100ll,
          priceJetA: data.priceJetA,
          priceMogas: null,
          lastUpdated: data.lastUpdated || '',
          source: data.source
        };
        fuelPriceCache[icao] = fuelPrice;
        return fuelPrice;
      }
    }
  } catch (e) {
    console.error('Error fetching fuel price:', e);
  }
  
  return undefined;
}

function calculateFuelNeeded(distanceNM: number, burnRateGPH: number, cruiseSpeedKTS: number, reservesPercent: number = 0.25): number {
  const flightHours = distanceNM / cruiseSpeedKTS;
  const fuelNeeded = flightHours * burnRateGPH;
  return fuelNeeded + (fuelNeeded * reservesPercent);
}

export default function FuelSaverPage() {
  const [aircraft, setAircraft] = useState<AircraftProfile>({
    fuelCapacity: 56,
    fuelBurnRate: 8.5,
    cruiseSpeed: 120,
    fuelType: '100LL',
  });
  
  const [departure, setDeparture] = useState<Airport | null>(null);
  const [destination, setDestination] = useState<Airport | null>(null);
  const [departureFuel, setDepartureFuel] = useState<number>(100);
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
  const [fuelPrices, setFuelPrices] = useState<Record<string, FuelPrice>>({});

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

  // Memoized search results
  const fromResultsMemo = useMemo(() => searchFrom.length >= 2 ? searchAirports(searchFrom) : [], [searchFrom]);
  const toResultsMemo = useMemo(() => searchTo.length >= 2 ? searchAirports(searchTo) : [], [searchTo]);
  
  // Fetch fuel prices for airports in route
  useEffect(() => {
    if (fuelStops.length > 0) {
      const fetchPrices = async () => {
        const prices: Record<string, FuelPrice> = {};
        for (const stop of fuelStops) {
          const price = await getFuelPriceFromAPI(stop.airport.icao);
          if (price) {
            prices[stop.airport.icao] = price;
          }
        }
        setFuelPrices(prev => ({ ...prev, ...prices }));
      };
      fetchPrices();
    }
  }, [fuelStops]);

  const calculateRoute = async () => {
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
    
    const stops: RoutePoint[] = [];
    
    const airportsAlongRoute = DEMO_AIRPORTS.filter(a => {
      if (a.icao === departure.icao || a.icao === destination.icao) return false;
      const distFromRoute = calculateDistance(
        (departure.latitude + destination.latitude) / 2,
        (departure.longitude + destination.longitude) / 2,
        a.latitude, a.longitude
      );
      return distFromRoute < 150;
    }).sort((a, b) => {
      const distA = calculateDistance(departure.latitude, departure.longitude, a.latitude, a.longitude);
      const distB = calculateDistance(departure.latitude, departure.longitude, b.latitude, b.longitude);
      return distA - distB;
    });

    stops.push({
      airport: departure,
      fuelNeeded: 0,
      fuelAvailable: fuelAtStart,
      distanceFromPrevious: 0,
    });

    if (fuelAtStart >= fuelNeeded) {
      stops.push({
        airport: destination,
        fuelNeeded: fuelNeeded,
        fuelAvailable: 0,
        distanceFromPrevious: distance,
      });
    } else {
      const numStops = Math.min(Math.ceil(fuelNeeded / (fuelCapacityGal * 0.8)), 3);
      const segmentDistance = distance / (numStops + 1);
      
      for (let i = 0; i < numStops; i++) {
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
    
    // Calculate estimated cost - try to get real prices
    const prices: Record<string, FuelPrice> = {};
    let totalPrice = 0;
    let priceCount = 0;
    
    for (const stop of stops) {
      const price = await getFuelPriceFromAPI(stop.airport.icao);
      if (price?.price100ll) {
        prices[stop.airport.icao] = price;
        totalPrice += price.price100ll;
        priceCount++;
      }
    }
    
    setFuelPrices(prev => ({ ...prev, ...prices }));
    const avgPrice = priceCount > 0 ? totalPrice / priceCount : DEFAULT_FUEL_PRICE;
    setEstimatedCost(fuelNeeded * avgPrice);
  };

  // SVG map dimensions
  const svgWidth = 600;
  const svgHeight = 400;
  const padding = 50;

  // Calculate SVG path
  const mapBounds = useMemo(() => {
    if (route.length < 2) return null;
    const lats = route.map(s => s.airport.latitude);
    const lons = route.map(s => s.airport.longitude);
    return {
      minLat: Math.min(...lats) - 3,
      maxLat: Math.max(...lats) + 3,
      minLon: Math.min(...lons) - 3,
      maxLon: Math.max(...lons) + 3,
    };
  }, [route]);

  const scaleX = (lon: number) => {
    if (!mapBounds) return svgWidth / 2;
    return padding + ((lon - mapBounds.minLon) / (mapBounds.maxLon - mapBounds.minLon)) * (svgWidth - padding * 2);
  };

  const scaleY = (lat: number) => {
    if (!mapBounds) return svgHeight / 2;
    return padding + ((mapBounds.maxLat - lat) / (mapBounds.maxLat - mapBounds.minLat)) * (svgHeight - padding * 2);
  };

  const pathD = route.map((stop, i) => {
    const x = scaleX(stop.airport.longitude);
    const y = scaleY(stop.airport.latitude);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-sky-400">Fuel Saver</h1>
          <p className="text-slate-400">Plan your route, find the best fuel prices, and save money</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                <div className="relative">
                  <label className="block text-sm text-slate-400 mb-1">From</label>
                  <input
                    type="text"
                    placeholder="Airport code"
                    value={searchFrom}
                    onChange={(e) => setSearchFrom(e.target.value)}
                    onFocus={() => setShowFromResults(true)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white uppercase"
                  />
                  {showFromResults && fromResultsMemo.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {fromResultsMemo.map((airport) => (
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
                
                <div className="relative">
                  <label className="block text-sm text-slate-400 mb-1">To</label>
                  <input
                    type="text"
                    placeholder="Airport code"
                    value={searchTo}
                    onChange={(e) => setSearchTo(e.target.value)}
                    onFocus={() => setShowToResults(true)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white uppercase"
                  />
                  {showToResults && toResultsMemo.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {toResultsMemo.map((airport) => (
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

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Fuel at Departure (%)</label>
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

          <div className="lg:col-span-2 space-y-6">
            {/* Map */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-lg font-semibold mb-4">🗺️ Route Map</h2>
              <div className="w-full h-64 bg-slate-900 rounded-xl overflow-hidden">
                {route.length >= 2 && mapBounds ? (
                  <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full">
                    {/* Background */}
                    <rect width={svgWidth} height={svgHeight} fill="#1e293b" />
                    
                    {/* Route line */}
                    <path d={pathD} stroke="#38bdf8" strokeWidth="2" strokeDasharray="5,5" fill="none" />
                    
                    {/* Airports */}
                    {route.map((stop, i) => {
                      const x = scaleX(stop.airport.longitude);
                      const y = scaleY(stop.airport.latitude);
                      const color = i === 0 ? '#22c55e' : i === route.length - 1 ? '#ef4444' : '#f59e0b';
                      const fuelPrice = fuelPrices[stop.airport.icao];
                      
                      return (
                        <g key={stop.airport.icao + i}>
                          <circle cx={x} cy={y} r="8" fill={color} />
                          <text x={x} y={y - 15} textAnchor="middle" fill="white" fontSize="12" fontFamily="sans-serif">
                            {stop.airport.icao}
                          </text>
                          {fuelPrice?.price100ll && (
                            <text x={x} y={y + 25} textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">
                              ${fuelPrice.price100ll.toFixed(2)}/gal
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                    {departure && destination ? 'Click Calculate to see route' : 'Enter departure and destination'}
                  </div>
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

                {fuelStops.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">⛽ Recommended Fuel Stops</h3>
                    <div className="space-y-2">
                      {fuelStops.map((stop, i) => {
                        const fuelPrice = fuelPrices[stop.airport.icao];
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
                                  <div className="text-xs text-slate-500">{fuelPrice.lastUpdated}</div>
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

                {fuelStops.length === 0 && (
                  <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-4 text-center">
                    <span className="text-emerald-400 font-medium">✅ Direct flight possible!</span>
                  </div>
                )}
              </div>
            )}

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <p className="text-amber-200 text-sm">
                <span className="font-medium">Demo Mode:</span> This is using placeholder data. 
                We're working on connecting real fuel price APIs. 
                <Link href="/signup" className="underline ml-1">Sign up</Link> to help prioritize features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
