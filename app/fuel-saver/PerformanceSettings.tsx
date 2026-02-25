'use client';

import { useState, useEffect } from 'react';

interface PerformanceSettings {
  threeDMode: boolean;
  weatherPlayback: boolean;
  animations: boolean;
  liveWeather: boolean;
  autoWeatherZoom: boolean;
  showAirspaces: boolean;
  showTerrain: boolean;
}

interface PerformanceSettingsPanelProps {
  onSettingsChange?: (settings: PerformanceSettings) => void;
}

const DEFAULT_SETTINGS: PerformanceSettings = {
  threeDMode: true,
  weatherPlayback: true,
  animations: true,
  liveWeather: true,
  autoWeatherZoom: true,
  showAirspaces: false,
  showTerrain: false,
};

export default function PerformanceSettingsPanel({ onSettingsChange }: PerformanceSettingsPanelProps) {
  const [settings, setSettings] = useState<PerformanceSettings>(DEFAULT_SETTINGS);
  const [isOpen, setIsOpen] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('performanceSettings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSettings(parsed);
          onSettingsChange?.(parsed);
        } catch (e) {
          console.error('Error loading settings:', e);
        }
      }
    }
  }, []);

  // Save settings when they change
  const updateSettings = (newSettings: Partial<PerformanceSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('performanceSettings', JSON.stringify(updated));
    }
    onSettingsChange?.(updated);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-[1001] bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-full shadow-lg border border-slate-600"
        title="Performance Settings"
      >
        ⚙️
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 z-[1000] bg-slate-800 rounded-lg shadow-xl border border-slate-700 w-72 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Performance</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            Toggle features to improve performance on slower devices.
          </p>

          <div className="space-y-3">
            {/* 3D Mode */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-300">3D Map Mode</span>
              <input
                type="checkbox"
                checked={settings.threeDMode}
                onChange={(e) => updateSettings({ threeDMode: e.target.checked })}
                className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-sky-500"
              />
            </label>

            {/* Weather Playback */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-300">Weather Playback</span>
              <input
                type="checkbox"
                checked={settings.weatherPlayback}
                onChange={(e) => updateSettings({ weatherPlayback: e.target.checked })}
                className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-sky-500"
              />
            </label>

            {/* Animations */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-300">Smooth Animations</span>
              <input
                type="checkbox"
                checked={settings.animations}
                onChange={(e) => updateSettings({ animations: e.target.checked })}
                className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-sky-500"
              />
            </label>

            {/* Live Weather */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-300">Live Weather</span>
              <input
                type="checkbox"
                checked={settings.liveWeather}
                onChange={(e) => updateSettings({ liveWeather: e.target.checked })}
                className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-sky-500"
              />
            </label>

            {/* Auto Weather Zoom */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-300">Auto Weather Zoom</span>
              <input
                type="checkbox"
                checked={settings.autoWeatherZoom}
                onChange={(e) => updateSettings({ autoWeatherZoom: e.target.checked })}
                className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-sky-500"
              />
            </label>

            {/* Show Airspaces */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-300">Show Airspaces</span>
              <input
                type="checkbox"
                checked={settings.showAirspaces}
                onChange={(e) => updateSettings({ showAirspaces: e.target.checked })}
                className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-sky-500"
              />
            </label>

            {/* Show Terrain */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-300">Show Terrain</span>
              <input
                type="checkbox"
                checked={settings.showTerrain}
                onChange={(e) => updateSettings({ showTerrain: e.target.checked })}
                className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-sky-500"
              />
            </label>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => updateSettings(DEFAULT_SETTINGS)}
            className="mt-4 w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded text-sm"
          >
            Reset to Defaults
          </button>
        </div>
      )}
    </>
  );
}

export { DEFAULT_SETTINGS, type PerformanceSettings };
