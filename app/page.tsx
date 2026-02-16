import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AviationHub - Your All-in-One Aviation Platform",
  description: "The all-in-one platform for pilots and aviation businesses. Search aircraft, find cheap fuel prices, manage your flying group, and connect with others in the aviation community.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800">
      {/* Hero */}
      <div className="mx-auto max-w-6xl px-6 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
          Your Aviation Data, <span className="text-sky-400">Unified</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
          The all-in-one platform for pilots and aviation businesses. 
          Search aircraft, manage your flying group, and connect with others - 
          use individual modules or get the full experience with synced data.
        </p>
      </div>

      {/* Current Status Overview */}
      <div className="mx-auto max-w-4xl px-6 pb-8">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6">
          <h2 className="text-xl font-semibold text-amber-400 mb-2">Where We Are Right Now</h2>
          <p className="text-slate-300 mb-4">
            We're building something ambitious - a unified aviation platform where all your data flows together. 
            Some modules are ready to use, some are preview demos of what's coming, and others are on the roadmap. 
            Everything connects: flight logs sync to currency tracking, which notifies you of maintenance, 
            which connects you to services, which finds fuel along your route.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-xl bg-sky-500 px-6 py-2 font-semibold text-white hover:bg-sky-400 transition"
            >
              Create Account
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-slate-500 px-6 py-2 font-semibold text-white hover:bg-slate-800 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Available Now - Ready to use */}
      <div className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="mb-2 text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-emerald-400">◆</span> Available Now
        </h2>
        <p className="text-slate-400 mb-6">Ready to use - click any module to try it</p>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto justify-items-center">
          
          {/* Flying Club - Beta */}
          <Link href="/modules/flying-club?demo=true" className="group block rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg hover:border-emerald-500/50 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">✈️</span>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                BETA
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">Flying Club</h3>
            <p className="mt-2 text-sm text-slate-400">
              Complete flight group management. Schedule bookings, track hours, manage aircraft, 
              handle billing, and coordinate with members.
            </p>
            <ul className="mt-3 space-y-1 text-xs text-slate-500">
              <li>✓ Book flights & manage schedule</li>
              <li>✓ Track flight hours & hobbs</li>
              <li>✓ Aircraft maintenance tracking</li>
              <li>✓ Member billing & invoicing</li>
            </ul>
          </Link>

          {/* Plane Carfax - Functional */}
          <Link href="/modules/plane-carfax" className="group block rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg hover:border-emerald-500/50 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">📋</span>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                FUNCTIONAL
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">Plane Carfax</h3>
            <p className="mt-2 text-sm text-slate-400">
              FAA aircraft records search. Look up any N-Number for registration details, 
              owner history, and aircraft specifications.
            </p>
            <ul className="mt-3 space-y-1 text-xs text-slate-500">
              <li>✓ N-Number lookup</li>
              <li>✓ Owner history</li>
              <li>✓ Aircraft specs</li>
              <li>⚠ Alerts & tracking (coming)</li>
            </ul>
          </Link>

          {/* Fuel Saver - Demo */}
          <Link href="/modules/fuel-saver" className="group block rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg hover:border-amber-500/50 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">⛽</span>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                DEMO
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">Fuel Saver</h3>
            <p className="mt-2 text-sm text-slate-400">
              Never overpay for fuel. Find the cheapest prices along your route, 
              track fuel burns, and optimize your flights for economy.
            </p>
            <ul className="mt-3 space-y-1 text-xs text-slate-500">
              <li>✓ Route fuel planning</li>
              <li>✓ Fuel price comparison</li>
              <li>✓ Cost estimation</li>
              <li>✓ Fuel stop suggestions</li>
            </ul>
          </Link>

        </div>
      </div>

      {/* Coming Soon - Preview Demos */}
      <div className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="mb-2 text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-purple-400">◇</span> Coming Soon
        </h2>
        <p className="text-slate-400 mb-6">Preview demos - see what we're building</p>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          
          {/* Aperture - Demo */}
          <Link href="/modules/aperture" className="group block rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg hover:border-purple-500/50 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">🤝</span>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                DEMO
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">Aperture</h3>
            <p className="mt-2 text-sm text-slate-400">
              The aviation network. Connect with pilots, find flight partners, 
              discover businesses, and share resources safely.
            </p>
            <ul className="mt-3 space-y-1 text-xs text-slate-500">
              <li>○ Pilot profiles & directories</li>
              <li>○ Partnership matching</li>
              <li>○ Business listings</li>
              <li>○ Resource sharing</li>
            </ul>
          </Link>

        </div>
      </div>

      {/* On the Roadmap - Planned */}
      <div className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="mb-2 text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-slate-500">○</span> On the Roadmap
        </h2>
        <p className="text-slate-400 mb-6">Planned features - help us prioritize what matters most</p>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          
          {/* Plane Search */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg opacity-60">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">🔍</span>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-700 text-slate-400 border border-slate-600">
                PLANNED
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">Plane Search</h3>
            <p className="mt-2 text-sm text-slate-400">
              Advanced aircraft search with powerful filters. Find aircraft by manufacturer, 
              model, year, price range, and more.
            </p>
            <ul className="mt-3 space-y-1 text-xs text-slate-600">
              <li>○ Multi-filter search</li>
              <li>○ Price analytics</li>
              <li>○ Market trends</li>
              <li>○ Save searches</li>
            </ul>
          </div>

          {/* TailHistory */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg opacity-60">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">📜</span>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-700 text-slate-400 border border-slate-600">
                PLANNED
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">TailHistory</h3>
            <p className="mt-2 text-sm text-slate-400">
              Visual timeline of any aircraft's life. See registration changes, 
              ownership history, and maintenance events in an interactive 3D view.
            </p>
            <ul className="mt-3 space-y-1 text-xs text-slate-600">
              <li>○ 3D timeline view</li>
              <li>○ Ownership chain</li>
              <li>○ Event history</li>
              <li>○ Export reports</li>
            </ul>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        <p>Aviation Dashboard • FAA Data • Built with Next.js</p>
      </footer>
    </div>
  );
}
