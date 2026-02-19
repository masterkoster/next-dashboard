'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  totalUsers: number;
  freeUsers: number;
  proUsers: number;
  newUsers30Days: number;
  openErrorReports: number;
  totalFlightPlans: number;
  totalGroups: number;
  estimatedAnnualRevenue: number;
  estimatedMRR: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized or error');
        return res.json();
      })
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading stats...</div>
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
      <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={stats?.totalUsers || 0}
          icon="👥"
          color="blue"
        />
        <StatCard
          label="Free Users"
          value={stats?.freeUsers || 0}
          icon="🆓"
          color="slate"
        />
        <StatCard
          label="Pro Users"
          value={stats?.proUsers || 0}
          icon="⭐"
          color="emerald"
        />
        <StatCard
          label="New (30 days)"
          value={stats?.newUsers30Days || 0}
          icon="📈"
          color="sky"
        />
      </div>

      {/* Revenue & Activity */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">💰 Revenue (Estimated)</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Monthly Recurring</span>
              <span className="text-xl font-bold text-emerald-400">${stats?.estimatedMRR?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Annual (if all annual)</span>
              <span className="text-xl font-bold text-emerald-400">${stats?.estimatedAnnualRevenue?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            * Based on $39.99/year early bird pricing
          </p>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">✈️ Activity</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Flight Plans</span>
              <span className="text-xl font-bold text-white">{stats?.totalFlightPlans || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Flying Clubs</span>
              <span className="text-xl font-bold text-white">{stats?.totalGroups || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">⚡ Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/users"
            className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            👥 Manage Users
          </Link>
          <Link
            href="/admin/errors"
            className={`px-4 py-2 rounded-lg font-medium transition ${
              (stats?.openErrorReports || 0) > 0
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-slate-700 text-slate-400'
            }`}
          >
            🐛 Error Reports {stats?.openErrorReports ? `(${stats.openErrorReports})` : ''}
          </Link>
          <Link
            href="/data-status"
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            💾 Data Cache
          </Link>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">🔧 System Status</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-slate-300">Database</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-slate-300">API Server</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-slate-300">Auth</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    slate: 'text-slate-400 border-slate-700 bg-slate-800/50',
    emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    sky: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
  };

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color]}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
      <div className="text-sm opacity-70">{label}</div>
    </div>
  );
}
