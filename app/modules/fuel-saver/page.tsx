'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import for Leaflet components (no SSR)
const LeafletMap = dynamic(() => import('./LeafletMap'), { ssr: false });

// Types
interface Airport {
  icao: string;
  iata?: string;
  name: string;
  city?: string;
  country?: string;
  latitude: number;
  longitude: number;
  type?: string;
  elevation_ft?: number;
}

interface Waypoint {
  id: string;
  icao: string;
  name: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  sequence: number;
}

interface FuelPrice {
  icao: string;
  price100ll: number | null;
  priceJetA: number | null;
  lastUpdated: string;
  source?: string;
}

// Demo airports (fallback)
const DEMO_AIRPORTS: Airport[] = [
  { icao: 'KORD', iata: 'ORD', name: "Chicago O'Hare International", city: 'Chicago', latitude: 41.9742, longitude: -87.9073, type: 'large_airport' },
  { icao: 'KLAX', iata: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', latitude: 33.9425, longitude: -118.4081, type: 'large_airport' },
  { icao: 'KJFK', iata: 'JFK', name: 'John F. Kennedy International', city: 'New York', latitude: 40.6413, longitude: -73.7781, type: 'large_airport' },
  { icao: 'KATL', iata: 'ATL', name: 'Hartsfield-Jackson Atlanta', city: 'Atlanta', latitude: 33.6407, longitude: -84.4277, type: 'large_airport' },
  { icao: 'KDEN', iata: 'DEN', name: 'Denver International', city: 'Denver', latitude: 39.8561, longitude: -104.6737, type: 'large_airport' },
  { icao: 'KSFO', iata: 'SFO', name: 'San Francisco International', city: 'San Francisco', latitude: 37.6213, longitude: -122.379, type: 'large_airport' },
  { icao: 'KLAS', iata: 'LAS', name: 'Harry Reid International', city: 'Las Vegas', latitude: 36.084, longitude: -115.1537, type: 'large_airport' },
  { icao: 'KSEA', iata: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle', latitude: 47.4502, longitude: -122.3088, type: 'large_airport' },
  { icao: 'KMIA', iata: 'MIA', name: 'Miami International', city: 'Miami', latitude: 25.7959, longitude: -80.287, type: 'large_airport' },
  { icao: 'KDFW', iata: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas', latitude: 32.8998, longitude: -97.0403, type: 'large_airport' },
  { icao: 'KPHX', iata: 'PHX', name: 'Phoenix Sky Harbor', city: 'Phoenix', latitude: 33.4352, longitude: -112.0101, type: 'large_airport' },
  { icao: 'KIAH', iata: 'IAH', name: 'George Bush Intercontinental', city: 'Houston', latitude: 29.9902, longitude: -95.3368, type: 'large_airport' },
  { icao: 'KBOS', iata: 'BOS', name: 'Boston Logan International', city: 'Boston', latitude: 42.3656, longitude: -71.0096, type: 'large_airport' },
  { icao: 'KMSP', iata: 'MSP', name: 'Minneapolis-St Paul International', city: 'Minneapolis', latitude: 44.882, longitude: -93.2218, type: 'large_airport' },
  { icao: 'KCLT', iata: 'CLT', name: 'Charlotte Douglas International', city: 'Charlotte', latitude: 35.2144, longitude: -80.9473, type: 'large_airport' },
  { icao: 'KSTL', iata: 'STL', name: 'St. Louis Lambert International', city: 'St. Louis', latitude: 38.7499, longitude: -90.3742, type: 'large_airport' },
  { icao: 'KPDX', iata: 'PDX', name: 'Portland International', city: 'Portland', latitude: 45.5898, longitude: -122.5951, type: 'large_airport' },
  { icao: 'KRDU', iata: 'RDU', name: 'Raleigh-Durham International', city: 'Raleigh', latitude: 35.8801, longitude: -78.788, type: 'large_airport' },
  { icao: 'KSMF', iata: 'SMF', name: 'Sacramento International', city: 'Sacramento', latitude: 38.6954, longitude: -121.5908, type: 'medium_airport' },
  { icao: 'KVNY', iata: 'VNY', name: 'Van Nuys Airport', city: 'Van Nuys', latitude: 34.2098, longitude: -118.4895, type: 'medium_airport' },
];

// Demo fuel prices
const DEMO_FUEL_PRICES: FuelPrice[] = [
  { icao: 'KORD', price100ll: 9.58, priceJetA: 9.58, lastUpdated: '2026-02-15' },
  { icao: 'KLAX', price100ll: 10.65, priceJetA: 10.65, lastUpdated: '2026-02-15' },
  { icao: 'KVNY', price100ll: 8.32, priceJetA: 8.32, lastUpdated: '2026-02-15' },
  { icao: 'KPDK', price100ll: 8.67, priceJetA: 8.67, lastUpdated: '2026-02-15' },
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

// Fuel price cache
const fuelPriceCache: Record<string, FuelPrice> = {};

async function getFuelPrice(icao: string): Promise<FuelPrice | undefined> {
  if (fuelPriceCache[icao]) return fuelPriceCache[icao];
  
  // Check demo prices
  const demo = DEMO_FUEL_PRICES.find(f => f.icao === icao);
  if (demo) {
    fuelPriceCache[icao] = demo;
    return demo;
  }
  
  // Try API
  try {
    const res = await fetch(`/api/fuel?icao=${icao}`);
    if (res.ok) {
      const data = await res.json();
      if (data.price100ll) {
        const fp: FuelPrice = {
          icao: data.icao,
          price100ll: data.price100ll,
          priceJetA: data.priceJetA,
          lastUpdated: data.lastUpdated || '',
          source: data.source
        };
        fuelPriceCache[icao] = fp;
        return fp;
      }
    }
  } catch (e) { console.error('Error fetching fuel:', e); }
  
  return undefined;
}

// Aircraft profiles
const AIRCRAFT_PROFILES = [
  { name: 'Cessna 172', fuelCapacity: 56, burnRate: 8.5, speed: 120, type: '100LL' },
  { name: 'Cessna 182', fuelCapacity: 92, burnRate: 12, speed: 140, type: '100LL' },
  { name: 'Piper Cherokee Six', fuelCapacity: 84, burnRate: 11, speed: 130, type: '100LL' },
  { name: 'Bonanza A36', fuelCapacity: 102, burnRate: 14, speed: 155, type: '100LL' },
  { name: 'Diamond DA40', fuelCapacity: 58, burnRate: 9, speed: 140, type: '100LL' },
  { name: 'Cirrus SR22', fuelCapacity: 92, burnRate: 13, speed: 155, type: '100LL' },
  { name: 'Cessna 208 Caravan', fuelCapacity: 335, burnRate: 55, speed: 180, type: 'JET-A' },
  { name: 'Piper Meridian', fuelCapacity: 242, burnRate: 40, speed: 240, type: 'JET-A' },
];

export default function FuelSaverPage() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapBounds, setMapBounds] = useState({ minLat: 25, maxLat: 50, minLon: -130, maxLon: -65 });
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loadingAirports, setLoadingAirports] = useState(false);
  
  // Flight plan state
  const [flightPlanName, setFlightPlanName] = useState('');
  const [callsign, setCallsign] = useState('');
  const [aircraftType, setAircraftType] = useState('');
  const [pilotName, setPilotName] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [cruisingAlt, setCruisingAlt] = useState(5500);
  const [alternateIcao, setAlternateIcao] = useState('');
  const [remarks, setRemarks] = useState('');
  const [soulsOnBoard, setSoulsOnBoard] = useState(1);
  
  // Route waypoints
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [departureFuel, setDepartureFuel] = useState(100);
  const [selectedAircraft, setSelectedAircraft] = useState(AIRCRAFT_PROFILES[0]);
  
  // Fuel data
  const [fuelPrices, setFuelPrices] = useState<Record<string, FuelPrice>>({});
  
  // Map settings
  const [showAllAirports, setShowAllAirports] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.8283, -98.5795]); // US center
  const [mapZoom, setMapZoom] = useState(5);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Airport[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // GPX/FPL file upload
  const [fileInputRef] = useState<HTMLInputElement | null>(null);

  // Fetch airports when map bounds change
  useEffect(() => {
    if (!mapLoaded) return;
    
    const fetchAirports = async () => {
      setLoadingAirports(true);
      try {
        const sizeParam = showAllAirports ? 'seaplane' : 'small';
        const res = await fetch(
          `/api/airports/bounds?minLat=${mapBounds.minLat}&maxLat=${mapBounds.maxLat}&minLon=${mapBounds.minLon}&maxLon=${mapBounds.maxLon}&minSize=${sizeParam}&limit=300`
        );
        const data = await res.json();
        if (data.airports) {
          setAirports(data.airports);
        }
      } catch (e) {
        console.error('Error fetching airports:', e);
        // Fallback to demo airports in view
        const demoInView = DEMO_AIRPORTS.filter(a => 
          a.latitude >= mapBounds.minLat && a.latitude <= mapBounds.maxLat &&
          a.longitude >= mapBounds.minLon && a.longitude <= mapBounds.maxLon
        );
        setAirports(demoInView);
      }
      setLoadingAirports(false);
    };
    
    fetchAirports();
  }, [mapBounds, showAllAirports, mapLoaded]);

  // Fetch fuel prices for waypoints
  useEffect(() => {
    const fetchPrices = async () => {
      for (const wp of waypoints) {
        if (!fuelPrices[wp.icao]) {
          const price = await getFuelPrice(wp.icao);
          if (price) {
            setFuelPrices(prev => ({ ...prev, [wp.icao]: price }));
          }
        }
      }
    };
    if (waypoints.length > 0) {
      fetchPrices();
    }
  }, [waypoints]);

  // Search airports
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      const q = query.toUpperCase();
      const results = DEMO_AIRPORTS.filter(a =>
        a.icao.includes(q) || a.iata?.includes(q) || 
        a.name.toUpperCase().includes(q) || a.city?.toUpperCase().includes(q)
      ).slice(0, 8);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Add waypoint
  const addWaypoint = (airport: Airport, index?: number) => {
    const wp: Waypoint = {
      id: crypto.randomUUID(),
      icao: airport.icao,
      name: airport.name,
      latitude: airport.latitude,
      longitude: airport.longitude,
      sequence: index ?? waypoints.length
    };
    
    if (index !== undefined) {
      const newWaypoints = [...waypoints];
      newWaypoints.splice(index, 0, wp);
      setWaypoints(newWaypoints.map((w, i) => ({ ...w, sequence: i })));
    } else {
      setWaypoints([...waypoints, wp]);
    }
    
    // Center map on new waypoint
    setMapCenter([airport.latitude, airport.longitude]);
    setMapZoom(8);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  // Remove waypoint
  const removeWaypoint = (id: string) => {
    setWaypoints(waypoints.filter(w => w.id !== id).map((w, i) => ({ ...w, sequence: i })));
  };

  // Move waypoint
  const moveWaypoint = (id: string, direction: 'up' | 'down') => {
    const index = waypoints.findIndex(w => w.id === id);
    if (index < 0) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= waypoints.length) return;
    
    const newWaypoints = [...waypoints];
    [newWaypoints[index], newWaypoints[newIndex]] = [newWaypoints[newIndex], newWaypoints[index]];
    setWaypoints(newWaypoints.map((w, i) => ({ ...w, sequence: i })));
  };

  // Parse GPX file
  const parseGPX = (content: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/xml');
    const wpts = doc.querySelectorAll('wpt');
    
    const newWaypoints: Waypoint[] = [];
    wpts.forEach((wpt, i) => {
      const lat = parseFloat(wpt.getAttribute('lat') || '0');
      const lon = parseFloat(wpt.getAttribute('lon') || '0');
      const name = wpt.querySelector('name')?.textContent || `WPT${i + 1}`;
      const ele = wpt.querySelector('ele')?.textContent;
      
      // Try to find matching airport in our DB
      const matchingAirport = DEMO_AIRPORTS.find(a => 
        a.icao.toUpperCase() === name.toUpperCase().substring(0, 4)
      );
      
      newWaypoints.push({
        id: crypto.randomUUID(),
        icao: matchingAirport?.icao || name.substring(0, 4),
        name: matchingAirport?.name || name,
        latitude: matchingAirport?.latitude || lat,
        longitude: matchingAirport?.longitude || lon,
        altitude: ele ? parseInt(ele) : undefined,
        sequence: i
      });
    });
    
    if (newWaypoints.length > 0) {
      setWaypoints(newWaypoints);
      // Center on first waypoint
      setMapCenter([newWaypoints[0].latitude, newWaypoints[0].longitude]);
      setMapZoom(8);
    }
  };

  // Parse FPL file (simple parsing)
  const parseFPL = (content: string) => {
    const lines = content.split('\n');
    const newWaypoints: Waypoint[] = [];
    let seq = 0;
    
    for (const line of lines) {
      // Look for waypoint patterns (5-letter names or airport codes)
      const match = line.match(/([A-Z]{4,5})/g);
      if (match) {
        for (const wpId of match) {
          const airport = DEMO_AIRPORTS.find(a => 
            a.icao === wpId || a.iata === wpId
          );
          if (airport) {
            newWaypoints.push({
              id: crypto.randomUUID(),
              icao: airport.icao,
              name: airport.name,
              latitude: airport.latitude,
              longitude: airport.longitude,
              sequence: seq++
            });
          }
        }
      }
    }
    
    if (newWaypoints.length > 0) {
      setWaypoints(newWaypoints);
      setMapCenter([newWaypoints[0].latitude, newWaypoints[0].longitude]);
      setMapZoom(8);
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (file.name.toLowerCase().endsWith('.gpx')) {
        parseGPX(content);
      } else if (file.name.toLowerCase().endsWith('.fpl')) {
        parseFPL(content);
      } else {
        alert('Please upload a .gpx or .fpl file');
      }
    };
    reader.readAsText(file);
  };

  // Calculate route statistics
  const routeStats = useMemo(() => {
    if (waypoints.length < 2) return null;
    
    let totalDist = 0;
    const segments: number[] = [];
    
    for (let i = 1; i < waypoints.length; i++) {
      const dist = calculateDistance(
        waypoints[i - 1].latitude, waypoints[i - 1].longitude,
        waypoints[i].latitude, waypoints[i].longitude
      );
      totalDist += dist;
      segments.push(dist);
    }
    
    // Estimate fuel needed with reserves
    const flightHours = totalDist / selectedAircraft.speed;
    const fuelNeeded = flightHours * selectedAircraft.burnRate;
    const fuelWithReserves = fuelNeeded * 1.25; // 25% reserves
    
    // Calculate estimated cost
    let totalCost = 0;
    for (const wp of waypoints) {
      const price = fuelPrices[wp.icao]?.price100ll || 6.50;
      totalCost += price * (fuelWithReserves / waypoints.length);
    }
    
    // Determine if fuel stops needed
    const fuelStops: Waypoint[] = [];
    const fuelCapacity = selectedAircraft.fuelCapacity * (departureFuel / 100);
    let accumulatedDist = 0;
    
    for (let i = 1; i < waypoints.length; i++) {
      accumulatedDist += segments[i - 1];
      if (accumulatedDist > fuelCapacity * 0.6) { // Refuel at 60% capacity
        fuelStops.push(waypoints[i]);
        accumulatedDist = 0;
      }
    }
    
    return {
      totalDistance: totalDist,
      flightHours: flightHours.toFixed(1),
      fuelNeeded: fuelWithReserves.toFixed(1),
      estimatedCost: totalCost.toFixed(0),
      fuelStops,
      segments
    };
  }, [waypoints, selectedAircraft, departureFuel, fuelPrices]);

  // Save flight plan
  const saveFlightPlan = async () => {
    if (waypoints.length < 2) {
      alert('Please add at least departure and destination');
      return;
    }
    
    const plan = {
      name: flightPlanName || `Flight Plan ${new Date().toLocaleDateString()}`,
      callsign,
      aircraftType: aircraftType || selectedAircraft.name,
      pilotName,
      departureTime,
      cruisingAlt,
      alternateIcao,
      remarks,
      soulsOnBoard,
      departureIcao: waypoints[0]?.icao,
      arrivalIcao: waypoints[waypoints.length - 1]?.icao,
      waypoints: waypoints.map(w => ({
        icao: w.icao,
        latitude: w.latitude,
        longitude: w.longitude,
        altitude: w.altitude,
        sequence: w.sequence
      }))
    };
    
    try {
      const res = await fetch('/api/flight-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan)
      });
      
      if (res.ok) {
        alert('Flight plan saved!');
      } else {
        // For demo, just log it
        console.log('Flight plan saved (demo):', plan);
        alert('Flight plan saved (demo mode)');
      }
    } catch (e) {
      console.log('Flight plan (demo):', plan);
      alert('Flight plan saved (demo mode)');
    }
  };

  // Marker click handler
  const handleMarkerClick = (airport: Airport) => {
    addWaypoint(airport);
  };

  // Get marker color based on airport type
  const getMarkerColor = (type?: string) => {
    switch (type) {
      case 'large_airport': return '#ef4444'; // red
      case 'medium_airport': return '#f59e0b'; // amber
      case 'small_airport': return '#22c55e'; // green
      default: return '#6b7280'; // gray
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="p-4 pb-2">
          <h1 className="text-3xl font-bold">Flight Planner & Fuel Saver</h1>
          <p className="text-slate-400">Plan your route, find fuel stops, and save your flight plan</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 p-4 pt-0">
          {/* Left Panel - Flight Plan Form */}
          <div className="w-full lg:w-80 flex-shrink-0 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
            {/* Flight Plan Details */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h2 className="text-lg font-semibold mb-3">Flight Plan Details</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Plan Name</label>
                  <input
                    type="text"
                    value={flightPlanName}
                    onChange={(e) => setFlightPlanName(e.target.value)}
                    placeholder="My Cross Country"
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Callsign</label>
                    <input
                      type="text"
                      value={callsign}
                      onChange={(e) => setCallsign(e.target.value)}
                      placeholder="N12345"
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Pilot Name</label>
                    <input
                      type="text"
                      value={pilotName}
                      onChange={(e) => setPilotName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Aircraft</label>
                    <select
                      value={selectedAircraft.name}
                      onChange={(e) => {
                        const ac = AIRCRAFT_PROFILES.find(p => p.name === e.target.value);
                        if (ac) setSelectedAircraft(ac);
                      }}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    >
                      {AIRCRAFT_PROFILES.map(p => (
                        <option key={p.name} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Departure Time</label>
                    <input
                      type="datetime-local"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Cruising Alt (ft)</label>
                    <input
                      type="number"
                      value={cruisingAlt}
                      onChange={(e) => setCruisingAlt(parseInt(e.target.value))}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Souls on Board</label>
                    <input
                      type="number"
                      value={soulsOnBoard}
                      onChange={(e) => setSoulsOnBoard(parseInt(e.target.value) || 1)}
                      min={1}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Alternate Airport</label>
                  <input
                    type="text"
                    value={alternateIcao}
                    onChange={(e) => setAlternateIcao(e.target.value.toUpperCase())}
                    placeholder="KABC"
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white uppercase"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Remarks</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Flight remarks..."
                    rows={2}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>
            
            {/* Import GPX/FPL */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h2 className="text-lg font-semibold mb-3">Import Flight Plan</h2>
              <div className="flex gap-2">
                <label className="flex-1 bg-slate-700 hover:bg-slate-600 rounded-lg px-4 py-2 cursor-pointer text-center transition">
                  <span>Upload GPX/FPL</span>
                  <input
                    type="file"
                    accept=".gpx,.fpl"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-slate-500 mt-2">Upload a GPX or FPL file to auto-populate waypoints</p>
            </div>
            
            {/* Waypoints List */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h2 className="text-lg font-semibold mb-3">Route ({waypoints.length} waypoints)</h2>
              
              {/* Add Waypoint Search */}
              <div className="relative mb-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                  placeholder="Search airport..."
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white uppercase"
                />
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {searchResults.map(airport => (
                      <button
                        key={airport.icao}
                        onClick={() => addWaypoint(airport)}
                        className="w-full text-left px-3 py-2 hover:bg-slate-600 text-white"
                      >
                        <span className="font-medium">{airport.icao}</span>
                        <span className="text-slate-400 text-sm ml-2">{airport.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Waypoints */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {waypoints.map((wp, i) => (
                  <div key={wp.id} className="flex items-center gap-2 bg-slate-700 rounded-lg p-2">
                    <span className="text-slate-400 text-sm w-6">{i + 1}</span>
                    <div className="flex-1">
                      <div className="font-medium">{wp.icao}</div>
                      <div className="text-xs text-slate-400">{wp.name}</div>
                    </div>
                    <div className="text-right">
                      {fuelPrices[wp.icao] ? (
                        <div className="text-emerald-400 text-sm">${fuelPrices[wp.icao].price100ll}/gal</div>
                      ) : (
                        <div className="text-slate-500 text-sm">--</div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveWaypoint(wp.id, 'up')}
                        disabled={i === 0}
                        className="text-slate-400 hover:text-white disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveWaypoint(wp.id, 'down')}
                        disabled={i === waypoints.length - 1}
                        className="text-slate-400 hover:text-white disabled:opacity-30"
                      >
                        ▼
                      </button>
                    </div>
                    <button
                      onClick={() => removeWaypoint(wp.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                
                {waypoints.length === 0 && (
                  <div className="text-center text-slate-500 py-4">
                    Search and add airports to build your route<br/>
                    or click airports on the map
                  </div>
                )}
              </div>
            </div>
            
            {/* Fuel Settings */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h2 className="text-lg font-semibold mb-3">Fuel Settings</h2>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Fuel at Departure: {departureFuel}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={departureFuel}
                  onChange={(e) => setDepartureFuel(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
            
            {/* Save Button */}
            <button
              onClick={saveFlightPlan}
              disabled={waypoints.length < 2}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition"
            >
              Save Flight Plan
            </button>
          </div>
          
          {/* Right Panel - Map */}
          <div className="flex-1 min-h-[500px] lg:min-h-0">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 h-full flex flex-col">
              {/* Map Controls */}
              <div className="flex flex-wrap gap-3 mb-3 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showAll"
                    checked={showAllAirports}
                    onChange={(e) => setShowAllAirports(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="showAll" className="text-sm">Show all airports (incl. small)</label>
                </div>
                <div className="text-sm text-slate-400">
                  {loadingAirports ? 'Loading...' : `${airports.length} airports shown`}
                </div>
              </div>
              
              {/* Map */}
              <div className="flex-1 rounded-lg overflow-hidden bg-slate-900 min-h-[400px]">
                {!mapLoaded ? (
                  <div className="h-full flex items-center justify-center">
                    <button
                      onClick={() => setMapLoaded(true)}
                      className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-lg"
                    >
                      Load Map
                    </button>
                  </div>
                ) : (
                  <LeafletMap
                    airports={airports}
                    waypoints={waypoints}
                    fuelPrices={fuelPrices}
                    onBoundsChange={setMapBounds}
                    onAirportClick={handleMarkerClick}
                    mapCenter={mapCenter}
                    mapZoom={mapZoom}
                  />
                )}
              </div>
            </div>
            
            {/* Route Summary */}
            {routeStats && (
              <div className="mt-4 bg-slate-800 rounded-xl p-4 border border-slate-700">
                <h2 className="text-lg font-semibold mb-3">Route Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-700 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-sky-400">{Math.round(routeStats.totalDistance)}</div>
                    <div className="text-sm text-slate-400">NM Distance</div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-amber-400">{routeStats.flightHours}</div>
                    <div className="text-sm text-slate-400">Flight Hours</div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-purple-400">{routeStats.fuelNeeded}</div>
                    <div className="text-sm text-slate-400">Gal Fuel (w/reserves)</div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-emerald-400">${routeStats.estimatedCost}</div>
                    <div className="text-sm text-slate-400">Est. Fuel Cost</div>
                  </div>
                </div>
                
                {routeStats.fuelStops.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Recommended Fuel Stops:</h3>
                    <div className="flex flex-wrap gap-2">
                      {routeStats.fuelStops.map((stop, i) => (
                        <span key={i} className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full">
                          {stop.icao}
                          {fuelPrices[stop.icao] && ` - $${fuelPrices[stop.icao].price100ll}/gal`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Leaflet CSS */}
      <style jsx global>{`
        .leaflet-container {
          background: #1e293b;
        }
        .leaflet-popup-content-wrapper {
          background: white;
          color: #1e293b;
          border-radius: 8px;
        }
        .leaflet-popup-tip {
          background: white;
        }
      `}</style>
    </div>
  );
}
