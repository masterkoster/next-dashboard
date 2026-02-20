'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function WeatherRadarMap() {
  const mapRef = useRef<L.Map | null>(null);
  const radarLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef<number | null>(null);

  const [radarHost, setRadarHost] = useState<string>('https://tilecache.rainviewer.com');
  const [frames, setFrames] = useState<Array<{ time: number; path: string }>>([]);
  const [frameIndex, setFrameIndex] = useState(0);

  const [jumpIcao, setJumpIcao] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [loadingFrames, setLoadingFrames] = useState(true);

  // Fetch radar timestamps from RainViewer API
  useEffect(() => {
    const fetchRadarData = async () => {
      try {
        setLoadingFrames(true);
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        const data = await res.json();
        const host = (data?.host || 'https://tilecache.rainviewer.com').toString();
        setRadarHost(host);

        const radarPast = Array.isArray(data?.radar?.past) ? data.radar.past : [];
        const nowcast = Array.isArray(data?.radar?.nowcast) ? data.radar.nowcast : [];
        const all = [...radarPast, ...nowcast]
          .filter((t: any) => typeof t?.time === 'number' && typeof t?.path === 'string')
          .map((t: any) => ({ time: t.time, path: t.path as string }));

        setFrames(all);
        setFrameIndex(Math.max(0, all.length - 1));
      } catch (err) {
        console.error('Failed to fetch radar data:', err);
        setNotice('Failed to load radar frames. Please try again.');
      } finally {
        setLoadingFrames(false);
      }
    };
    fetchRadarData();
  }, []);

  useEffect(() => {
    // Initialize map
    const map = L.map('weather-radar-map', {
      center: [39.8283, -98.5795], // Center of US
      zoom: 6,
      zoomControl: true,
    });

    mapRef.current = map;

    // Add dark base map for better radar visibility
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB',
      maxZoom: 19,
    }).addTo(map);

    return () => {
      if (animationRef.current) {
        window.clearInterval(animationRef.current);
        animationRef.current = null;
      }
      map.remove();
    };
  }, []);

  const currentFrame = frames[frameIndex] || null;
  const currentTileUrl = useMemo(() => {
    if (!currentFrame) return null;
    return `${radarHost}${currentFrame.path}/{z}/{x}/{y}/2/1_1.png`;
  }, [currentFrame, radarHost]);

  // Ensure radar layer exists when frames arrive; update when frame changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!currentTileUrl) return;

    if (!radarLayerRef.current) {
      radarLayerRef.current = L.tileLayer(currentTileUrl, {
        attribution: 'Radar data © RainViewer',
        opacity: 0.72,
        maxZoom: 12,
        zIndex: 500,
      }).addTo(map);
      return;
    }

    radarLayerRef.current.setUrl(currentTileUrl);
  }, [currentTileUrl]);

  // Animation.
  useEffect(() => {
    if (animationRef.current) {
      window.clearInterval(animationRef.current);
      animationRef.current = null;
    }

    if (!isPlaying) return;
    if (frames.length < 2) return;

    animationRef.current = window.setInterval(() => {
      setFrameIndex((prev) => {
        const next = prev + 1;
        return next >= frames.length ? 0 : next;
      });
    }, 450);

    return () => {
      if (animationRef.current) {
        window.clearInterval(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, frames.length]);

  const frameLabel = useMemo(() => {
    if (!currentFrame) return '—';
    try {
      return new Date(currentFrame.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return String(currentFrame.time);
    }
  }, [currentFrame]);

  async function jumpToAirport() {
    const map = mapRef.current;
    if (!map) return;
    const icao = jumpIcao.trim().toUpperCase();
    if (!icao) return;

    setNotice(null);
    try {
      const res = await fetch(`/api/airports/${encodeURIComponent(icao)}`);
      if (!res.ok) {
        setNotice('Airport not found. Try a valid ICAO (e.g., KJFK).');
        return;
      }
      const data = await res.json();
      const lat = Number(data.latitude);
      const lon = Number(data.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        setNotice('Airport location missing.');
        return;
      }

      map.setView([lat, lon], Math.max(map.getZoom(), 8), { animate: true });

      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }

      markerRef.current = L.marker([lat, lon]).addTo(map);
      const label = `${data.name || icao}${data.city ? ` • ${data.city}` : ''}`;
      markerRef.current.bindPopup(label).openPopup();
    } catch (error) {
      console.error('Airport jump failed', error);
      setNotice('Failed to jump to airport.');
    }
  }

  function jumpToMyLocation() {
    const map = mapRef.current;
    if (!map) return;
    setNotice(null);

    if (!navigator.geolocation) {
      setNotice('Geolocation not available in this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        map.setView([lat, lon], Math.max(map.getZoom(), 8), { animate: true });
      },
      () => setNotice('Location permission denied.'),
      { enableHighAccuracy: false, timeout: 6000 }
    );
  }

  return (
    <div className="relative h-full">
      {/* Map Container */}
      <div id="weather-radar-map" className="h-full w-full" />

      {/* Controls Overlay */}
      <div className="absolute top-4 left-4 z-[1000] bg-slate-800/90 backdrop-blur rounded-lg p-4 shadow-lg w-[320px]">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Radar</h3>
          <span className="text-xs text-slate-400">{loadingFrames ? 'Loading…' : frames.length ? `Frame ${frameIndex + 1}/${frames.length}` : 'No data'}</span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => setIsPlaying((p) => !p)}
            disabled={frames.length < 2}
            className={`px-3 py-2 rounded text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
              isPlaying ? 'bg-red-500 hover:bg-red-400 text-white' : 'bg-emerald-500 hover:bg-emerald-400 text-white'
            }`}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={() => setFrameIndex((i) => (frames.length ? (i - 1 + frames.length) % frames.length : i))}
            disabled={!frames.length}
            className="px-3 py-2 rounded text-sm bg-slate-700 text-slate-200 hover:bg-slate-600 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setFrameIndex((i) => (frames.length ? (i + 1) % frames.length : i))}
            disabled={!frames.length}
            className="px-3 py-2 rounded text-sm bg-slate-700 text-slate-200 hover:bg-slate-600 disabled:opacity-50"
          >
            Next
          </button>
          <div className="ml-auto text-xs text-slate-400">{frameLabel}</div>
        </div>

        <div className="mt-3">
          <input
            type="range"
            min={0}
            max={Math.max(0, frames.length - 1)}
            value={Math.min(frameIndex, Math.max(0, frames.length - 1))}
            onChange={(e) => setFrameIndex(Number(e.target.value))}
            disabled={!frames.length}
            className="w-full"
          />
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="text-xs text-slate-400 mb-2">Jump to</div>
          <div className="flex gap-2">
            <input
              value={jumpIcao}
              onChange={(e) => setJumpIcao(e.target.value)}
              placeholder="ICAO (e.g., KJFK)"
              className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"
            />
            <button
              onClick={jumpToAirport}
              className="px-3 py-2 rounded text-sm bg-slate-700 text-slate-200 hover:bg-slate-600"
            >
              Go
            </button>
          </div>
          <button
            onClick={jumpToMyLocation}
            className="mt-2 w-full px-3 py-2 rounded text-sm bg-slate-700 text-slate-200 hover:bg-slate-600"
          >
            Use My Location
          </button>
          {notice && <div className="mt-2 text-xs text-amber-300">{notice}</div>}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-slate-800/90 backdrop-blur rounded-lg p-4 shadow-lg">
        <h4 className="text-white text-sm font-semibold mb-2">Precipitation Intensity</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-300" />
            <span className="text-xs text-slate-300">Light</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500" />
            <span className="text-xs text-slate-300">Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500" />
            <span className="text-xs text-slate-300">Heavy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span className="text-xs text-slate-300">Severe</span>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="absolute top-4 right-4 z-[1000] bg-slate-800/90 backdrop-blur rounded-lg p-4 shadow-lg max-w-xs">
        <h4 className="text-white text-sm font-semibold mb-2">About Weather Radar</h4>
        <p className="text-xs text-slate-400 mb-2">
          Real-time precipitation radar. Use the timeline to scrub through recent frames.
        </p>
        <p className="text-xs text-slate-500">
          Data provided by RainViewer API. Updates every 10 minutes.
        </p>
      </div>

      {/* Empty state overlay */}
      {!loadingFrames && frames.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200">
            No radar frames available right now.
          </div>
        </div>
      )}
    </div>
  );
}
