'use client';

import { useState, useEffect } from 'react';

interface StateInfo {
  state: string;
  stateName: string;
  nickname: string;
  capital: string;
  region: string;
  bio: string;
  terrain: string;
  majorAirports: string[];
  attractions: string[];
  funFact: string;
  avgElevation: number;
  climate: string;
  medianPrice?: number;
  sampleCount?: number;
}

interface StateInfoPanelProps {
  stateInfo: StateInfo | null;
  onClose: () => void;
  onAirportClick?: (icao: string) => void;
}

export default function StateInfoPanel({ stateInfo, onClose, onAirportClick }: StateInfoPanelProps) {
  if (!stateInfo) return null;

  // Get region color
  const getRegionColor = (region: string) => {
    switch (region) {
      case 'Northeast': return 'from-blue-500 to-cyan-500';
      case 'South': return 'from-red-500 to-orange-500';
      case 'Midwest': return 'from-green-500 to-emerald-500';
      case 'West': return 'from-purple-500 to-pink-500';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  return (
    <div className="absolute top-4 left-4 z-[1000] w-80 animate-in slide-in-from-left duration-300">
      {/* Main Card */}
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
        
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${getRegionColor(stateInfo.region)} p-4 relative overflow-hidden`}>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-10 -mb-10 blur-xl"></div>
          
          <div className="relative z-10">
            <button
              onClick={onClose}
              className="absolute top-0 right-0 w-7 h-7 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-lg font-bold transition-colors"
            >
              ×
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                <span className="text-2xl font-bold text-white">{stateInfo.state}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{stateInfo.stateName}</h2>
                <p className="text-white/80 text-sm">The {stateInfo.nickname}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-sky-400">${stateInfo.medianPrice?.toFixed(2) || '--'}</div>
              <div className="text-xs text-slate-400">Avg Fuel Price</div>
              {stateInfo.sampleCount && (
                <div className="text-xs text-slate-500">{stateInfo.sampleCount} airports</div>
              )}
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-emerald-400">{stateInfo.avgElevation.toLocaleString()}</div>
              <div className="text-xs text-slate-400">Avg Elevation</div>
              <div className="text-xs text-slate-500">ft</div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-slate-800/30 rounded-xl p-3">
            <p className="text-sm text-slate-300 leading-relaxed">{stateInfo.bio}</p>
          </div>

          {/* Quick Facts */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">📍</span>
              <span className="text-slate-300">Capital: <strong>{stateInfo.capital}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">🌡️</span>
              <span className="text-slate-300">{stateInfo.climate}</span>
            </div>
          </div>

          {/* Terrain */}
          <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-xl p-3 border border-amber-700/30">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-amber-400">🏔️</span>
              <span className="text-sm font-medium text-amber-200">Terrain</span>
            </div>
            <p className="text-xs text-slate-300">{stateInfo.terrain}</p>
          </div>

          {/* Attractions */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-pink-400">🎯</span>
              <span className="text-sm font-medium text-slate-300">Top Attractions</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {stateInfo.attractions.slice(0, 3).map((attraction, i) => (
                <span 
                  key={i} 
                  className="text-xs bg-slate-800/60 text-slate-300 px-2 py-1 rounded-lg border border-slate-700/50"
                >
                  {attraction}
                </span>
              ))}
            </div>
          </div>

          {/* Major Airports */}
          {stateInfo.majorAirports.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sky-400">✈️</span>
                <span className="text-sm font-medium text-slate-300">Major Airports</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {stateInfo.majorAirports.map((icao, i) => (
                  <button
                    key={i}
                    onClick={() => onAirportClick?.(icao)}
                    className="text-xs bg-sky-900/40 hover:bg-sky-800/60 text-sky-300 px-2 py-1 rounded-lg border border-sky-700/30 hover:border-sky-500/50 transition-colors"
                  >
                    {icao}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fun Fact */}
          <div className="bg-gradient-to-r from-violet-900/30 to-purple-900/30 rounded-xl p-3 border border-violet-700/30">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-violet-400">💡</span>
              <span className="text-sm font-medium text-violet-200">Fun Fact</span>
            </div>
            <p className="text-xs text-slate-300">{stateInfo.funFact}</p>
          </div>

        </div>
      </div>

      {/* Decorative corner */}
      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-tl from-sky-500/30 to-transparent rounded-bl-2xl"></div>
    </div>
  );
}
