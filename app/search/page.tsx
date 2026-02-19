'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

interface SearchResults {
  marketplace: any[];
  pilots: any[];
  flightPlans: any[];
  documents: any[];
}

const emptyResults: SearchResults = {
  marketplace: [],
  pilots: [],
  flightPlans: [],
  documents: [],
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>(emptyResults);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(emptyResults);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Search failed');
        }
        const data = await res.json();
        setResults({
          marketplace: data.marketplace || [],
          pilots: data.pilots || [],
          flightPlans: data.flightPlans || [],
          documents: data.documents || [],
        });
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error(err);
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query]);

  const resultCount = useMemo(() => {
    return (
      results.marketplace.length +
      results.pilots.length +
      results.flightPlans.length +
      results.documents.length
    );
  }, [results]);

  return (
    <div className="min-h-screen bg-slate-900 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Global Search</h1>
          <p className="text-slate-400">Search across marketplace listings, pilots, your flight plans, and documents.</p>
          <div className="mt-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pilots, aircraft, airports, documents, flight plans…"
              className="w-full max-w-3xl bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white text-lg"
              autoFocus
            />
          </div>
          <div className="text-xs text-slate-500 mt-2">Tip: Press Ctrl + K (Cmd + K) to jump here quickly.</div>
        </div>

        {query.trim().length < 2 ? (
          <div className="text-center text-slate-500">Start typing at least two characters to search.</div>
        ) : loading ? (
          <div className="text-center text-slate-400">Searching…</div>
        ) : error ? (
          <div className="text-center text-rose-300">{error}</div>
        ) : resultCount === 0 ? (
          <div className="text-center text-slate-400">No results yet. Try another search term.</div>
        ) : (
          <div className="space-y-10">
            <SearchSection
              title="Marketplace"
              items={results.marketplace}
              renderItem={(item) => (
                <Link href={`/modules/marketplace#${item.id}`} className="block">
                  <div className="text-white font-semibold">{item.title}</div>
                  <div className="text-xs text-slate-400">{item.aircraftType} • {item.airportIcao}</div>
                  <p className="text-sm text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                </Link>
              )}
            />

            <SearchSection
              title="Pilots"
              items={results.pilots}
              renderItem={(item) => (
                <Link href={`/modules/pilot-directory`} className="block">
                  <div className="text-white font-semibold">{item.user?.name || item.user?.username || 'Pilot'}</div>
                  <div className="text-xs text-slate-400">{item.homeAirport || 'Unknown airport'}</div>
                  <div className="text-xs text-emerald-300 mt-1">
                    {item.ratings?.join(', ') || 'No ratings listed'}
                  </div>
                  <p className="text-sm text-slate-400 mt-1 line-clamp-2">{item.bio || 'No bio provided.'}</p>
                </Link>
              )}
            />

            <SearchSection
              title="Your Flight Plans"
              items={results.flightPlans}
              renderItem={(item) => (
                <Link href={`/modules/fuel-saver?plan=${item.id}`} className="block">
                  <div className="text-white font-semibold">{item.name || `${item.departureIcao || '???'} → ${item.arrivalIcao || '???'}`}</div>
                  <div className="text-xs text-slate-400">{item.route?.slice(0, 80) || 'No route saved'}</div>
                  <div className="text-xs text-slate-500 mt-1">Updated {new Date(item.updatedAt).toLocaleDateString()}</div>
                </Link>
              )}
            />

            <SearchSection
              title="Your Documents"
              items={results.documents}
              renderItem={(item) => (
                <a href={item.fileUrl} className="block" target="_blank" rel="noopener noreferrer">
                  <div className="text-white font-semibold">{item.name}</div>
                  <div className="text-xs text-slate-400">{item.type}</div>
                  <p className="text-sm text-slate-400 mt-1 line-clamp-2">{item.description || 'No description'}</p>
                </a>
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface SearchSectionProps<T> {
  title: string;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function SearchSection<T>({ title, items, renderItem }: SearchSectionProps<T>) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">{title}</div>
      <div className="grid gap-3">
        {items.map((item, index) => (
          <div key={index} className="bg-slate-800 border border-slate-700 rounded-2xl p-4 hover:border-emerald-400 transition-colors">
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
}
