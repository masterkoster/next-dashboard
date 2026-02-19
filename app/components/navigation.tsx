'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useAuthModal } from './AuthModalContext';

const modules = [
  { id: 'flying-club', label: 'Flying Club', href: '/modules/flying-club' },
  { id: 'fuel-saver', label: 'Fuel Saver', href: '/modules/fuel-saver' },
  { id: 'e6b', label: 'E6B', href: '/modules/e6b' },
  { id: 'training', label: 'Training', href: '/modules/training' },
  { id: 'logbook', label: 'Logbook', href: '/modules/logbook' },
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
  const { data: session } = useSession();
  const { openLoginModal } = useAuthModal();
  const isHomeOrDashboard = pathname === '/' || pathname === '/dashboard';
  const [showDropdown, setShowDropdown] = useState(false);
  const [showInviteDropdown, setShowInviteDropdown] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setShowInviteDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
            href="/dashboard" 
            className="text-2xl text-slate-100 hover:text-emerald-400 transition-colors"
          >
            ✈️
          </Link>
          <Link 
            href="/" 
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

          {/* Profile Dropdown */}
          {session ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => { setShowDropdown(!showDropdown); setShowInviteDropdown(false); }}
                className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden sm:inline">{session.user?.name || session.user?.email?.split('@')[0]}</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg bg-slate-800 border border-slate-700 shadow-lg overflow-hidden z-50">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-slate-700">
                    <div className="font-medium text-white">{session.user?.name || 'User'}</div>
                    <div className="text-xs text-slate-400">{session.user?.email}</div>
                  </div>
                  
                  {/* Menu items */}
                  <div className="py-1">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700"
                      onClick={() => setShowDropdown(false)}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </Link>
                    <Link
                      href="/trips"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700"
                      onClick={() => setShowDropdown(false)}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      My Trips
                    </Link>
                    <div className="border-t border-slate-700 my-1"></div>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700"
                      onClick={() => setShowDropdown(false)}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </Link>
                    <Link
                      href="/support"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700"
                      onClick={() => setShowDropdown(false)}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Support
                    </Link>
                    <div className="border-t border-slate-700 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-slate-700"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openLoginModal()}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu dropdown */}
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
