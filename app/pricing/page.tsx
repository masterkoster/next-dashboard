'use client';

import Link from 'next/link';
import { useState } from 'react';

const features = [
  { name: 'Waypoints per flight', free: '6', pro: 'Unlimited', proPlus: 'Unlimited' },
  { name: 'Saved flight plans', free: '5', pro: 'Unlimited', proPlus: 'Unlimited' },
  { name: 'Flying clubs', free: '1', pro: 'Unlimited', proPlus: 'Unlimited' },
  { name: 'Aircraft profiles', free: '3', pro: 'Unlimited', proPlus: 'Unlimited' },
  { name: 'Fuel prices', free: 'Home state', pro: 'All 50 states', proPlus: 'All 50 states' },
  { name: 'E6B Flight Computer', free: true, pro: true, proPlus: true },
  { name: 'Training Tracker', free: true, pro: true, proPlus: true },
  { name: 'Weight & Balance', free: true, pro: true, proPlus: true },
  { name: 'NOTAMs & Weather', free: true, pro: true, proPlus: true },
  { name: 'Export to ForeFlight', free: true, pro: true, proPlus: true },
  { name: 'Export to Garmin Pilot', free: true, pro: true, proPlus: true },
  { name: 'Export to PDF', free: true, pro: true, proPlus: true },
  { name: 'Digital Logbook', free: false, pro: false, proPlus: true },
  { name: 'Currency Tracking (BFR, IPC, night)', free: false, pro: false, proPlus: true },
  { name: 'Hour Analytics & Graphs', free: false, pro: false, proPlus: true },
  { name: 'Post-Flight Playback', free: false, pro: false, proPlus: true },
  { name: 'Calendar Sync (Google/Apple)', free: false, pro: false, proPlus: true },
  { name: 'Email Flight Plans', free: false, pro: false, proPlus: true },
  { name: 'Priority support', free: false, pro: false, proPlus: true },
  { name: 'Early access to new features', free: false, pro: false, proPlus: true },
];

