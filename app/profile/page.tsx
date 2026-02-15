'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateUserName, addUserAircraft, getUserAircraft, removeUserAircraft } from '@/lib/actions';

export default function ProfilePage() {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [newAircraft, setNewAircraft] = useState('');
  const [nickname, setNickname] = useState('');
  const [savedName, setSavedName] = useState(false);
  const [aircraftList, setAircraftList] = useState<{id: string, nNumber: string, nickname: string | null}[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Delete account states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const router = useRouter();

  // Load user's aircraft on mount
  useEffect(() => {
    getUserAircraft().then((aircraft) => {
      setAircraftList(aircraft);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const handleNameSave = () => {
    startTransition(async () => {
      await updateUserName(name);
      setSavedName(true);
      setTimeout(() => setSavedName(false), 2000);
    });
  };

  const handleAddAircraft = () => {
    if (!newAircraft) return;
    startTransition(async () => {
      const added = await addUserAircraft(newAircraft, nickname || null);
      if (added) {
        setAircraftList([...aircraftList, { id: added.id, nNumber: added.nNumber, nickname: added.nickname }]);
        setNewAircraft('');
        setNickname('');
      }
    });
  };

  const handleRemoveAircraft = (id: string) => {
    startTransition(async () => {
      await removeUserAircraft(id);
      setAircraftList(aircraftList.filter(ac => ac.id !== id));
    });
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Type DELETE to confirm');
      return;
    }
    
    setDeleteLoading(true);
    setDeleteError('');
    
    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (res.ok) {
        router.push('/login?deleted=true');
      } else {
        const data = await res.json();
        setDeleteError(data.error || 'Failed to delete account');
      }
    } catch (error) {
      setDeleteError('An error occurred');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-3xl font-semibold text-slate-100">Profile</h1>

        {/* Name Section */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold text-slate-100">Display Name</h2>
          <p className="mt-1 text-sm text-slate-400">This is how you appear to others</p>
          
          <div className="mt-4 flex gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
            <button
              onClick={handleNameSave}
              disabled={isPending || !name}
              className="rounded-xl bg-emerald-500 px-6 py-2 font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-50"
            >
              {savedName ? 'Saved!' : 'Save'}
            </button>
          </div>
        </div>

        {/* My Aircraft Section */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold text-slate-100">My Aircraft</h2>
          <p className="mt-1 text-sm text-slate-400">Add your owned aircraft to track</p>

          {/* Add new aircraft */}
          <div className="mt-4 space-y-3">
            <div className="flex gap-3">
              <input
                type="text"
                value={newAircraft}
                onChange={(e) => setNewAircraft(e.target.value.toUpperCase())}
                placeholder="N-Number (e.g., N12345)"
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none uppercase"
              />
              <button
                onClick={handleAddAircraft}
                disabled={isPending || !newAircraft}
                className="rounded-xl bg-emerald-500 px-6 py-2 font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-50"
              >
                Add
              </button>
            </div>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Nickname (optional, e.g., My Cherokee)"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Aircraft list */}
          <div className="mt-6 space-y-2">
            {loading ? (
              <p className="text-sm text-slate-400">Loading...</p>
            ) : aircraftList.length === 0 ? (
              <p className="text-sm text-slate-400">No aircraft added yet</p>
            ) : (
              aircraftList.map((ac) => (
                <div
                  key={ac.id}
                  className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-slate-100">{ac.nNumber}</p>
                    {ac.nickname && <p className="text-sm text-slate-400">{ac.nickname}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={`/modules/plane-carfax?n=${ac.nNumber}`}
                      className="text-sm text-emerald-400 hover:text-emerald-300"
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleRemoveAircraft(ac.id)}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Account Settings Section */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold text-slate-100">Account Settings</h2>
          <p className="mt-1 text-sm text-slate-400">Manage your account</p>
          
          <div className="mt-4 space-y-3">
            <a
              href="/forgot-password"
              className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 hover:bg-slate-800 transition-colors"
            >
              <div>
                <p className="font-medium text-slate-100">Change Password</p>
                <p className="text-sm text-slate-400">Reset your password</p>
              </div>
              <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
            
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex w-full items-center justify-between rounded-xl border border-red-900/50 bg-red-900/20 px-4 py-3 hover:bg-red-900/30 transition-colors"
            >
              <div>
                <p className="font-medium text-red-400">Delete Account</p>
                <p className="text-sm text-red-400/70">Permanently delete your account and data</p>
              </div>
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-red-800 bg-slate-900 p-6">
            <h3 className="text-xl font-bold text-red-400">Delete Account</h3>
            <p className="mt-2 text-slate-300">
              This action cannot be undone. All your data, including aircraft tracking, will be permanently deleted.
            </p>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Type <span className="font-mono text-red-400">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-red-500 focus:outline-none"
                placeholder="DELETE"
              />
            </div>
            
            {deleteError && (
              <p className="mt-2 text-sm text-red-400">{deleteError}</p>
            )}
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                  setDeleteError('');
                }}
                className="flex-1 rounded-xl border border-slate-600 py-2 font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading || deleteConfirmText !== 'DELETE'}
                className="flex-1 rounded-xl bg-red-500 py-2 font-semibold text-white hover:bg-red-400 disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
