'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Popup, Polyline, CircleMarker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (window as any).L?.Icon?.Default?.prototype?._getIconUrl;
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
  onViewStateInfo?: (stateCode: string) => void;
  performanceMode?: boolean;
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

// Simple state inference from coordinates
function inferStateFromCoords(lat: number, lon: number): string | null {
  if (lat >= 41.7 && lon >= -90.4 && lon <= -82.1) return 'MI';
  if (lat >= 40.5 && lon >= -79.8 && lon <= -71.8) return 'NY';
  if (lat >= 30.4 && lon >= -85.6 && lon <= -80.8) return 'GA';
  if (lat >= 35 && lon >= -90.3 && lon <= -81.6) return 'TN';
  if (lat >= 37 && lon >= -91.5 && lon <= -87) return 'IL';
  if (lat >= 38 && lon >= -88.1 && lon <= -84.8) return 'IN';
  if (lat >= 38.4 && lon >= -84.8 && lon <= -80.5) return 'OH';
  if (lat >= 29 && lon >= -95 && lon <= -81) return 'FL';
  if (lat >= 30 && lon >= -90 && lon <= -85) return 'MS';
  if (lat >= 29 && lon >= -94.1 && lon <= -88.8) return 'LA';
  if (lat >= 33 && lon >= -106.7 && lon <= -93.5) return 'TX';
  if (lat >= 31.3 && lon >= -114.7 && lon <= -109) return 'AZ';
  if (lat >= 32.5 && lon >= -124.4 && lon <= -114.6) return 'CA';
  if (lat >= 45.5 && lon >= -124.8 && lon <= -116.9) return 'WA';
  if (lat >= 42 && lon >= -124.6 && lon <= -116.5) return 'OR';
  if (lat >= 43 && lon >= -117 && lon <= -111) return 'ID';
  if (lat >= 37 && lon >= -109.1 && lon <= -102) return 'CO';
  if (lat >= 35 && lon >= -120 && lon <= -114) return 'NV';
  if (lat >= 37 && lon >= -114.1 && lon <= -109) return 'UT';
  if (lat >= 41 && lon >= -111.1 && lon <= -104.1) return 'WY';
  if (lat >= 44.4 && lon >= -116 && lon <= -104) return 'MT';
  if (lat >= 45.9 && lon >= -104.1 && lon <= -96.6) return 'ND';
  if (lat >= 42.5 && lon >= -104.1 && lon <= -96.4) return 'SD';
  if (lat >= 38 && lon >= -104.1 && lon <= -94.3) return 'NE';
  if (lat >= 37 && lon >= -102.1 && lon <= -94.6) return 'KS';
  if (lat >= 33.6 && lon >= -103 && lon <= -94.4) return 'OK';
  if (lat >= 33.8 && lon >= -84.3 && lon <= -75.4) return 'NC';
  if (lat >= 32 && lon >= -83.4 && lon <= -78.5) return 'SC';
  if (lat >= 36.5 && lon >= -83.7 && lon <= -75.2) return 'VA';
  if (lat >= 36.5 && lon >= -89.6 && lon <= -81.9) return 'KY';
  if (lat >= 37.2 && lon >= -82.6 && lon <= -77.7) return 'WV';
  if (lat >= 39.7 && lon >= -80.5 && lon <= -74.7) return 'PA';
  if (lat >= 41 && lon >= -73.7 && lon <= -71.8) return 'CT';
  if (lat >= 41.2 && lon >= -73.5 && lon <= -69.9) return 'MA';
  if (lat >= 42.7 && lon >= -72.6 && lon <= -70.7) return 'NH';
  if (lat >= 43.1 && lon >= -71.1 && lon <= -66.9) return 'ME';
  if (lat >= 42.7 && lon >= -73.5 && lon <= -71.5) return 'VT';
  if (lat >= 38.9 && lon >= -75.6 && lon <= -73.9) return 'NJ';
  if (lat >= 41.1 && lon >= -71.9 && lon <= -71.1) return 'RI';
  if (lat >= 38.5 && lon >= -75.8 && lon <= -75) return 'DE';
  if (lat >= 37.9 && lon >= -79.5 && lon <= -75) return 'MD';
  if (lat >= 38.79 && lon >= -77.119 && lon <= -76.909) return 'DC';
  if (lat >= 30.2 && lon >= -88.5 && lon <= -84.9) return 'AL';
  if (lat >= 33 && lon >= -94.6 && lon <= -89.6) return 'AR';
  if (lat >= 40.4 && lon >= -96.6 && lon <= -90.1) return 'IA';
  if (lat >= 36 && lon >= -95.8 && lon <= -89.1) return 'MO';
  if (lat >= 31.3 && lon >= -109.1 && lon <= -103) return 'NM';
  if (lat >= 42.5 && lon >= -92.9 && lon <= -86.8) return 'WI';
  if (lat >= 43.5 && lon >= -97.2 && lon <= -89.5) return 'MN';
  if (lat >= 51.8 && lon >= -180 && lon <= -130) return 'AK';
  if (lat >= 18.9 && lon >= -160.2 && lon <= -154.7) return 'HI';
  return null;
}

