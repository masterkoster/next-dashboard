'use client';

import { useState, useEffect, useCallback } from 'react';

interface Notam {
  id: string;
  icao: string;
  category: 'TFR' | 'RUNWAY' | 'NAVAID' | 'OBSTACLE' | 'AIRSPACE' | 'GENERAL';
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
}

interface NotamsPanelProps {
  waypoints: Array<{ icao: string; latitude: number; longitude: number }>;
  isPro?: boolean;
}

const categoryColors: Record<Notam['category'], { bg: string; text: string; icon: string }> = {
  TFR: { bg: 'bg-red-500/20', text: 'text-red-400', icon: '🔴' },
  RUNWAY: { bg: 'bg-orange-500/20', text: 'text-orange-400', icon: '🟡' },
  NAVAID: { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: '⚪' },
  OBSTACLE: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: '🟠' },
  AIRSPACE: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: '🔵' },
  GENERAL: { bg: 'bg-slate-500/20', text: 'text-slate-400', icon: '⚪' },
};

export default function NotamsPanel({ waypoints, isPro = false }: NotamsPanelProps) {
  const [notams, setNotams] = useState<Notam[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState<Notam['category'] | 'ALL'>('ALL');
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchNotams = useCallback(async () => {
    if (waypoints.length === 0) {
      setNotams([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Only fetch NOTAMs for real US airports (starting with K)
      const airportIcaos = waypoints
        .map(w => w.icao)
        .filter(icao => icao && icao.startsWith('K'))
        .join(',');
      
      if (!airportIcaos) {
        setNotams([]);
        setLoading(false);
        return;
      }
      
      const res = await fetch(`/api/notams?icaos=${airportIcaos}`);
      
      if (!res.ok) {
        throw new Error('Failed to fetch NOTAMs');
      }
      
      const data = await res.json();
      setNotams(data.notams || []);
      setLastFetched(new Date());
    } catch (err) {
      console.error('NOTAM fetch error:', err);
      setError('Unable to load NOTAMs');
    } finally {
      setLoading(false);
    }
  }, [waypoints]);

  // Fetch NOTAMs when waypoints change
  useEffect(() => {
    fetchNotams();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchNotams, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNotams]);

  const filteredNotams = filter === 'ALL' 
    ? notams 
    : notams.filter(n => n.category === filter);

  // Group NOTAMs by category
  const groupedNotams = filteredNotams.reduce((acc, notam) => {
    if (!acc[notam.category]) acc[notam.category] = [];
    acc[notam.category].push(notam);
    return acc;
  }, {} as Record<Notam['category'], Notam[]>);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  if (waypoints.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <span className="font-semibold text-white">NOTAMs</span>
          {notams.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              notams.some(n => n.category === 'TFR') 
                ? 'bg-red-500/30 text-red-300' 
                : 'bg-slate-600 text-slate-300'
            }`}>
              {notams.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              fetchNotams();
            }}
            disabled={loading}
            className="p-1 hover:bg-slate-600 rounded disabled:opacity-50"
            title="Refresh"
          >
            <svg className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <span className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
      </button>

      {/* Filters - Pro feature preview */}
      <div className="px-4 py-2 border-b border-slate-700 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-2 py-1 rounded text-xs ${
            filter === 'ALL' ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          All
        </button>
        {(['TFR', 'RUNWAY', 'OBSTACLE', 'AIRSPACE', 'NAVAID'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => {
              if (!isPro && cat !== 'TFR' && cat !== 'RUNWAY') {
                // Show preview mode for non-Pro
                return;
              }
              setFilter(cat);
            }}
            disabled={!isPro && cat !== 'TFR' && cat !== 'RUNWAY'}
            className={`px-2 py-1 rounded text-xs ${
              filter === cat 
                ? 'bg-sky-500 text-white' 
                : isPro || cat === 'TFR' || cat === 'RUNWAY'
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
            }`}
          >
            {cat === 'TFR' ? '🔴' : cat === 'RUNWAY' ? '🟡' : cat === 'OBSTACLE' ? '🟠' : cat === 'AIRSPACE' ? '🔵' : '⚪'} {cat}
            {!isPro && cat !== 'TFR' && cat !== 'RUNWAY' && ' 🔒'}
          </button>
        ))}
      </div>

      {/* Content */}
      {expanded && (
        <div className="p-4 max-h-96 overflow-y-auto">
          {loading && notams.length === 0 && (
            <div className="text-center text-slate-400 py-4">
              Loading NOTAMs...
            </div>
          )}

          {error && (
            <div className="text-center text-red-400 py-4">
              {error}
            </div>
          )}

          {!loading && !error && filteredNotams.length === 0 && (
            <div className="text-center text-slate-400 py-4">
              No {filter === 'ALL' ? '' : filter.toLowerCase()} NOTAMs found
            </div>
          )}

          {/* Show preview warning for non-Pro */}
          {!isPro && notams.length > 3 && filter === 'ALL' && (
            <div className="mb-4 p-2 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-300">
              🔒 Pro: Filter & sort NOTAMs • {notams.length - 3} more available
            </div>
          )}

          {/* NOTAM List */}
          {filteredNotams.slice(0, isPro ? undefined : 3).map((notam, idx) => {
            const colors = categoryColors[notam.category];
            return (
              <div
                key={notam.id || idx}
                className={`mb-3 p-3 rounded-lg ${colors.bg} border border-slate-600`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{colors.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${colors.text}`}>
                        {notam.category}
                      </span>
                      <span className="text-slate-400 text-sm">
                        {notam.icao}
                      </span>
                    </div>
                    <div className="text-sm text-slate-200 mt-1">
                      {notam.title || notam.description.substring(0, 60)}
                    </div>
                    {notam.description && (
                      <details className="mt-2">
                        <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-300">
                          Show more
                        </summary>
                        <p className="text-xs text-slate-300 mt-1 font-mono whitespace-pre-wrap">
                          {notam.description}
                        </p>
                      </details>
                    )}
                    <div className="flex gap-4 mt-2 text-xs text-slate-400">
                      {notam.startDate && (
                        <span>From: {formatDate(notam.startDate)}</span>
                      )}
                      {notam.endDate && (
                        <span>Until: {formatDate(notam.endDate)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Load more for Pro */}
          {isPro && filteredNotams.length > 10 && (
            <div className="text-center text-slate-400 text-sm py-2">
              Showing 10 of {filteredNotams.length} NOTAMs
            </div>
          )}

          {/* Last updated */}
          {lastFetched && (
            <div className="text-xs text-slate-500 text-center mt-4">
              Last updated: {lastFetched.toLocaleTimeString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
