"use client";

import { useState, useCallback } from "react";

type AircraftResult = {
  nNumber: string;
  serialNumber: string;
  manufacturer: string;
  model: string;
  status: string;
  typeRegistrant: string;
  lastActionDate: string;
  airWorthDate: string;
  name: string;
};

export default function PlaneSearchClient() {
  const [results, setResults] = useState<AircraftResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
  // Filter states
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [status, setStatus] = useState("");
  const [typeRegistrant, setTypeRegistrant] = useState("");

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    
    const params = new URLSearchParams();
    if (manufacturer) params.set("manufacturer", manufacturer);
    if (model) params.set("model", model);
    if (yearFrom) params.set("yearFrom", yearFrom);
    if (yearTo) params.set("yearTo", yearTo);
    if (status) params.set("status", status);
    if (typeRegistrant) params.set("typeRegistrant", typeRegistrant);
    
    try {
      const res = await fetch(`/api/aircraft/search?${params.toString()}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [manufacturer, model, yearFrom, yearTo, status, typeRegistrant]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 mb-1">
              Manufacturer
            </label>
            <input
              type="text"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              placeholder="e.g. CESSNA, PIPER, BEECHcraft"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500"
            />
          </div>
          
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 mb-1">
              Model
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. 172S, PA-28-181"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500"
            />
          </div>
          
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 mb-1">
              Year From
            </label>
            <input
              type="number"
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
              placeholder="2000"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500"
            />
          </div>
          
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 mb-1">
              Year To
            </label>
            <input
              type="number"
              value={yearTo}
              onChange={(e) => setYearTo(e.target.value)}
              placeholder="2024"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500"
            />
          </div>
          
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
            >
              <option value="">All</option>
              <option value="Valid">Valid</option>
              <option value="Deregistered">Deregistered</option>
              <option value="Expired">Expired</option>
              <option value="Reserved">Reserved</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 mb-1">
              Owner Type
            </label>
            <select
              value={typeRegistrant}
              onChange={(e) => setTypeRegistrant(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
            >
              <option value="">All</option>
              <option value="Individual">Individual</option>
              <option value="Corporation">Corporation</option>
              <option value="Partnership">Partnership</option>
              <option value="LLC">LLC</option>
              <option value="Government">Government</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={handleSearch}
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-emerald-500 py-3 font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search Aircraft"}
        </button>
      </div>

      {/* Results */}
      {searched && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-sm text-slate-400 mb-4">
            Found {results.length} aircraft
          </p>
          
          {results.length === 0 ? (
            <p className="text-slate-400">No aircraft found matching your criteria.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((aircraft) => (
                <div
                  key={aircraft.nNumber}
                  className="rounded-xl border border-slate-800 bg-slate-800/50 p-3 flex justify-between items-center"
                >
                  <div>
                    <span className="font-mono font-semibold text-emerald-400">
                      {aircraft.nNumber}
                    </span>
                    <span className="ml-3 text-slate-200">
                      {aircraft.manufacturer} {aircraft.model}
                    </span>
                  </div>
                  <div className="text-right text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      aircraft.status === 'Valid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {aircraft.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
