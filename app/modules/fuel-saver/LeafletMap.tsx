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
  onClick 
}: { 
  airport: Airport; 
  onClick: () => void;
}) {
  return (
    <CircleMarker
      center={[airport.latitude, airport.longitude]}
      radius={airport.type === 'large_airport' ? 6 : airport.type === 'medium_airport' ? 4 : 2}
      pathOptions={{
        color: getMarkerColor(airport.type),
        fillColor: getMarkerColor(airport.type),
        fillOpacity: 0.7,
        weight: 1
      }}
    >
      <Popup>
        <div className="min-w-[150px] max-w-[180px] text-slate-900">
          <strong className="text-lg">{airport.icao}</strong>
          {airport.iata && <span className="ml-2 text-slate-500">({airport.iata})</span>}
          <div className="font-medium text-sm">{airport.name}</div>
          {airport.city && <div className="text-xs text-slate-500">{airport.city}</div>}
          <button
            onClick={onClick}
            className="mt-2 w-full bg-sky-500 hover:bg-sky-600 text-white px-2 py-1 rounded text-xs font-medium"
          >
            Add to Route
          </button>
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

  // Filter visible airports based on bounds - PERFORMANCE: only show airports in view
  const visibleAirports = useMemo(() => {
    // In performance mode, dramatically reduce airport count
    const zoom = mapRef.current?.getZoom() || mapZoom;
    
    let maxAirports: number;
    if (performanceMode) {
      // Performance mode - very aggressive limits
      maxAirports = zoom < 5 ? 10 : zoom < 7 ? 20 : zoom < 9 ? 40 : 60;
    } else {
      // Normal mode - still limited but more generous
      maxAirports = zoom < 5 ? 30 : zoom < 7 ? 60 : zoom < 9 ? 100 : 150;
    }
    
    if (!mapBounds) return airports.slice(0, maxAirports);
    
    const { minLat, maxLat, minLon, maxLon } = mapBounds;
    const buffer = zoom < 5 ? 5 : 3;
    
    return airports.filter(a => 
      a.latitude >= minLat - buffer && 
      a.latitude <= maxLat + buffer &&
      a.longitude >= minLon - buffer && 
      a.longitude <= maxLon + buffer
    ).slice(0, maxAirports);
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
