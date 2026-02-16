'use client';

import { useState, useEffect } from 'react';
import { LayersControl, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapLayerOptions {
  baseLayer: 'osm' | 'satellite' | 'terrain' | 'dark';
  showLarge: boolean;
  showMedium: boolean;
  showSmall: boolean;
  showSeaplane: boolean;
  showTerrain: boolean;
  showAirspaces: boolean;
  showFuelPrices: boolean;
}

interface MapControlsProps {
  options: MapLayerOptions;
  onOptionsChange: (options: MapLayerOptions) => void;
}

// Layer configuration
const LAYERS = {
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri'
  },
  terrain: {
    name: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap'
  },
  dark: {
    name: 'Dark Mode',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB'
  }
};

export function MapControls({ options, onOptionsChange }: MapControlsProps) {
  const toggleOption = (key: keyof MapLayerOptions) => {
    if (key === 'baseLayer') return;
    onOptionsChange({
      ...options,
      [key]: !options[key as keyof MapLayerOptions]
    });
  };

  const setBaseLayer = (layer: MapLayerOptions['baseLayer']) => {
    onOptionsChange({ ...options, baseLayer: layer });
  };

  return (
    <div className="absolute top-3 right-3 z-[1000] bg-slate-800/95 backdrop-blur rounded-lg shadow-xl border border-slate-700">
      {/* Layer Selector */}
      <div className="p-3 border-b border-slate-700">
        <div className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Map Layer</div>
        <div className="grid grid-cols-2 gap-1">
          {(Object.keys(LAYERS) as MapLayerOptions['baseLayer'][]).map((layer) => (
            <button
              key={layer}
              onClick={() => setBaseLayer(layer)}
              className={`px-2 py-1.5 text-xs rounded transition-colors ${
                options.baseLayer === layer
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {LAYERS[layer].name}
            </button>
          ))}
        </div>
      </div>

      {/* Airport Filters */}
      <div className="p-3 border-b border-slate-700">
        <div className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Airports</div>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.showLarge}
              onChange={() => toggleOption('showLarge')}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-sky-500 focus:ring-sky-500"
            />
            <span className="text-sm">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1.5"></span>
              Large ({'>'}10,000ft)
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.showMedium}
              onChange={() => toggleOption('showMedium')}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-sky-500 focus:ring-sky-500"
            />
            <span className="text-sm">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span>
              Medium (5,000-10,000ft)
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.showSmall}
              onChange={() => toggleOption('showSmall')}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-sky-500 focus:ring-sky-500"
            />
            <span className="text-sm">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
              Small / GA Airstrips
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.showSeaplane}
              onChange={() => toggleOption('showSeaplane')}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-sky-500 focus:ring-sky-500"
            />
            <span className="text-sm">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span>
              Seaplane Bases
            </span>
          </label>
        </div>
      </div>

      {/* Overlays */}
      <div className="p-3">
        <div className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Overlays</div>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.showFuelPrices}
              onChange={() => toggleOption('showFuelPrices')}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-sky-500 focus:ring-sky-500"
            />
            <span className="text-sm">💰 Fuel Prices</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.showTerrain}
              onChange={() => toggleOption('showTerrain')}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-sky-500 focus:ring-sky-500"
            />
            <span className="text-sm">🏔️ Terrain / Elevation</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.showAirspaces}
              onChange={() => toggleOption('showAirspaces')}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-sky-500 focus:ring-sky-500"
            />
            <span className="text-sm">✈️ Airspaces (B/C/D)</span>
          </label>
        </div>
      </div>
    </div>
  );
}

// Default options
export const DEFAULT_MAP_OPTIONS: MapLayerOptions = {
  baseLayer: 'osm',
  showLarge: true,
  showMedium: true,
  showSmall: false,
  showSeaplane: false,
  showTerrain: false,
  showAirspaces: false,
  showFuelPrices: true
};

// Tile layer component for the map
export function MapTileLayer({ baseLayer }: { baseLayer: MapLayerOptions['baseLayer'] }) {
  const layer = LAYERS[baseLayer];
  return (
    <TileLayer
      key={baseLayer}
      url={layer.url}
      attribution={layer.attribution}
    />
  );
}

export { LAYERS };
