'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface TrackPoint {
  lat: number;
  lng: number;
  alt?: number;
  speed?: number;
  timestamp: string;
}

interface FlightPlaybackMapProps {
  points: TrackPoint[];
  playing: boolean;
  currentPointIndex: number;
  onPlaybackEnd: () => void;
  onIndexChange: (index: number) => void;
}

export default function FlightPlaybackMap({ 
  points, 
  playing, 
  currentPointIndex, 
  onPlaybackEnd,
  onIndexChange 
}: FlightPlaybackMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize map
  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map('flight-playback-map', {
      center: [39.8283, -98.5795],
      zoom: 6,
      zoomControl: true,
    });

    mapRef.current = map;

    // Add base map layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add dark overlay for better visibility
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB',
      maxZoom: 19,
    }).addTo(map);

    return () => {
      map.remove();
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, []);

  // Draw full track when points change
  useEffect(() => {
    if (!mapRef.current || points.length < 2) return;

    // Remove existing polyline
    if (polylineRef.current) {
      mapRef.current.removeLayer(polylineRef.current);
    }

    // Create lat/lng array for the full track
    const latLngs: L.LatLngExpression[] = points.map(p => [p.lat, p.lng]);

    // Draw the full track path (gray)
    polylineRef.current = L.polyline(latLngs, {
      color: '#64748b',
      weight: 3,
      opacity: 0.6,
      dashArray: '5, 10',
    }).addTo(mapRef.current);

    // Fit map to track bounds
    const bounds = L.latLngBounds(latLngs);
    mapRef.current.fitBounds(bounds, { padding: [50, 50] });

    // Add start/end markers
    const startIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="background:#22c55e;width:16px;height:16px;border-radius:50%;border:2px solid white;"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    const endIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="background:#ef4444;width:16px;height:16px;border-radius:50%;border:2px solid white;"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    L.marker([points[0].lat, points[0].lng], { icon: startIcon })
      .bindPopup('Start')
      .addTo(mapRef.current);

    L.marker([points[points.length - 1].lat, points[points.length - 1].lng], { icon: endIcon })
      .bindPopup('End')
      .addTo(mapRef.current);

  }, [points]);

  // Update marker position during playback
  useEffect(() => {
    if (!mapRef.current || points.length === 0) return;

    // Remove existing marker
    if (markerRef.current) {
      mapRef.current.removeLayer(markerRef.current);
    }

    const point = points[currentPointIndex];
    if (!point) return;

    // Create plane icon
    const planeIcon = L.divIcon({
      className: 'plane-marker',
      html: `<div style="
        background: #3b82f6;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">✈️</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    markerRef.current = L.marker([point.lat, point.lng], { icon: planeIcon })
      .addTo(mapRef.current);

    // Add popup with details
    const popupContent = `
      <div style="font-family: system-ui; font-size: 12px;">
        <strong>Point ${currentPointIndex + 1}</strong><br/>
        Alt: ${point.alt || '--'} ft<br/>
        Speed: ${point.speed || '--'} kts<br/>
        ${point.timestamp ? new Date(point.timestamp).toLocaleTimeString() : ''}
      </div>
    `;
    markerRef.current.bindPopup(popupContent);

    // Pan map to follow the plane
    mapRef.current.panTo([point.lat, point.lng]);

  }, [currentPointIndex, points]);

  // Handle playback animation
  useEffect(() => {
    if (!playing || points.length === 0) {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const interval = 500; // Base 500ms between points

    animationRef.current = setInterval(() => {
      if (currentPointIndex >= points.length - 1) {
        // Playback complete
        if (animationRef.current) {
          clearInterval(animationRef.current);
          animationRef.current = null;
        }
        onPlaybackEnd();
        return;
      }
      onIndexChange(currentPointIndex + 1);
    }, interval);

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [playing, points.length, onPlaybackEnd, currentPointIndex, onIndexChange]);

  return (
    <div 
      id="flight-playback-map" 
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    />
  );
}
