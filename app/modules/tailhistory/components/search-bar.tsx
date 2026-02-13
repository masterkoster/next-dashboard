'use client';

import { useState } from "react";

type SearchBarProps = {
  onSubmit: (nNumber: string) => void;
  loading?: boolean;
};

export function SearchBar({ onSubmit, loading }: SearchBarProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const sanitized = value.trim().toUpperCase();
    if (!sanitized) return;
    onSubmit(sanitized);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-slate-950/30 md:flex-row md:items-center"
    >
      <div className="flex-1">
        <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
          N-Number
        </label>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. N123AB"
          className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-1 ring-transparent transition focus:border-emerald-500/60 focus:ring-emerald-500/40"
          spellCheck={false}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Searching…" : "Search"}
      </button>
    </form>
  );
}
