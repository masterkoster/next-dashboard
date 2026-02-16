import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { moduleCatalog } from "@/lib/modules";

function parsePurchasedModules(input: string): string[] {
  try {
    const parsed = JSON.parse(input);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { name: true, purchasedModules: true, credits: true }
  });

  if (!dbUser) {
    redirect("/login");
  }

  const purchased = new Set(parsePurchasedModules(dbUser.purchasedModules));
  const availableModules = moduleCatalog.filter((module) =>
    purchased.has(module.id),
  );
  const lockedModules = moduleCatalog.filter(
    (module) => !purchased.has(module.id),
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 lg:flex-row">
        <aside className="lg:w-64 lg:flex-shrink-0">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/40">
            <div className="mb-6 space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Signed in
              </p>
              <p className="text-sm font-semibold text-slate-100">
                {dbUser.name ?? session.user.email}
              </p>
              <p className="text-xs text-slate-400">{session.user.email}</p>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Modules
              </p>
              {availableModules.length === 0 ? (
                <p className="mt-2 text-sm text-slate-400">
                  No modules purchased yet.
                </p>
              ) : (
                <nav className="mt-2 space-y-1">
                  {availableModules.map((module) => (
                    <a
                      key={module.id}
                      href={module.href}
                      className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-slate-100 transition-colors hover:border-slate-700 hover:bg-slate-800/70"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-xs font-semibold text-slate-200">
                        {module.label.charAt(0)}
                      </span>
                      <div className="flex flex-col">
                        <span>{module.label}</span>
                        {module.description && (
                          <span className="text-xs font-normal text-slate-400">
                            {module.description}
                          </span>
                        )}
                      </div>
                    </a>
                  ))}
                </nav>
              )}
            </div>
          </div>
        </aside>

        <main className="flex-1 space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/40">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-100">
              Welcome back, {dbUser.name ?? session.user.email}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              Your available modules are shown in the sidebar based on your purchased modules and credits.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Flying Club */}
            <a
              href="/modules/flying-club"
              className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/30 transition hover:border-emerald-600/70 hover:shadow-emerald-500/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Module</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-50">Flying Club</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    Manage your flying group, book aircraft, track hours, and handle billing.
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100">Active</span>
              </div>
            </a>

            {/* Fuel Saver */}
            <a
              href="/modules/fuel-saver"
              className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/30 transition hover:border-amber-600/70 hover:shadow-amber-500/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Module</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-50">Fuel Saver</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    Plan routes, find cheapest fuel stops.
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100">Active</span>
              </div>
            </a>

            {/* Plane Carfax - Coming Soon */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-lg shadow-slate-950/30 opacity-60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Module</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-50">Plane Carfax</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Pull FAA history for a specific N-Number.
                  </p>
                </div>
                <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">Coming Soon</span>
              </div>
            </div>
              </div>
            </a>

            {/* Plane Search - Coming Soon */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-lg shadow-slate-950/30 opacity-60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Module</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-50">Plane Search</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Search and filter aircraft by model, year, and more.
                  </p>
                </div>
                <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">Coming Soon</span>
              </div>
            </div>

            {/* 3D Viewer - Coming Soon */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-lg shadow-slate-950/30 opacity-60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Module</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-50">3D Viewer</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Interactive 3D aircraft models with specifications.
                  </p>
                </div>
                <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">Coming Soon</span>
              </div>
            </div>

            {/* TailHistory - Coming Soon */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-lg shadow-slate-950/30 opacity-60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Module</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-50">TailHistory</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    View aircraft registration timeline and ownership history.
                  </p>
                </div>
                <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">Coming Soon</span>
              </div>
            </div>

            {/* Hangar Finder - Coming Soon */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-lg shadow-slate-950/30 opacity-60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Module</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-50">Hangar Finder</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Locate available hangars nearby or along your route.
                  </p>
                </div>
                <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">Coming Soon</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {availableModules.map((module) => (
              <div
                key={module.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-slate-950/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Enabled module
                    </p>
                    <h2 className="text-lg font-semibold text-slate-50">
                      {module.label}
                    </h2>
                    {module.description && (
                      <p className="mt-1 text-sm text-slate-300">
                        {module.description}
                      </p>
                    )}
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200">
                    Active
                  </span>
                </div>
              </div>
            ))}

            {lockedModules.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 shadow-inner shadow-slate-950/30">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Locked modules
                </p>
                <ul className="mt-2 space-y-2 text-sm text-slate-300">
                  {lockedModules.map((module) => (
                    <li
                      key={module.id}
                      className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/40 px-3 py-2"
                    >
                      <div>
                        <p className="font-semibold text-slate-100">
                          {module.label}
                        </p>
                        {module.description && (
                          <p className="text-xs text-slate-400">
                            {module.description}
                          </p>
                        )}
                      </div>
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] font-semibold text-slate-300">
                        Not purchased
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
