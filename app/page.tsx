'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuthModal } from './components/AuthModalContext';

const features = [
  { name: 'Fuel prices', free: 'Home state', pro: 'All 50 states', proPlus: 'All 50 states' },
  { name: 'E6B Flight Computer', free: true, pro: true, proPlus: true },
  { name: 'Training Tracker', free: true, pro: true, proPlus: true },
  { name: 'Weight & Balance', free: true, pro: true, proPlus: true },
  { name: 'NOTAMs & Weather', free: true, pro: true, proPlus: true },
  { name: 'Export to ForeFlight', free: true, pro: true, proPlus: true },
  { name: 'Export to PDF', free: true, pro: true, proPlus: true },
  { name: 'Digital Logbook', free: false, pro: false, proPlus: true },
  { name: 'Currency Tracking', free: false, pro: false, proPlus: true },
  { name: 'Flight Playback', free: false, pro: false, proPlus: true },
];

export default function LandingPage() {
  const [planePhase, setPlanePhase] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { openLoginModal } = useAuthModal();

  // Wait for client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

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
      return { 
        left: `${p * 5}%`, 
        top: '50%',
        transform: 'translateY(-50%) rotate(0deg) scaleX(1)',
        opacity: p > 5 ? 1 : p * 20
      };
    } else if (p < 30) {
      const loopP = (p - 20) / 10;
      return {
        left: '100%',
        top: `${50 - Math.sin(loopP * Math.PI * 2) * 30}%`,
        transform: `rotate(${loopP * 360}deg) scaleX(1)`,
        opacity: 1
      };
    } else if (p < 50) {
      return { left: '100%', top: '50%', transform: 'translateY(-50%)', opacity: 0 };
    } else {
      return { left: '-10%', top: '50%', transform: 'translateY(-50%)', opacity: 0 };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        


        {/* Animated Hero with fun plane */}
        <div className="relative h-[380px]">
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

          {/* Hero Content */}
          <div className="relative z-20 h-full flex flex-col items-center justify-center px-6 pt-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-sm text-emerald-400 mb-6">
              <span className="text-lg">✈️</span>
              <span>Built by pilots, for pilots</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 text-center">
              Find Cheap Fuel.{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
                Plan Flights.
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl font-bold text-slate-200 mb-4 text-center">
              Manage Your Club.
            </p>
            
            <p className="text-slate-400 mb-4 text-center max-w-lg text-lg">
              Quick flight planning that does the job.<br/>
              When you need more — ForeFlight&apos;s there.<br/>
              For quick planning — we&apos;re here.
            </p>
            
            {mounted && (
              <button
                onClick={() => openLoginModal()}
                className="text-sky-400 hover:text-sky-300 text-lg underline underline-offset-4 mb-2"
              >
                Log In
              </button>
            )}
            <p className="text-slate-500 text-sm">
              Ready to try a module? Just click on any below.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Cards - Glassmorphism Style */}
      <div className="mx-auto max-w-6xl px-6 pb-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Fuel Saver */}
          <Link href="/modules/fuel-saver" className="group rounded-3xl border border-slate-700/50 bg-slate-800/30 p-6 backdrop-blur-sm hover:border-emerald-500/50 hover:bg-slate-800/50 transition">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">⛽</span>
              <div>
                <h3 className="text-xl font-bold text-white">Fuel Saver</h3>
                <p className="text-sm text-slate-400">Find cheapest 100LL</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                Search airports by ICAO
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                Compare fuel prices
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                Plan multi-stop routes
              </li>
            </ul>
          </Link>

          {/* Flying Club */}
          <Link href="/modules/flying-club?demo=true" className="group rounded-3xl border border-slate-700/50 bg-slate-800/30 p-6 backdrop-blur-sm hover:border-sky-500/50 hover:bg-slate-800/50 transition">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">✈️</span>
              <div>
                <h3 className="text-xl font-bold text-white">Flying Club</h3>
                <p className="text-sm text-slate-400">Manage shared aircraft</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <span className="text-sky-400">✓</span>
                Schedule bookings
              </li>
              <li className="flex items-center gap-2">
                <span className="text-sky-400">✓</span>
                Track flight hours
              </li>
              <li className="flex items-center gap-2">
                <span className="text-sky-400">✓</span>
                Handle billing
              </li>
            </ul>
          </Link>

          {/* E6B Flight Computer */}
          <Link href="/modules/e6b" className="group rounded-3xl border border-slate-700/50 bg-slate-800/30 p-6 backdrop-blur-sm hover:border-amber-500/50 hover:bg-slate-800/50 transition">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🧮</span>
              <div>
                <h3 className="text-xl font-bold text-white">E6B</h3>
                <p className="text-sm text-slate-400">Aviation calculator</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <span className="text-amber-400">✓</span>
                Wind correction
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">✓</span>
                Fuel burn estimates
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">✓</span>
                Unit conversions
              </li>
            </ul>
          </Link>

          {/* Training Tracker */}
          <Link href="/modules/training" className="group rounded-3xl border border-slate-700/50 bg-slate-800/30 p-6 backdrop-blur-sm hover:border-purple-500/50 hover:bg-slate-800/50 transition">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🎓</span>
              <div>
                <h3 className="text-xl font-bold text-white">Training</h3>
                <p className="text-sm text-slate-400">Track PPL progress</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <span className="text-purple-400">✓</span>
                Progress bars
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-400">✓</span>
                Hour tracking
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-400">✓</span>
                Milestones
              </li>
            </ul>
          </Link>
        </div>
      </div>

      {/* Beta Notice */}
      <div className="mx-auto max-w-4xl px-6 pb-8">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center backdrop-blur-sm">
          <span className="text-amber-400 font-semibold text-lg">🧪 Beta — </span>
          <span className="text-slate-300 text-lg">
            Both modules work. Free to try. Account needed to save.
          </span>
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="mx-auto max-w-4xl px-6 pb-12">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Compare Plans</h2>
        <div className="rounded-3xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm overflow-hidden">
          <div className="grid grid-cols-4 border-b border-slate-700/50">
            <div className="p-4 text-left">
              <span className="text-slate-400 text-sm font-medium">Feature</span>
            </div>
            <div className="p-4 text-center">
              <span className="text-white font-bold">Free</span>
            </div>
            <div className="p-4 text-center">
              <span className="text-sky-400 font-bold">Pro</span>
              <span className="block text-xs text-slate-500">$3.99/mo</span>
            </div>
            <div className="p-4 text-center">
              <span className="text-emerald-400 font-bold">Pro+</span>
              <span className="block text-xs text-slate-500">$6.99/mo</span>
            </div>
          </div>
          {features.map((feature, i) => (
            <div key={i} className="grid grid-cols-4 border-b border-slate-700/30 last:border-0">
              <div className="p-3 text-left text-slate-400 text-sm">{feature.name}</div>
              <div className="p-3 text-center">
                {typeof feature.free === 'boolean' ? (
                  feature.free ? <span className="text-emerald-400">✓</span> : <span className="text-slate-600">—</span>
                ) : (
                  <span className="text-slate-300 text-sm">{feature.free}</span>
                )}
              </div>
              <div className="p-3 text-center">
                {typeof feature.pro === 'boolean' ? (
                  feature.pro ? <span className="text-emerald-400">✓</span> : <span className="text-slate-600">—</span>
                ) : (
                  <span className="text-slate-300 text-sm">{feature.pro}</span>
                )}
              </div>
              <div className="p-3 text-center">
                {typeof feature.proPlus === 'boolean' ? (
                  feature.proPlus ? <span className="text-emerald-400">✓</span> : <span className="text-slate-600">—</span>
                ) : (
                  <span className="text-slate-300 text-sm">{feature.proPlus}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Privacy */}
      <div className="mx-auto max-w-4xl px-6 pb-12">
        <div className="rounded-3xl border border-slate-700/50 bg-slate-800/30 p-8 text-center backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-4">🔒 Your Data Is Yours</h2>
          <ul className="text-slate-400 space-y-2">
            <li className="flex items-center justify-center gap-2">
              <span className="text-emerald-400">•</span>
              We never sell your data
            </li>
            <li className="flex items-center justify-center gap-2">
              <span className="text-emerald-400">•</span>
              Fuel prices you share are public
            </li>
            <li className="flex items-center justify-center gap-2">
              <span className="text-emerald-400">•</span>
              Your flight plans stay private
            </li>
          </ul>
        </div>
      </div>

      {/* CTA */}
      <div className="mx-auto max-w-2xl px-6 pb-16 text-center">
        <p className="text-slate-400 mb-4 text-lg">Ready to try?</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/modules/fuel-saver"
            className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-8 py-3 font-semibold text-white transition text-lg shadow-lg hover:shadow-emerald-500/25"
          >
            Start Free
          </Link>
          <Link
            href="/pricing"
            className="rounded-xl border border-slate-600 hover:bg-slate-800 px-8 py-3 font-semibold text-white transition"
          >
            View Pricing
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center">
        <p className="text-slate-500 mb-4">Built by a Dutch student. FAA data. No ads. No selling out.</p>
        <div className="flex justify-center gap-4">
          <Link href="/pricing" className="text-slate-500 hover:text-sky-400 transition">
            Pricing
          </Link>
          <span className="text-slate-700">|</span>
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
        </div>
      </footer>
    </div>
  );
}
