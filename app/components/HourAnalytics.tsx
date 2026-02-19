'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface LogbookEntry {
  date: string;
  totalTime: number;
  soloTime: number;
  nightTime: number;
  instrumentTime: number;
  crossCountryTime: number;
  dualReceived: number;
}

interface MonthlyData {
  month: string;
  total: number;
  solo: number;
  night: number;
  instrument: number;
  crossCountry: number;
  dual: number;
}

export default function HourAnalytics() {
  const { data: session, status } = useSession();
  const [entries, setEntries] = useState<LogbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [totals, setTotals] = useState({
    total: 0,
    solo: 0,
    night: 0,
    instrument: 0,
    crossCountry: 0,
    dual: 0,
  });
  const [selectedType, setSelectedType] = useState<string>('total');

  useEffect(() => {
    if (status === 'authenticated') {
      fetchEntries();
    }
  }, [status]);

  useEffect(() => {
    if (entries.length > 0) {
      calculateAnalytics();
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

  const calculateAnalytics = () => {
    // Calculate totals
    const totals = entries.reduce((acc, entry) => ({
      total: acc.total + entry.totalTime,
      solo: acc.solo + entry.soloTime,
      night: acc.night + entry.nightTime,
      instrument: acc.instrument + entry.instrumentTime,
      crossCountry: acc.crossCountry + entry.crossCountryTime,
      dual: acc.dual + entry.dualReceived,
    }), {
      total: 0, solo: 0, night: 0, instrument: 0, crossCountry: 0, dual: 0,
    });
    setTotals(totals);

    // Group by month (last 12 months)
    const monthlyMap = new Map<string, MonthlyData>();
    const now = new Date();
    
    // Initialize last 12 months with zeros
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(key, {
        month: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        total: 0, solo: 0, night: 0, instrument: 0, crossCountry: 0, dual: 0,
      });
    }

    // Fill with actual data
    entries.forEach(entry => {
      const date = new Date(entry.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyMap.has(key)) {
        const existing = monthlyMap.get(key)!;
        existing.total += entry.totalTime;
        existing.solo += entry.soloTime;
        existing.night += entry.nightTime;
        existing.instrument += entry.instrumentTime;
        existing.crossCountry += entry.crossCountryTime;
        existing.dual += entry.dualReceived;
      }
    });

    setMonthlyData(Array.from(monthlyMap.values()));
  };

  const getBarHeight = (value: number, max: number) => {
    if (max === 0) return 0;
    return Math.max((value / max) * 100, 4); // Minimum 4% height
  };

  const getMaxValue = () => {
    if (monthlyData.length === 0) return 0;
    return Math.max(...monthlyData.map(d => {
      switch (selectedType) {
        case 'solo': return d.solo;
        case 'night': return d.night;
        case 'instrument': return d.instrument;
        case 'crossCountry': return d.crossCountry;
        case 'dual': return d.dual;
        default: return d.total;
      }
    }));
  };

  const getValue = (data: MonthlyData) => {
    switch (selectedType) {
      case 'solo': return data.solo;
      case 'night': return data.night;
      case 'instrument': return data.instrument;
      case 'crossCountry': return data.crossCountry;
      case 'dual': return data.dual;
      default: return data.total;
    }
  };

  const getTypeColor = () => {
    switch (selectedType) {
      case 'solo': return 'bg-emerald-500';
      case 'night': return 'bg-purple-500';
      case 'instrument': return 'bg-amber-500';
      case 'crossCountry': return 'bg-sky-500';
      case 'dual': return 'bg-pink-500';
      default: return 'bg-emerald-500';
    }
  };

  const getTypeLabel = () => {
    switch (selectedType) {
      case 'solo': return 'Solo Hours';
      case 'night': return 'Night Hours';
      case 'instrument': return 'Instrument Hours';
      case 'crossCountry': return 'Cross Country';
      case 'dual': return 'Dual Received';
      default: return 'Total Hours';
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">📊 Hour Analytics</h2>
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  const maxValue = getMaxValue();

  return (
    <div className="bg-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">📊 Hour Analytics</h2>
          <p className="text-slate-400 text-sm">Visual breakdown of your flight hours</p>
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1 text-white text-sm"
        >
          <option value="total">Total Hours</option>
          <option value="solo">Solo Hours</option>
          <option value="night">Night Hours</option>
          <option value="instrument">Instrument Hours</option>
          <option value="crossCountry">Cross Country</option>
          <option value="dual">Dual Received</option>
        </select>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-400 mb-2">No logbook entries found</p>
          <p className="text-slate-500 text-sm">
            Add flights to see your analytics
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
            <div 
              className={`rounded-lg p-3 cursor-pointer transition ${selectedType === 'total' ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-slate-700/50'}`}
              onClick={() => setSelectedType('total')}
            >
              <p className="text-xs text-slate-400">Total</p>
              <p className="text-lg font-bold text-white">{totals.total.toFixed(1)}</p>
            </div>
            <div 
              className={`rounded-lg p-3 cursor-pointer transition ${selectedType === 'solo' ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-slate-700/50'}`}
              onClick={() => setSelectedType('solo')}
            >
              <p className="text-xs text-slate-400">Solo</p>
              <p className="text-lg font-bold text-emerald-400">{totals.solo.toFixed(1)}</p>
            </div>
            <div 
              className={`rounded-lg p-3 cursor-pointer transition ${selectedType === 'night' ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-slate-700/50'}`}
              onClick={() => setSelectedType('night')}
            >
              <p className="text-xs text-slate-400">Night</p>
              <p className="text-lg font-bold text-purple-400">{totals.night.toFixed(1)}</p>
            </div>
            <div 
              className={`rounded-lg p-3 cursor-pointer transition ${selectedType === 'instrument' ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-slate-700/50'}`}
              onClick={() => setSelectedType('instrument')}
            >
              <p className="text-xs text-slate-400">Inst</p>
              <p className="text-lg font-bold text-amber-400">{totals.instrument.toFixed(1)}</p>
            </div>
            <div 
              className={`rounded-lg p-3 cursor-pointer transition ${selectedType === 'crossCountry' ? 'bg-sky-500/20 border border-sky-500/30' : 'bg-slate-700/50'}`}
              onClick={() => setSelectedType('crossCountry')}
            >
              <p className="text-xs text-slate-400">XC</p>
              <p className="text-lg font-bold text-sky-400">{totals.crossCountry.toFixed(1)}</p>
            </div>
            <div 
              className={`rounded-lg p-3 cursor-pointer transition ${selectedType === 'dual' ? 'bg-pink-500/20 border border-pink-500/30' : 'bg-slate-700/50'}`}
              onClick={() => setSelectedType('dual')}
            >
              <p className="text-xs text-slate-400">Dual</p>
              <p className="text-lg font-bold text-pink-400">{totals.dual.toFixed(1)}</p>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-slate-300 mb-3">{getTypeLabel()} - Last 12 Months</h3>
            <div className="h-48 flex items-end gap-2">
              {monthlyData.map((data, i) => {
                const value = getValue(data);
                const height = getBarHeight(value, maxValue);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="w-full relative" style={{ height: '160px' }}>
                      <div
                        className={`absolute bottom-0 w-full rounded-t ${getTypeColor()} transition-all duration-500`}
                        style={{ height: `${height}%` }}
                        title={`${data.month}: ${value.toFixed(1)} hours`}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1 truncate w-full text-center">
                      {data.month.split(' ')[0]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {entries.slice(0, 5).map((entry, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                  <span className="text-slate-300">{entry.totalTime.toFixed(1)} hrs</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
