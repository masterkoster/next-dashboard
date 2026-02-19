'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface LogbookEntry {
  id: string;
  date: string;
  aircraft: string;
  routeFrom: string;
  routeTo: string;
  totalTime: number;
  soloTime: number;
  dualGiven: number;
  dualReceived: number;
  nightTime: number;
  instrumentTime: number;
  crossCountryTime: number;
  dayLandings: number;
  nightLandings: number;
  remarks: string | null;
  instructor: string | null;
}

export default function LogbookPage() {
  const { data: session, status } = useSession();
  const [entries, setEntries] = useState<LogbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    aircraft: '',
    routeFrom: '',
    routeTo: '',
    totalTime: '',
    soloTime: '',
    dualGiven: '',
    dualReceived: '',
    nightTime: '',
    instrumentTime: '',
    crossCountryTime: '',
    dayLandings: '0',
    nightLandings: '0',
    remarks: '',
    instructor: '',
  });

  // Calculate totals
  const totals = entries.reduce((acc, entry) => ({
    totalTime: acc.totalTime + entry.totalTime,
    soloTime: acc.soloTime + entry.soloTime,
    dualGiven: acc.dualGiven + entry.dualGiven,
    dualReceived: acc.dualReceived + entry.dualReceived,
    nightTime: acc.nightTime + entry.nightTime,
    instrumentTime: acc.instrumentTime + entry.instrumentTime,
    crossCountryTime: acc.crossCountryTime + entry.crossCountryTime,
    dayLandings: acc.dayLandings + entry.dayLandings,
    nightLandings: acc.nightLandings + entry.nightLandings,
  }), {
    totalTime: 0, soloTime: 0, dualGiven: 0, dualReceived: 0,
    nightTime: 0, instrumentTime: 0, crossCountryTime: 0,
    dayLandings: 0, nightLandings: 0
  });

  useEffect(() => {
    if (status === 'authenticated') {
      fetchEntries();
    }
  }, [status]);

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/logbook');
      if (!res.ok) {
        const data = await res.json();
        if (data.code === 'PROPLUS_REQUIRED') {
          setError('Pro+ subscription required');
        } else {
          setError(data.error || 'Failed to load entries');
        }
        return;
      }
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (err) {
      setError('Failed to load logbook');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/logbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totalTime: parseFloat(formData.totalTime) || 0,
          soloTime: parseFloat(formData.soloTime) || 0,
          dualGiven: parseFloat(formData.dualGiven) || 0,
          dualReceived: parseFloat(formData.dualReceived) || 0,
          nightTime: parseFloat(formData.nightTime) || 0,
          instrumentTime: parseFloat(formData.instrumentTime) || 0,
          crossCountryTime: parseFloat(formData.crossCountryTime) || 0,
          dayLandings: parseInt(formData.dayLandings) || 0,
          nightLandings: parseInt(formData.nightLandings) || 0,
        }),
      });

      if (res.ok) {
        await fetchEntries();
        setShowForm(false);
        setFormData({
          date: new Date().toISOString().split('T')[0],
          aircraft: '',
          routeFrom: '',
          routeTo: '',
          totalTime: '',
          soloTime: '',
          dualGiven: '',
          dualReceived: '',
          nightTime: '',
          instrumentTime: '',
          crossCountryTime: '',
          dayLandings: '0',
          nightLandings: '0',
          remarks: '',
          instructor: '',
        });
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save');
      }
    } catch (err) {
      alert('Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return;
    
    try {
      const res = await fetch(`/api/logbook?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchEntries();
      }
    } catch (err) {
      alert('Failed to delete');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please Sign In</h1>
          <p className="text-slate-400 mb-6">You need to be signed in to view your logbook.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2 rounded-lg"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (error === 'Pro+ subscription required') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📖</div>
          <h1 className="text-2xl font-bold text-white mb-4">Pro+ Feature</h1>
          <p className="text-slate-400 mb-6">
            The Digital Logbook is available with Pro+ subscription. 
            Upgrade to track your flight hours automatically.
          </p>
          <Link
            href="/pricing"
            className="inline-block bg-amber-500 hover:bg-amber-400 text-white px-6 py-2 rounded-lg"
          >
            Upgrade to Pro+
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">📖 Digital Logbook</h1>
            <p className="text-slate-400">Track your flight hours</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg"
          >
            {showForm ? 'Cancel' : '+ Add Entry'}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase">Total Time</p>
            <p className="text-2xl font-bold text-white">{totals.totalTime.toFixed(1)}h</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase">Solo Time</p>
            <p className="text-2xl font-bold text-emerald-400">{totals.soloTime.toFixed(1)}h</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase">Night Time</p>
            <p className="text-2xl font-bold text-purple-400">{totals.nightTime.toFixed(1)}h</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase">Landings</p>
            <p className="text-2xl font-bold text-sky-400">{totals.dayLandings + totals.nightLandings}</p>
          </div>
        </div>

        {/* Add Entry Form */}
        {showForm && (
          <div className="bg-slate-800 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">New Flight Entry</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Aircraft</label>
                  <input
                    type="text"
                    value={formData.aircraft}
                    onChange={(e) => setFormData({...formData, aircraft: e.target.value})}
                    placeholder="N123AB"
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">From</label>
                  <input
                    type="text"
                    value={formData.routeFrom}
                    onChange={(e) => setFormData({...formData, routeFrom: e.target.value.toUpperCase()})}
                    placeholder="KABC"
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">To</label>
                  <input
                    type="text"
                    value={formData.routeTo}
                    onChange={(e) => setFormData({...formData, routeTo: e.target.value.toUpperCase()})}
                    placeholder="KXYZ"
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-7 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Total</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.totalTime}
                    onChange={(e) => setFormData({...formData, totalTime: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    placeholder="1.5"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Solo</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.soloTime}
                    onChange={(e) => setFormData({...formData, soloTime: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Dual Rec</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.dualReceived}
                    onChange={(e) => setFormData({...formData, dualReceived: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Night</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.nightTime}
                    onChange={(e) => setFormData({...formData, nightTime: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Instrument</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.instrumentTime}
                    onChange={(e) => setFormData({...formData, instrumentTime: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">XC</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.crossCountryTime}
                    onChange={(e) => setFormData({...formData, crossCountryTime: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Landings</label>
                  <input
                    type="number"
                    value={formData.dayLandings}
                    onChange={(e) => setFormData({...formData, dayLandings: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white h-20"
                  placeholder="Flight notes..."
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white px-6 py-2 rounded-lg"
              >
                {saving ? 'Saving...' : 'Save Entry'}
              </button>
            </form>
          </div>
        )}

        {/* Entries Table */}
        <div className="bg-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-slate-400 font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-slate-400 font-medium">Aircraft</th>
                  <th className="px-4 py-3 text-left text-slate-400 font-medium">Route</th>
                  <th className="px-4 py-3 text-center text-slate-400 font-medium">Total</th>
                  <th className="px-4 py-3 text-center text-slate-400 font-medium">Solo</th>
                  <th className="px-4 py-3 text-center text-slate-400 font-medium">Night</th>
                  <th className="px-4 py-3 text-center text-slate-400 font-medium">Inst</th>
                  <th className="px-4 py-3 text-center text-slate-400 font-medium">XC</th>
                  <th className="px-4 py-3 text-center text-slate-400 font-medium">Ldg</th>
                  <th className="px-4 py-3 text-right text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                      No entries yet. Click &quot;Add Entry&quot; to log your first flight!
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id} className="border-t border-slate-700 hover:bg-slate-750">
                      <td className="px-4 py-3 text-slate-300">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-slate-300">{entry.aircraft}</td>
                      <td className="px-4 py-3 text-slate-300">
                        {entry.routeFrom} → {entry.routeTo}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-300">{entry.totalTime.toFixed(1)}</td>
                      <td className="px-4 py-3 text-center text-emerald-400">{entry.soloTime > 0 ? entry.soloTime.toFixed(1) : '-'}</td>
                      <td className="px-4 py-3 text-center text-purple-400">{entry.nightTime > 0 ? entry.nightTime.toFixed(1) : '-'}</td>
                      <td className="px-4 py-3 text-center text-amber-400">{entry.instrumentTime > 0 ? entry.instrumentTime.toFixed(1) : '-'}</td>
                      <td className="px-4 py-3 text-center text-sky-400">{entry.crossCountryTime > 0 ? entry.crossCountryTime.toFixed(1) : '-'}</td>
                      <td className="px-4 py-3 text-center text-slate-300">{entry.dayLandings + entry.nightLandings}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
