'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { createNavLogPdfDoc, downloadNavLogPdf, getNavLogExportHistory, StoredNavLogExport } from '../fuel-saver/lib/exportUtils';

// Import the existing components
import CurrencyTracker from '../../components/CurrencyTracker';
import HourAnalytics from '../../components/HourAnalytics';

interface TrainingProgress {
  id: string;
  userId: string;
  totalHours: number;
  soloHours: number;
  nightHours: number;
  instrumentHours: number;
  crossCountryHours: number;
  xcSoloHours: number;
  xcSoloDone: boolean;
  nightSoloDone: boolean;
  instrumentDone: boolean;
  soloDone: boolean;
  threeTakeoffsLandingsDone: boolean;
  threeNightTakeoffsLandingsDone: boolean;
  dualGiven: number;
  hoodHours: number;
}

const PPL_REQUIREMENTS = {
  totalHours: { required: 40, label: 'Total Flight Hours' },
  soloHours: { required: 10, label: 'Solo Hours' },
  nightHours: { required: 3, label: 'Night Hours' },
  instrumentHours: { required: 3, label: 'Instrument Hours' },
  crossCountryHours: { required: 10, label: 'Cross Country Hours' },
  xcSoloHours: { required: 5, label: 'Solo XC Hours' },
};

// Training Overview Component - shown to all users
function TrainingOverview() {
  const { data: session } = useSession();
  const [progress, setProgress] = useState<TrainingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [localProgress, setLocalProgress] = useState({
    totalHours: 0,
    soloHours: 0,
    nightHours: 0,
    instrumentHours: 0,
    crossCountryHours: 0,
    xcSoloHours: 0,
    xcSoloDone: false,
    nightSoloDone: false,
    instrumentDone: false,
    soloDone: false,
    threeTakeoffsLandingsDone: false,
    threeNightTakeoffsLandingsDone: false,
    dualGiven: 0,
    hoodHours: 0,
  });

  useEffect(() => {
    if (session?.user?.email) {
      fetchProgress();
    }
  }, [session]);

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/training-progress');
      if (res.ok) {
        const data = await res.json();
        setProgress(data);
        if (data) {
          setLocalProgress({
            totalHours: data.totalHours || 0,
            soloHours: data.soloHours || 0,
            nightHours: data.nightHours || 0,
            instrumentHours: data.instrumentHours || 0,
            crossCountryHours: data.crossCountryHours || 0,
            xcSoloHours: data.xcSoloHours || 0,
            xcSoloDone: data.xcSoloDone || false,
            nightSoloDone: data.nightSoloDone || false,
            instrumentDone: data.instrumentDone || false,
            soloDone: data.soloDone || false,
            threeTakeoffsLandingsDone: data.threeTakeoffsLandingsDone || false,
            threeNightTakeoffsLandingsDone: data.threeNightTakeoffsLandingsDone || false,
            dualGiven: data.dualGiven || 0,
            hoodHours: data.hoodHours || 0,
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/training-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localProgress),
      });
      if (res.ok) {
        alert('Progress saved!');
      }
    } catch (err) {
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-400">Loading training progress...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">🎓 Training Progress</h3>
            <p className="text-slate-400 text-sm">Track your PPL requirements and flight hours</p>
          </div>
          <button
            onClick={saveProgress}
            disabled={saving}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white px-4 py-2 rounded-lg"
          >
            {saving ? 'Saving...' : 'Save Progress'}
          </button>
        </div>

        {/* PPL Requirements Progress */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {Object.entries(PPL_REQUIREMENTS).map(([key, req]) => {
            const current = localProgress[key as keyof typeof localProgress] as number || 0;
            const percent = Math.min((current / req.required) * 100, 100);
            const isDone = percent >= 100;
            
            return (
              <div key={key} className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">{req.label}</span>
                  <span className={`text-sm ${isDone ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {current.toFixed(1)} / {req.required} hrs
                  </span>
                </div>
                <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${isDone ? 'bg-emerald-500' : 'bg-blue-500'}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Hour Inputs */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { key: 'totalHours', label: 'Total Hours' },
            { key: 'soloHours', label: 'Solo Hours' },
            { key: 'nightHours', label: 'Night Hours' },
            { key: 'instrumentHours', label: 'Instrument Hours' },
            { key: 'crossCountryHours', label: 'Cross Country Hours' },
            { key: 'xcSoloHours', label: 'Solo XC Hours' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm text-slate-400 mb-1">{label}</label>
              <input
                type="number"
                step="0.1"
                value={localProgress[key as keyof typeof localProgress] as number || 0}
                onChange={(e) => setLocalProgress({ ...localProgress, [key]: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
          ))}
        </div>

        {/* Checkboxes */}
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {[
            { key: 'soloDone', label: 'Solo Complete' },
            { key: 'nightSoloDone', label: 'Night Solo Complete' },
            { key: 'instrumentDone', label: 'Instrument Checkride Done' },
            { key: 'threeTakeoffsLandingsDone', label: '3 Takeoffs/Landings Done' },
            { key: 'threeNightTakeoffsLandingsDone', label: '3 Night T/O/L Done' },
            { key: 'xcSoloDone', label: 'Solo XC Complete' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-white cursor-pointer">
              <input
                type="checkbox"
                checked={localProgress[key as keyof typeof localProgress] as boolean || false}
                onChange={(e) => setLocalProgress({ ...localProgress, [key]: e.target.checked })}
                className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-emerald-500"
              />
              {label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

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
  remarks?: string;
}

interface CurrentFuelSaverPlan {
  name?: string;
  waypoints: Array<{ icao: string; name?: string; latitude: number; longitude: number }>;
  aircraft: { name: string; speed: number; burnRate: number; fuelCapacity: number };
  cruisingAltitude: number;
  fuelPrices: Record<string, { price100ll: number | null }>;
  updatedAt?: string;
}

type SavedPlanKey = `db:${string}` | `local:${string}`;

interface SavedFlightPlan {
  key: SavedPlanKey;
  id: string;
  source: 'db' | 'local';
  name?: string | null;
  aircraftType?: string | null;
  aircraftSpeed?: number | null;
  aircraftBurnRate?: number | null;
  aircraftFuelCapacity?: number | null;
  cruisingAlt?: number | null;
  createdAt?: string | null;
  waypoints: Array<{
    icao?: string | null;
    name?: string | null;
    city?: string | null;
    latitude: number;
    longitude: number;
  }>;
}

function PilotOverviewContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [entries, setEntries] = useState<LogbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'logbook' | 'training' | 'currency' | 'analytics' | 'documents'>('logbook');
  const [isProPlus, setIsProPlus] = useState(false);
  const [navLogExports, setNavLogExports] = useState<StoredNavLogExport[]>([]);
  const [selectedExportId, setSelectedExportId] = useState<string | null>(null);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [currentFuelPlan, setCurrentFuelPlan] = useState<CurrentFuelSaverPlan | null>(null);
  const [savedFlightPlans, setSavedFlightPlans] = useState<SavedFlightPlan[]>([]);
  const [selectedSavedPlanKey, setSelectedSavedPlanKey] = useState<SavedPlanKey | ''>('');
  const [savedPlansLoading, setSavedPlansLoading] = useState(false);
  const [savedPlansError, setSavedPlansError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (viewerUrl && viewerUrl.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(viewerUrl);
        } catch {}
      }
    };
  }, [viewerUrl]);

  useEffect(() => {
    if (status === 'authenticated') {
      checkSubscription();
    }
  }, [status]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setNavLogExports(getNavLogExportHistory());
    const handler = () => setNavLogExports(getNavLogExportHistory());
    window.addEventListener('navlog-exports-updated', handler);
    return () => window.removeEventListener('navlog-exports-updated', handler);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadLocal = () => {
      try {
        const raw = localStorage.getItem('savedFlightPlans');
        if (!raw) return [] as any[];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [] as any[];
      }
    };

    const localPlans = loadLocal()
      .filter((plan: any) => plan && plan.waypoints && Array.isArray(plan.waypoints))
      .map((plan: any) => {
        const id = String(plan.id ?? plan.name ?? Date.now());
        return {
          key: `local:${id}` as SavedPlanKey,
          id,
          source: 'local' as const,
          name: plan.name ?? null,
          aircraftType: plan.aircraftType ?? null,
          aircraftSpeed: typeof plan.aircraftSpeed === 'number' ? plan.aircraftSpeed : null,
          aircraftBurnRate: typeof plan.aircraftBurnRate === 'number' ? plan.aircraftBurnRate : null,
          aircraftFuelCapacity: typeof plan.aircraftFuelCapacity === 'number' ? plan.aircraftFuelCapacity : null,
          cruisingAlt: typeof plan.cruisingAlt === 'number' ? plan.cruisingAlt : null,
          createdAt: plan.createdAt ?? null,
          waypoints: (plan.waypoints || []).map((wp: any) => ({
            icao: wp.icao ?? null,
            name: wp.name ?? null,
            city: wp.city ?? null,
            latitude: Number(wp.latitude),
            longitude: Number(wp.longitude),
          })),
        } satisfies SavedFlightPlan;
      });

    setSavedFlightPlans(localPlans);
  }, []);

  useEffect(() => {
    if (status !== 'authenticated') return;
    setSavedPlansLoading(true);
    setSavedPlansError(null);
    fetch('/api/flight-plans')
      .then((res) => res.json())
      .then((data) => {
        const dbPlans = (data.flightPlans || [])
          .filter((plan: any) => plan && plan.waypoints && Array.isArray(plan.waypoints))
          .map((plan: any) => {
            return {
              key: `db:${plan.id}` as SavedPlanKey,
              id: String(plan.id),
              source: 'db' as const,
              name: plan.name ?? null,
              aircraftType: plan.aircraftType ?? null,
              aircraftSpeed: typeof plan.aircraftSpeed === 'number' ? plan.aircraftSpeed : null,
              aircraftBurnRate: typeof plan.aircraftBurnRate === 'number' ? plan.aircraftBurnRate : null,
              aircraftFuelCapacity: typeof plan.aircraftFuelCapacity === 'number' ? plan.aircraftFuelCapacity : null,
              cruisingAlt: typeof plan.cruisingAlt === 'number' ? plan.cruisingAlt : null,
              createdAt: plan.createdAt ? new Date(plan.createdAt).toISOString() : null,
              waypoints: (plan.waypoints || []).map((wp: any) => ({
                icao: wp.icao ?? null,
                name: wp.name ?? null,
                city: wp.city ?? null,
                latitude: Number(wp.latitude),
                longitude: Number(wp.longitude),
              })),
            } satisfies SavedFlightPlan;
          });

        setSavedFlightPlans((prev) => {
          const locals = prev.filter((p) => p.source === 'local');
          return [...dbPlans, ...locals];
        });
      })
      .catch((error) => {
        console.error('Failed to load saved flight plans', error);
        setSavedPlansError('Failed to load saved flight plans.');
      })
      .finally(() => setSavedPlansLoading(false));
  }, [status]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadCurrentPlan = () => {
      try {
        const raw = localStorage.getItem('fuelSaverCurrentPlan');
        if (!raw) {
          setCurrentFuelPlan(null);
          return;
        }
        const parsed = JSON.parse(raw) as CurrentFuelSaverPlan;
        if (!parsed?.waypoints || parsed.waypoints.length < 2) {
          setCurrentFuelPlan(null);
          return;
        }
        setCurrentFuelPlan(parsed);
      } catch (error) {
        console.error('Failed to load current Fuel Saver plan', error);
        setCurrentFuelPlan(null);
      }
    };

    loadCurrentPlan();
    window.addEventListener('fuel-saver-plan-updated', loadCurrentPlan);
    return () => window.removeEventListener('fuel-saver-plan-updated', loadCurrentPlan);
  }, []);

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

  const handlePreviewExport = (exportItem: StoredNavLogExport) => {
    setSelectedExportId(exportItem.id);
    setViewerLoading(true);
    setTimeout(() => {
      try {
        const doc = createNavLogPdfDoc(exportItem.navLogData, {
          detailed: exportItem.detailed,
          cruisingAltitude: exportItem.navLogData.cruisingAltitude,
        });
        const blob = doc.output('blob');
        const blobUrl = URL.createObjectURL(blob);
        setViewerUrl((prev) => {
          if (prev && prev.startsWith('blob:')) {
            try {
              URL.revokeObjectURL(prev);
            } catch {}
          }
          return blobUrl;
        });
      } catch (error) {
        console.error('Failed to render nav log preview', error);
        setViewerUrl(null);
      } finally {
        setViewerLoading(false);
      }
    }, 0);
  };

  const handleDownloadExport = (exportItem: StoredNavLogExport) => {
    try {
      const doc = createNavLogPdfDoc(exportItem.navLogData, {
        detailed: exportItem.detailed,
        cruisingAltitude: exportItem.navLogData.cruisingAltitude,
      });
      const filenameBase = exportItem.name.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'flight-plan';
      doc.save(`${filenameBase}-navlog.pdf`);
    } catch (error) {
      console.error('Failed to download nav log export', error);
    }
  };

  const handleDownloadCurrentPlan = (detailed: boolean) => {
    if (!currentFuelPlan) return;
    downloadNavLogPdf(
      currentFuelPlan.waypoints,
      currentFuelPlan.aircraft,
      currentFuelPlan.cruisingAltitude,
      currentFuelPlan.fuelPrices,
      { detailed, planName: currentFuelPlan.name }
    );
  };

  const handleGenerateFromSavedPlan = (detailed: boolean) => {
    const selected = savedFlightPlans.find((plan) => plan.key === selectedSavedPlanKey);
    if (!selected) return;
    if (!selected.waypoints || selected.waypoints.length < 2) return;

    const aircraft = {
      name: selected.aircraftType || 'Aircraft',
      speed: selected.aircraftSpeed ?? 110,
      burnRate: selected.aircraftBurnRate ?? 8.5,
      fuelCapacity: selected.aircraftFuelCapacity ?? 50,
    };
    const cruisingAltitude = selected.cruisingAlt ?? 5500;

    downloadNavLogPdf(
      selected.waypoints.map((wp) => ({
        icao: (wp.icao || '').toUpperCase(),
        name: wp.name || undefined,
        latitude: wp.latitude,
        longitude: wp.longitude,
      })),
      aircraft,
      cruisingAltitude,
      {},
      { detailed, planName: selected.name || undefined }
    );
  };

  const formatExportDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
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
      console.error('Failed to fetch logbook:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  // Calculate totals
  const totals = entries.reduce((acc, entry) => ({
    totalTime: acc.totalTime + (entry.totalTime || 0),
    soloTime: acc.soloTime + (entry.soloTime || 0),
    nightTime: acc.nightTime + (entry.nightTime || 0),
    instrumentTime: acc.instrumentTime + (entry.instrumentTime || 0),
    crossCountryTime: acc.crossCountryTime + (entry.crossCountryTime || 0),
    dayLandings: acc.dayLandings + (entry.dayLandings || 0),
    nightLandings: acc.nightLandings + (entry.nightLandings || 0),
  }), { totalTime: 0, soloTime: 0, nightTime: 0, instrumentTime: 0, crossCountryTime: 0, dayLandings: 0, nightLandings: 0 });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading Pilot Overview...</div>
      </div>
    );
  }

  if (!isProPlus) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-white mb-2">Pilot Overview</h2>
          <p className="text-slate-400 mb-4">
            Unlock advanced analytics, currency tracking, and detailed flight insights with Pro+.
          </p>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-left space-y-2">
            <div className="flex items-center gap-2 text-slate-300">
              <span>✓</span> Hour Analytics & Charts
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span>✓</span> Currency Tracking (BFR, IPC)
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span>✓</span> Digital Logbook
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span>✓</span> Priority Support
            </div>
          </div>
          <button
            onClick={() => router.push('/pricing')}
            className="mt-6 bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Upgrade to Pro+ - $6.99/mo
          </button>
        </div>
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
              <h1 className="text-2xl font-bold text-white">👨‍✈️ Pilot Overview</h1>
              <p className="text-slate-400 text-sm">Your complete flight statistics and logbook</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm">
                Pro+ Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto flex gap-1 px-4 overflow-x-auto">
          {(['logbook', 'training', 'currency', 'analytics', 'documents'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'logbook' && '📖 '}
              {tab === 'training' && '🎓 '}
              {tab === 'currency' && '💱 '}
              {tab === 'analytics' && '📊 '}
              {tab === 'documents' && '📂 '}
              {tab === 'training' ? 'Training' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Logbook Tab */}
        {activeTab === 'logbook' && (
          <div>
            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="text-slate-400 text-sm">Total Time</div>
                <div className="text-2xl font-bold text-white">{formatTime(totals.totalTime)}</div>
              </div>
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="text-slate-400 text-sm">Night Time</div>
                <div className="text-2xl font-bold text-white">{formatTime(totals.nightTime)}</div>
              </div>
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="text-slate-400 text-sm">Instrument</div>
                <div className="text-2xl font-bold text-white">{formatTime(totals.instrumentTime)}</div>
              </div>
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="text-slate-400 text-sm">Cross Country</div>
                <div className="text-2xl font-bold text-white">{formatTime(totals.crossCountryTime)}</div>
              </div>
            </div>

            {/* Logbook Entries */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                <h3 className="font-semibold text-white">Flight Log</h3>
                <span className="text-slate-400 text-sm">{entries.length} flights</span>
              </div>
              
              {entries.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No flights logged yet. Add your first flight!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700/50">
                      <tr className="text-left text-slate-400 text-sm">
                        <th className="p-3">Date</th>
                        <th className="p-3">Aircraft</th>
                        <th className="p-3">Route</th>
                        <th className="p-3">Time</th>
                        <th className="p-3">Night</th>
                        <th className="p-3">IMC</th>
                        <th className="p-3">XC</th>
                        <th className="p-3">Landings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {entries.slice(0, 20).map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-700/30">
                          <td className="p-3 text-white text-sm">{formatDate(entry.date)}</td>
                          <td className="p-3 text-slate-300 text-sm">{entry.aircraft}</td>
                          <td className="p-3 text-slate-300 text-sm">
                            {entry.routeFrom} → {entry.routeTo}
                          </td>
                          <td className="p-3 text-white text-sm">{formatTime(entry.totalTime)}</td>
                          <td className="p-3 text-slate-300 text-sm">{formatTime(entry.nightTime)}</td>
                          <td className="p-3 text-slate-300 text-sm">{formatTime(entry.instrumentTime)}</td>
                          <td className="p-3 text-slate-300 text-sm">{formatTime(entry.crossCountryTime)}</td>
                          <td className="p-3 text-slate-300 text-sm">
                            {entry.dayLandings}d / {entry.nightLandings}n
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {entries.length > 20 && (
                <div className="p-3 text-center text-slate-500 text-sm border-t border-slate-700">
                  Showing 20 of {entries.length} flights
                </div>
              )}
            </div>
          </div>
        )}

        {/* Currency Tab */}
        {activeTab === 'currency' && (
          <CurrencyTracker />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <HourAnalytics />
        )}

        {/* Training Tab - show for everyone (not just Pro+) */}
        {activeTab === 'training' && (
          <TrainingOverview />
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex flex-col gap-2">
              <div>
                <h3 className="text-xl font-bold text-white">📂 Documents</h3>
                <p className="text-slate-400 text-sm">
                  Every time you export a Nav Log PDF we store a local copy here so you can preview or download again without rebuilding the route.
                </p>
              </div>
            </div>

            {currentFuelPlan && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-semibold">Current Fuel Saver Plan</div>
                    <div className="text-xs text-slate-400">
                      {currentFuelPlan.name || `${currentFuelPlan.waypoints[0].icao} → ${currentFuelPlan.waypoints[currentFuelPlan.waypoints.length - 1].icao}`}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full border border-slate-600 text-slate-300">Live</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadCurrentPlan(false)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-sm py-2 rounded-lg"
                  >
                    Download Basic
                  </button>
                  <button
                    onClick={() => handleDownloadCurrentPlan(true)}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white text-sm py-2 rounded-lg"
                  >
                    Download Detailed
                  </button>
                </div>
              </div>
            )}

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">Generate From Saved Flight Plan</div>
                  <div className="text-xs text-slate-400">Pick a plan and generate a Nav Log PDF here.</div>
                </div>
                {savedPlansLoading ? (
                  <span className="text-xs text-slate-400">Loading…</span>
                ) : (
                  <span className="text-xs px-2 py-1 rounded-full border border-slate-600 text-slate-300">{savedFlightPlans.length} plans</span>
                )}
              </div>

              {savedPlansError && (
                <div className="text-xs text-red-300">{savedPlansError}</div>
              )}

              <div className="flex flex-col gap-2">
                <select
                  value={selectedSavedPlanKey}
                  onChange={(e) => setSelectedSavedPlanKey(e.target.value as SavedPlanKey)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="">Select a saved plan…</option>
                  {savedFlightPlans.map((plan) => {
                    const label = plan.name || `${plan.waypoints?.[0]?.icao || 'DEP'} → ${plan.waypoints?.[plan.waypoints.length - 1]?.icao || 'ARR'}`;
                    const tag = plan.source === 'db' ? 'Cloud' : 'Local';
                    return (
                      <option key={plan.key} value={plan.key}>
                        [{tag}] {label}
                      </option>
                    );
                  })}
                </select>
                <div className="flex gap-2">
                  <button
                    disabled={!selectedSavedPlanKey}
                    onClick={() => handleGenerateFromSavedPlan(false)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm py-2 rounded-lg"
                  >
                    Generate Basic PDF
                  </button>
                  <button
                    disabled={!selectedSavedPlanKey}
                    onClick={() => handleGenerateFromSavedPlan(true)}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm py-2 rounded-lg"
                  >
                    Generate Detailed PDF
                  </button>
                </div>
                <div className="text-xs text-slate-400">
                  If a saved plan is missing performance data, we use safe defaults (110 kt / 8.5 gph / 50 gal).
                </div>
              </div>
            </div>

            {navLogExports.length === 0 ? (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-10 text-center text-slate-400">
                Export a Nav Log as PDF from the Fuel Saver module and it will appear here for quick access.
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-4">
                <div className="space-y-3">
                  {navLogExports.map((exportItem) => (
                    <div
                      key={exportItem.id}
                      className={`bg-slate-800 border rounded-xl p-4 transition-colors ${
                        selectedExportId === exportItem.id ? 'border-emerald-500' : 'border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-white font-semibold">{exportItem.name}</div>
                          <div className="text-xs text-slate-400">{formatExportDate(exportItem.createdAt)}</div>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full border border-slate-600 text-slate-300">
                          {exportItem.detailed ? 'Detailed' : 'Basic'}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400 mt-2">
                        {exportItem.navLogData.departure} → {exportItem.navLogData.arrival}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handlePreviewExport(exportItem)}
                          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-sm py-2 rounded-lg"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => handleDownloadExport(exportItem)}
                          className="flex-1 bg-slate-600 hover:bg-slate-500 text-white text-sm py-2 rounded-lg"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-4 min-h-[520px] flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-white font-semibold">PDF Preview</h4>
                      <p className="text-xs text-slate-400">Rendered directly in your browser</p>
                    </div>
                  </div>
                  <div className="flex-1 bg-white rounded-lg overflow-hidden border border-slate-200">
                    {viewerLoading ? (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        Preparing preview…
                      </div>
                    ) : viewerUrl ? (
                      <iframe src={viewerUrl} className="w-full h-[500px]" title="Nav Log Preview" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        Select a nav log from the list to preview it here.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PilotOverviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    }>
      <PilotOverviewContent />
    </Suspense>
  );
}