function AirportPopup({ airport, onAddToRoute, onViewStateInfo }: { airport: Airport; onAddToRoute: () => void; onViewStateInfo?: (stateCode: string) => void }) {
  const [details, setDetails] = useState<AirportDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await fetch(`/api/airports/${airport.icao}`);
        if (res.ok) {
          const data = await res.json();
          setDetails(data);
        }
      } catch (e) {
        console.error('Error fetching airport details:', e);
      }
      setLoading(false);
    }
    fetchDetails();
  }, [airport.icao]);

  const handleViewStateInfo = () => {
    if (onViewStateInfo) {
      const stateCode = details?.state || inferStateFromCoords(airport.latitude, airport.longitude);
      if (stateCode) {
        onViewStateInfo(stateCode);
      }
    }
  };

  return (
    <div className="min-w-[150px] max-w-[180px] text-slate-900 relative">
      {/* Close button */}
      <button
        onClick={(e) => { e.stopPropagation(); }}
        className="absolute -top-1 -right-1 w-5 h-5 bg-slate-200 hover:bg-slate-300 rounded-full text-xs flex items-center justify-center"
        title="Close"
      >
        ×
      </button>
      <strong className="text-lg">{airport.icao}</strong>
      {airport.iata && <span className="ml-2 text-slate-500">({airport.iata})</span>}
      <div className="font-medium">{airport.name}</div>
      {details?.city && (
        <div className="text-sm text-slate-600">
          {details.city}{details.state && `, ${details.state}`}
        </div>
      )}
      
      {details && (
        <>
          {details.elevation_ft && (
            <div className="text-sm mt-2">
              <span className="font-medium">Elevation:</span> {details.elevation_ft} ft
            </div>
          )}
          
          {details.runways && details.runways.length > 0 && (
            <div className="text-sm mt-1">
              <span className="font-medium">Runways:</span>{' '}
              {details.runways.slice(0, 2).map((r, i) => (
                <span key={i} className="mr-2">
                  {r.he_ident} ({r.length_ft?.toLocaleString()}ft {r.surface})
                </span>
              ))}
            </div>
          )}
          
          {details.frequencies && details.frequencies.length > 0 && (
            <div className="text-sm mt-2">
              <span className="font-medium">Freqs:</span>
              <div className="max-h-20 overflow-y-auto mt-1">
                {details.frequencies.slice(0, 5).map((f, i) => (
                  <div key={i} className="text-xs">
                    {f.frequency_mhz.toFixed(3)} {f.type} - {f.description}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {details.fuel && (
            <div className="mt-2">
              <div className="text-emerald-600 font-medium">
                100LL: ${details.fuel.price100ll.toFixed(2)}/gal
                {details.fuel.priceJetA && (
                  <span className="ml-2">JetA: ${details.fuel.priceJetA.toFixed(2)}/gal</span>
                )}
              </div>
              {details.fuel.lastReported && (
                <div className="text-xs text-slate-400">
                  Updated: {details.fuel.lastReported}
                </div>
              )}
              {/* AirNav Attribution */}
              {details.fuel.source === 'airnav' && (
                <a 
                  href={details.fuel.sourceUrl || 'https://www.airnav.com'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-slate-500 hover:text-sky-500 block mt-1"
                >
                  Source: AirNav.com
                </a>
              )}
              {/* Tower & Landing Fee - Important Info */}
              {(details.hasTower !== undefined || details.landingFee) && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {details.hasTower !== undefined && (
                    <span className={`text-xs px-2 py-1 rounded ${details.hasTower ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {details.hasTower ? '✓ Tower' : '✗ No Tower'}
                    </span>
                  )}
                  {details.landingFee && (
                    <span className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-400">
                      Landing: ${details.landingFee.amount}
                    </span>
                  )}
                </div>
              )}
              {/* More Details Dropdown */}
              <details className="mt-2">
                <summary className="text-xs text-slate-500 cursor-pointer hover:text-sky-400">
                  More details
                </summary>
                <div className="mt-2 space-y-1 text-xs bg-slate-100 p-2 rounded">
                  {details.manager && (
                    <div><span className="font-medium">Manager:</span> {details.manager}</div>
                  )}
                  {/* Manager/Airport Phone */}
                  {details.phone && (
                    <div>
                      <span className="font-medium">Airport Phone:</span>{' '}
                      <a href={`tel:${details.phone}`} className="text-sky-600 hover:underline">{details.phone}</a>
                    </div>
                  )}
                  {/* Fuel Provider Info */}
                  {details.fuel?.providerName && (
                    <div>
                      <span className="font-medium">Fuel Provider:</span> {details.fuel.providerName}
                      {details.fuel.providerPhone && (
                        <span className="ml-1">
                          (<a href={`tel:${details.fuel.providerPhone}`} className="text-sky-600 hover:underline">{details.fuel.providerPhone}</a>)
                        </span>
                      )}
                    </div>
                  )}
                  {details.attendance && (
                    <div><span className="font-medium">Attendance:</span> {details.attendance}</div>
                  )}
                  <a 
                    href={`https://www.airnav.com/airport/${airport.icao}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sky-500 hover:underline block mt-2"
                  >
                    View full details on AirNav →
                  </a>
                </div>
              </details>
              {/* Submit price button */}
              <details className="mt-2">
                <summary className="text-xs text-sky-500 cursor-pointer hover:text-sky-400">
                  Submit updated price
                </summary>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const price = parseFloat((form.elements.namedItem('price') as HTMLInputElement).value);
                    const fuelType = (form.elements.namedItem('fuelType') as HTMLSelectElement).value;
                    if (price > 0) {
                      // Emit event to update price
                      const event = new CustomEvent('submitFuelPrice', { 
                        detail: { 
                          icao: details.icao, 
                          price, 
                          fuelType 
                        } 
                      });
                      window.dispatchEvent(event);
                      alert('Thanks! Price submitted.');
                    }
                  }}
                  className="mt-2 p-2 bg-slate-700 rounded"
                >
                  <div className="text-xs mb-2 text-slate-300">Submit your price (per gallon)</div>
                  <div className="flex gap-2">
                    <select 
                      name="fuelType" 
                      className="bg-slate-600 text-white text-xs px-2 py-1 rounded"
                    >
                      <option value="100LL">100LL</option>
                      <option value="JetA">Jet A</option>
                    </select>
                    <input 
                      type="number" 
                      name="price" 
                      step="0.01" 
                      min="0" 
                      max="20"
                      placeholder="$0.00"
                      className="bg-slate-600 text-white text-xs px-2 py-1 rounded w-20"
                      required
                    />
                    <button 
                      type="submit"
                      className="bg-sky-500 hover:bg-sky-600 text-white text-xs px-2 py-1 rounded"
                    >
                      Submit
                    </button>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Prices help other pilots!
                  </div>
                </form>
              </details>
            </div>
          )}
          
          {details.landingFee && (
            <div className="text-sm text-amber-600">
              Landing: ${details.landingFee.amount.toFixed(2)}
            </div>
          )}
        </>
      )}
      
      {loading && <div className="text-sm text-slate-400 mt-2">Loading details...</div>}
      
      <button
        onClick={onAddToRoute}
        className="mt-3 w-full bg-sky-500 hover:bg-sky-600 text-white px-3 py-2 rounded text-sm font-medium"
      >
        Add to Route
      </button>
      
      {/* View State Info button - always show */}
      <button
        onClick={() => {
          // Use state from details or infer from coordinates
          let stateCode: string | undefined = details?.state;
          if (!stateCode) {
            stateCode = inferStateFromCoords(airport.latitude, airport.longitude) ?? undefined;
          }
          if (stateCode && onViewStateInfo) {
            onViewStateInfo(stateCode);
          }
        }}
        className="mt-2 w-full bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded text-sm font-medium"
      >
        View State Info
      </button>
    </div>
  );
}

export default function LeafletMap({ 
  airports, 
  waypoints, 
  fuelPrices, 
  onBoundsChange, 
  onAirportClick, 
  mapCenter, 
  mapZoom,
  showTerrain = false,
  showAirspaces = false,
  showStateOverlay = false,
  onStateClick,
  baseLayer = 'osm',
  onViewStateInfo,
  performanceMode = false
}: LeafletMapProps) {
  const [terrainLayer, setTerrainLayer] = useState<L.TileLayer | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [currentZoom, setCurrentZoom] = useState(mapZoom);
  
  // Base layer URLs
  const baseLayers = {
    osm: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '&copy; OpenStreetMap' },
    satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: '&copy; Esri' },
    terrain: { url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', attribution: '&copy; OpenTopoMap' },
    dark: { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attribution: '&copy; CartoDB' }
  };
  
  // Filter out seaplanes automatically
  const filteredAirports = useMemo(() => {
    return airports.filter(a => a.type !== 'seaplane_base');
  }, [airports]);
  
  // Calculate marker size based on zoom - scales up more for medium/small when zoomed in
  const getMarkerRadius = (type?: string) => {
    const zoomScale = Math.max(1, (currentZoom - 4) * 0.5);
    if (type === 'large_airport') {
      return 6 + zoomScale;
    } else if (type === 'medium_airport') {
      return 4 + zoomScale * 1.5;
    } else {
      return 2 + zoomScale * 2;
    }
  };
  
  // Update zoom level
  useEffect(() => {
    if (mapRef.current) {
      const handleZoom = () => setCurrentZoom(mapRef.current!.getZoom());
      mapRef.current.on('zoomend', handleZoom);
      return () => {
        mapRef.current?.off('zoomend', handleZoom);
      };
    }
  }, []);
  
  // Toggle terrain layer based on setting
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Import Leaflet dynamically
    import('leaflet').then((L) => {
      if (showTerrain && !terrainLayer) {
        // Add OpenTopoMap terrain layer
        const terrain = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: 'Map data: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
          maxZoom: 17,
        });
        terrain.addTo(mapRef.current!);
        setTerrainLayer(terrain);
      } else if (!showTerrain && terrainLayer) {
        // Remove terrain layer
        terrainLayer.remove();
        setTerrainLayer(null);
      }
    });
  }, [showTerrain, terrainLayer]);
 
  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      style={{ height: '100%', width: '100%', zIndex: 0 }}
    >
      <TileLayer
        attribution={baseLayers[baseLayer].attribution}
        url={baseLayers[baseLayer].url}
      />
      
      <MapEventHandler onBoundsChange={onBoundsChange} onMapReady={(map) => { mapRef.current = map; }} />
      
      {/* Airport markers - filtered and zoom-based sizing */}
      {filteredAirports.map(airport => (
        <CircleMarker
          key={airport.icao}
          center={[airport.latitude, airport.longitude]}
          radius={getMarkerRadius(airport.type)}
          pathOptions={{
            color: getMarkerColor(airport.type),
            fillColor: getMarkerColor(airport.type),
            fillOpacity: 0.7,
            weight: 1
          }}
        >
          <Popup>
            <AirportPopup airport={airport} onAddToRoute={() => onAirportClick(airport)} onViewStateInfo={onViewStateInfo} />
          </Popup>
        </CircleMarker>
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
              <br />
              {fuelPrices[wp.icao] && (
                <span className="text-emerald-600 font-medium">
                  ${fuelPrices[wp.icao].price100ll}/gal
                </span>
              )}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
