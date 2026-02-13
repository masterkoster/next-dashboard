'use client';

import { useCallback, useState, useTransition } from "react";
import { checkTailHistory, TailHistoryActionResult } from "../actions";
import { SearchBar } from "./search-bar";
import { Timeline3D, TailHistoryRecord } from "./timeline-3d";

export default function TailHistoryClient() {
  const [isPending, startTransition] = useTransition();
  const [record, setRecord] = useState<TailHistoryRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | undefined>(undefined);
  const [showBuyModal, setShowBuyModal] = useState(false);

  const handleSubmit = useCallback((value: string) => {
    startTransition(async () => {
      setError(null);
      const result: TailHistoryActionResult = await checkTailHistory(value);
      if (result.needsCredits) {
        setShowBuyModal(true);
        setRecord(null);
        setRemaining(result.remainingCredits);
        setError(result.error ?? "No credits remaining.");
        return;
      }
      if (result.error) {
        setError(result.error);
        setRecord(null);
        return;
      }
      setRecord(result.data as TailHistoryRecord);
      setRemaining(result.remainingCredits);
    });
  }, []);

  return (
    <div className="space-y-4">
      <SearchBar onSubmit={handleSubmit} loading={isPending} />

      {remaining !== undefined && (
        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-slate-200">
          Remaining Credits: {remaining}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-800 bg-rose-950/50 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      {showBuyModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl shadow-black/50">
            <h3 className="text-lg font-semibold text-slate-50">Buy More Credits</h3>
            <p className="mt-2 text-sm text-slate-300">
              You’ve run out of credits. Purchase more to keep exploring TailHistory.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowBuyModal(false)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200"
              >
                Close
              </button>
              <button
                onClick={() => setShowBuyModal(false)}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
              >
                Buy Credits
              </button>
            </div>
          </div>
        </div>
      )}

      {record && (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Aircraft</p>
              <h2 className="text-xl font-semibold text-slate-50">{record.nNumber}</h2>
              <p className="text-sm text-slate-300">
                {record.manufacturer} {record.model} · SN {record.serialNumber}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-1 text-sm text-slate-200">
              <div className="flex justify-between"><span>Status</span><span className="text-slate-300">{record.status ?? "Unknown"}</span></div>
              <div className="flex justify-between"><span>Airworthiness</span><span className="text-slate-300">{record.airworthinessDate ?? "Unknown"}</span></div>
              <div className="flex justify-between"><span>Last Action</span><span className="text-slate-300">{record.lastActionDate ?? "Unknown"}</span></div>
              <div className="flex justify-between"><span>Owner</span><span className="text-slate-300">{record.ownerName ?? "Unknown"}</span></div>
              <div className="flex justify-between"><span>Registrant</span><span className="text-slate-300">{record.typeRegistrant ?? "Unknown"}</span></div>
              <div className="flex justify-between"><span>Engine</span><span className="text-slate-300">{record.engineManufacturer ?? "?"} {record.engineModel ?? ""}</span></div>
              <div className="flex justify-between"><span>Engine Count</span><span className="text-slate-300">{record.engineCount ?? "?"}</span></div>
            </div>
          </div>

          <Timeline3D record={record} />
        </div>
      )}

      {!record && !isPending && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-sm text-slate-300">
          Enter an N-Number to retrieve its history and render the 3D timeline.
        </div>
      )}
    </div>
  );
}
