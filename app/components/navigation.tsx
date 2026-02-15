'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';

const modules = [
  { id: 'plane-carfax', label: 'Plane Carfax', href: '/modules/plane-carfax' },
  { id: 'flying-club', label: 'Flying Club', href: '/modules/flying-club' },
  { id: 'fuel-saver', label: 'Fuel Saver', href: '/modules/fuel-saver' },
  { id: 'aperture', label: 'Aperture', href: '/modules/aperture' },
];

interface Invite {
  id: string;
  email: string;
  group: {
    id: string;
    name: string;
  };
  role: string;
  createdAt: string;
}

export default function Navigation() {
  const pathname = usePathname();
  const isHomeOrDashboard = pathname === '/' || pathname === '/dashboard';
  const [showDropdown, setShowDropdown] = useState(false);
  const [showInviteDropdown, setShowInviteDropdown] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        setIsLoggedIn(!!data?.user);
      })
      .catch(() => setIsLoggedIn(false));
  }, []);

  useEffect(() => {
    const fetchInvites = async () => {
      try {
        const res = await fetch('/api/invitations');
        if (res.ok) {
          const data = await res.json();
          setPendingInvites(data);
        }
      } catch (e) {
        console.error('Error fetching invites:', e);
      }
      setLoadingInvites(false);
    };
    fetchInvites();
  }, []);

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId }),
      });
      if (res.ok) {
        setPendingInvites(prev => prev.filter(i => i.id !== inviteId));
        alert('You have successfully joined the group!');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to accept invitation');
      }
    } catch (e) {
      console.error('Error accepting invite:', e);
      alert('Failed to accept invitation');
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo / Home */}
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="text-2xl text-slate-100 hover:text-emerald-400 transition-colors"
          >
            ✈️
          </Link>
          <Link 
            href="/dashboard" 
            className="text-lg font-semibold text-slate-100 hover:text-emerald-400 transition-colors"
          >
            Aviation
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
          {/* Invitations Bell */}
          <div className="relative">
            <button
              onClick={() => { setShowInviteDropdown(!showInviteDropdown); setShowDropdown(false); }}
              className="relative rounded-lg bg-slate-800 p-2 text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {pendingInvites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {pendingInvites.length}
                </span>
              )}
            </button>
            
            {showInviteDropdown && (
              <div className="absolute right-0 mt-2 w-80 rounded-lg bg-slate-800 border border-slate-700 shadow-lg overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-700">
                  <h3 className="font-medium">Invitations</h3>
                </div>
                {loadingInvites ? (
                  <div className="p-4 text-center text-slate-400">Loading...</div>
                ) : pendingInvites.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">No pending invitations</div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    {pendingInvites.map((invite) => (
                      <div key={invite.id} className="p-4 border-b border-slate-700/50">
                        <div className="font-medium text-sm">{invite.group.name}</div>
                        <div className="text-xs text-slate-400 mt-1">
                          Invited as {invite.role} • {new Date(invite.createdAt).toLocaleDateString()}
                        </div>
                        <button
                          onClick={() => handleAcceptInvite(invite.id)}
                          className="mt-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm py-1.5 rounded-lg transition-colors"
                        >
                          Accept Invitation
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="relative md:hidden">
            <button className="rounded-lg bg-slate-800 p-2 text-slate-300 hover:bg-slate-700">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Login/Logout - Show Login when not logged in, Profile dropdown when logged in */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => { setShowDropdown(!showDropdown); setShowInviteDropdown(false); }}
                className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden sm:inline">Profile</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-40 rounded-lg bg-slate-800 border border-slate-700 shadow-lg overflow-hidden z-50">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
                    onClick={() => setShowDropdown(false)}
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
            >
              Login
            </Link>
          )}
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
