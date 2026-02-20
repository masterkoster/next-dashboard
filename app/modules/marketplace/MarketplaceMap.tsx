'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

export interface MarketplaceMapListing {
  id: string;
  title: string;
  latitude?: number | null;
  longitude?: number | null;
  airportIcao: string;
  airportName?: string | null;
  type: string;
  price?: number | null;
  sharePercent?: number | null;
}

interface MarketplaceMapProps {
  listings: MarketplaceMapListing[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

const DEFAULT_CENTER: [number, number] = [39.8283, -98.5795];

export default function MarketplaceMap({ listings, selectedId, onSelect }: MarketplaceMapProps) {
  const validListings = listings.filter((listing) =>
    typeof listing.latitude === 'number' && typeof listing.longitude === 'number'
  );

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={4}
      className="w-full h-[480px] rounded-2xl overflow-hidden"
      scrollWheelZoom={false}
    >
      <MapBounds listings={validListings} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validListings.map((listing) => (
        <Marker
          key={listing.id}
          position={[listing.latitude!, listing.longitude!]}
          eventHandlers={{
            click: () => onSelect?.(listing.id),
          }}
        >
          <Popup>
            <div className="space-y-1">
              <div className="font-semibold">{listing.title}</div>
              <div className="text-xs text-muted-foreground">{listing.airportIcao}</div>
              {listing.price && (
                <div className="text-sm">${listing.price.toLocaleString()}</div>
              )}
              {listing.sharePercent && (
                <div className="text-xs text-muted-foreground">Share: {listing.sharePercent}%</div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

function MapBounds({ listings }: { listings: MarketplaceMapListing[] }) {
  const map = useMap();
  useEffect(() => {
    if (!map || listings.length === 0) return;
    const bounds = L.latLngBounds(listings.map((l) => [l.latitude!, l.longitude!] as L.LatLngTuple));
    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.15));
    }
  }, [map, listings]);
  return null;
}
