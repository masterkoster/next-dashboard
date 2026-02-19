'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import CurrencyTracker from '../../components/CurrencyTracker';
import HourAnalytics from '../../components/HourAnalytics';

interface LogbookEntry {
  id: string;
  date: string;
  aircraft: string;
  routeFrom: string;
  routeTo: string;
  totalTime: number;
  soloTime: number;
  nightTime: number;
  instrumentTime: number;
  crossCountryTime: number;
  dayLandings: number;
  nightLandings: number;
}

export default function ProPlusDashboard() {
  const { data: session, status } = useSession();
  const [entries, setEntries] = useState<LogbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProPlus, setIsProPlus] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      checkSubscription();
    }
  }, [status]);

  const checkSubscription = async () => {
    try {
      const res = await fetch('/api/user/tier');
      if (res.ok) {
        const data = await res.json();
        setIsProPlus(data.tier === 'proplus');
        if (data.tier === 'proplus') {
          fetchEntries();
        }
      }
    } catch (err) {
      console.error('Failed to check tier:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/logbook');
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
      }
    } catch (err) {
      console.error('Failed to fetch entries:', err);
    }
  };

  const totals = entries.reduce((acc, entry) => ({
    totalTime: acc.totalTime + entry.totalTime,
    soloTime: acc.soloTime + entry.soloTime,
    nightTime: acc.nightTime + entry.nightTime,
    crossCountryTime: acc.crossCountryTime + entry.crossCountryTime,
    landings: acc.landings + entry.dayLandings + entry.nightLandings,
  }), {
    totalTime: 0, soloTime: 0, nightTime: 0, crossCountryTime: 0, landings: 0,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!isProPlus) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🚀</div>
          <h1 className="text-2xl font-bold text-white mb-4">Pro+ Dashboard</h1>
          <p className="text-slate-400 mb-6">
            Unlock advanced analytics, currency tracking, and detailed flight insights with Pro+.
          </p>
          <div className="space-y-3">
            <div className="bg-slate-800 rounded-lg p-4 text-left">
              <p className="text-emerald-400 mb-2">✓ Hour Analytics & Charts</p>
              <p className="text-emerald-400 mb-2">✓ Currency Tracking (BFR, IPC)</p>
              <p className="text-emerald-400 mb-2">✓ Digital Logbook</p>
              <p className="text-emerald-400">✓ Priority Support</p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="inline-block mt-6 bg-amber-500 hover:bg-amber-400 text-white px-6 py-2 rounded-lg"
          >
            Upgrade to Pro+ - $6.99/mo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded font-bold">PRO+</span>
            <h1 className="text-2xl font-bold text-white">Pilot Dashboard</h1>
          </div>
          <p className="text-slate-400">Advanced analytics and flight tracking</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase">Total Hours</p>
            <p className="text-2xl font-bold text-white">{totals.totalTime.toFixed(1)}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase">Solo</p>
            <p className="text-2xl font-bold text-emerald-400">{totals.soloTime.toFixed(1)}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase">Night</p>
            <p className="text-2xl font-bold text-purple-400">{totals.nightTime.toFixed(1)}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase">XC</p>
            <p className="text-2xl font-bold text-sky-400">{totals.crossCountryTime.toFixed(1)}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase">Landings</p>
            <p className="text-2xl font-bold text-amber-400">{totals.landings}</p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Hour Analytics */}
          <HourAnalytics />

          {/* Currency Tracker */}
          <CurrencyTracker />
        </div>

        {/* Recent Flights & Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Recent Flights */}
          <div className="bg-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Recent Flights</h2>
              <Link href="/modules/logbook" className="text-sm text-emerald-400 hover:text-emerald-300">
                View All →
              </Link>
            </div>
            {entries.length === 0 ? (
              <p className="text-slate-400 text-sm">No flights logged yet.</p>
            ) : (
              <div className="space-y-2">
                {entries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                    <div>
                      <p className="text-sm text-white">{entry.routeFrom} → {entry.routeTo}</p>
                      <p className="text-xs text-slate-500">{new Date(entry.date).toLocaleDateString()} • {entry.aircraft}</p>
                    </div>
                    <p className="text-sm text-emerald-400">{entry.totalTime.toFixed(1)}h</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/modules/logbook"
                className="block w-full text-center bg-emerald-500 hover:bg-emerald-400 text-white py-3 rounded-lg transition"
              >
                📖 Open Logbook
              </Link>
              <Link
                href="/modules/fuel-saver"
                className="block w-full text-center bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition"
              >
                ⛽ Plan Flight
              </Link>
              <Link
                href="/modules/e6b"
                className="block w-full text-center bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition"
              >
                🧮 E6B Calculator
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
