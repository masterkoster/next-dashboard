import { Suspense } from "react";
import PlaneSearchClient from "./components/plane-search-client";

export default function PlaneSearchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Module</p>
          <h1 className="text-3xl font-semibold text-slate-50">Plane Search</h1>
          <p className="max-w-3xl text-sm text-slate-300">
            Search and filter through our database of US aircraft. Find planes by year, model, manufacturer, or engine type.
          </p>
        </header>

        <Suspense
          fallback={
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-sm text-slate-300">
              Loading Plane Search…
            </div>
          }
        >
          <PlaneSearchClient />
        </Suspense>
      </div>
    </div>
  );
}
