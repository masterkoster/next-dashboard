import { Suspense } from "react";
import TailHistoryClient from "../tailhistory/components/tailhistory-client";

export default function PlaneCarfaxPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Module</p>
          <h1 className="text-3xl font-semibold text-slate-50">Plane Carfax</h1>
          <p className="max-w-3xl text-sm text-slate-300">
            Pull FAA registration history, ownership, and engine details in a single 3D
            timeline—like Carfax, but for aircraft.
          </p>
        </header>

        <Suspense
          fallback={
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-sm text-slate-300">
              Loading Plane Carfax…
            </div>
          }
        >
          <TailHistoryClient />
        </Suspense>
      </div>
    </div>
  );
}
