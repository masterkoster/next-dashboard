'use client';

import { Suspense } from 'react';
import { AircraftModel } from '../components/three/aircraft-model';

export default function ModelViewerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">3D Viewer</p>
          <h1 className="text-3xl font-semibold text-slate-50">Aircraft Model</h1>
          <p className="max-w-3xl text-sm text-slate-300">
            Procedural Ghost Aircraft generated from FAA specifications
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Cessna 172 Style */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h2 className="font-semibold text-slate-100">Cessna 172 (GA Single)</h2>
              <p className="text-xs text-slate-400">Single Engine • 180 HP</p>
            </div>
            <div className="h-80">
              <AircraftModel
                nNumber="N12345"
                manufacturer="Cessna"
                model="172 Skyhawk"
                length={27}
                wingspan={36}
                engineCount={1}
              />
            </div>
          </div>

          {/* Boeing 737 Style */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h2 className="font-semibold text-slate-100">Boeing 737-800 (Commercial)</h2>
              <p className="text-xs text-slate-400">Twin Engine • 12000 lbs thrust</p>
            </div>
            <div className="h-80">
              <AircraftModel
                nNumber="N56789"
                manufacturer="Boeing"
                model="737-824"
                length={129}
                wingspan={117}
                engineCount={2}
              />
            </div>
          </div>

          {/* Gulfstream Style */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h2 className="font-semibold text-slate-100">Gulfstream G650 (Business Jet)</h2>
              <p className="text-xs text-slate-400">Twin Engine • Long Range</p>
            </div>
            <div className="h-80">
              <AircraftModel
                nNumber="N99999"
                manufacturer="Gulfstream"
                model="G650"
                length={90}
                wingspan={93}
                engineCount={2}
              />
            </div>
          </div>

          {/* Embraer E-Jet */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h2 className="font-semibold text-slate-100">Embraer E190 (Regional Jet)</h2>
              <p className="text-xs text-slate-400">Twin Engine • 100+ PAX</p>
            </div>
            <div className="h-80">
              <AircraftModel
                nNumber="N11111"
                manufacturer="Embraer"
                model="E190"
                length={98}
                wingspan={94}
                engineCount={2}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
