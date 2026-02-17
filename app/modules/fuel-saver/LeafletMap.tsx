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
}

// Fix Leaflet icon issue
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (window as any).L?.Icon?.Default?.prototype?._getIconUrl;
}

// Component to handle map move events and get map reference
function MapEventHandler({ onBoundsChange, onMapReady }: { onBoundsChange: (bounds: any) => void; onMapReady?: (map: L.Map) => void }) {
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
  baseLayer = 'osm'
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
    if (!mapBounds) return airports.slice(0, 100); // Initial limit
    
    const { minLat, maxLat, minLon, maxLon } = mapBounds;
    const buffer = 2; // Add buffer around edges
    
    return airports.filter(a => 
      a.latitude >= minLat - buffer && 
      a.latitude <= maxLat + buffer &&
      a.longitude >= minLon - buffer && 
      a.longitude <= maxLon + buffer
    ).slice(0, 200); // Hard limit for performance
  }, [airports, mapBounds]);

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

  // State overlay styles
  const stateStyle = {
    fillColor: 'transparent',
    fillOpacity: 0,
    color: '#64748b',
    weight: 1,
    opacity: 0.4,
  };

  const stateHoverStyle = {
    fillColor: '#0ea5e9',
    fillOpacity: 0.15,
    color: '#0ea5e9',
    weight: 2,
  };

  const onEachState = (feature: any, layer: L.Layer) => {
    const stateCode = feature.id;
    const pathLayer = layer as L.Path;
    
    layer.on({
      mouseover: () => {
        setHoveredState(stateCode);
        pathLayer.setStyle(stateHoverStyle);
        const container = mapRef.current?.getContainer();
        if (container) container.style.cursor = 'pointer';
      },
      mouseout: () => {
        setHoveredState(null);
        pathLayer.setStyle(stateStyle);
        const container = mapRef.current?.getContainer();
        if (container) container.style.cursor = '';
      },
      click: () => {
        if (onStateClick && stateData) {
          const info = stateData[stateCode];
          if (info) {
            onStateClick(info);
          }
        }
      },
    });
  };

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
      
      {/* State Overlay */}
      {showStateOverlay && usStatesGeoJson && GeoJSONComponent && (
        <GeoJSONComponent
          data={usStatesGeoJson}
          style={(feature: any) => 
            feature.id === hoveredState ? stateHoverStyle : stateStyle
          }
          onEachFeature={onEachState}
        />
      )}
      
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
