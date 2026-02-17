'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [planePhase, setPlanePhase] = useState(0);

  // Fun plane animation phases
  useEffect(() => {
    const interval = setInterval(() => {
      setPlanePhase((prev) => (prev + 1) % 100);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  // Calculate plane position with fun loop
  const getPlaneStyle = () => {
    const p = planePhase;
    if (p < 20) {
      // Coming in from left
      return { 
        left: `${p * 5}%`, 
        top: '50%',
        transform: 'translateY(-50%) rotate(0deg) scaleX(1)',
        opacity: p > 5 ? 1 : p * 20
      };
    } else if (p < 30) {
      // Loop!
      const loopP = (p - 20) / 10;
      return {
        left: '100%',
        top: `${50 - Math.sin(loopP * Math.PI * 2) * 30}%`,
        transform: `rotate(${loopP * 360}deg) scaleX(1)`,
        opacity: 1
      };
    } else if (p < 50) {
      // Going back
      return { left: '100%', top: '50%', transform: 'translateY(-50%)', opacity: 0 };
    } else {
      // Pause before restart
      return { left: '-10%', top: '50%', transform: 'translateY(-50%)', opacity: 0 };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 overflow-hidden">
      {/* Header with Login */}
      <div className="absolute top-4 right-4 z-30">
        <Link
          href="/login"
          className="rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-2 text-sm font-medium text-white transition border border-slate-700"
        >
          Log In
        </Link>
      </div>

      {/* Animated Hero with fun plane */}
      <div className="relative h-[350px]">
        {/* Sky background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent" />
        
        {/* Clouds */}
        <div className="absolute top-8 left-4 text-6xl opacity-30 animate-pulse">☁️</div>
        <div className="absolute top-16 right-20 text-5xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}>☁️</div>
        <div className="absolute top-24 left-1/3 text-4xl opacity-15 animate-pulse" style={{animationDelay: '2s'}}>☁️</div>
        
        {/* Fun flying plane */}
        <div 
          className="absolute text-6xl transition-all duration-75 ease-linear z-10 filter drop-shadow-lg"
          style={getPlaneStyle()}
        >
          <span className="inline-block transform scale-x-[-1]">✈️</span>
        </div>
        
        {/* Trail effect */}
        <div 
          className="absolute h-1 bg-gradient-to-r from-transparent via-sky-400/40 to-transparent"
          style={{
            left: '0%',
            right: '20%',
            top: '50%',
            transform: 'translateY(-50%)',
            width: planePhase > 10 && planePhase < 50 ? `${(planePhase - 10) * 2}%` : '0%',
            opacity: planePhase > 10 && planePhase < 50 ? 1 : 0,
            transition: 'all 0.1s'
          }}
        />

        {/* Hero Content - centered */}
        <div className="relative z-20 h-full flex flex-col items-center justify-center px-6">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 text-center">
            Find Cheap Fuel. <span className="text-sky-400">Plan Flights.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 mb-2">
            Manage Your Club.
          </p>
          <p className="text-slate-500 mb-6 text-center max-w-lg">
            Quick flight planning that does the job. <br/>
            When you need more — ForeFlight's there. For quick planning — we're here.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/modules/fuel-saver"
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-8 py-3 font-semibold text-white transition text-lg shadow-lg hover:shadow-emerald-500/25"
            >
              ⛽ Try Fuel Saver
            </Link>
            <Link
              href="/modules/flying-club?demo=true"
              className="rounded-xl bg-sky-500 hover:bg-sky-400 px-8 py-3 font-semibold text-white transition text-lg shadow-lg hover:shadow-sky-500/25"
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
          <a href="#" className="text-sky-400 hover:underline">
            Leave a tip
          </a>
        </p>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-sm text-slate-600">
        <p>Built by a Dutch student. FAA data. No ads. No selling out.</p>
        <div className="flex justify-center gap-4 mt-3">
          <button 
            onClick={() => {
              const desc = prompt('Describe the error:');
              if (desc) {
                fetch('/api/error-report', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    title: 'User Reported Error',
                    description: desc,
                    url: window.location.href,
                  }),
                }).then(() => alert('Error report submitted. Thank you!')).catch(() => alert('Failed to submit report'));
              }
            }}
            className="text-slate-500 hover:text-sky-400 transition"
          >
            Report Error
          </button>
          <span className="text-slate-700">|</span>
          <Link href="/admin" className="text-slate-500 hover:text-sky-400 transition">
            Admin
          </Link>
        </div>
      </footer>
    </div>
  );
}
