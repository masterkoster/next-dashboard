'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
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
  city?: string;
  state?: string;
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
  // Core state
  const [mapLoaded, setMapLoaded] = useState(true);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loadingAirports, setLoadingAirports] = useState(false);
  const [mapBounds, setMapBounds] = useState({ minLat: 25, maxLat: 50, minLon: -130, maxLon: -65 });
  const [showAllAirports, setShowAllAirports] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.8283, -98.5795]);
  const [mapZoom, setMapZoom] = useState(5);
  
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
  
  // Saved flight plans
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [showPlanList, setShowPlanList] = useState(false);
  
  // Load fuel prices from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fuelPrices');
      if (saved) {
        try {
          setFuelPrices(JSON.parse(saved));
        } catch (e) { console.error('Error loading fuel prices:', e); }
      }
    }
  }, []);
  
  // Save fuel prices to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(fuelPrices).length > 0) {
      localStorage.setItem('fuelPrices', JSON.stringify(fuelPrices));
    }
  }, [fuelPrices]);
  
  // Load saved flight plans from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('savedFlightPlans');
      if (saved) {
        try {
          setSavedPlans(JSON.parse(saved));
        } catch (e) { console.error('Error loading flight plans:', e); }
      }
    }
  }, []);
  
  // Save flight plans to localStorage
  const saveToLocalStorage = (plans: any[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('savedFlightPlans', JSON.stringify(plans));
    }
  };
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Airport[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Panel visibility
  const [showPanel, setShowPanel] = useState(true);
  
  // Cached airports - accumulates as user pans around
  const [cachedAirports, setCachedAirports] = useState<Airport[]>([]);
  
  // Fetch airports when map bounds change - with caching
  useEffect(() => {
    if (!mapLoaded) return;
    
    const fetchAirports = async () => {
      setLoadingAirports(true);
      try {
        const sizeParam = showAllAirports ? 'seaplane' : 'medium';
        const res = await fetch(
          `/api/airports/bounds?minLat=${mapBounds.minLat}&maxLat=${mapBounds.maxLat}&minLon=${mapBounds.minLon}&maxLon=${mapBounds.maxLon}&minSize=${sizeParam}&limit=100`
        );
        const data = await res.json();
        if (data.airports && data.airports.length > 0) {
          // Merge with cached airports (avoid duplicates)
          setCachedAirports(prev => {
            const existing = new Set(prev.map(a => a.icao));
            const newOnes = data.airports.filter((a: Airport) => !existing.has(a.icao));
            return [...prev, ...newOnes];
          });
          // Show recent ones
          setAirports(data.airports);
        }
      } catch (e) {
        console.error('Error fetching airports:', e);
        // Fallback to demo airports
        setAirports(DEMO_AIRPORTS.slice(0, 20));
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

  // Debounced search ref
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Search airports - searches demo + loaded + cached airports
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (query.length >= 2) {
      // Debounce search by 150ms
      searchTimeoutRef.current = setTimeout(() => {
        const q = query.toUpperCase();
        // Search demo airports
        const demoResults = DEMO_AIRPORTS.filter(a =>
          a.icao.includes(q) || a.iata?.includes(q) || 
          a.name.toUpperCase().includes(q) || a.city?.toUpperCase().includes(q)
        );
        // Search current airports from map
        const mapResults = airports.filter(a =>
          a.icao.toUpperCase().includes(q) || a.iata?.toUpperCase().includes(q) || 
          a.name.toUpperCase().includes(q) || a.city?.toUpperCase().includes(q)
        );
        // Search cached airports (accumulated from panning)
        const cachedResults = cachedAirports.filter(a =>
          a.icao.toUpperCase().includes(q) || a.iata?.toUpperCase().includes(q) || 
          a.name.toUpperCase().includes(q) || a.city?.toUpperCase().includes(q)
        );
        // Combine and dedupe
        const combined = [...demoResults];
        const seen = new Set(combined.map(a => a.icao));
        for (const a of [...mapResults, ...cachedResults]) {
          if (!seen.has(a.icao)) {
            seen.add(a.icao);
            combined.push(a);
          }
        }
        setSearchResults(combined.slice(0, 10));
        setShowSearchResults(true);
      }, 150);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [airports, cachedAirports]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Add waypoint
  const addWaypoint = (airport: Airport, index?: number) => {
    // Check if already in route
    if (waypoints.find(w => w.icao === airport.icao)) {
      alert('Airport already in route');
      return;
    }
    const wp: Waypoint = {
      id: crypto.randomUUID(),
      icao: airport.icao,
      name: airport.name,
      city: airport.city,
      state: (airport as any).state,
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
              city: airport.city,
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

  // Parse flightplandatabase.com JSON format
  const parseFPDBJson = async (content: string) => {
    try {
      const data = JSON.parse(content);
      const newWaypoints: Waypoint[] = [];
      
      // Handle flightplandatabase.com JSON format
      // The route is in data.route as array of waypoints
      const route = data.route || data.plan?.route || [];
      
      for (const wp of route) {
        // Each waypoint can have: id, name, type, lat, lon, airway
        const lat = wp.lat || wp.latitude;
        const lon = wp.lon || wp.longitude;
        const icao = wp.id || wp.icao || wp.name;
        
        // Try to find airport in our database
        let airport = DEMO_AIRPORTS.find(a => a.icao === icao?.substring(0, 4));
        
        if (airport || (lat && lon)) {
          newWaypoints.push({
            id: crypto.randomUUID(),
            icao: airport?.icao || icao?.substring(0, 4) || 'WAYPT',
            name: airport?.name || icao || 'Waypoint',
            city: airport?.city,
            latitude: airport?.latitude || lat,
            longitude: airport?.longitude || lon,
            sequence: newWaypoints.length
          });
        }
      }
      
      if (newWaypoints.length > 0) {
        setWaypoints(newWaypoints);
        setMapCenter([newWaypoints[0].latitude, newWaypoints[0].longitude]);
        setMapZoom(6);
        return true;
      }
    } catch (e) {
      console.error('Error parsing FPDB JSON:', e);
    }
    return false;
  };

  // Parse flightplandatabase.com CSV format
  const parseFPDBCSV = (content: string) => {
    try {
      const lines = content.split('\n');
      const newWaypoints: Waypoint[] = [];
      
      // Skip header if present, find waypoint data
      for (const line of lines) {
        const parts = line.split(',').map(p => p.trim().replace(/"/g, ''));
        if (parts.length < 3) continue;
        
        // Try to extract waypoint info - format varies
        // Could be: id,type,lat,lon,airway or waypoint,lat,lon,alt,etc.
        let lat: number | undefined, lon: number | undefined, icao: string | undefined;
        
        // Try to find lat/lon in the line
        for (let i = 0; i < parts.length; i++) {
          const val = parseFloat(parts[i]);
          if (!isNaN(val)) {
            if (val >= -90 && val <= 90 && !lat) lat = val;
            else if (val >= -180 && val <= 180 && !lon) lon = val;
          }
          // Look for 4-letter ICAO codes
          if (parts[i].match(/^[A-Z]{4}$/)) {
            icao = parts[i];
          }
        }
        
        if (lat && lon) {
          const airport = DEMO_AIRPORTS.find(a => a.icao === icao);
          newWaypoints.push({
            id: crypto.randomUUID(),
            icao: airport?.icao || icao || `WPT${newWaypoints.length}`,
            name: airport?.name || icao || 'Waypoint',
            city: airport?.city,
            latitude: airport?.latitude || lat,
            longitude: airport?.longitude || lon,
            sequence: newWaypoints.length
          });
        }
      }
      
      if (newWaypoints.length > 0) {
        setWaypoints(newWaypoints);
        setMapCenter([newWaypoints[0].latitude, newWaypoints[0].longitude]);
        setMapZoom(6);
        return true;
      }
    } catch (e) {
      console.error('Error parsing FPDB CSV:', e);
    }
    return false;
  };

  // Import from flightplandatabase.com by plan ID
  const importFromFPDB = async (planId: string) => {
    try {
      // Fetch from flightplandatabase.com API (public endpoint)
      const res = await fetch(`https://flightplandatabase.com/api/plan/${planId}?format=json`);
      if (!res.ok) {
        alert('Plan not found. Check the plan ID.');
        return;
      }
      const data = await res.json();
      
      // Parse the route from FPDB format
      const newWaypoints: Waypoint[] = [];
      const route = data.route || [];
      
      for (const wp of route) {
        const lat = wp.lat;
        const lon = wp.lon;
        const waypointId = wp.id;
        
        // Try to find airport in our database
        const airport = DEMO_AIRPORTS.find(a => a.icao === waypointId?.substring(0, 4));
        
        if (airport || (lat && lon)) {
          newWaypoints.push({
            id: crypto.randomUUID(),
            icao: airport?.icao || waypointId?.substring(0, 4) || 'WAYPT',
            name: airport?.name || waypointId || 'Waypoint',
            city: airport?.city,
            latitude: airport?.latitude || lat,
            longitude: airport?.longitude || lon,
            sequence: newWaypoints.length
          });
        }
      }
      
      if (newWaypoints.length > 0) {
        setWaypoints(newWaypoints);
        setMapCenter([newWaypoints[0].latitude, newWaypoints[0].longitude]);
        setMapZoom(6);
        
        // Also fill in flight plan details if available
        if (data.origin) {
          setDepartureTime(data.departureTime || '');
        }
        if (data.altitude) {
          setCruisingAlt(data.altitude);
        }
        
        alert(`Imported ${newWaypoints.length} waypoints from flightplandatabase.com!`);
      } else {
        alert('No waypoints found in this plan.');
      }
    } catch (e) {
      console.error('Error importing from FPDB:', e);
      alert('Failed to import plan. Make sure the plan ID is correct.');
    }
  };

  // Parse simple route string (comma or space separated ICAOs)
  const parseRouteString = (content: string) => {
    const newWaypoints: Waypoint[] = [];
    
    // Split by comma, space, or newline
    const tokens = content.split(/[,\s\n]+/).filter(t => t.length >= 3 && t.length <= 5);
    
    for (const token of tokens) {
      const icao = token.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 4);
      if (icao.length < 3) continue;
      
      const airport = DEMO_AIRPORTS.find(a => a.icao === icao || a.iata === icao);
      if (airport) {
        newWaypoints.push({
          id: crypto.randomUUID(),
          icao: airport.icao,
          name: airport.name,
          city: airport.city,
          latitude: airport.latitude,
          longitude: airport.longitude,
          sequence: newWaypoints.length
        });
      }
    }
    
    if (newWaypoints.length > 0) {
      setWaypoints(newWaypoints);
      setMapCenter([newWaypoints[0].latitude, newWaypoints[0].longitude]);
      setMapZoom(6);
      return true;
    }
    return false;
  };

  // Parse X-Plane FMS format
  const parseFMS = (content: string) => {
    const lines = content.split('\n');
    const newWaypoints: Waypoint[] = [];
    
    for (const line of lines) {
      // FMS format: 5 WAYPOINT_NAME lat lon alt (approximate)
      // Or: I waypoint lat lon altitude airWay
      const parts = line.trim().split(/[\s,]+/);
      if (parts.length < 4) continue;
      
      // Check if it's a valid line (starts with number or I)
      if (!parts[0].match(/^[0-9I]/)) continue;
      
      const waypointName = parts[1] || parts[0];
      const lat = parseFloat(parts[parts.length - 3]);
      const lon = parseFloat(parts[parts.length - 2]);
      
      if (!isNaN(lat) && !isNaN(lon)) {
        const airport = DEMO_AIRPORTS.find(a => a.icao === waypointName.substring(0, 4));
        newWaypoints.push({
          id: crypto.randomUUID(),
          icao: airport?.icao || waypointName.substring(0, 4),
          name: airport?.name || waypointName,
          city: airport?.city,
          latitude: airport?.latitude || lat,
          longitude: airport?.longitude || lon,
          sequence: newWaypoints.length
        });
      }
    }
    
    if (newWaypoints.length > 0) {
      setWaypoints(newWaypoints);
      setMapCenter([newWaypoints[0].latitude, newWaypoints[0].longitude]);
      setMapZoom(6);
      return true;
    }
    return false;
  };

  // Parse VATSIM/IVAO flight plan (plain text)
  const parseVATSIM = (content: string) => {
    const lines = content.split('\n');
    const newWaypoints: Waypoint[] = [];
    let foundRoute = false;
    
    for (const line of lines) {
      const upperLine = line.toUpperCase();
      
      // Look for ROUTE: or similar markers
      if (upperLine.includes('ROUTE:') || upperLine.includes('SID') || upperLine.includes('STAR')) {
        foundRoute = true;
      }
      
      if (foundRoute) {
        // Extract ICAO codes (4 letters)
        const matches = line.match(/[A-Z]{4}/g);
        if (matches) {
          for (const icao of matches) {
            const airport = DEMO_AIRPORTS.find(a => a.icao === icao);
            if (airport && !newWaypoints.find(w => w.icao === icao)) {
              newWaypoints.push({
                id: crypto.randomUUID(),
                icao: airport.icao,
                name: airport.name,
                city: airport.city,
                latitude: airport.latitude,
                longitude: airport.longitude,
                sequence: newWaypoints.length
              });
            }
          }
        }
        
        // Stop at next section
        if (upperLine.includes('REMARKS:') || upperLine.includes('NOTES:')) {
          break;
        }
      }
    }
    
    if (newWaypoints.length > 0) {
      setWaypoints(newWaypoints);
      setMapCenter([newWaypoints[0].latitude, newWaypoints[0].longitude]);
      setMapZoom(6);
      return true;
    }
    return false;
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const ext = file.name.toLowerCase();
      
      if (ext.endsWith('.gpx')) {
        parseGPX(content);
      } else if (ext.endsWith('.fpl')) {
        parseFPL(content);
      } else if (ext.endsWith('.json')) {
        const success = await parseFPDBJson(content);
        if (!success) alert('Could not parse JSON file. Make sure it\'s from flightplandatabase.com');
      } else if (ext.endsWith('.csv')) {
        const success = parseFPDBCSV(content);
        if (!success) alert('Could not parse CSV file. Make sure it\'s from flightplandatabase.com');
      } else {
        alert('Please upload a .gpx, .fpl, .json, or .csv file');
      }
    };
    reader.readAsText(file);
  };

  // Calculate route statistics
  const routeStats = useMemo(() => {
    if (waypoints.length < 2) return null;
    
    let totalDist = 0;
    const segments: number[] = [];
    const legs: { from: Waypoint; to: Waypoint; distance: number; fuelNeeded: number; cost: number }[] = [];
    
    for (let i = 1; i < waypoints.length; i++) {
      const dist = calculateDistance(
        waypoints[i - 1].latitude, waypoints[i - 1].longitude,
        waypoints[i].latitude, waypoints[i].longitude
      );
      totalDist += dist;
      segments.push(dist);
      
      // Calculate fuel and cost for this leg
      const legFuel = (dist / selectedAircraft.speed) * selectedAircraft.burnRate * 1.25; // with reserves
      const fuelPrice = fuelPrices[waypoints[i].icao]?.price100ll || 6.50;
      const legCost = legFuel * fuelPrice;
      
      legs.push({
        from: waypoints[i - 1],
        to: waypoints[i],
        distance: dist,
        fuelNeeded: legFuel,
        cost: legCost
      });
    }
    
    // Estimate total fuel needed with reserves
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
      segments,
      legs
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
        name: w.name,
        city: w.city,
        latitude: w.latitude,
        longitude: w.longitude,
        altitude: w.altitude,
        sequence: w.sequence
      })),
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage (always works)
    const newPlans = [...savedPlans, plan];
    setSavedPlans(newPlans);
    saveToLocalStorage(newPlans);
    
    try {
      const res = await fetch('/api/flight-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan)
      });
      
      if (res.ok) {
        alert('Flight plan saved!');
      } else {
        alert('Flight plan saved locally');
      }
    } catch (e) {
      alert('Flight plan saved locally');
    }
  };
  
  // Load a flight plan
  const loadFlightPlan = (plan: any) => {
    setFlightPlanName(plan.name || '');
    setCallsign(plan.callsign || '');
    setAircraftType(plan.aircraftType || '');
    setPilotName(plan.pilotName || '');
    setDepartureTime(plan.departureTime || '');
    setCruisingAlt(plan.cruisingAlt || 5500);
    setAlternateIcao(plan.alternateIcao || '');
    setRemarks(plan.remarks || '');
    setSoulsOnBoard(plan.soulsOnBoard || 1);
    
    if (plan.waypoints) {
      const loadedWaypoints = plan.waypoints.map((w: any, i: number) => ({
        id: crypto.randomUUID(),
        icao: w.icao,
        name: w.name || w.icao,
        city: w.city,
        latitude: w.latitude,
        longitude: w.longitude,
        altitude: w.altitude,
        sequence: i
      }));
      setWaypoints(loadedWaypoints);
      
      // Center map on first waypoint
      if (loadedWaypoints.length > 0) {
        setMapCenter([loadedWaypoints[0].latitude, loadedWaypoints[0].longitude]);
        setMapZoom(8);
      }
    }
    
    setShowPlanList(false);
  };
  
  // Delete a flight plan
  const deleteFlightPlan = (index: number) => {
    const newPlans = savedPlans.filter((_, i) => i !== index);
    setSavedPlans(newPlans);
    saveToLocalStorage(newPlans);
  };

  // Marker click handler
  const handleMarkerClick = (airport: Airport) => {
    // Don't auto-add - just let the popup show
    // User must click "Add to Route" in popup
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
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-2 lg:p-3 bg-slate-800 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg lg:text-xl font-bold">Flight Planner & Fuel Saver</h1>
            <p className="text-slate-400 text-xs">Plan route, find fuel stops</p>
          </div>
          <button
            onClick={() => setShowPanel(!showPanel)}
            className="bg-slate-700 hover:bg-slate-600 p-1.5 rounded-lg text-white"
          >
            {showPanel ? '✕' : '☰'}
          </button>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-2 text-xs mt-1">
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Large</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Medium</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Small</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel - Flight Plan Form */}
        {showPanel && (
          <div className="w-full lg:w-72 bg-slate-800 border-b lg:border-r border-slate-700 overflow-y-auto p-2 space-y-2 flex-shrink-0" style={{ maxHeight: '55vh' }}>
            {/* Flight Plan Details */}
            <div>
              <h2 className="text-base font-semibold mb-1.5">Flight Plan Details</h2>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-0.5">Plan Name</label>
                  <input
                    type="text"
                    value={flightPlanName}
                    onChange={(e) => setFlightPlanName(e.target.value)}
                    placeholder="My Cross Country"
                    className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-white text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="block text-xs text-slate-400 mb-0.5">Callsign</label>
                    <input
                      type="text"
                      value={callsign}
                      onChange={(e) => setCallsign(e.target.value)}
                      placeholder="N12345"
                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-0.5">Pilot Name</label>
                    <input
                      type="text"
                      value={pilotName}
                      onChange={(e) => setPilotName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-white text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="block text-xs text-slate-400 mb-0.5">Aircraft</label>
                    <select
                      value={selectedAircraft.name}
                      onChange={(e) => {
                        const ac = AIRCRAFT_PROFILES.find(p => p.name === e.target.value);
                        if (ac) setSelectedAircraft(ac);
                      }}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-white text-sm"
                    >
                      {AIRCRAFT_PROFILES.map(p => (<option key={p.name} value={p.name}>{p.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-0.5">Departure Time</label>
                    <input
                      type="datetime-local"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-white text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="block text-xs text-slate-400 mb-0.5">Cruising Alt (ft)</label>
                    <input
                      type="number"
                      value={cruisingAlt}
                      onChange={(e) => setCruisingAlt(parseInt(e.target.value))}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-0.5">Souls on Board</label>
                    <input
                      type="number"
                      min="1"
                      value={soulsOnBoard}
                      onChange={(e) => setSoulsOnBoard(parseInt(e.target.value))}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-white text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-0.5">Alternate Airport</label>
                  <input
                    type="text"
                    value={alternateIcao}
                    onChange={(e) => setAlternateIcao(e.target.value.toUpperCase())}
                    placeholder="KABC"
                    className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-white uppercase text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-0.5">Remarks</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Flight remarks..."
                    rows={2}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-white text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Waypoints */}
            <div>
              <h2 className="text-base font-semibold mb-1.5">Route ({waypoints.length} waypoints)</h2>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search airport..."
                className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-white uppercase mb-2 text-sm"
              />
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {waypoints.map((wp, i) => (
                  <div key={wp.id} className="flex items-center justify-between bg-slate-700 rounded px-2 py-1 text-sm">
                    <span><span className="text-slate-400">{i+1}.</span> <strong>{wp.icao}</strong></span>
                    <button onClick={() => removeWaypoint(wp.id)} className="text-red-400 text-xs">✕</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Fuel Settings */}
            <div>
              <h2 className="text-base font-semibold mb-1.5">Fuel Settings</h2>
              <div>
                <label className="block text-xs text-slate-400 mb-0.5">Fuel at Departure: {departureFuel}%</label>
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
            <div className="flex gap-2">
              <button
                onClick={() => setShowPlanList(!showPlanList)}
                className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-semibold py-1.5 rounded-lg text-sm"
              >
                Load Plan {savedPlans.length > 0 && `(${savedPlans.length})`}
              </button>
              <button
                onClick={saveFlightPlan}
                disabled={waypoints.length < 2}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 text-white font-semibold py-1.5 rounded-lg text-sm"
              >
                Save Plan
              </button>
            </div>
            
            {/* Saved Plans List */}
            {showPlanList && savedPlans.length > 0 && (
              <div className="bg-slate-700 rounded p-2 space-y-2 max-h-48 overflow-y-auto">
                <div className="text-sm font-semibold text-slate-300">Saved Plans</div>
                {savedPlans.map((plan, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-600 rounded p-2 text-sm">
                    <button onClick={() => loadFlightPlan(plan)} className="text-left flex-1 hover:text-sky-400">
                      <div className="font-medium">{plan.name || 'Untitled'}</div>
                      <div className="text-xs text-slate-400">
                        {plan.departureIcao} → {plan.arrivalIcao} • {plan.waypoints?.length || 0} waypoints
                      </div>
                    </button>
                    <button onClick={() => deleteFlightPlan(i)} className="text-red-400 hover:text-red-300 px-2">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Map - Always visible */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-slate-800 p-1.5 flex gap-1.5 flex-wrap items-center flex-shrink-0">
            <label className="bg-sky-500 hover:bg-sky-600 px-2 py-1 rounded text-xs cursor-pointer">
              Import
              <input type="file" accept=".gpx,.fpl,.json,.csv" onChange={handleFileUpload} className="hidden" />
            </label>
            <input
              type="text"
              id="fpdbPlanId"
              placeholder="FPDB ID"
              className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-xs flex-1"
              onKeyDown={(e) => { if (e.key === 'Enter') { const input = document.getElementById('fpdbPlanId') as HTMLInputElement; if (input.value) { importFromFPDB(input.value); input.value = ''; } }}}
            />
            <input
              type="checkbox"
              id="showAll"
              checked={showAllAirports}
              onChange={(e) => setShowAllAirports(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="showAll" className="text-xs">All</label>
          </div>

          {/* Map Container */}
          <div className="flex-1 min-h-[200px]">
            {!mapLoaded ? (
              <div className="h-full flex items-center justify-center bg-slate-800">
                <button onClick={() => setMapLoaded(true)} className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm">
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

          {/* Route Summary */}
          {routeStats && (
            <div className="bg-slate-800 p-2 flex-shrink-0 overflow-x-auto">
              <div className="flex gap-3 text-xs">
                <div className="text-center"><div className="text-sky-400 font-bold">{Math.round(routeStats.totalDistance)}</div><div className="text-slate-500">NM</div></div>
                <div className="text-center"><div className="text-amber-400 font-bold">{routeStats.flightHours}h</div><div className="text-slate-500">Flight</div></div>
                <div className="text-center"><div className="text-purple-400 font-bold">{routeStats.fuelNeeded}</div><div className="text-slate-500">Gal</div></div>
                <div className="text-center"><div className="text-emerald-400 font-bold">${routeStats.estimatedCost}</div><div className="text-slate-500">Cost</div></div>
              </div>
              {routeStats.legs.length > 0 && (
                <div className="mt-1.5 flex gap-1.5 overflow-x-auto pb-1">
                  {routeStats.legs.map((leg, i) => (
                    <div key={i} className="flex-shrink-0 bg-slate-700 rounded px-2 py-1 text-xs">
                      <span className="text-sky-400">{leg.from.icao}</span>→<span className="text-amber-400">{leg.to.icao}</span>
                      <div className="text-slate-400">{Math.round(leg.distance)}NM ${leg.cost.toFixed(0)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
