'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [planePosition, setPlanePosition] = useState(0);

  // Animate plane across screen
  useEffect(() => {
    const interval = setInterval(() => {
      setPlanePosition((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800">
      {/* Animated Hero */}
      <div className="relative overflow-hidden h-[400px] flex items-center justify-center">
        {/* Background plane trail */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-sky-500/30 to-transparent" />
        </div>
        
        {/* Flying plane */}
        <div 
          className="absolute text-4xl transition-all duration-[5000ms] ease-linear"
          style={{ left: `${planePosition}%`, top: '50%', transform: 'translateY(-50%)' }}
        >
          ✈️
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Find Cheap Fuel. <span className="text-sky-400">Plan Flights.</span>
            <br />
            <span className="text-2xl md:text-3xl text-slate-400">Manage Your Club.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-2">
            Quick flight planning that does the job. 
          </p>
          <p className="text-slate-500 mb-8">
            When you need more — ForeFlight's there. For quick planning — we're here.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/modules/fuel-saver"
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-8 py-3 font-semibold text-white transition text-lg"
            >
              ⛽ Try Fuel Saver
            </Link>
            <Link
              href="/modules/flying-club?demo=true"
              className="rounded-xl bg-sky-500 hover:bg-sky-400 px-8 py-3 font-semibold text-white transition text-lg"
            >
              ✈️ Try Flying Club
            </Link>
          </div>
        </div>
      </div>

      {/* Beta Notice */}
      <div className="mx-auto max-w-4xl px-6 py-6">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
          <span className="text-amber-400 font-medium">🧪 Beta — </span>
          <span className="text-slate-300">
            Both modules work. Free to try. Account needed to save.
          </span>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="mx-auto max-w-6xl px-6 pb-12">
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          
          {/* Fuel Saver */}
          <Link href="/modules/fuel-saver" className="group rounded-2xl border border-slate-700 bg-slate-800/50 p-6 hover:border-emerald-500/50 hover:bg-slate-800 transition">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">⛽</span>
              <div>
                <h3 className="text-xl font-bold text-white">Fuel Saver</h3>
                <p className="text-sm text-slate-400">Find cheapest 100LL along your route</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>✓ Search airports by name, ICAO, or city</li>
              <li>✓ Compare fuel prices</li>
              <li>✓ Plan routes with multiple stops</li>
              <li>✓ See fuel burn estimates</li>
            </ul>
          </Link>

          {/* Flying Club */}
          <Link href="/modules/flying-club?demo=true" className="group rounded-2xl border border-slate-700 bg-slate-800/50 p-6 hover:border-sky-500/50 hover:bg-slate-800 transition">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">✈️</span>
              <div>
                <h3 className="text-xl font-bold text-white">Flying Club</h3>
                <p className="text-sm text-slate-400">Manage shared aircraft & members</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>✓ Schedule bookings</li>
              <li>✓ Track flight hours</li>
              <li>✓ Manage members</li>
              <li>✓ Handle billing</li>
            </ul>
          </Link>
        </div>
      </div>

      {/* How It Works */}
      <div className="mx-auto max-w-4xl px-6 pb-12">
        <h2 className="text-2xl font-bold text-white text-center mb-8">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div className="p-4">
            <div className="text-3xl mb-2">🔍</div>
            <h3 className="font-semibold text-white mb-1">1. Search</h3>
            <p className="text-sm text-slate-400">Find airports or fuel along your planned route</p>
          </div>
          <div className="p-4">
            <div className="text-3xl mb-2">📝</div>
            <h3 className="font-semibold text-white mb-1">2. Plan</h3>
            <p className="text-sm text-slate-400">Build your flight with waypoints & estimates</p>
          </div>
          <div className="p-4">
            <div className="text-3xl mb-2">💾</div>
            <h3 className="font-semibold text-white mb-1">3. Save</h3>
            <p className="text-sm text-slate-400">Save plans (account required)</p>
          </div>
        </div>
      </div>

      {/* Data Privacy */}
      <div className="mx-auto max-w-4xl px-6 pb-12">
        <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-6 text-center">
          <h2 className="text-xl font-bold text-white mb-3">🔒 Your Data Is Yours</h2>
          <ul className="text-sm text-slate-400 space-y-1">
            <li>• We never sell your data</li>
            <li>• Fuel prices you share are public</li>
            <li>• Your flight plans stay private</li>
            <li>• No tracking, no ads, no BS</li>
          </ul>
        </div>
      </div>

      {/* Future Ideas */}
      <div className="mx-auto max-w-4xl px-6 pb-12">
        <h2 className="text-xl font-bold text-white text-center mb-4">Coming Later</h2>
        <div className="flex flex-wrap justify-center gap-3">
          <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-sm">Plane Search</span>
          <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-sm">Tail History</span>
          <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-sm">Plane Share</span>
          <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-sm">Flight Logs</span>
        </div>
      </div>

      {/* CTA */}
      <div className="mx-auto max-w-2xl px-6 pb-16 text-center">
        <p className="text-slate-400 mb-4">Ready to try?</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/modules/fuel-saver"
            className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-6 py-2 font-semibold text-white transition"
          >
            Start Free
          </Link>
          <Link
            href="/signup"
            className="rounded-xl border border-slate-600 hover:bg-slate-800 px-6 py-2 font-semibold text-white transition"
          >
            Create Account
          </Link>
        </div>
        
        {/* Tip Jar */}
        <p className="mt-8 text-sm text-slate-500">
          Like what we're building?{' '}
          <a 
            href="#" 
            className="text-sky-400 hover:underline"
            onClick={(e) => {
              e.preventDefault();
              alert('Tip jar coming soon! Thanks for the support.');
            }}
          >
            Leave a tip
          </a>
        </p>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-sm text-slate-600">
        <p>Built by a Dutch student. FAA data. No ads. No selling out.</p>
      </footer>
    </div>
  );
}
