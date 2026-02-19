import Link from 'next/link';

export default function SocialLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          <aside className="bg-slate-800 border border-slate-700 rounded-2xl p-4 h-fit">
            <div className="text-white font-bold text-lg mb-1">Social</div>
            <div className="text-xs text-slate-400 mb-4">
              Marketplace + pilots + overview
            </div>
            <nav className="space-y-2">
              <NavButton href="/modules/social" label="Listings" icon="🛩️" />
              <NavButton href="/modules/social/pilots" label="Pilot Directory" icon="👥" />
              <NavButton href="/modules/social/overview" label="Pilot Overview" icon="👨‍✈️" />
            </nav>
          </aside>
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}

function NavButton({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/40 px-4 py-3 text-slate-200 hover:border-emerald-400 hover:text-white transition-colors"
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
