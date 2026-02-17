'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CacheData {
  name: string;
  description: string;
  cachedCount: number;
  lastUpdated: string | null;
  source: string;
}

export default function AdminDataPage() {
  const [data, setData] = useState<Record<string, CacheData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    fetch('/api/admin/data-cache')
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized or error');
        return res.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleRefresh = async (type: string) => {
    setRefreshing(type);
    // In a real app, this would trigger a scraping job
    // For now, just simulate a refresh
    setTimeout(() => {
      setRefreshing(null);
      fetchData();
    }, 2000);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const hoursAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    const daysAgo = Math.floor(hoursAgo / 24);
    
    if (daysAgo > 0) return `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
    if (hoursAgo > 0) return `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading data status...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
        <h2 className="text-red-400 font-semibold mb-2">Access Denied</h2>
        <p className="text-slate-400">{error}</p>
        <p className="text-slate-500 text-sm mt-2">You need admin privileges to access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Data Cache Management</h1>
      <p className="text-slate-400">View and manage cached data sources. Click refresh to trigger a new data fetch.</p>

      {/* Data Cards */}
      <div className="grid gap-4">
        {data && Object.entries(data).map(([key, item]) => (
          <div key={key} className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                <p className="text-sm text-slate-400 mt-1">{item.description}</p>
                
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Cached</p>
                    <p className="text-xl font-bold text-white">{item.cachedCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Last Updated</p>
                    <p className="text-lg font-medium text-white">{formatDate(item.lastUpdated)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Source</p>
                    <p className="text-sm text-slate-300">{item.source}</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleRefresh(key)}
                disabled={refreshing === key}
                className={`ml-4 px-4 py-2 rounded-lg font-medium transition ${
                  refreshing === key
                    ? 'bg-slate-600 text-slate-400 cursor-wait'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {refreshing === key ? 'Refreshing...' : '🔄 Refresh'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
        <h4 className="text-sm font-semibold text-slate-300 mb-2">ℹ️ How it works</h4>
        <p className="text-sm text-slate-400">
          Data is scraped from various sources and cached in the database. 
          Refresh triggers a new scrape from the source. Some sources may take several minutes to complete.
        </p>
      </div>
    </div>
  );
}
