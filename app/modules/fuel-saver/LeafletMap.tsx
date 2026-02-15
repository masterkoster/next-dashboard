'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Popup, Polyline, CircleMarker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

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
  fuel?: { price100ll: number; source: string };
  landingFee?: { amount: number };
}

interface LeafletMapProps {
  airports: Airport[];
  waypoints: Waypoint[];
  fuelPrices: Record<string, FuelPrice>;
  onBoundsChange: (bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number }) => void;
  onAirportClick: (airport: Airport) => void;
  mapCenter: [number, number];
  mapZoom: number;
}

// Component to handle map move events
function MapEventHandler({ onBoundsChange }: { onBoundsChange: (bounds: any) => void }) {
  useMapEvents({
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
    <div className="min-w-[200px] text-slate-900">
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
            <div className="mt-2 text-emerald-600 font-medium">
              100LL: ${details.fuel.price100ll.toFixed(2)}/gal
              <span className="text-xs text-slate-400 ml-1">({details.fuel.source})</span>
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

export default function LeafletMap({ airports, waypoints, fuelPrices, onBoundsChange, onAirportClick, mapCenter, mapZoom }: LeafletMapProps) {
  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      style={{ height: '100%', width: '100%', zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapEventHandler onBoundsChange={onBoundsChange} />
      
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
          eventHandlers={{
            click: () => onAirportClick(airport)
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
