import Link from "next/link";

// Landing page - public entry point with module previews
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-800/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 text-xl font-bold text-white">
            <span className="text-2xl">✈️</span>
            <span>Aviation</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:text-white"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="mx-auto max-w-6xl px-6 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
          Aviation Dashboard
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
          Search FAA aircraft records, view registration history, and explore aircraft specs. 
          Try our tools below - no account required.
        </p>
      </div>

      {/* Modules Grid - Accessible without login */}
      <div className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="mb-6 text-xl font-semibold text-white">Try Our Tools</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Plane Carfax */}
          <Link
            href="/modules/plane-carfax"
            className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg transition hover:border-emerald-500/50 hover:shadow-emerald-500/20"
          >
            <div className="text-3xl mb-3">📋</div>
            <h3 className="text-lg font-semibold text-white">Plane Carfax</h3>
            <p className="mt-2 text-sm text-slate-400">
              Look up any N-Number to see FAA registration details, owner history, and aircraft specs.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-400">
              Try now →
            </div>
          </Link>

          {/* TailHistory */}
          <Link
            href="/modules/tailhistory"
            className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg transition hover:border-emerald-500/50 hover:shadow-emerald-500/20"
          >
            <div className="text-3xl mb-3">📜</div>
            <h3 className="text-lg font-semibold text-white">TailHistory</h3>
            <p className="mt-2 text-sm text-slate-400">
              View aircraft registration timeline and 3D visualization of ownership history.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-400">
              Try now →
            </div>
          </Link>

          {/* Plane Search */}
          <Link
            href="/modules/plane-search"
            className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg transition hover:border-emerald-500/50 hover:shadow-emerald-500/20"
          >
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="text-lg font-semibold text-white">Plane Search</h3>
            <p className="mt-2 text-sm text-slate-400">
              Search and filter aircraft by manufacturer, model, year, and more.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-400">
              Try now →
            </div>
          </Link>

          {/* 3D Viewer */}
          <Link
            href="/model-viewer"
            className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg transition hover:border-emerald-500/50 hover:shadow-emerald-500/20"
          >
            <div className="text-3xl mb-3">🎮</div>
            <h3 className="text-lg font-semibold text-white">3D Viewer</h3>
            <p className="mt-2 text-sm text-slate-400">
              Interactive 3D aircraft models with specifications and performance data.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-400">
              Try now →
            </div>
          </Link>

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
