'use client';

import { useEffect, useState } from 'react';
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

export default function LeafletMap({ airports, waypoints, fuelPrices, onBoundsChange, onAirportClick, mapCenter, mapZoom }: LeafletMapProps) {
  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapEventHandler onBoundsChange={onBoundsChange} />
      
      {/* Airport markers */}
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
            <div className="text-slate-900">
              <strong>{airport.icao}</strong>
              <br />
              {airport.name}
              <br />
              <span className="text-sm">{airport.city}</span>
              <br />
              <button
                onClick={() => onAirportClick(airport)}
                className="mt-2 bg-sky-500 text-white px-2 py-1 rounded text-sm"
              >
                Add to Route
              </button>
            </div>
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
