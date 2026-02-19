'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';

interface PilotProfile {
  id: string;
  userId: string;
  homeAirport?: string | null;
  ratings: string[];
  availability?: string | null;
  aircraft?: string | null;
  hours?: number | null;
  bio?: string | null;
  user?: {
    id: string;
    name?: string | null;
    username?: string | null;
    email?: string | null;
    tier?: string | null;
  } | null;
}

const RATING_OPTIONS = ['Student', 'PPL', 'Instrument', 'Commercial', 'CFI', 'CFII', 'MEI', 'ATP'];
const AVAILABILITY_OPTIONS = ['Weekdays', 'Weekends', 'Evenings', 'Anytime'];

const initialProfileState = {
  homeAirport: '',
  availability: '',
  aircraft: '',
  hours: '',
  bio: '',
  ratings: [] as string[],
};

export default function PilotDirectoryPage() {
  const { data: session, status } = useSession();
  const [profiles, setProfiles] = useState<PilotProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ query: '', rating: 'ALL', airport: '' });
  const [myProfile, setMyProfile] = useState<typeof initialProfileState>(initialProfileState);
  const [profileLoading, setProfileLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, [filters.rating, filters.airport]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchMyProfile();
    }
  }, [session]);

  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile) => {
      if (filters.rating !== 'ALL' && !profile.ratings?.includes(filters.rating)) return false;
      if (filters.airport && profile.homeAirport !== filters.airport.toUpperCase()) return false;
      if (!filters.query) return true;
      const q = filters.query.toLowerCase();
      return (
        (profile.user?.name || '').toLowerCase().includes(q) ||
        (profile.user?.username || '').toLowerCase().includes(q) ||
        (profile.aircraft || '').toLowerCase().includes(q) ||
        (profile.bio || '').toLowerCase().includes(q)
      );
    });
  }, [profiles, filters]);

  async function fetchProfiles() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.rating !== 'ALL') params.set('rating', filters.rating);
      if (filters.airport) params.set('airport', filters.airport.toUpperCase());
      const res = await fetch(`/api/pilots?${params.toString()}`);
      const data = await res.json();
      setProfiles(data.profiles || []);
    } catch (error) {
      console.error('Failed to load pilot profiles', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMyProfile() {
    try {
      const res = await fetch('/api/pilots/me');
      const data = await res.json();
      if (data.profile) {
        setMyProfile({
          homeAirport: data.profile.homeAirport || '',
          availability: data.profile.availability || '',
          aircraft: data.profile.aircraft || '',
          bio: data.profile.bio || '',
          hours: data.profile.hours?.toString() || '',
          ratings: data.profile.ratings || [],
        });
      } else {
        setMyProfile(initialProfileState);
      }
    } catch (error) {
      console.error('Failed to load personal profile', error);
    }
  }

  function toggleRating(value: string) {
    setMyProfile((prev) => {
      const exists = prev.ratings.includes(value);
      return {
        ...prev,
        ratings: exists ? prev.ratings.filter((item) => item !== value) : [...prev.ratings, value],
      };
    });
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!session) {
      signIn();
      return;
    }
    setProfileLoading(true);
    try {
      const payload = {
        ...myProfile,
        hours: myProfile.hours ? Number(myProfile.hours) : null,
      };
      const res = await fetch('/api/pilots/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save profile');
      }
      await fetchProfiles();
      setEditMode(false);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setProfileLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">👥 Pilot Directory</h1>
            <p className="text-slate-400 text-sm">Find verified pilots, rating buddies, and potential co-owners.</p>
          </div>
          <div className="flex gap-2">
            <select
              value={filters.rating}
              onChange={(e) => setFilters((prev) => ({ ...prev, rating: e.target.value }))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="ALL">All Ratings</option>
              {RATING_OPTIONS.map((rating) => (
                <option key={rating} value={rating}>{rating}</option>
              ))}
            </select>
            <input
              type="text"
              value={filters.airport}
              onChange={(e) => setFilters((prev) => ({ ...prev, airport: e.target.value }))}
              placeholder="Home Airport"
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm uppercase"
            />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
              placeholder="Search pilots"
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center text-slate-400">
              Loading pilot profiles…
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center text-slate-400">
              No pilots match your filters yet.
            </div>
          ) : (
            filteredProfiles.map((profile) => (
              <div key={profile.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-white text-lg font-semibold">
                      {profile.user?.name || profile.user?.username || 'Anonymous Pilot'}
                    </div>
                    <div className="text-xs text-slate-400">{profile.homeAirport || 'No home airport'}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.ratings?.map((rating) => (
                      <span key={rating} className="text-xs bg-slate-700 text-slate-200 px-2 py-0.5 rounded-full">
                        {rating}
                      </span>
                    ))}
                  </div>
                </div>
                {profile.availability && (
                  <div className="text-xs text-emerald-300 mt-2">Available: {profile.availability}</div>
                )}
                {profile.hours && (
                  <div className="text-xs text-slate-400 mt-1">Hours logged: {profile.hours.toLocaleString()}</div>
                )}
                {profile.aircraft && (
                  <div className="text-sm text-slate-300 mt-3">
                    <span className="font-semibold text-slate-200">Aircraft:</span> {profile.aircraft}
                  </div>
                )}
                <p className="text-sm text-slate-300 mt-3">
                  {profile.bio || 'No bio yet.'}
                </p>
                {profile.user?.email && (
                  <a
                    href={`mailto:${profile.user.email}`}
                    className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 mt-3"
                  >
                    ✉️ Contact pilot
                  </a>
                )}
              </div>
            ))
          )}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 h-fit">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">Your Profile</h2>
            {session ? (
              <button onClick={() => setEditMode((prev) => !prev)} className="text-xs text-emerald-400">
                {editMode ? 'Close' : 'Edit'}
              </button>
            ) : (
              <button onClick={() => signIn()} className="text-xs text-emerald-400">
                Sign in
              </button>
            )}
          </div>
          {session ? (
            editMode ? (
              <form onSubmit={saveProfile} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Home Airport</label>
                  <input
                    type="text"
                    value={myProfile.homeAirport}
                    onChange={(e) => setMyProfile((prev) => ({ ...prev, homeAirport: e.target.value.toUpperCase() }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    placeholder="KAPA"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Availability</label>
                  <select
                    value={myProfile.availability}
                    onChange={(e) => setMyProfile((prev) => ({ ...prev, availability: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">Select availability</option>
                    {AVAILABILITY_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Ratings</label>
                  <div className="flex flex-wrap gap-2">
                    {RATING_OPTIONS.map((rating) => (
                      <button
                        type="button"
                        key={rating}
                        onClick={() => toggleRating(rating)}
                        className={`px-3 py-1 rounded-full text-xs border ${
                          myProfile.ratings.includes(rating)
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                            : 'bg-slate-900 border-slate-700 text-slate-300'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Aircraft You Fly / Own</label>
                  <textarea
                    value={myProfile.aircraft}
                    onChange={(e) => setMyProfile((prev) => ({ ...prev, aircraft: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    rows={2}
                    placeholder="C172, SR22, PA-28"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Total Hours</label>
                  <input
                    type="number"
                    value={myProfile.hours}
                    onChange={(e) => setMyProfile((prev) => ({ ...prev, hours: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    placeholder="250"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Bio</label>
                  <textarea
                    value={myProfile.bio}
                    onChange={(e) => setMyProfile((prev) => ({ ...prev, bio: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    rows={3}
                    placeholder="Share your flying goals or what you're looking for."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setEditMode(false)} className="px-4 py-2 text-slate-300">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg"
                  >
                    {profileLoading ? 'Saving…' : 'Save Profile'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-4 text-sm text-slate-300 space-y-2">
                <p><span className="text-slate-400">Home Airport:</span> {myProfile.homeAirport || 'Not set'}</p>
                <p><span className="text-slate-400">Availability:</span> {myProfile.availability || 'Not set'}</p>
                <p><span className="text-slate-400">Hours:</span> {myProfile.hours || '0'}</p>
                <p><span className="text-slate-400">Aircraft:</span> {myProfile.aircraft || '—'}</p>
                <p><span className="text-slate-400">Ratings:</span> {myProfile.ratings.length ? myProfile.ratings.join(', ') : '—'}</p>
                <p className="text-slate-400">{myProfile.bio || 'Add a short bio so other pilots can find you.'}</p>
              </div>
            )
          ) : (
            <p className="text-sm text-slate-400 mt-4">Sign in to manage your profile.</p>
          )}
        </div>
      </div>
    </div>
  );
}
