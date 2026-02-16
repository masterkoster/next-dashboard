'use client';

import { useState, useEffect, useRef } from 'react';
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
  baseLayer?: 'osm' | 'satellite' | 'terrain' | 'dark';
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

function AirportPopup({ airport, onAddToRoute }: { airport: Airport; onAddToRoute: () => void }) {
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

  return (
    <div className="min-w-[160px] max-w-[220px] text-slate-900">
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
  baseLayer = 'osm'
}: LeafletMapProps) {
  const [terrainLayer, setTerrainLayer] = useState<L.TileLayer | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  
  // Base layer URLs
  const baseLayers = {
    osm: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '&copy; OpenStreetMap' },
    satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: '&copy; Esri' },
    terrain: { url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', attribution: '&copy; OpenTopoMap' },
    dark: { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attribution: '&copy; CartoDB' }
  };
  
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
      
      {/* Airport markers - only show larger airports when zoomed out */}
      {airports.map(airport => (
        <CircleMarker
          key={airport.icao}
          center={[airport.latitude, airport.longitude]}
          radius={airport.type === 'large_airport' ? 8 : airport.type === 'medium_airport' ? 6 : 4}
          pathOptions={{
            color: getMarkerColor(airport.type),
            fillColor: getMarkerColor(airport.type),
            fillOpacity: 0.7,
            weight: 1
          }}
        >
          <Popup>
            <AirportPopup airport={airport} onAddToRoute={() => onAirportClick(airport)} />
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
