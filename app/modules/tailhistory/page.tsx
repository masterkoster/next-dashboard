import { Suspense } from "react";
import TailHistoryClient from "./components/tailhistory-client";

export default function TailHistoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Module</p>
          <h1 className="text-3xl font-semibold text-slate-50">TailHistory</h1>
          <p className="max-w-3xl text-sm text-slate-300">
            Search by N-Number and visualize the aircraft&apos;s key registration
            milestones on a 3D ribbon timeline. Data is served from your Azure
            Function backed by the FAA releasable dataset in Azure SQL.
          </p>
        </header>

        <Suspense
          fallback={
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-sm text-slate-300">
              Loading TailHistory...
            </div>
          }
        >
          <TailHistoryClient />
        </Suspense>
      </div>
    </div>
  );
}
