'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';

// Dynamic import for Leaflet (no SSR)
const WeatherRadarMap = dynamic(() => import('./WeatherRadarMap'), { ssr: false });

export default function WeatherRadarPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading Weather Radar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">🌩️ Weather Radar</h1>
              <p className="text-slate-400 text-sm">Real-time precipitation and storm tracking</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
                Live Data
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="h-[calc(100vh-80px)] overflow-hidden">
        <WeatherRadarMap />
      </div>
    </div>
  );
}
