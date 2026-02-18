'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Popup, Polyline, CircleMarker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Dynamic imports for state data to avoid SSR issues
let stateData: any = null;
let usStatesGeoJson: any = null;
let GeoJSONComponent: any = null;

// Load on client only
if (typeof window !== 'undefined') {
  Promise.all([
    import('@/lib/stateData'),
    import('@/lib/usStates'),
    import('react-leaflet')
  ]).then(([stateMod, usStatesMod, reactLeaflet]) => {
    stateData = stateMod.stateData;
    usStatesGeoJson = usStatesMod.usStatesGeoJson;
    GeoJSONComponent = reactLeaflet.GeoJSON;
  });
}

interface Airport {
  icao: string;
  iata?: string;
  name: string;
  city?: string;
  latitude: number;
  longitude: number;
  type?: string;
}

interface Waypoint {
  id: string;
  icao: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface FuelPrice {
  icao: string;
  price100ll: number | null;
  priceJetA?: number | null;
  source?: string;
  sourceUrl?: string;
  lastReported?: string;
  attribution?: {
    name: string;
    url: string;
    airbossUrl: string;
  };
}

interface AirportDetails {
  icao: string;
  name: string;
  type?: string;
  elevation_ft?: number;
  city?: string;
  state?: string;
  runways?: { length_ft: number; surface: string; he_ident: string }[];
  frequencies?: { frequency_mhz: number; description: string; type: string }[];
  fuel?: { 
    price100ll: number; 
    priceJetA?: number;
    source: string;
    sourceUrl?: string;
    lastReported?: string;
    providerName?: string;
    providerPhone?: string;
  };
  landingFee?: { amount: number };
  hasTower?: boolean;
  attendance?: string;
  phone?: string;
  manager?: string;
}

interface LeafletMapProps {
  airports: Airport[];
  waypoints: Waypoint[];
  fuelPrices: Record<string, FuelPrice>;
  onBoundsChange: (bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number }) => void;
  onAirportClick: (airport: Airport) => void;
  mapCenter: [number, number];
  mapZoom: number;
  showTerrain?: boolean;
  showAirspaces?: boolean;
  showStateOverlay?: boolean;
  onStateClick?: (stateInfo: any) => void;
  onViewStateInfo?: (stateCode: string) => void;
  baseLayer?: 'osm' | 'satellite' | 'terrain' | 'dark';
  performanceMode?: boolean;
}

// Fix Leaflet icon issue
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (window as any).L?.Icon?.Default?.prototype?._getIconUrl;
}

