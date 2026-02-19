'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface LogbookEntry {
  date: string;
  totalTime: number;
  soloTime: number;
  nightTime: number;
  instrumentTime: number;
  dayLandings: number;
  nightLandings: number;
  dualReceived: number;
}

interface CurrencyStatus {
  name: string;
  icon: string;
  isCurrent: boolean;
  expiresAt: Date | null;
  daysRemaining: number;
  description: string;
}

export default function CurrencyTracker() {
  const { data: session, status } = useSession();
  const [entries, setEntries] = useState<LogbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currencies, setCurrencies] = useState<CurrencyStatus[]>([]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchEntries();
    }
  }, [status]);

  useEffect(() => {
    if (entries.length > 0) {
      calculateCurrencies();
    }
  }, [entries]);

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/logbook');
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (err) {
      console.error('Failed to fetch entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateCurrencies = () => {
    const now = new Date();
    const calculated: CurrencyStatus[] = [];

    // 1. BFR (Biennial Flight Review) - 24 months from last dual flight
    const lastDualFlight = entries
      .filter(e => e.dualReceived > 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    if (lastDualFlight) {
      const lastDualDate = new Date(lastDualFlight.date);
      const bfrExpires = new Date(lastDualDate);
      bfrExpires.setMonth(bfrExpires.getMonth() + 24);
      const daysUntilBFR = Math.floor((bfrExpires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      calculated.push({
        name: 'BFR (Biennial Flight Review)',
        icon: '📋',
        isCurrent: daysUntilBFR > 0,
        expiresAt: bfrExpires,
        daysRemaining: daysUntilBFR,
        description: 'Required every 24 months',
      });
    } else {
      calculated.push({
        name: 'BFR (Biennial Flight Review)',
        icon: '📋',
        isCurrent: false,
        expiresAt: null,
        daysRemaining: -999,
        description: 'No dual instruction recorded',
      });
    }

    // 2. Night Currency - 90 days from last night landing
    const lastNightLanding = entries
      .filter(e => e.nightLandings > 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    if (lastNightLanding) {
      const lastNightDate = new Date(lastNightLanding.date);
      const nightCurrencyExpires = new Date(lastNightDate);
      nightCurrencyExpires.setDate(nightCurrencyExpires.getDate() + 90);
      const daysUntilNight = Math.floor((nightCurrencyExpires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      calculated.push({
        name: 'Night Landing Currency',
        icon: '🌙',
        isCurrent: daysUntilNight > 0,
        expiresAt: nightCurrencyExpires,
        daysRemaining: daysUntilNight,
        description: 'Required every 90 days for night flights',
      });
    } else {
      calculated.push({
        name: 'Night Landing Currency',
        icon: '🌙',
        isCurrent: false,
        expiresAt: null,
        daysRemaining: -999,
        description: 'No night landings recorded',
      });
    }

    // 3. Instrument Currency - 6 months from last instrument time
    const lastInstrument = entries
      .filter(e => e.instrumentTime > 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    if (lastInstrument) {
      const lastInstDate = new Date(lastInstrument.date);
      const instrumentExpires = new Date(lastInstDate);
      instrumentExpires.setMonth(instrumentExpires.getMonth() + 6);
      const daysUntilInst = Math.floor((instrumentExpires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      calculated.push({
        name: 'Instrument Currency',
        icon: '🌫️',
        isCurrent: daysUntilInst > 0,
        expiresAt: instrumentExpires,
        daysRemaining: daysUntilInst,
        description: 'Required every 6 months under IFR',
      });
    } else {
      calculated.push({
        name: 'Instrument Currency',
        icon: '🌫️',
        isCurrent: false,
        expiresAt: null,
        daysRemaining: -999,
        description: 'No instrument time recorded',
      });
    }

    // 4. Passenger Carrying Currency (Day) - 90 days from 3 takeoffs/landings
    const recentDayLandings = entries
      .filter(e => new Date(e.date) > new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000))
      .reduce((sum, e) => sum + e.dayLandings, 0);
    
    const dayPassengerCurrent = recentDayLandings >= 3;
    const dayExpires = dayPassengerCurrent 
      ? new Date(Math.min(...entries
          .filter(e => e.dayLandings > 0)
          .map(e => new Date(e.date).getTime())) + 90 * 24 * 60 * 60 * 1000)
      : null;
    
    calculated.push({
      name: 'Day Passenger Currency',
      icon: '👥',
      isCurrent: dayPassengerCurrent,
      expiresAt: dayExpires,
      daysRemaining: dayExpires ? Math.floor((dayExpires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : -999,
      description: '3 takeoffs/landings in 90 days',
    });

    // 5. Passenger Carrying Currency (Night) - 90 days from 3 night takeoffs/landings
    const recentNightLandings = entries
      .filter(e => new Date(e.date) > new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000))
      .reduce((sum, e) => sum + e.nightLandings, 0);
    
    const nightPassengerCurrent = recentNightLandings >= 3;
    const nightPassExpires = nightPassengerCurrent
      ? new Date(Math.min(...entries
          .filter(e => e.nightLandings > 0)
          .map(e => new Date(e.date).getTime())) + 90 * 24 * 60 * 60 * 1000)
      : null;
    
    calculated.push({
      name: 'Night Passenger Currency',
      icon: '🌃',
      isCurrent: nightPassengerCurrent,
      expiresAt: nightPassExpires,
      daysRemaining: nightPassExpires ? Math.floor((nightPassExpires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : -999,
      description: '3 night takeoffs/landings in 90 days',
    });

    // 6. IPC (Instrument Proficiency Check) - 12 months
    // This would need a specific IPC log entry type - for now estimate from last instrument training
    const lastInstTraining = entries
      .filter(e => e.instrumentTime > 0 && e.dualReceived > 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    if (lastInstTraining) {
      const lastTrainingDate = new Date(lastInstTraining.date);
      const ipcExpires = new Date(lastTrainingDate);
      ipcExpires.setMonth(ipcExpires.getMonth() + 12);
      const daysUntilIPC = Math.floor((ipcExpires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      calculated.push({
        name: 'IPC (Instrument Proficiency)',
        icon: '✈️',
        isCurrent: daysUntilIPC > 0,
        expiresAt: ipcExpires,
        daysRemaining: daysUntilIPC,
        description: 'Required every 12 months (estimate)',
      });
    } else {
      calculated.push({
        name: 'IPC (Instrument Proficiency)',
        icon: '✈️',
        isCurrent: false,
        expiresAt: null,
        daysRemaining: -999,
        description: 'No instrument training recorded',
      });
    }

    setCurrencies(calculated);
  };

  const getStatusColor = (currency: CurrencyStatus) => {
    if (!currency.isCurrent) return 'bg-red-500/20 border-red-500/30 text-red-400';
    if (currency.daysRemaining < 30) return 'bg-amber-500/20 border-amber-500/30 text-amber-400';
    return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400';
  };

  const getStatusText = (currency: CurrencyStatus) => {
    if (!currency.isCurrent) return 'EXPIRED';
    if (currency.daysRemaining < 30) return `${currency.daysRemaining} days left`;
    if (currency.daysRemaining < 90) return `${currency.daysRemaining} days left`;
    return 'Current';
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">📋 Currency Tracker</h2>
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">📋 Currency Tracker</h2>
          <p className="text-slate-400 text-sm">Track your flight currency expiration dates</p>
        </div>
        <button
          onClick={fetchEntries}
          className="text-sm text-emerald-400 hover:text-emerald-300"
        >
          Refresh
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-400 mb-2">No logbook entries found</p>
          <p className="text-slate-500 text-sm">
            Add flights to your logbook to track currency
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currencies.map((currency, i) => (
            <div
              key={i}
              className={`rounded-lg border p-4 ${getStatusColor(currency)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{currency.icon}</span>
                  <div>
                    <h3 className="font-semibold">{currency.name}</h3>
                    <p className="text-xs opacity-80">{currency.description}</p>
                    {currency.expiresAt && (
                      <p className="text-xs mt-1">
                        Expires: {currency.expiresAt.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold ${
                    currency.isCurrent 
                      ? currency.daysRemaining < 30 ? 'text-amber-400' : 'text-emerald-400'
                      : 'text-red-400'
                  }`}>
                    {getStatusText(currency)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-slate-700">
        <p className="text-xs text-slate-500">
          💡 Tip: Currency is calculated from your logbook entries. 
          Keep your logbook up to date for accurate tracking.
        </p>
      </div>
    </div>
  );
}
