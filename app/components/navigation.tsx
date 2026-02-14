'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const modules = [
  { id: 'plane-carfax', label: 'Plane Carfax', href: '/modules/plane-carfax' },
  { id: 'plane-search', label: 'Plane Search', href: '/modules/plane-search' },
  { id: 'tailhistory', label: 'TailHistory', href: '/modules/tailhistory' },
  { id: 'model-viewer', label: '3D Viewer', href: '/model-viewer' },
];

export default function Navigation() {
  const pathname = usePathname();
  const isHomeOrDashboard = pathname === '/' || pathname === '/dashboard';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo / Home */}
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-lg font-semibold text-slate-100 hover:text-emerald-400 transition-colors"
          >
            <span className="text-2xl">✈️</span>
            <span>Aviation</span>
          </Link>
        </div>

        {/* Module Links */}
        <div className="hidden md:flex items-center gap-1">
          {modules.map((module) => (
            <Link
              key={module.id}
              href={module.href}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                pathname === module.href
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              {module.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <div className="relative md:hidden">
            <button className="rounded-lg bg-slate-800 p-2 text-slate-300 hover:bg-slate-700">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Profile Link */}
          <Link
            href="/profile"
            className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="hidden sm:inline">Profile</span>
          </Link>
        </div>
      </div>

      {/* Mobile menu dropdown - simplified for now */}
      <div className="border-t border-slate-800/60 md:hidden">
        <div className="flex overflow-x-auto px-4 py-2 gap-2">
          {modules.map((module) => (
            <Link
              key={module.id}
              href={module.href}
              className={`flex-shrink-0 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap ${
                pathname === module.href
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {module.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
