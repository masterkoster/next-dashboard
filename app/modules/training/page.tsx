'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import VerificationBanner from '../../components/VerificationBanner';

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
  lastUpdated: string;
}

const PPL_REQUIREMENTS = {
  totalHours: { required: 40, label: 'Total Flight Hours', description: 'Minimum 40 hours' },
  soloHours: { required: 10, label: 'Solo Hours', description: 'Minimum 10 hours solo' },
  nightHours: { required: 3, label: 'Night Hours', description: 'Minimum 3 hours night' },
  instrumentHours: { required: 3, label: 'Instrument Hours', description: 'Minimum 3 hours hood/instrument' },
  crossCountryHours: { required: 10, label: 'Cross Country Hours', description: 'Minimum 10 hours XC' },
  xcSoloHours: { required: 5, label: 'Solo XC Hours', description: 'Minimum 5 hours solo XC' },
  dualGiven: { required: 3, label: 'Dual Given', description: 'Minimum 3 hours dual given' },
};

export default function TrainingPage() {
  const { data: session, status } = useSession();
  const [progress, setProgress] = useState<TrainingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Local state for editing
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
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/training-progress');
      if (res.ok) {
        const data = await res.json();
        setProgress(data);
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
    } catch (err) {
      console.error('Error fetching progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async () => {
    setSaving(true);
    try {
      await fetch('/api/training-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localProgress),
      });
      alert('Progress saved!');
    } catch (err) {
      console.error('Error saving:', err);
    } finally {
      setSaving(false);
    }
  };

  const getProgressPercent = (current: number, required: number) => {
    return Math.min(100, (current / required) * 100);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">🎓</div>
          <h1 className="text-2xl font-bold text-white mb-2">Training Progress Tracker</h1>
          <p className="text-slate-400 mb-6">Sign in to track your flight training progress</p>
          <button
            onClick={() => signIn()}
            className="bg-sky-600 hover:bg-sky-500 text-white px-6 py-3 rounded-lg font-medium"
          >
            Sign In to Track Progress
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Email Verification Banner */}
        <VerificationBanner email={session?.user?.email} />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">🎓 Training Progress</h1>
            <p className="text-slate-400">Track your PPL requirements</p>
          </div>
          <button
            onClick={saveProgress}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Hours Input Section */}
        <div className="bg-slate-800 rounded-xl p-4 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">✏️ Log Your Hours</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'totalHours', label: 'Total Hours' },
              { key: 'soloHours', label: 'Solo Hours' },
              { key: 'nightHours', label: 'Night Hours' },
              { key: 'instrumentHours', label: 'Instrument Hours' },
              { key: 'crossCountryHours', label: 'Cross Country Hours' },
              { key: 'xcSoloHours', label: 'Solo XC Hours' },
              { key: 'dualGiven', label: 'Dual Given' },
              { key: 'hoodHours', label: 'Hood/Sim Hours' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs text-slate-400 mb-1">{label}</label>
                <input
                  type="number"
                  value={localProgress[key as keyof typeof localProgress] as number}
                  onChange={(e) => setLocalProgress({ ...localProgress, [key]: Number(e.target.value) })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  min={0}
                  step={0.5}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-4">
          {Object.entries(PPL_REQUIREMENTS).map(([key, req]) => {
            const current = localProgress[key as keyof typeof localProgress] as number || 0;
            const percent = getProgressPercent(current, req.required);
            const isComplete = current >= req.required;

            return (
              <div key={key} className="bg-slate-800 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className={`font-medium ${isComplete ? 'text-emerald-400' : 'text-white'}`}>
                      {req.label}
                    </div>
                    <div className="text-xs text-slate-400">{req.description}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${isComplete ? 'text-emerald-400' : 'text-sky-400'}`}>
                      {current.toFixed(1)}/{req.required}
                    </div>
                    <div className="text-xs text-slate-500">{percent.toFixed(0)}%</div>
                  </div>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${isComplete ? 'bg-emerald-500' : 'bg-sky-500'}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Checkboxes Section */}
        <div className="bg-slate-800 rounded-xl p-4 mt-6">
          <h2 className="text-lg font-semibold text-white mb-4">☑️ Milestones Completed</h2>
          <div className="space-y-2">
            {[
              { key: 'soloDone', label: 'First Solo' },
              { key: 'nightSoloDone', label: 'Solo Night' },
              { key: 'instrumentDone', label: 'Instrument Checkride' },
              { key: 'xcSoloDone', label: 'Solo XC Complete' },
              { key: 'threeTakeoffsLandingsDone', label: '3 Takeoffs/Landings' },
              { key: 'threeNightTakeoffsLandingsDone', label: '3 Night Takeoffs/Landings' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localProgress[key as keyof typeof localProgress] as boolean}
                  onChange={(e) => setLocalProgress({ ...localProgress, [key]: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <span className={localProgress[key as keyof typeof localProgress] ? 'text-emerald-400' : 'text-slate-300'}>
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-slate-800 rounded-xl p-4 mt-6">
          <h2 className="text-lg font-semibold text-white mb-4">📊 Summary</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-slate-700 rounded-lg p-3">
              <div className="text-2xl font-bold text-sky-400">{localProgress.totalHours}</div>
              <div className="text-xs text-slate-400">Total Hours</div>
            </div>
            <div className="bg-slate-700 rounded-lg p-3">
              <div className="text-2xl font-bold text-emerald-400">
                {Object.values(PPL_REQUIREMENTS).filter((req, i) => {
                  const keys = Object.keys(PPL_REQUIREMENTS);
                  return (localProgress[keys[i] as keyof typeof localProgress] as number) >= req.required;
                }).length}
              </div>
              <div className="text-xs text-slate-400">Requirements Met</div>
            </div>
            <div className="bg-slate-700 rounded-lg p-3">
              <div className="text-2xl font-bold text-amber-400">
                {Object.keys(PPL_REQUIREMENTS).length - 
                  Object.values(PPL_REQUIREMENTS).filter((req, i) => {
                    const keys = Object.keys(PPL_REQUIREMENTS);
                    return (localProgress[keys[i] as keyof typeof localProgress] as number) >= req.required;
                  }).length}
              </div>
              <div className="text-xs text-slate-400">Remaining</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
