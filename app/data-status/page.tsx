'use client';

import { useState, useEffect } from 'react';

interface FuelCacheData {
  icao: string;
  price: number;
  cachedAt: string;
  ageDisplay: string;
  source: string;
}

interface DataStatus {
  summary: {
    totalAirports: { large: number; medium: number; small: number; total: number };
    totalFuelCached: number;
    airportsWithFuel: { type: string; count: number }[];
    lastUpdate: string;
    nextUpdate: string;
    updateInterval: string;
  };
  fuelPrices: FuelCacheData[];
}

export default function DataStatusPage() {
  const [data, setData] = useState<DataStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'recent' | 'stale'>('all');

  useEffect(() => {
    fetch('/api/data-status')
      .then(res => res.json())
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Data Cache Status</h1>
          <div className="text-slate-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Data Cache Status</h1>
          <div className="text-red-400">Error: {error}</div>
        </div>
      </div>
    );
  }

  const filteredPrices = data?.fuelPrices.filter(p => {
    if (filter === 'recent') return p.ageDisplay.includes('hour') || p.ageDisplay === 'Just now';
    if (filter === 'stale') return p.ageDisplay.includes('month') || parseInt(p.ageDisplay) > 7;
    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Data Cache Status</h1>
          <a href="/settings" className="text-sky-400 hover:text-sky-300">← Back to Settings</a>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-slate-400 text-sm">Total Airports</div>
            <div className="text-2xl font-bold">{data?.summary.totalAirports.total || 0}</div>
            <div className="text-xs text-slate-500">
              {data?.summary.totalAirports.large} large, {data?.summary.totalAirports.medium} medium, {data?.summary.totalAirports.small} small
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-slate-400 text-sm">Fuel Prices Cached</div>
            <div className="text-2xl font-bold">{data?.summary.totalFuelCached || 0}</div>
            <div className="text-xs text-slate-500">
              {data?.summary.airportsWithFuel.map(a => `${a.count} ${a.type}`).join(', ')}
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-slate-400 text-sm">Last Updated</div>
            <div className="text-xl font-bold">{data?.summary.lastUpdate ? new Date(data.summary.lastUpdate).toLocaleDateString() : 'Never'}</div>
            <div className="text-xs text-slate-500">Auto-update every 72 hours</div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-slate-400 text-sm">Next Update</div>
            <div className="text-xl font-bold">{data?.summary.nextUpdate ? new Date(data.summary.nextUpdate).toLocaleDateString() : 'N/A'}</div>
            <div className="text-xs text-slate-500">Every 3 days</div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm ${filter === 'all' ? 'bg-sky-500' : 'bg-slate-700 hover:bg-slate-600'}`}
          >
            All ({data?.fuelPrices.length})
          </button>
          <button
            onClick={() => setFilter('recent')}
            className={`px-4 py-2 rounded-lg text-sm ${filter === 'recent' ? 'bg-sky-500' : 'bg-slate-700 hover:bg-slate-600'}`}
          >
            Recent
          </button>
          <button
            onClick={() => setFilter('stale')}
            className={`px-4 py-2 rounded-lg text-sm ${filter === 'stale' ? 'bg-sky-500' : 'bg-slate-700 hover:bg-slate-600'}`}
          >
            Older than 7 days
          </button>
        </div>

        {/* Fuel Price Table */}
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-750">
                <tr>
                  <th className="text-left p-3 text-slate-400 text-sm">ICAO</th>
                  <th className="text-right p-3 text-slate-400 text-sm">Price</th>
                  <th className="text-left p-3 text-slate-400 text-sm">Cached</th>
                  <th className="text-left p-3 text-slate-400 text-sm">Age</th>
                  <th className="text-left p-3 text-slate-400 text-sm">Source</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrices.slice(0, 100).map((price) => (
                  <tr key={price.icao} className="border-t border-slate-700 hover:bg-slate-750">
                    <td className="p-3 font-mono">{price.icao}</td>
                    <td className="p-3 text-right font-mono">${price.price.toFixed(2)}</td>
                    <td className="p-3 text-sm text-slate-400">{new Date(price.cachedAt).toLocaleDateString()}</td>
                    <td className="p-3 text-sm">
                      <span className={`px-2 py-1 rounded ${
                        price.ageDisplay.includes('month') ? 'bg-red-500/20 text-red-400' :
                        price.ageDisplay.includes('day') && parseInt(price.ageDisplay) > 7 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {price.ageDisplay}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-slate-400">{price.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredPrices.length > 100 && (
            <div className="p-3 text-center text-slate-400 text-sm">
              Showing 100 of {filteredPrices.length} entries
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
