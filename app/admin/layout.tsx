'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/admin');
    } else if (status === 'authenticated') {
      // Check if user has admin or owner role
      const userRole = (session?.user as any)?.role;
      if (userRole === 'admin' || userRole === 'owner') {
        setIsAdmin(true);
      }
      setLoading(false);
      
      if (userRole !== 'admin' && userRole !== 'owner') {
        // Not admin, redirect to home
        router.push('/');
      }
    }
  }, [status, router, session]);

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/data', label: 'Data Cache', icon: '💾' },
    { href: '/admin/errors', label: 'Errors', icon: '🐛' },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Admin Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-xl font-bold text-white">
              ⚙️ Admin Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-400 hover:text-white text-sm">
              ← Back to Site
            </Link>
            <div className="text-sm text-slate-400">
              {session?.user?.email}
            </div>
          </div>
        </div>
      </header>

      {/* Admin Nav */}
      <nav className="bg-slate-900/50 border-b border-slate-800">
        <div className="flex gap-1 px-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                pathname === item.href
                  ? 'text-white border-b-2 border-sky-500 bg-slate-800/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
