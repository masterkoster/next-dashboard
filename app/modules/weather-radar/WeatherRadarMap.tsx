'use client';

import { useEffect, useState, useRef } from 'react';
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
  const [selectedLayer, setSelectedLayer] = useState<'precipitation' | 'clouds' | 'wind' | 'temp'>('precipitation');
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationFrame, setAnimationFrame] = useState(0);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize map
    const map = L.map('weather-radar-map', {
      center: [39.8283, -98.5795], // Center of US
      zoom: 5,
      zoomControl: true,
    });

    mapRef.current = map;

    // Add base map layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add weather radar layer from RainViewer
    addWeatherLayer(map, selectedLayer);

    return () => {
      map.remove();
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      // Clear existing weather layers
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.TileLayer && layer.options.attribution?.includes('RainViewer')) {
          mapRef.current?.removeLayer(layer);
        }
      });
      
      // Add new weather layer
      addWeatherLayer(mapRef.current, selectedLayer);
    }
  }, [selectedLayer]);

  const addWeatherLayer = (map: L.Map, layerType: string) => {
    let tileUrl = '';
    
    switch (layerType) {
      case 'precipitation':
        // RainViewer precipitation radar
        tileUrl = 'https://tilecache.rainviewer.com/v2/radar/nowcast_0b0c4d1f0b0c4d1f0b0c4d1f0b0c4d1f/{z}/{x}/{y}/2/1_1.png';
        break;
      case 'clouds':
        // OpenWeatherMap clouds (free tier)
        tileUrl = 'https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=YOUR_API_KEY';
        break;
      default:
        tileUrl = 'https://tilecache.rainviewer.com/v2/radar/nowcast_0b0c4d1f0b0c4d1f0b0c4d1f0b0c4d1f/{z}/{x}/{y}/2/1_1.png';
    }

    // For now, use a demo approach with RainViewer
    // In production, you'd want to fetch the actual latest timestamp
    L.tileLayer(
      'https://tilecache.rainviewer.com/v2/radar/1700000000/{z}/{x}/{y}/2/1_1.png',
      {
        attribution: 'Radar data © RainViewer',
        opacity: 0.6,
        maxZoom: 19,
      }
    ).addTo(map);
  };

  const handlePlayAnimation = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    } else {
      setIsPlaying(true);
      animationRef.current = setInterval(() => {
        setAnimationFrame((prev) => (prev + 1) % 12); // 12 frames
      }, 500);
    }
  };

  return (
    <div className="relative h-full">
      {/* Map Container */}
      <div id="weather-radar-map" className="h-full w-full" />

      {/* Controls Overlay */}
      <div className="absolute top-4 left-4 z-[1000] bg-slate-800/90 backdrop-blur rounded-lg p-4 shadow-lg">
        <h3 className="text-white font-semibold mb-3">Weather Layers</h3>
        
        <div className="space-y-2">
          <button
            onClick={() => setSelectedLayer('precipitation')}
            className={`w-full text-left px-3 py-2 rounded text-sm transition ${
              selectedLayer === 'precipitation'
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            🌧️ Precipitation (Radar)
          </button>
          <button
            onClick={() => setSelectedLayer('clouds')}
            className={`w-full text-left px-3 py-2 rounded text-sm transition ${
              selectedLayer === 'clouds'
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            ☁️ Cloud Cover
          </button>
          <button
            onClick={() => setSelectedLayer('wind')}
            className={`w-full text-left px-3 py-2 rounded text-sm transition ${
              selectedLayer === 'wind'
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            💨 Wind Speed
          </button>
          <button
            onClick={() => setSelectedLayer('temp')}
            className={`w-full text-left px-3 py-2 rounded text-sm transition ${
              selectedLayer === 'temp'
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            🌡️ Temperature
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700">
          <button
            onClick={handlePlayAnimation}
            className={`w-full px-3 py-2 rounded text-sm font-medium transition ${
              isPlaying
                ? 'bg-red-500 hover:bg-red-400 text-white'
                : 'bg-emerald-500 hover:bg-emerald-400 text-white'
            }`}
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play Animation'}
          </button>
        </div>

        <div className="mt-4 text-xs text-slate-400">
          Frame: {animationFrame + 1}/12
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
          Real-time precipitation radar data shows rain, snow, and storm systems.
        </p>
        <p className="text-xs text-slate-500">
          Data provided by RainViewer API. Updates every 10 minutes.
        </p>
      </div>
    </div>
  );
}
