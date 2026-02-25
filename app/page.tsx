'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';

const features = [
  { icon: '⛽', title: 'Fuel Saver', desc: 'Find cheapest 100LL along your route', color: 'emerald', href: '/fuel-saver' },
  { icon: '✈️', title: 'Flying Club', desc: 'Manage aircraft, bookings & members', color: 'sky', href: '/flying-club' },
  { icon: '🧮', title: 'E6B Computer', desc: 'Wind, fuel, speed calculations', color: 'amber', href: '/modules/e6b' },
  { icon: '🎓', title: 'Training Tracker', desc: 'Track your PPL progress', color: 'purple', href: '/modules/training' },
];

function LandingContent() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [status_, setStatus] = useState<'loading' | 'verified' | 'already-verified' | 'error' | 'normal'>('loading');

  const success = searchParams.get('success');
  const error = searchParams.get('error');

  useEffect(() => {
    if (success === 'verified') {
      setStatus('verified');
    } else if (success === 'already-verified') {
      setStatus('already-verified');
    } else if (error) {
      setStatus('error');
    } else {
      setStatus('normal');
    }
  }, [success, error]);

  if (status === 'loading' || status_ === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (status_ === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-slate-800/50 border border-red-500/30 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
            <p className="text-slate-400 mb-6">There was an issue with your verification link.</p>
            <Link href="/" className="text-emerald-400 hover:underline">Go to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  const isVerified = status_ === 'verified' || status_ === 'already-verified';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        
        <div className="relative mx-auto max-w-4xl px-6 py-16 text-center">
          {isVerified && (
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500 animate-pulse">
                <span className="text-5xl">✅</span>
              </div>
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome to AviationHub!
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
            {isVerified 
              ? "Your email is verified and you're all set. Here's what you can do:" 
              : "Your all-in-one aviation toolkit. Plan flights, track training, manage your flying club, and more."}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {session ? (
              <Link
                href="/dashboard"
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-8 py-3 font-semibold text-white transition shadow-lg shadow-emerald-500/25"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
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
              </>
            )}
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
              href={feature.href}
              className="group rounded-2xl border border-slate-700 bg-slate-800/50 p-6 hover:border-slate-500 hover:bg-slate-800 transition"
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl">{feature.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-slate-300 transition">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 mt-1">{feature.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 py-8 text-center">
        <p className="text-slate-500 text-sm">© 2026 AviationHub. All rights reserved.</p>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LandingContent />
    </Suspense>
  );
}
