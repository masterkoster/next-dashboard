"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

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

type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

export default function PlaneSearchClient() {
  const [results, setResults] = useState<AircraftResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  
  // Filter states
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [status, setStatus] = useState("");
  const [typeRegistrant, setTypeRegistrant] = useState("");
  const [page, setPage] = useState(1);

  const handleSearch = useCallback(async (pageNum: number = 1) => {
    setLoading(true);
    setSearched(true);
    setPage(pageNum);
    
    const params = new URLSearchParams();
    if (manufacturer) params.set("manufacturer", manufacturer);
    if (model) params.set("model", model);
    if (yearFrom) params.set("yearFrom", yearFrom);
    if (yearTo) params.set("yearTo", yearTo);
    if (status) params.set("status", status);
    if (typeRegistrant) params.set("typeRegistrant", typeRegistrant);
    params.set("page", pageNum.toString());
    params.set("limit", "50");
    
    try {
      const res = await fetch(`/api/aircraft/search?${params.toString()}`);
      const data = await res.json();
      setResults(data.results || []);
      setPagination(data.pagination || null);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [manufacturer, model, yearFrom, yearTo, status, typeRegistrant]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && (!pagination || newPage <= pagination.totalPages)) {
      handleSearch(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
              placeholder="e.g. CESSNA, PIPER, BEECH"
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
          onClick={() => handleSearch(1)}
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-emerald-500 py-3 font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search Aircraft"}
        </button>
      </div>

      {/* Results */}
      {searched && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-400">
              {loading ? "Loading..." : (
                <>
                  Found <span className="font-semibold text-emerald-400">{pagination?.total?.toLocaleString() || 0}</span> aircraft
                  {pagination && pagination.totalPages > 1 && (
                    <span className="text-slate-500"> (page {pagination.page} of {pagination.totalPages})</span>
                  )}
                </>
              )}
            </p>
          </div>
          
          {results.length === 0 ? (
            <p className="text-slate-400">No aircraft found matching your criteria.</p>
          ) : (
            <>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {results.map((aircraft) => (
                  <Link
                    key={aircraft.nNumber}
                    href={`/modules/plane-carfax?n=${aircraft.nNumber}`}
                    className="rounded-xl border border-slate-800 bg-slate-800/50 p-3 flex justify-between items-center hover:bg-slate-800 transition"
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
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1 || loading}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>
                  
                  {/* Page numbers */}
                  <div className="flex gap-1">
                    {pagination.page > 2 && (
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={loading}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700"
                      >
                        1
                      </button>
                    )}
                    {pagination.page > 3 && (
                      <span className="px-2 py-2 text-slate-500">...</span>
                    )}
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(pagination.page - 2, pagination.totalPages - 4)) + i;
                      if (pageNum > pagination.totalPages) return null;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          disabled={loading}
                          className={`rounded-lg border bg-slate-800 px-3 py-2 text-sm ${
                            pageNum === page
                              ? 'border-emerald-500 text-emerald-400'
                              : 'border-slate-700 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    {pagination.page < pagination.totalPages - 2 && (
                      <span className="px-2 py-2 text-slate-500">...</span>
                    )}
                    {pagination.page < pagination.totalPages - 1 && (
                      <button
                        onClick={() => handlePageChange(pagination.totalPages)}
                        disabled={loading}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700"
                      >
                        {pagination.totalPages}
                      </button>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!pagination.hasMore || loading}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
