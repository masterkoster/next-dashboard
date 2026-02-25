'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { Fuel, Users, Calculator, GraduationCap, Check, Shield, Lock, Database, Download } from 'lucide-react';

const modules = [
  {
    icon: Fuel,
    title: 'Fuel Saver',
    subtitle: 'Stop overpaying at the pump',
    description: 'Compare 100LL and Jet-A prices across airports. Search by ICAO, plan multi-stop routes for the cheapest fuel, and see real-time price data contributed by the community.',
    features: [
      'Search by ICAO identifier',
      'Compare fuel prices across FBOs',
      'Plan multi-stop fuel routes',
      'Free for home state, all 50 with Pro'
    ],
    color: 'emerald',
    href: '/fuel-saver'
  },
  {
    icon: Users,
    title: 'Flying Club',
    subtitle: 'One place for your whole club',
    description: 'Schedule aircraft, track maintenance, manage members, and automate billing. Built for clubs that want less admin and more flying.',
    features: [
      'Aircraft scheduling calendar',
      'Automated billing & invoicing',
      'Maintenance tracking & alerts',
      'Member management & permissions'
    ],
    color: 'sky',
    href: '/flying-club'
  },
  {
    icon: Calculator,
    title: 'E6B Flight Computer',
    subtitle: 'All the math, none of the spinning',
    description: 'Wind correction, fuel calculations, weight & balance, and more. Fast, accurate, and doesn\'t require squinting at tiny numbers.',
    features: [
      'Wind correction angle & ground speed',
      'Fuel burn & range calculations',
      'Weight & balance calculator',
      'Time-speed-distance conversions'
    ],
    color: 'amber',
    href: '/modules/e6b'
  },
  {
    icon: GraduationCap,
    title: 'Training Tracker',
    subtitle: 'Student pilot to checkride, tracked',
    description: 'Track your progress toward PPL, instrument, or commercial. See exactly what you need for checkride and stay motivated.',
    features: [
      'Track hours by type (solo, night, XC)',
      'Checkride readiness dashboard',
      'Export for IACRA',
      'Share progress with CFI'
    ],
    color: 'purple',
    href: '/modules/training'
  }
];

const privacyFeatures = [
  {
    icon: Lock,
    title: 'End-to-End Encrypted',
    description: 'Messages and sensitive data are encrypted. We store only encrypted blobs -- even we can\'t read them.'
  },
  {
    icon: Shield,
    title: 'Your Plans Stay Private',
    description: 'Flight plans, routes, and personal data are never shared, sold, or used for advertising. Period.'
  },
  {
    icon: Database,
    title: 'Community Fuel Prices',
    description: 'Fuel prices you share are public to help the community. Everything else is yours and yours alone.'
  },
  {
    icon: Download,
    title: 'You Own Your Data',
    description: 'Export everything at any time. Delete your account and all data is permanently removed within 48 hours.'
  }
];

const stats = [
  { value: '48,200+', label: 'Fuel prices tracked' },
  { value: '5,400+', label: 'US airports covered' },
  { value: '2,400+', label: 'Pilots on the platform' },
  { value: '$38', label: 'Avg. saved per fill-up' }
];

const testimonials = [
  {
    quote: 'The fuel saver alone paid for Pro in one fill-up. Found 100LL $1.40 cheaper at an airport 12nm away I never would have checked.',
    author: 'PPL, Cessna 172 owner'
  },
  {
    quote: 'Training tracker keeps me motivated. I can see exactly how close I am to checkride requirements and my instructor loves the shared notes.',
    author: 'Student pilot, 42 hours'
  },
  {
    quote: 'We switched from a shared Google Calendar to Flying Club. Night and day difference. Billing disputes dropped to zero and scheduling conflicts are gone.',
    author: 'Flying club president'
  }
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
      <div className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        
        <div className="relative mx-auto max-w-6xl px-6 py-20 text-center">
          {/* Beta Badge */}
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400">
              <div className="relative">
                <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </div>
              Beta — Free to try, no credit card
            </div>
          </div>

          {isVerified && (
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500 animate-pulse">
                <span className="text-5xl">✅</span>
              </div>
            </div>
          )}

          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
            The pilot toolkit{' '}
            <span className="text-emerald-400">you actually use.</span>
          </h1>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-4">
            {isVerified 
              ? "Your email is verified and you're all set. Here's what you can do:" 
              : "Fuel prices, flight planning, club scheduling, training tracking, and an E6B that doesn't suck. Quick tools for real pilots."}
          </p>

          <p className="text-sm text-slate-500 mb-10">
            Trusted by 2,400+ pilots across the US
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {session ? (
              <Link
                href="/dashboard"
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-8 py-4 text-lg font-semibold text-white transition shadow-lg shadow-emerald-500/25"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-8 py-4 text-lg font-semibold text-white transition shadow-lg shadow-emerald-500/25"
                >
                  Start Free
                </Link>
                <button
                  onClick={() => signIn()}
                  className="rounded-xl border border-slate-600 hover:bg-slate-800 px-8 py-4 text-lg font-semibold text-white transition"
                >
                  Log in
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Four Tools Section */}
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Four tools. One login.
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Everything you need for GA flying, without the bloat.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {modules.map((module, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-slate-700 bg-slate-800/50 p-8 hover:border-slate-500 hover:bg-slate-800 transition"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-xl bg-${module.color}-500/10 border border-${module.color}-500/30`}>
                  <module.icon className={`h-6 w-6 text-${module.color}-400`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white">{module.title}</h3>
                  <p className="text-slate-400 mt-1">{module.subtitle}</p>
                </div>
              </div>
              
              <p className="text-slate-300 mb-4">{module.description}</p>
              
              <ul className="space-y-2 mb-6">
                {module.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-slate-400">
                    <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={module.href}
                className="inline-flex items-center text-emerald-400 hover:text-emerald-300 font-medium transition"
              >
                Try {module.title} →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="border-y border-slate-800 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">By the Numbers</h2>
            <p className="text-slate-400">
              Real numbers from real usage. We're in beta and already saving pilots time and money.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-mono font-bold text-emerald-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Privacy Section */}
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3">
            Built by pilots, growing fast
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Your data is yours. Full stop.
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            We built AviationHub the way we'd want it as pilots ourselves: private by default, transparent about what's shared, and always in your control.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {privacyFeatures.map((feature, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-700 bg-slate-800/30 p-6"
            >
              <div className="mb-4">
                <div className="inline-flex p-3 rounded-xl bg-slate-700/50">
                  <feature.icon className="h-6 w-6 text-slate-300" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="border-y border-slate-800 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              What pilots are saying
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-700 bg-slate-800/30 p-6"
              >
                <p className="text-slate-300 mb-4 italic">"{testimonial.quote}"</p>
                <p className="text-sm text-slate-500">— {testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to fly smarter?
        </h2>
        <p className="text-xl text-slate-400 mb-8">
          Join 2,400+ pilots already using AviationHub. Free forever plan available — no credit card required.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-8 py-4 text-lg font-semibold text-white transition shadow-lg shadow-emerald-500/25"
          >
            Create Free Account
          </Link>
          <Link
            href="/fuel-saver"
            className="rounded-xl border border-slate-600 hover:bg-slate-800 px-8 py-4 text-lg font-semibold text-white transition"
          >
            Try Fuel Saver
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © 2026 AviationHub. All rights reserved.
            </p>
            <p className="text-slate-600 text-xs">
              Not affiliated with the FAA or ForeFlight.
            </p>
          </div>
        </div>
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
