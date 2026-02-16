'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function SettingsPage() {
  const { data: session, status } = useSession();

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
          <Link href="/login" className="inline-block bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-lg font-medium">
            Sign In
          </Link>
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

          {/* Danger Zone */}
          <div className="bg-slate-800 rounded-lg p-6 border border-red-500/30">
            <h2 className="text-lg font-semibold mb-4 text-red-400">Danger Zone</h2>
            <div className="space-y-3">
              <button className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded-lg transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
