'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Plane,
  Download,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  FileText,
  X
} from "lucide-react";

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

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterAircraft, setFilterAircraft] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get unique aircraft for filter dropdown
  const uniqueAircraft = [...new Set(entries.map(e => e.aircraft))].sort();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  // Filtered entries
  const filteredEntries = entries.filter(entry => {
    const entryYear = new Date(entry.date).getFullYear().toString();
    if (filterYear !== 'all' && entryYear !== filterYear) return false;
    if (filterAircraft !== 'all' && entry.aircraft !== filterAircraft) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        entry.aircraft.toLowerCase().includes(query) ||
        entry.routeFrom.toLowerCase().includes(query) ||
        entry.routeTo.toLowerCase().includes(query) ||
        (entry.remarks?.toLowerCase().includes(query) ?? false)
      );
    }
    return true;
  });

  // Filtered totals
  const filteredTotals = filteredEntries.reduce((acc, entry) => ({
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

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Aircraft', 'From', 'To', 'Total Time', 'Solo', 'Dual Given', 'Dual Received', 'Night', 'Instrument', 'XC', 'Day Landings', 'Night Landings', 'Remarks'];
    const csvContent = [
      headers.join(','),
      ...filteredEntries.map(entry => [
        entry.date,
        entry.aircraft,
        entry.routeFrom,
        entry.routeTo,
        entry.totalTime,
        entry.soloTime,
        entry.dualGiven,
        entry.dualReceived,
        entry.nightTime,
        entry.instrumentTime,
        entry.crossCountryTime,
        entry.dayLandings,
        entry.nightLandings,
        `"${entry.remarks || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `logbook_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Export to PDF (text-based for simplicity)
  const exportToPDF = () => {
    const content = `
LOGBOOK EXPORT - Generated ${new Date().toLocaleDateString()}
================================================

SUMMARY (Filtered: ${filteredEntries.length} of ${entries.length} entries)
-------
Total Time: ${filteredTotals.totalTime.toFixed(1)} hours
Solo Time: ${filteredTotals.soloTime.toFixed(1)} hours
Dual Given: ${filteredTotals.dualGiven.toFixed(1)} hours
Dual Received: ${filteredTotals.dualReceived.toFixed(1)} hours
Night Time: ${filteredTotals.nightTime.toFixed(1)} hours
Instrument Time: ${filteredTotals.instrumentTime.toFixed(1)} hours
Cross Country: ${filteredTotals.crossCountryTime.toFixed(1)} hours
Day Landings: ${filteredTotals.dayLandings}
Night Landings: ${filteredTotals.nightLandings}

FLIGHT ENTRIES
--------------
${filteredEntries.map((entry, i) => `
${i + 1}. ${entry.date} - ${entry.aircraft}
   Route: ${entry.routeFrom} → ${entry.routeTo}
   Total: ${entry.totalTime}h | Solo: ${entry.soloTime}h | Night: ${entry.nightTime}h
   Instrument: ${entry.instrumentTime}h | XC: ${entry.crossCountryTime}h
   Landings: ${entry.dayLandings} day, ${entry.nightLandings} night
   ${entry.remarks ? `Remarks: ${entry.remarks}` : ''}
`).join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `logbook_export_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
  };

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Please Sign In</h1>
          <p className="text-muted-foreground mb-6">You need to be signed in to view your logbook.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (error === 'Pro+ subscription required') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📖</div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Pro+ Feature</h1>
          <p className="text-muted-foreground mb-6">
            The Digital Logbook is available with Pro+ subscription. 
            Upgrade to track your flight hours automatically.
          </p>
          <Link
            href="/pricing"
            className="inline-block bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg"
          >
            Upgrade to Pro+
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">📖 Digital Logbook</h1>
              <p className="text-muted-foreground">Track your flight hours</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant={showFilters ? "default" : "outline"} 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <FileText className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={exportToPDF}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button 
                onClick={() => setShowForm(!showForm)}
                className="bg-green-600 hover:bg-green-700"
              >
                {showForm ? 'Cancel' : '+ Add Entry'}
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          {showFilters && (
            <div className="flex flex-wrap items-center gap-3 p-4 bg-card border border-border rounded-xl">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="h-8 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="all">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <Plane className="h-4 w-4 text-muted-foreground" />
                <select
                  value={filterAircraft}
                  onChange={(e) => setFilterAircraft(e.target.value)}
                  className="h-8 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="all">All Aircraft</option>
                  {uniqueAircraft.map(ac => (
                    <option key={ac} value={ac}>{ac}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search aircraft, route, remarks..."
                  className="h-8 flex-1 rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>

              {(filterYear !== 'all' || filterAircraft !== 'all' || searchQuery) && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setFilterYear('all');
                    setFilterAircraft('all');
                    setSearchQuery('');
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Stats Cards - Show filtered totals if filters are active */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase">Total Time {(filterYear !== 'all' || filterAircraft !== 'all' || searchQuery) && '(Filtered)'}</p>
            <p className="text-2xl font-bold text-foreground">{(filterYear !== 'all' || filterAircraft !== 'all' || searchQuery ? filteredTotals : totals).totalTime.toFixed(1)}h</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase">Solo Time</p>
            <p className="text-2xl font-bold text-green-600">{(filterYear !== 'all' || filterAircraft !== 'all' || searchQuery ? filteredTotals : totals).soloTime.toFixed(1)}h</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase">Night Time</p>
            <p className="text-2xl font-bold text-purple-600">{(filterYear !== 'all' || filterAircraft !== 'all' || searchQuery ? filteredTotals : totals).nightTime.toFixed(1)}h</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase">Landings</p>
            <p className="text-2xl font-bold text-blue-600">{((filterYear !== 'all' || filterAircraft !== 'all' || searchQuery ? filteredTotals : totals).dayLandings + (filterYear !== 'all' || filterAircraft !== 'all' || searchQuery ? filteredTotals : totals).nightLandings)}</p>
          </div>
        </div>

        {/* Add Entry Form */}
        {showForm && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">New Flight Entry</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Aircraft</label>
                  <input
                    type="text"
                    value={formData.aircraft}
                    onChange={(e) => setFormData({...formData, aircraft: e.target.value})}
                    placeholder="N123AB"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">From</label>
                  <input
                    type="text"
                    value={formData.routeFrom}
                    onChange={(e) => setFormData({...formData, routeFrom: e.target.value.toUpperCase()})}
                    placeholder="KABC"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">To</label>
                  <input
                    type="text"
                    value={formData.routeTo}
                    onChange={(e) => setFormData({...formData, routeTo: e.target.value.toUpperCase()})}
                    placeholder="KXYZ"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground uppercase"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-7 gap-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Total</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.totalTime}
                    onChange={(e) => setFormData({...formData, totalTime: e.target.value})}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                    placeholder="1.5"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Solo</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.soloTime}
                    onChange={(e) => setFormData({...formData, soloTime: e.target.value})}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Dual Rec</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.dualReceived}
                    onChange={(e) => setFormData({...formData, dualReceived: e.target.value})}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Night</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.nightTime}
                    onChange={(e) => setFormData({...formData, nightTime: e.target.value})}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Instrument</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.instrumentTime}
                    onChange={(e) => setFormData({...formData, instrumentTime: e.target.value})}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">XC</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.crossCountryTime}
                    onChange={(e) => setFormData({...formData, crossCountryTime: e.target.value})}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Landings</label>
                  <input
                    type="number"
                    value={formData.dayLandings}
                    onChange={(e) => setFormData({...formData, dayLandings: e.target.value})}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground h-20"
                  placeholder="Flight notes..."
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg"
              >
                {saving ? 'Saving...' : 'Save Entry'}
              </button>
            </form>
          </div>
        )}

        {/* Entries Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Table header with count */}
          <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
            <span className="text-xs text-muted-foreground">
              Showing {filteredEntries.length} of {entries.length} entries
            </span>
            {(filterYear !== 'all' || filterAircraft !== 'all' || searchQuery) && (
              <span className="text-xs text-primary">
                (Filtered)
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-muted-foreground font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-muted-foreground font-medium">Aircraft</th>
                  <th className="px-4 py-3 text-left text-muted-foreground font-medium">Route</th>
                  <th className="px-4 py-3 text-center text-muted-foreground font-medium">Total</th>
                  <th className="px-4 py-3 text-center text-muted-foreground font-medium">Solo</th>
                  <th className="px-4 py-3 text-center text-muted-foreground font-medium">Night</th>
                  <th className="px-4 py-3 text-center text-muted-foreground font-medium">Inst</th>
                  <th className="px-4 py-3 text-center text-muted-foreground font-medium">XC</th>
                  <th className="px-4 py-3 text-center text-muted-foreground font-medium">Ldg</th>
                  <th className="px-4 py-3 text-right text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">
                      {entries.length === 0 
                        ? 'No entries yet. Click "Add Entry" to log your first flight!'
                        : 'No entries match your filters. Try adjusting your search criteria.'
                      }
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => (
                    <tr key={entry.id} className="border-t border-border hover:bg-muted/50">
                      <td className="px-4 py-3 text-foreground">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-foreground">{entry.aircraft}</td>
                      <td className="px-4 py-3 text-foreground">
                        {entry.routeFrom} → {entry.routeTo}
                      </td>
                      <td className="px-4 py-3 text-center text-foreground">{entry.totalTime.toFixed(1)}</td>
                      <td className="px-4 py-3 text-center text-green-600">{entry.soloTime > 0 ? entry.soloTime.toFixed(1) : '-'}</td>
                      <td className="px-4 py-3 text-center text-purple-600">{entry.nightTime > 0 ? entry.nightTime.toFixed(1) : '-'}</td>
                      <td className="px-4 py-3 text-center text-amber-600">{entry.instrumentTime > 0 ? entry.instrumentTime.toFixed(1) : '-'}</td>
                      <td className="px-4 py-3 text-center text-blue-600">{entry.crossCountryTime > 0 ? entry.crossCountryTime.toFixed(1) : '-'}</td>
                      <td className="px-4 py-3 text-center text-foreground">{entry.dayLandings + entry.nightLandings}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-600 hover:text-red-700 text-xs"
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
