'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthModal } from '../components/AuthModalContext';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const { openLoginModal } = useAuthModal();

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This will permanently delete all your data including flight plans, aircraft, and group memberships. This action cannot be undone.')) {
      return;
    }
    if (!confirm('This is your final warning. All your data will be permanently deleted. Continue?')) {
      return;
    }
    
    setDeleting(true);
    try {
      const res = await fetch('/api/auth/delete-account', { method: 'DELETE' });
      if (res.ok) {
        alert('Your account has been deleted.');
        signOut({ callbackUrl: '/' });
      } else {
        const data = await res.json();
        alert('Failed to delete account: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error deleting account');
    }
    setDeleting(false);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>
          <div className="text-slate-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <div className="max-w-2xl mx-auto text-center py-16">
          <h1 className="text-2xl font-bold mb-4">Settings</h1>
          <p className="text-slate-400 mb-6">Sign in to access settings</p>
          <button onClick={() => openLoginModal()} className="inline-block bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-lg font-medium">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <div className="space-y-6">
          {/* Account Section */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Account</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-700">
                <span className="text-slate-400">Email</span>
                <span>{session.user?.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-700">
                <span className="text-slate-400">Name</span>
                <span>{session.user?.name || 'Not set'}</span>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Email Notifications</div>
                  <div className="text-sm text-slate-400">Receive updates about your trips</div>
                </div>
                <button className="bg-emerald-500 w-12 h-6 rounded-full relative transition-colors">
                  <span className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full transition-transform"></span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Dark Mode</div>
                  <div className="text-sm text-slate-400">Use dark theme</div>
                </div>
                <button className="bg-emerald-500 w-12 h-6 rounded-full relative transition-colors">
                  <span className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full transition-transform"></span>
                </button>
              </div>
            </div>
          </div>

          {/* Data Cache Section */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Data Cache</h2>
            <div className="space-y-3">
              <Link 
                href="/data-status"
                className="block w-full bg-slate-700 hover:bg-slate-600 text-center text-white py-2 rounded-lg transition-colors"
              >
                View Data Cache Status
              </Link>
              <p className="text-xs text-slate-500">
                See what airport data is cached and how old it is. Fuel prices are automatically updated every 72 hours.
              </p>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-slate-800 rounded-lg p-6 border border-red-500/30">
            <h2 className="text-lg font-semibold mb-4 text-red-400">Danger Zone</h2>
            <div className="space-y-3">
              <button 
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