// Component to handle map move events and get map reference
function MapEventHandler({ onBoundsChange, onMapReady }: { 
  onBoundsChange: (bounds: any) => void; 
  onMapReady?: (map: L.Map) => void;
}) {
  const map = useMapEvents({
    moveend: (e: any) => {
      const bounds = e.target.getBounds();
      onBoundsChange({
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLon: bounds.getWest(),
        maxLon: bounds.getEast()
      });
    }
  });
  
  useEffect(() => {
    if (onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);
  
  return null;
}

function getMarkerColor(type?: string) {
  switch (type) {
    case 'large_airport': return '#ef4444';
    case 'medium_airport': return '#f59e0b';
    case 'small_airport': return '#22c55e';
    default: return '#6b7280';
  }
}

// Memoized airport marker component
const AirportMarker = React.memo(function AirportMarker({ 
  airport, 
  onClick,
  onViewStateInfo 
}: { 
  airport: Airport; 
  onClick: () => void;
  onViewStateInfo?: (stateCode: string) => void;
}) {
  const [details, setDetails] = useState<AirportDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [popupOpen, setPopupOpen] = useState(false);
  const stateInfoTriggered = useRef(false);

  // Simple state inference from coordinates (fallback)
  const inferStateFromCoords = (lat: number, lon: number): string | null => {
    // Rough approximation based on lat/lon ranges
    if (lat >= 41.7 && lon >= -90.4 && lon <= -82.1) return 'MI'; // Michigan (DTW area)
    if (lat >= 40.5 && lon >= -79.8 && lon <= -71.8) return 'NY'; // New York
    if (lat >= 30.4 && lon >= -85.6 && lon <= -80.8) return 'GA'; // Georgia
    if (lat >= 35 && lon >= -90.3 && lon <= -81.6) return 'TN'; // Tennessee
    if (lat >= 36 && lon >= -91.5 && lon <= -87) return 'IL'; // Illinois
    if (lat >= 38 && lon >= -88.1 && lon <= -84.8) return 'IN'; // Indiana
    if (lat >= 38.4 && lon >= -84.8 && lon <= -80.5) return 'OH'; // Ohio
    if (lat >= 29 && lon >= -95 && lon <= -81) return 'FL'; // Florida
    if (lat >= 30 && lon >= -90 && lon <= -85) return 'MS'; // Mississippi
    if (lat >= 29 && lon >= -94.1 && lon <= -88.8) return 'LA'; // Louisiana
    if (lat >= 33 && lon >= -106.7 && lon <= -93.5) return 'TX'; // Texas
    if (lat >= 31.3 && lon >= -114.7 && lon <= -109) return 'AZ'; // Arizona
    if (lat >= 32.5 && lon >= -124.4 && lon <= -114.6) return 'CA'; // California
    if (lat >= 45.5 && lon >= -124.8 && lon <= -116.9) return 'WA'; // Washington
    if (lat >= 42 && lon >= -124.6 && lon <= -116.5) return 'OR'; // Oregon
    if (lat >= 43 && lon >= -117 && lon <= -111) return 'ID'; // Idaho
    if (lat >= 37 && lon >= -109.1 && lon <= -102) return 'CO'; // Colorado
    if (lat >= 35 && lon >= -120 && lon <= -114) return 'NV'; // Nevada
    if (lat >= 37 && lon >= -114.1 && lon <= -109) return 'UT'; // Utah
    if (lat >= 41 && lon >= -111.1 && lon <= -104.1) return 'WY'; // Wyoming
    if (lat >= 44.4 && lon >= -116 && lon <= -104) return 'MT'; // Montana
    if (lat >= 45.9 && lon >= -104.1 && lon <= -96.6) return 'ND'; // North Dakota
    if (lat >= 42.5 && lon >= -104.1 && lon <= -96.4) return 'SD'; // South Dakota
    if (lat >= 38 && lon >= -104.1 && lon <= -94.3) return 'NE'; // Nebraska
    if (lat >= 37 && lon >= -102.1 && lon <= -94.6) return 'KS'; // Kansas
    if (lat >= 33.6 && lon >= -103 && lon <= -94.4) return 'OK'; // Oklahoma
    if (lat >= 33.8 && lon >= -84.3 && lon <= -75.4) return 'NC'; // North Carolina
    if (lat >= 32 && lon >= -83.4 && lon <= -78.5) return 'SC'; // South Carolina
    if (lat >= 36.5 && lon >= -83.7 && lon <= -75.2) return 'VA'; // Virginia
    if (lat >= 36.5 && lon >= -89.6 && lon <= -81.9) return 'KY'; // Kentucky
    if (lat >= 37.2 && lon >= -82.6 && lon <= -77.7) return 'WV'; // West Virginia
    if (lat >= 39.7 && lon >= -80.5 && lon <= -74.7) return 'PA'; // Pennsylvania
    if (lat >= 41 && lon >= -73.7 && lon <= -71.8) return 'CT'; // Connecticut
    if (lat >= 41.2 && lon >= -73.5 && lon <= -69.9) return 'MA'; // Massachusetts
    if (lat >= 42.7 && lon >= -72.6 && lon <= -70.7) return 'NH'; // New Hampshire
    if (lat >= 43.1 && lon >= -71.1 && lon <= -66.9) return 'ME'; // Maine
    if (lat >= 42.7 && lon >= -73.5 && lon <= -71.5) return 'VT'; // Vermont
    if (lat >= 38.9 && lon >= -75.6 && lon <= -73.9) return 'NJ'; // New Jersey
    if (lat >= 41.1 && lon >= -71.9 && lon <= -71.1) return 'RI'; // Rhode Island
    if (lat >= 38.5 && lon >= -75.8 && lon <= -75) return 'DE'; // Delaware
    if (lat >= 37.9 && lon >= -79.5 && lon <= -75) return 'MD'; // Maryland
    if (lat >= 38.79 && lon >= -77.119 && lon <= -76.909) return 'DC'; // DC
    if (lat >= 30.2 && lon >= -91.7 && lon <= -88.1) return 'MS'; // Mississippi
    if (lat >= 30.2 && lon >= -88.5 && lon <= -84.9) return 'AL'; // Alabama
    if (lat >= 33 && lon >= -94.6 && lon <= -89.6) return 'AR'; // Arkansas
    if (lat >= 37 && lon >= -91.5 && lon <= -87) return 'IL'; // Illinois
    if (lat >= 40.4 && lon >= -96.6 && lon <= -90.1) return 'IA'; // Iowa
    if (lat >= 36 && lon >= -95.8 && lon <= -89.1) return 'MO'; // Missouri
    if (lat >= 31.3 && lon >= -109.1 && lon <= -103) return 'NM'; // New Mexico
    if (lat >= 42.5 && lon >= -92.9 && lon <= -86.8) return 'WI'; // Wisconsin
    if (lat >= 43.5 && lon >= -97.2 && lon <= -89.5) return 'MN'; // Minnesota
    // Alaska
    if (lat >= 51.8 && lon >= -180 && lon <= -130) return 'AK';
    // Hawaii
    if (lat >= 18.9 && lon >= -160.2 && lon <= -154.7) return 'HI';
    
    return null;
  };

  useEffect(() => {
    if (!popupOpen) return;
    stateInfoTriggered.current = false;
    
    async function fetchDetails() {
      try {
        const res = await fetch(`/api/airports/${airport.icao}`);
        if (res.ok) {
          const data = await res.json();
          setDetails(data);
          
          console.log('Airport details loaded:', airport.icao, 'state:', data.state);
          
          // Auto-show state info when details load
          const stateCode = data?.state || inferStateFromCoords(airport.latitude, airport.longitude);
          console.log('State code:', stateCode);
          if (stateCode && onViewStateInfo && !stateInfoTriggered.current) {
            stateInfoTriggered.current = true;
            console.log('Triggering state info for:', stateCode);
            onViewStateInfo(stateCode);
          }
        }
      } catch (e) {
        console.error('Error fetching airport details:', e);
      }
      setLoading(false);
    }
    fetchDetails();
  }, [airport.icao, popupOpen, onViewStateInfo, airport.latitude, airport.longitude]);

  return (
    <CircleMarker
      center={[airport.latitude, airport.longitude]}
      radius={airport.type === 'large_airport' ? 8 : airport.type === 'medium_airport' ? 6 : 4}
      pathOptions={{
        color: getMarkerColor(airport.type),
        fillColor: getMarkerColor(airport.type),
        fillOpacity: 0.8,
        weight: 2
      }}
      eventHandlers={{
        popupopen: () => setPopupOpen(true),
        popupclose: () => setPopupOpen(false)
      }}
    >
      <Popup>
        <div className="min-w-[180px] max-w-[220px] text-slate-900 text-sm">
          <strong className="text-lg">{airport.icao}</strong>
          {airport.iata && <span className="ml-2 text-slate-500">({airport.iata})</span>}
          <div className="font-medium text-sm">{airport.name}</div>
          {airport.city && <div className="text-xs text-slate-500">{airport.city}</div>}
          
          {/* Loading state */}
          {loading && <div className="text-xs text-slate-400 mt-2">Loading details...</div>}
          
          {/* Airport Details */}
          {details && (
            <div className="mt-2 space-y-1 border-t border-slate-300 pt-2">
              {/* Elevation */}
              {details.elevation_ft && (
                <div className="text-xs">
                  <span className="text-slate-500">Elev:</span> {details.elevation_ft} ft
                </div>
              )}
              
              {/* Fuel Price */}
              {details.fuel && (
                <div className="text-xs">
                  <span className="text-slate-500">100LL:</span>{' '}
                  <span className="font-semibold text-emerald-600">
                    ${details.fuel.price100ll.toFixed(2)}/gal
                  </span>
                  {details.fuel.source && (
                    <span className="text-slate-400 text-[10px] ml-1">({details.fuel.source})</span>
                  )}
                </div>
              )}
              
              {/* Jet A Price */}
              {details.fuel?.priceJetA && (
                <div className="text-xs">
                  <span className="text-slate-500">JetA:</span>{' '}
                  <span className="font-semibold text-emerald-600">
                    ${details.fuel.priceJetA.toFixed(2)}/gal
                  </span>
                </div>
              )}
              
              {/* Landing Fee */}
              {details.landingFee && (
                <div className="text-xs">
                  <span className="text-slate-500">Landing:</span> ${details.landingFee.amount}
                </div>
              )}
              
              {/* Tower */}
              {details.hasTower !== null && details.hasTower !== undefined && (
                <div className="text-xs">
                  <span className="text-slate-500">Tower:</span>{' '}
                  {details.hasTower ? 'Yes' : 'No'}
                </div>
              )}
              
              {/* Runways */}
              {details.runways && details.runways.length > 0 && (
                <div className="text-xs">
                  <span className="text-slate-500">RWY:</span>{' '}
                  {details.runways.slice(0, 3).map((r: any) => r.he_ident).join(', ')}
                  {details.runways.length > 3 && ` +${details.runways.length - 3}`}
                </div>
              )}
              
              {/* Frequencies */}
              {details.frequencies && details.frequencies.length > 0 && (
                <div className="text-xs">
                  <span className="text-slate-500">Freq:</span>{' '}
                  {details.frequencies.slice(0, 2).map((f: any, i: number) => (
                    <span key={i} className="mr-2">{f.frequency_mhz} ({f.type})</span>
                  ))}
                </div>
              )}
              
              {/* Attendance */}
              {details.attendance && (
                <div className="text-xs">
                  <span className="text-slate-500">Attended:</span> {details.attendance}
                </div>
              )}
              
              {/* Phone */}
              {details.phone && (
                <div className="text-xs">
                  <span className="text-slate-500">Phone:</span> {details.phone}
                </div>
              )}
              
              {/* Manager */}
              {details.manager && (
                <div className="text-xs">
                  <span className="text-slate-500">Manager:</span> {details.manager}
                </div>
              )}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="mt-2 space-y-1">
            <button
              onClick={onClick}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white px-2 py-1 rounded text-xs font-medium"
            >
              Add to Route
            </button>
            
            {/* Manual state info button as backup */}
            <button
              onClick={() => {
                const stateCode = details?.state || inferStateFromCoords(airport.latitude, airport.longitude);
                if (stateCode && onViewStateInfo) {
                  onViewStateInfo(stateCode);
                }
              }}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium"
            >
              View State Info
            </button>
          </div>
        </div>
      </Popup>
    </CircleMarker>
  );
});

export default function LeafletMap({ 
  airports, 
  waypoints, 
  fuelPrices, 
  onBoundsChange, 
  onAirportClick, 
  mapCenter, 
  mapZoom,
  showTerrain = false,
  showStateOverlay = false,
  onStateClick,
  onViewStateInfo,
  baseLayer = 'osm',
  performanceMode = false
}: LeafletMapProps) {
  const [terrainLayer, setTerrainLayer] = useState<L.TileLayer | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [mapBounds, setMapBounds] = useState<{minLat: number; maxLat: number; minLon: number; maxLon: number} | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  // Base layer URLs
  const baseLayers = {
    osm: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '&copy; OpenStreetMap' },
    satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: '&copy; Esri' },
    terrain: { url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', attribution: '&copy; OpenTopoMap' },
    dark: { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attribution: '&copy; CartoDB' }
  };

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Filter visible airports - always show large airports, scale others by zoom
  const visibleAirports = useMemo(() => {
    const zoom = mapRef.current?.getZoom() || mapZoom;
    
    // Determine max small/medium airports based on zoom - show more
    let maxOtherAirports: number;
    if (zoom <= 3) {
      maxOtherAirports = 15;
    } else if (zoom <= 5) {
      maxOtherAirports = 40;
    } else if (zoom <= 7) {
      maxOtherAirports = 80;
    } else if (zoom <= 9) {
      maxOtherAirports = 150;
    } else {
      maxOtherAirports = 300;
    }
    
    // Performance mode caps
    if (performanceMode) {
      maxOtherAirports = Math.min(maxOtherAirports, 50);
    }
    
    // Smaller buffer to show more airports
    const buffer = zoom < 5 ? 8 : zoom < 8 ? 4 : 2;
    
    if (!mapBounds) {
      // No bounds yet - show large airports + some others
      const large = airports.filter(a => a.type === 'large_airport');
      const others = airports.filter(a => a.type !== 'large_airport').slice(0, maxOtherAirports);
      return [...large, ...others].slice(0, 200);
    }
    
    const { minLat, maxLat, minLon, maxLon } = mapBounds;
    
    // Always include large airports in view
    const largeInView = airports.filter(a => 
      a.type === 'large_airport' &&
      a.latitude >= minLat - buffer && 
      a.latitude <= maxLat + buffer &&
      a.longitude >= minLon - buffer && 
      a.longitude <= maxLon + buffer
    );
    
    // Filter other airports (medium, small, seaplane)
    const othersInView = airports.filter(a => 
      a.type !== 'large_airport' &&
      a.latitude >= minLat - buffer && 
      a.latitude <= maxLat + buffer &&
      a.longitude >= minLon - buffer && 
      a.longitude <= maxLon + buffer
    ).slice(0, maxOtherAirports);
    
    // Combine large airports (always visible) + limited others
    return [...largeInView, ...othersInView].slice(0, 200);
  }, [airports, mapBounds, mapZoom, performanceMode]);

  // Handle bounds change with debounce
  const handleBoundsChange = useCallback((bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number }) => {
    setMapBounds(bounds);
    onBoundsChange(bounds);
  }, [onBoundsChange]);

  // Toggle terrain layer based on setting
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;
    
    import('leaflet').then((L) => {
      if (showTerrain && !terrainLayer) {
        const terrain = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: 'Map data: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
          maxZoom: 17,
        });
        terrain.addTo(mapRef.current!);
        setTerrainLayer(terrain);
      } else if (!showTerrain && terrainLayer) {
        terrainLayer.remove();
        setTerrainLayer(null);
      }
    });
  }, [showTerrain, terrainLayer]);

  // State bounds for click detection (no GeoJSON rendering!)
  const stateBounds = useMemo(() => ({
    AL: { minLat: 30.2, maxLat: 35, minLon: -88.5, maxLon: -84.9 },
    AK: { minLat: 51.8, maxLat: 71.4, minLon: -180, maxLon: -130 },
    AZ: { minLat: 31.3, maxLat: 37, minLon: -114.7, maxLon: -109 },
    AR: { minLat: 33, maxLat: 36.5, minLon: -94.6, maxLon: -89.6 },
    CA: { minLat: 32.5, maxLat: 42, minLon: -124.4, maxLon: -114.6 },
    CO: { minLat: 37, maxLat: 41, minLon: -109.1, maxLon: -102 },
    CT: { minLat: 41, maxLat: 42.1, minLon: -73.7, maxLon: -71.8 },
    DE: { minLat: 38.5, maxLat: 39.8, minLon: -75.8, maxLon: -75 },
    FL: { minLat: 24.5, maxLat: 31, minLon: -87.6, maxLon: -80 },
    GA: { minLat: 30.4, maxLat: 35, minLon: -85.6, maxLon: -80.8 },
    HI: { minLat: 18.9, maxLat: 22.5, minLon: -160.2, maxLon: -154.7 },
    ID: { minLat: 42, maxLat: 49, minLon: -117.2, maxLon: -111 },
    IL: { minLat: 37, maxLat: 42.5, minLon: -91.5, maxLon: -87 },
    IN: { minLat: 38, maxLat: 41.8, minLon: -88.1, maxLon: -84.8 },
    IA: { minLat: 40.4, maxLat: 43.5, minLon: -96.6, maxLon: -90.1 },
    KS: { minLat: 37, maxLat: 40, minLon: -102.1, maxLon: -94.6 },
    KY: { minLat: 36.5, maxLat: 39.2, minLon: -89.6, maxLon: -81.9 },
    LA: { minLat: 29, maxLat: 33, minLon: -94.1, maxLon: -88.8 },
    ME: { minLat: 43.1, maxLat: 47.5, minLon: -71.1, maxLon: -66.9 },
    MD: { minLat: 37.9, maxLat: 39.7, minLon: -79.5, maxLon: -75 },
    MA: { minLat: 41.2, maxLat: 42.9, minLon: -73.5, maxLon: -69.9 },
    MI: { minLat: 41.7, maxLat: 48.2, minLon: -90.4, maxLon: -82.1 },
    MN: { minLat: 43.5, maxLat: 49.4, minLon: -97.2, maxLon: -89.5 },
    MS: { minLat: 30.2, maxLat: 35, minLon: -91.7, maxLon: -88.1 },
    MO: { minLat: 36, maxLat: 40.6, minLon: -95.8, maxLon: -89.1 },
    MT: { minLat: 44.4, maxLat: 49, minLon: -116, maxLon: -104 },
    NE: { minLat: 40, maxLat: 43, minLon: -104.1, maxLon: -95.3 },
    NV: { minLat: 35, maxLat: 42, minLon: -120, maxLon: -114 },
    NH: { minLat: 42.7, maxLat: 45.3, minLon: -72.6, maxLon: -70.7 },
    NJ: { minLat: 38.9, maxLat: 41.4, minLon: -75.6, maxLon: -73.9 },
    NM: { minLat: 31.3, maxLat: 37, minLon: -109.1, maxLon: -103 },
    NY: { minLat: 40.5, maxLat: 45, minLon: -79.8, maxLon: -71.8 },
    NC: { minLat: 33.8, maxLat: 36.5, minLon: -84.3, maxLon: -75.4 },
    ND: { minLat: 45.9, maxLat: 49, minLon: -104.1, maxLon: -96.6 },
    OH: { minLat: 38.4, maxLat: 41.7, minLon: -84.8, maxLon: -80.5 },
    OK: { minLat: 33.6, maxLat: 37, minLon: -103, maxLon: -94.4 },
    OR: { minLat: 42, maxLat: 46.3, minLon: -124.6, maxLon: -116.5 },
    PA: { minLat: 39.7, maxLat: 42.3, minLon: -80.5, maxLon: -74.7 },
    RI: { minLat: 41.1, maxLat: 42, minLon: -71.9, maxLon: -71.1 },
    SC: { minLat: 32, maxLat: 35.2, minLon: -83.4, maxLon: -78.5 },
    SD: { minLat: 42.5, maxLat: 45.9, minLon: -104.1, maxLon: -96.4 },
    TN: { minLat: 35, maxLat: 36.5, minLon: -90.3, maxLon: -81.6 },
    TX: { minLat: 25.8, maxLat: 36.5, minLon: -106.7, maxLon: -93.5 },
    UT: { minLat: 37, maxLat: 42, minLon: -114.1, maxLon: -109 },
    VT: { minLat: 42.7, maxLat: 45, minLon: -73.5, maxLon: -71.5 },
    VA: { minLat: 36.5, maxLat: 39.5, minLon: -83.7, maxLon: -75.2 },
    WA: { minLat: 45.5, maxLat: 49, minLon: -124.8, maxLon: -116.9 },
    WV: { minLat: 37.2, maxLat: 40.6, minLon: -82.6, maxLon: -77.7 },
    WI: { minLat: 42.5, maxLat: 47.1, minLon: -92.9, maxLon: -86.8 },
    WY: { minLat: 41, maxLat: 45, minLon: -111.1, maxLon: -104.1 },
    DC: { minLat: 38.79, maxLat: 38.995, minLon: -77.119, maxLon: -76.909 },
  }), []);

  // Handle map click for state detection
  const handleMapClick = useCallback((e: { latlng: { lat: number; lng: number } }) => {
    const { lat, lng } = e.latlng;
    
    // Find which state contains this point
    for (const [stateCode, bounds] of Object.entries(stateBounds)) {
      if (lat >= bounds.minLat && lat <= bounds.maxLat && 
          lng >= bounds.minLon && lng <= bounds.maxLon) {
        if (onStateClick && stateData) {
          const info = stateData[stateCode];
          if (info) {
            onStateClick(info);
            return;
          }
        }
      }
    }
  }, [stateBounds, stateData, onStateClick]);

  // Don't render on server
  if (!isClient) {
    return (
      <div className="h-full w-full bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading map...</div>
      </div>
    );
  }

  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      style={{ height: '100%', width: '100%', zIndex: 0 }}
      zoomControl={true}
    >
      <TileLayer
        attribution={baseLayers[baseLayer].attribution}
        url={baseLayers[baseLayer].url}
      />
      
      <MapEventHandler 
        onBoundsChange={handleBoundsChange} 
        onMapReady={(map) => { mapRef.current = map; }}
      />

      {/* Airport markers - PERFORMANCE: limited to visible airports */}
      {visibleAirports.map(airport => (
        <AirportMarker
          key={airport.icao}
          airport={airport}
          onClick={() => onAirportClick(airport)}
          onViewStateInfo={onViewStateInfo}
        />
      ))}
      
      {/* Route line */}
      {waypoints.length > 1 && (
        <Polyline
          positions={waypoints.map(w => [w.latitude, w.longitude])}
          pathOptions={{ color: '#38bdf8', weight: 3, dashArray: '10, 5' }}
        />
      )}
      
      {/* Waypoint markers */}
      {waypoints.map((wp, i) => (
        <CircleMarker
          key={wp.id}
          center={[wp.latitude, wp.longitude]}
          radius={8}
          pathOptions={{
            color: i === 0 ? '#22c55e' : i === waypoints.length - 1 ? '#ef4444' : '#f59e0b',
            fillColor: i === 0 ? '#22c55e' : i === waypoints.length - 1 ? '#ef4444' : '#f59e0b',
            fillOpacity: 1,
            weight: 2
          }}
        >
          <Popup>
            <div className="text-slate-900">
              <strong>{wp.icao}</strong>
              <br />
              {wp.name}
              <br />
              <span className="text-sm">Position: {i + 1} of {waypoints.length}</span>
              {fuelPrices[wp.icao] && (
                <div className="text-emerald-600 font-medium mt-1">
                  ${fuelPrices[wp.icao].price100ll}/gal
                </div>
              )}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
