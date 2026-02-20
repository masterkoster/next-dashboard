'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icons (works in production builds)
const markerIconUrl = new URL('leaflet/dist/images/marker-icon.png', import.meta.url).toString();
const markerIconRetinaUrl = new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).toString();
const markerShadowUrl = new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).toString();

L.Icon.Default.mergeOptions({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIconRetinaUrl,
  shadowUrl: markerShadowUrl,
});

export default function WeatherRadarMap() {
  const mapRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const baseLayerRef = useRef<L.TileLayer | null>(null);
  const radarLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef<number | null>(null);

  const frames = useMemo(() => {
    // IEM provides current + 5-min increments back to 55 minutes.
    // Order oldest -> newest.
    const mins = [55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5, 0];
    return mins.map((m) => ({ minutesAgo: m }));
  }, []);

  const [frameIndex, setFrameIndex] = useState(frames.length - 1);

  const [jumpIcao, setJumpIcao] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [loadingFrames, setLoadingFrames] = useState(false);
  const [radarOpacity, setRadarOpacity] = useState(0.72);
  const [basemap, setBasemap] = useState<'light' | 'dark'>('light');
  const [showLegend, setShowLegend] = useState(false);
  const [speedMs, setSpeedMs] = useState(450);

  // Frames are fixed for IEM (0-55 minutes). No fetch needed.
  useEffect(() => {
    // Initialize map
    const map = L.map('weather-radar-map', {
      center: [39.8283, -98.5795], // Center of US
      zoom: 6,
      zoomControl: false,
    });

    mapRef.current = map;
    setMapReady(true);

    L.control
      .zoom({ position: 'bottomright' })
      .addTo(map);

    baseLayerRef.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap, © CARTO',
      maxZoom: 19,
    }).addTo(map);

    return () => {
      if (animationRef.current) {
        window.clearInterval(animationRef.current);
        animationRef.current = null;
      }
      setMapReady(false);
      map.remove();
    };
  }, []);

  useEffect(() => {
    const layer = baseLayerRef.current;
    if (!layer) return;

    const url = basemap === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    layer.setUrl(url);
  }, [basemap]);

  const currentFrame = frames[frameIndex] || null;
  const currentTileUrl = useMemo(() => {
    if (!currentFrame) return null;
    const m = currentFrame.minutesAgo;
    const layer = m === 0 ? 'nexrad-n0q' : `nexrad-n0q-m${String(m).padStart(2, '0')}m`;
    // Use multiple hostnames for parallel loading.
    return `https://mesonet{s}.agron.iastate.edu/cache/tile.py/1.0.0/${layer}-900913/{z}/{x}/{y}.png`;
  }, [currentFrame]);

  // Ensure radar layer exists when frames arrive; update when frame changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;
    if (!currentTileUrl) return;

    if (!radarLayerRef.current) {
      radarLayerRef.current = L.tileLayer(currentTileUrl, {
        attribution: 'Radar © Iowa Environmental Mesonet',
        opacity: radarOpacity,
        maxZoom: 12,
        zIndex: 500,
        subdomains: ['1', '2', '3'],
      }).addTo(map);
      return;
    }

    radarLayerRef.current.setUrl(currentTileUrl);
  }, [currentTileUrl, radarOpacity, mapReady]);

  useEffect(() => {
    if (!radarLayerRef.current) return;
    radarLayerRef.current.setOpacity(radarOpacity);
  }, [radarOpacity]);

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
    }, Math.max(200, Math.min(2000, speedMs)));

    return () => {
      if (animationRef.current) {
        window.clearInterval(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, frames.length, speedMs]);

  const frameLabel = useMemo(() => {
    if (!currentFrame) return '—';
    try {
      const then = Date.now() - currentFrame.minutesAgo * 60_000;
      return new Date(then).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }, [currentFrame]);

  const frameRelativeLabel = useMemo(() => {
    if (!currentFrame) return '';
    return currentFrame.minutesAgo === 0 ? 'now' : `${currentFrame.minutesAgo}m ago`;
  }, [currentFrame]);


  async function jumpToAirport() {
    const map = mapRef.current;
    if (!mapReady || !map) return;
    const icao = jumpIcao.trim().toUpperCase();
    if (!icao) return;

    setNotice(null);
    try {
      const res = await fetch(`/api/airports/${encodeURIComponent(icao)}`);
      if (!res.ok) {
        setNotice('Airport not found. Try ICAO (KDTW) or IATA (DTW).');
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

      if (markerRef.current && map.hasLayer(markerRef.current)) {
        map.removeLayer(markerRef.current);
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
    if (!mapReady || !map) return;
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
      () => setNotice('Location permission denied by browser settings.'),
      { enableHighAccuracy: false, timeout: 6000 }
    );
  }

  function zoomIn() {
    mapRef.current?.zoomIn();
  }

  function zoomOut() {
    mapRef.current?.zoomOut();
  }

  return (
    <div className="relative h-full bg-slate-950">
      {/* Map Container */}
      <div id="weather-radar-map" className="h-full w-full" />

      {/* Top glass bar (Windy-ish) */}
      <div className="absolute top-0 left-0 right-0 z-[1000] px-4 pt-4 pointer-events-none">
        <div className="mx-auto max-w-6xl">
          <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-slate-200/10 bg-slate-900/60 backdrop-blur-xl shadow-xl px-3 py-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <div className="text-sm font-semibold text-white">Radar</div>
              <div className="text-xs text-slate-300">{frameLabel}{frameRelativeLabel ? ` • ${frameRelativeLabel}` : ''}</div>
            </div>

            <div className="flex-1" />

            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setBasemap((b) => (b === 'light' ? 'dark' : 'light'))}
                className="text-xs px-3 py-2 rounded-full bg-slate-800/70 hover:bg-slate-700/70 text-slate-200 border border-slate-700"
              >
                Base: {basemap === 'light' ? 'Light' : 'Dark'}
              </button>
              <button
                onClick={() => setShowLegend((v) => !v)}
                className="text-xs px-3 py-2 rounded-full bg-slate-800/70 hover:bg-slate-700/70 text-slate-200 border border-slate-700"
              >
                Legend
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Left tool rail */}
      <div className="absolute top-24 left-4 z-[1000] pointer-events-auto">
        <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/10 bg-slate-900/60 backdrop-blur-xl shadow-xl p-2">
          <button
            onClick={jumpToMyLocation}
            className="h-10 w-10 rounded-xl bg-slate-800/70 hover:bg-slate-700/70 border border-slate-700 text-slate-200 text-sm"
            title="Use my location"
          >
            ⦿
          </button>
          <button
            onClick={() => setShowLegend((v) => !v)}
            className="h-10 w-10 rounded-xl bg-slate-800/70 hover:bg-slate-700/70 border border-slate-700 text-slate-200 text-sm"
            title="Legend"
          >
            ≋
          </button>
        </div>
      </div>

      {/* Search box */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[1000] w-[min(520px,calc(100%-2rem))] pointer-events-auto">
        <div className="rounded-2xl border border-slate-200/10 bg-slate-900/60 backdrop-blur-xl shadow-xl px-3 py-2 flex items-center gap-2">
          <div className="text-slate-300 text-sm">Go to</div>
          <input
            value={jumpIcao}
            onChange={(e) => setJumpIcao(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') jumpToAirport();
            }}
            placeholder="Airport code (DTW / KDTW)"
            className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-slate-500"
          />
          <button
            onClick={jumpToAirport}
            className="px-3 py-2 rounded-xl bg-emerald-500/90 hover:bg-emerald-400 text-white text-sm"
          >
            Go
          </button>
        </div>
        {notice && (
          <div className="mt-2 text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2">
            {notice}
          </div>
        )}
      </div>

      {/* Bottom timeline */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000] pointer-events-none">
        <div className="mx-auto max-w-6xl pointer-events-auto">
          <div className="rounded-2xl border border-slate-200/10 bg-slate-900/60 backdrop-blur-xl shadow-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying((p) => !p)}
                disabled={frames.length < 2}
                className={`px-3 py-2 rounded-xl text-sm font-medium border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isPlaying ? 'bg-red-500/80 hover:bg-red-400 text-white' : 'bg-slate-800/70 hover:bg-slate-700/70 text-white'
                }`}
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>

              <div className="flex-1">
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, frames.length - 1)}
                  value={Math.min(frameIndex, Math.max(0, frames.length - 1))}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setFrameIndex(Number(e.target.value));
                  }}
                  disabled={!frames.length}
                  className="w-full"
                />
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-300">
                  <span>{loadingFrames ? 'Loading frames…' : frames.length ? 'Past radar' : 'No data'}</span>
                  <span>{frameLabel}{frameRelativeLabel ? ` • ${frameRelativeLabel}` : ''}</span>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2">
                <div className="text-[11px] text-slate-300">Opacity</div>
                <input
                  type="range"
                  min={0.2}
                  max={0.95}
                  step={0.01}
                  value={radarOpacity}
                  onChange={(e) => setRadarOpacity(Number(e.target.value))}
                />
              </div>

              <div className="hidden lg:flex items-center gap-2">
                <div className="text-[11px] text-slate-300">Speed</div>
                <select
                  value={speedMs}
                  onChange={(e) => setSpeedMs(Number(e.target.value))}
                  className="bg-slate-800/70 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white"
                >
                  <option value={300}>Fast</option>
                  <option value={450}>Normal</option>
                  <option value={700}>Slow</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zoom buttons */}
      <div className="absolute bottom-28 right-4 z-[1000] pointer-events-auto">
        <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/10 bg-slate-900/60 backdrop-blur-xl shadow-xl p-2">
          <button
            onClick={zoomIn}
            className="h-10 w-10 rounded-xl bg-slate-800/70 hover:bg-slate-700/70 border border-slate-700 text-slate-200 text-lg"
            title="Zoom in"
          >
            +
          </button>
          <button
            onClick={zoomOut}
            className="h-10 w-10 rounded-xl bg-slate-800/70 hover:bg-slate-700/70 border border-slate-700 text-slate-200 text-lg"
            title="Zoom out"
          >
            −
          </button>
        </div>
      </div>

      {/* Legend (toggle) */}
      {showLegend && (
        <div className="absolute top-24 right-4 z-[1000] pointer-events-auto w-[260px]">
          <div className="rounded-2xl border border-slate-200/10 bg-slate-900/60 backdrop-blur-xl shadow-xl p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white">Intensity</div>
              <button
                onClick={() => setShowLegend(false)}
                className="text-xs text-slate-300 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-blue-300" />
                <span className="text-xs text-slate-200">Light</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-blue-500" />
                <span className="text-xs text-slate-200">Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-yellow-500" />
                <span className="text-xs text-slate-200">Heavy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-red-500" />
                <span className="text-xs text-slate-200">Severe</span>
              </div>
            </div>
            <div className="mt-3 text-[11px] text-slate-400">
              Radar tiles: RainViewer.
            </div>
          </div>
        </div>
      )}

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