const faqs = [
  {
    q: 'Can I switch plans anytime?',
    a: 'Yes! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect at your next billing cycle.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards, PayPal, and Apple Pay. All payments are processed securely through Stripe.',
  },
  {
    q: 'Is there a free trial for Pro?',
    a: 'We offer a 7-day free trial for Pro. No credit card required to start. You\'ll only be charged if you decide to continue.',
  },
  {
    q: 'What happens to my data if I downgrade?',
    a: 'Your data is always safe. If you downgrade from Pro, you\'ll keep your first 5 flight plans and 3 aircraft profiles. Everything else is archived and restored if you upgrade again.',
  },
  {
    q: 'Is my flight data private?',
    a: 'Absolutely. We never sell your data. Your flight plans and personal information stay private. Fuel prices you contribute are shared publicly to help other pilots.',
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        
        <div className="relative mx-auto max-w-6xl px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-sm text-emerald-400 mb-6">
            <span className="text-lg">✈️</span>
            <span>Built by pilots, for pilots</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Simple Pricing for{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
              Real Pilots
            </span>
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
            Start free forever, or unlock unlimited power with Pro. Go Pro+ for advanced features.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-slate-800/50 rounded-full p-1.5 border border-slate-700">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition ${
                billingCycle === 'monthly'
                  ? 'bg-emerald-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-emerald-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="text-xs bg-amber-500 text-black px-2 py-0.5 rounded-full font-bold">
                -17%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Free Plan */}
          <div className="relative rounded-3xl border border-slate-700 bg-slate-800/30 p-8 backdrop-blur-sm">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
              <p className="text-slate-400">Perfect for student pilots & casual flyers</p>
            </div>
            
            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-white">$0</span>
                <span className="text-slate-400">/forever</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                '6 waypoints per flight',
                '5 saved flight plans',
                '1 Flying Club',
                '3 Aircraft profiles',
                'E6B & Training Tracker',
                'Home state fuel prices',
                'Export to GPX/PDF/ForeFlight',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href="/modules/fuel-saver"
              className="block w-full text-center rounded-xl border border-slate-600 bg-slate-700/50 hover:bg-slate-700 px-6 py-3 font-semibold text-white transition"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="relative rounded-3xl border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-500/5 to-sky-500/5 p-8 backdrop-blur-sm shadow-lg shadow-emerald-500/10">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-1.5 text-sm font-bold text-white shadow-lg">
                <span>⭐</span> Most Popular
              </span>
            </div>

            <div className="mb-6 mt-2">
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <p className="text-slate-400">For serious pilots & flying clubs</p>
            </div>
            
            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-white">
                  {billingCycle === 'monthly' ? '$3.99' : '$39.99'}
                </span>
                <span className="text-slate-400">
                  /{billingCycle === 'monthly' ? 'mo' : 'year'}
                </span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-sm text-emerald-400 mt-1">
                  Save $7.89 per year
                </p>
              )}
            </div>

            <ul className="space-y-4 mb-8">
              {[
                'Unlimited waypoints',
                'Unlimited flight plans',
                'Unlimited Flying Clubs',
                'Unlimited Aircraft',
                'All 50 states fuel prices',
                'E6B & Training Tracker',
                'Priority support',
                'Early access to features',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 px-6 py-3 font-semibold text-white transition shadow-lg shadow-emerald-500/25"
            >
              Start 7-Day Free Trial
            </button>
            <p className="text-center text-xs text-slate-500 mt-3">
              No credit card required
            </p>
          </div>

          {/* Pro+ Plan */}
          <div className="relative rounded-3xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-8 backdrop-blur-sm shadow-lg shadow-amber-500/10">
            {/* Best Value Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1.5 text-sm font-bold text-white shadow-lg">
                <span>🚀</span> Best Value
              </span>
            </div>

            <div className="mb-6 mt-2">
              <h3 className="text-2xl font-bold text-white mb-2">Pro+</h3>
              <p className="text-slate-400">For pilots who want it all</p>
            </div>
            
            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-white">
                  {billingCycle === 'monthly' ? '$6.99' : '$69.99'}
                </span>
                <span className="text-slate-400">
                  /{billingCycle === 'monthly' ? 'mo' : 'year'}
                </span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-sm text-amber-400 mt-1">
                  Save $13.89 per year
                </p>
              )}
            </div>

            <ul className="space-y-4 mb-8">
              {[
                'Everything in Pro',
                'Digital Logbook',
                'Currency Tracking (BFR, IPC)',
                'Hour Analytics & Graphs',
                'Post-Flight Playback',
                'Calendar Sync',
                'Email Flight Plans',
                'Premium support',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className={i === 0 ? 'text-amber-400 font-medium' : ''}>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 px-6 py-3 font-semibold text-white transition shadow-lg shadow-amber-500/25"
            >
              Upgrade to Pro+
            </button>
            <p className="text-center text-xs text-slate-500 mt-3">
              Zero external costs
            </p>
          </div>
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Compare All Features
        </h2>

        <div className="rounded-2xl border border-slate-700 bg-slate-800/30 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-4 bg-slate-800/50 border-b border-slate-700">
            <div className="px-6 py-4 text-left">
              <span className="text-sm font-medium text-slate-400">Feature</span>
            </div>
            <div className="px-6 py-4 text-center border-l border-slate-700">
              <span className="text-sm font-medium text-slate-300">Free</span>
            </div>
            <div className="px-6 py-4 text-center border-l border-slate-700 bg-emerald-500/10">
              <span className="text-sm font-medium text-emerald-400">Pro</span>
            </div>
            <div className="px-6 py-4 text-center border-l border-slate-700 bg-amber-500/10">
              <span className="text-sm font-medium text-amber-400">Pro+</span>
            </div>
          </div>

          {/* Table Rows */}
          {features.map((feature, i) => (
            <div
              key={i}
              className={`grid grid-cols-4 border-b border-slate-700/50 last:border-0 ${
                i % 2 === 0 ? 'bg-slate-800/20' : ''
              }`}
            >
              <div className="px-6 py-4">
                <span className="text-sm text-slate-300">{feature.name}</span>
              </div>
              <div className="px-6 py-4 text-center border-l border-slate-700/50 flex items-center justify-center">
                {typeof feature.free === 'boolean' ? (
                  feature.free ? (
                    <span className="text-emerald-400 text-lg">✓</span>
                  ) : (
                    <span className="text-slate-600 text-lg">—</span>
                  )
                ) : (
                  <span className="text-sm text-slate-300">{feature.free}</span>
                )}
              </div>
              <div className="px-6 py-4 text-center border-l border-slate-700/50 bg-emerald-500/5 flex items-center justify-center">
                {typeof feature.pro === 'boolean' ? (
                  feature.pro ? (
                    <span className="text-emerald-400 text-lg">✓</span>
                  ) : (
                    <span className="text-slate-600 text-lg">—</span>
                  )
                ) : (
                  <span className="text-sm text-emerald-300 font-medium">{feature.pro}</span>
                )}
              </div>
              <div className="px-6 py-4 text-center border-l border-slate-700/50 bg-amber-500/5 flex items-center justify-center">
                {typeof feature.proPlus === 'boolean' ? (
                  feature.proPlus ? (
                    <span className="text-amber-400 text-lg">✓</span>
                  ) : (
                    <span className="text-slate-600 text-lg">—</span>
                  )
                ) : (
                  <span className="text-sm text-amber-300 font-medium">{feature.proPlus}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mx-auto max-w-3xl px-6 pb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-700 bg-slate-800/30 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-6 py-4 flex items-center justify-between text-left"
              >
                <span className="font-medium text-white">{faq.q}</span>
                <svg
                  className={`w-5 h-5 text-slate-400 transition-transform ${
                    openFaq === i ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-4">
                  <p className="text-slate-400">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="mx-auto max-w-4xl px-6 pb-20">
        <div className="rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-12 text-center backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Upgrade Your Flying?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Join thousands of pilots using AviationHub to plan smarter, fly safer, and save money on fuel.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/modules/fuel-saver"
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-8 py-3 font-semibold text-white transition shadow-lg shadow-emerald-500/25"
            >
              Start Free
            </Link>
            <Link
              href="/modules/flying-club?demo=true"
              className="rounded-xl border border-slate-600 hover:bg-slate-800 px-8 py-3 font-semibold text-white transition"
            >
              Try Flying Club
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center">
        <Link href="/" className="text-slate-400 hover:text-white transition">
          ← Back to Home
        </Link>
      </footer>
    </div>
  );
}
