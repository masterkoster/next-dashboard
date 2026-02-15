import Link from "next/link";

// Landing page - public entry point with module previews
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800">
      {/* Hero */}
      <div className="mx-auto max-w-6xl px-6 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
          Aviation Dashboard
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
          The all-in-one platform for pilots and aviation businesses. 
          Search aircraft, manage your flying group, and connect with others - 
          use individual modules or sync your data across everything.
        </p>
      </div>

      {/* Beta Notice */}
      <div className="mx-auto max-w-4xl px-6 mb-8">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
          <p className="text-amber-200">
            <span className="font-semibold">Building the vision:</span> Some modules are in beta, 
            some are demos of future features, and some are functional but need improvement. 
            Your data syncs across whatever you choose to use.
          </p>
        </div>
      </div>

      {/* Modules Grid - Accessible without login */}
      <div className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="mb-6 text-xl font-semibold text-white">Try Our Tools</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          
          {/* Flying Club - Beta */}
          <div className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg relative">
            <div className="absolute top-4 right-4">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                BETA
              </span>
            </div>
            <div className="text-3xl mb-3">✈️</div>
            <h3 className="text-lg font-semibold text-white">Flying Club</h3>
            <p className="mt-2 text-sm text-slate-400">
              Manage your flying group, book aircraft, track flight hours, and handle billing. 
              Works well for clubs and shared ownership groups.
            </p>
            <Link 
              href="/modules/flying-club?demo=true"
              className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300"
            >
              Try now →
            </Link>
          </div>

          {/* Aperture - Demo */}
          <div className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg relative">
            <div className="absolute top-4 right-4">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                DEMO
              </span>
            </div>
            <div className="text-3xl mb-3">🤝</div>
            <h3 className="text-lg font-semibold text-white">Aperture</h3>
            <p className="mt-2 text-sm text-slate-400">
              Connect with other pilots and aviation businesses. 
              Share resources, find partners, and grow your network.
            </p>
            <Link 
              href="/modules/aperture"
              className="mt-4 flex items-center gap-2 text-sm font-medium text-purple-400 hover:text-purple-300"
            >
              View demo →
            </Link>
          </div>

          {/* Plane Carfax - Functional but needs work */}
          <div className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg relative">
            <div className="absolute top-4 right-4">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                FUNCTIONAL
              </span>
            </div>
            <div className="text-3xl mb-3">📋</div>
            <h3 className="text-lg font-semibold text-white">Plane Carfax</h3>
            <p className="mt-2 text-sm text-slate-400">
              Look up any N-Number to see FAA registration details, owner history, and aircraft specs. 
              Works but needs improvement to fully fulfill its purpose.
            </p>
            <Link 
              href="/modules/plane-carfax"
              className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300"
            >
              Try now →
            </Link>
          </div>

          {/* Plane Search - Coming Soon */}
          <div className="group rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg opacity-60">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="text-lg font-semibold text-white">Plane Search</h3>
            <p className="mt-2 text-sm text-slate-400">
              Search and filter aircraft by manufacturer, model, year, and more.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-500">
              Coming soon →
            </div>
          </div>

          {/* Fuel Saver - Coming Soon */}
          <div className="group rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg opacity-60">
            <div className="text-3xl mb-3">⛽</div>
            <h3 className="text-lg font-semibold text-white">Fuel Saver</h3>
            <p className="mt-2 text-sm text-slate-400">
              Find the cheapest fuel prices along your route. Save money on every flight.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-500">
              Coming soon →
            </div>
          </div>

          {/* TailHistory - Coming Soon */}
          <div className="group rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg opacity-60">
            <div className="text-3xl mb-3">📜</div>
            <h3 className="text-lg font-semibold text-white">TailHistory</h3>
            <p className="mt-2 text-sm text-slate-400">
              3D timeline view of aircraft registration history and ownership changes.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-500">
              Coming soon →
            </div>
          </div>

        </div>

        {/* The Vision Section */}
        <div className="mt-16 rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
          <h3 className="text-xl font-semibold text-white text-center mb-4">The Vision</h3>
          <p className="text-slate-400 text-center max-w-2xl mx-auto mb-6">
            We're building a unified platform where your data flows seamlessly across all modules. 
            Book a flight in Flying Club → it appears in your logbook → tracks your currency → 
            connects you with maintenance when needed → finds fuel along your route. 
            Use what you need, or use it all.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Beta - Works well
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              Demo - Coming soon
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              Functional - Needs work
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center">
          <h3 className="text-xl font-semibold text-white">Want more features?</h3>
          <p className="mt-2 text-slate-400">
            Create an account to save your searches, track aircraft, and access premium modules.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white hover:bg-emerald-400"
            >
              Sign Up Free
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-slate-600 px-6 py-3 font-semibold text-white hover:bg-slate-800"
            >
              Login
            </Link>
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
