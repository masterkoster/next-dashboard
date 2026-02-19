'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

const features = [
  { icon: '⛽', title: 'Fuel Saver', desc: 'Find cheapest 100LL along your route', color: 'emerald' },
  { icon: '✈️', title: 'Flying Club', desc: 'Manage aircraft, bookings & members', color: 'sky' },
  { icon: '🧮', title: 'E6B Computer', desc: 'Wind, fuel, speed calculations', color: 'amber' },
  { icon: '🎓', title: 'Training Tracker', desc: 'Track your PPL progress', color: 'purple' },
];

function WelcomeContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'verified' | 'already-verified' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  const success = searchParams.get('success');
  const error = searchParams.get('error');

  useEffect(() => {
    if (success === 'verified') {
      setStatus('verified');
      setMessage('Your email has been verified! Welcome to AviationHub.');
    } else if (success === 'already-verified') {
      setStatus('already-verified');
      setMessage('Your email is already verified. Welcome back!');
    } else if (error) {
      setStatus('error');
      setMessage('There was an issue with your verification link.');
    }
  }, [success, error]);

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-slate-800/50 border border-red-500/30 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
            <p className="text-slate-400 mb-6">{message}</p>
            <Link href="/" className="text-emerald-400 hover:underline">
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        
        <div className="relative mx-auto max-w-4xl px-6 py-16 text-center">
          {/* Success Animation */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500 animate-pulse">
              <span className="text-5xl">✅</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome to AviationHub!
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
            {status === 'verified' 
              ? "Your email is verified and you're all set. Here's what you can do:"
              : "You're already verified! Here's a quick overview of what AviationHub offers:"}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link
              href="/dashboard"
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-8 py-3 font-semibold text-white transition shadow-lg shadow-emerald-500/25"
            >
              Go to Dashboard →
            </Link>
            <button
              onClick={() => signIn()}
              className="rounded-xl border border-slate-600 hover:bg-slate-800 px-8 py-3 font-semibold text-white transition"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mx-auto max-w-5xl px-6 pb-16">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          Your Flight Planning Toolkit
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <Link
              key={i}
              href={`/modules/${feature.title.toLowerCase().replace(' ', '-')}`}
              className={`group rounded-2xl border border-slate-700 bg-slate-800/50 p-6 hover:border-${feature.color}-500/50 hover:bg-slate-800 transition`}
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl">{feature.icon}</span>
                <div>
                  <h3 className={`text-xl font-bold text-white group-hover:text-${feature.color}-400 transition`}>
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 mt-1">{feature.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* What You Get Section */}
      <div className="mx-auto max-w-4xl px-6 pb-16">
        <div className="rounded-2xl border border-slate-700 bg-slate-800/30 p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            What You Get With Your Free Account
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <ul className="space-y-3">
              {[
                'Save up to 5 flight plans',
                '6 waypoints per flight',
                'Compare fuel prices',
                'E6B flight computer',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <ul className="space-y-3">
              {[
                'Track PPL training progress',
                'Weight & balance calculations',
                'Export to GPX/PDF',
                'Flying Club access',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-400 mb-4">
              Want unlimited plans and advanced features?
            </p>
            <Link
              href="/pricing"
              className="inline-block rounded-xl bg-amber-500 hover:bg-amber-400 px-6 py-2 font-semibold text-white transition"
            >
              View Pro Plans
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center">
        <p className="text-slate-400">
          Ready to start planning?{' '}
          <Link href="/modules/fuel-saver" className="text-emerald-400 hover:underline">
            Try Fuel Saver now →
          </Link>
        </p>
      </footer>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-6">✈️</div>
            <h1 className="text-2xl font-bold text-white mb-4">Loading...</h1>
            <p className="text-slate-400">Please wait...</p>
          </div>
        </div>
      </div>
    }>
      <WelcomeContent />
    </Suspense>
  );
}
