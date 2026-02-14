'use client';

import { useState, useTransition, useEffect } from 'react';
import { updateUserName, addUserAircraft, getUserAircraft, removeUserAircraft } from '@/lib/actions';

export default function ProfilePage() {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [newAircraft, setNewAircraft] = useState('');
  const [nickname, setNickname] = useState('');
  const [savedName, setSavedName] = useState(false);
  const [aircraftList, setAircraftList] = useState<{id: string, nNumber: string, nickname: string | null}[]>([]);
  const [loading, setLoading] = useState(true);

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
      </div>
    </div>
  );
}
