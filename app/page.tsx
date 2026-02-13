import Link from "next/link";

// Landing page - public entry point
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-20 text-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            Now Live
          </div>
          
          <h1 className="text-5xl font-bold tracking-tight text-white md:text-7xl">
            Aviation Dashboard
          </h1>
          
          <p className="mx-auto max-w-2xl text-xl text-slate-300">
            Your all-in-one platform for aircraft insights, history, and analytics. 
            Pull FAA records, track aircraft history, and more.
          </p>
          
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-xl bg-emerald-500 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/25"
            >
              Sign Up Free
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-slate-600 bg-slate-800/50 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-slate-800"
            >
              Login
            </Link>
          </div>
          
          <p className="pt-8 text-sm text-slate-500">
            Free to start · No credit card required
          </p>
        </div>
        
        <div className="mt-16 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="text-3xl mb-3">✈️</div>
            <h3 className="text-lg font-semibold text-white">Plane Carfax</h3>
            <p className="mt-2 text-sm text-slate-400">
              Pull complete FAA registration history, ownership details, and aircraft specifications.
            </p>
          </div>
          
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="text-3xl mb-3">🛫</div>
            <h3 className="text-lg font-semibold text-white">Hangar Finder</h3>
            <p className="mt-2 text-sm text-slate-400">
              Locate available hangars nearby or along your flight route.
            </p>
          </div>
          
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="text-3xl mb-3">⛽</div>
            <h3 className="text-lg font-semibold text-white">Fuel Saver</h3>
            <p className="mt-2 text-sm text-slate-400">
              Optimize fuel stops with pricing comparisons across airports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
