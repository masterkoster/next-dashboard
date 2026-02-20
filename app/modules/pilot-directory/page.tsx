'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { checkMessageSafety } from '@/lib/message-safety';
import { encryptForUser, publishMyPublicKey } from '@/lib/e2ee';

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

const DEMO_PROFILES: PilotProfile[] = [
  {
    id: 'demo-1',
    userId: 'demo-user',
    homeAirport: 'KAPA',
    ratings: ['PPL', 'Instrument'],
    availability: 'Weekends',
    aircraft: 'C172S, PA-28',
    hours: 320,
    bio: 'Weekend IFR currency runs and cross-country trips.',
    user: { id: 'demo-user', name: 'Liam Carter', username: 'liamc', email: 'liam@example.com', tier: 'pro' },
  },
  {
    id: 'demo-2',
    userId: 'demo-user',
    homeAirport: 'KDAL',
    ratings: ['Commercial', 'CFI'],
    availability: 'Weekdays',
    aircraft: 'SR22, C182T',
    hours: 1450,
    bio: 'Looking for safety pilots and ferry opportunities.',
    user: { id: 'demo-user', name: 'Sofia Nguyen', username: 'sofiaflys', email: 'sofia@example.com', tier: 'proplus' },
  },
  {
    id: 'demo-3',
    userId: 'demo-user',
    homeAirport: 'KSMO',
    ratings: ['Student'],
    availability: 'Evenings',
    aircraft: 'C152',
    hours: 48,
    bio: 'Student pilot building time. Happy to split time for practice.',
    user: { id: 'demo-user', name: 'Marcus Reed', username: 'marcusreed', email: 'marcus@example.com', tier: 'free' },
  },
];

export default function PilotDirectoryPage() {
  const { data: session, status } = useSession();
  const [profiles, setProfiles] = useState<PilotProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ query: '', rating: 'ALL', airport: '' });
  const [myProfile, setMyProfile] = useState<typeof initialProfileState>(initialProfileState);
  const [profileLoading, setProfileLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [friends, setFriends] = useState<{ id: string }[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);
  const [friendActionMessage, setFriendActionMessage] = useState<string | null>(null);
  const [friendDraftFor, setFriendDraftFor] = useState<string | null>(null);
  const [friendDraftMessage, setFriendDraftMessage] = useState('');

  function countSentences(input: string) {
    const cleaned = input
      .replace(/\s+/g, ' ')
      .trim();
    if (!cleaned) return 0;
    const parts = cleaned
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    return parts.length;
  }

  useEffect(() => {
    fetchProfiles();
  }, [filters.rating, filters.airport]);

  useEffect(() => {
    if (session?.user?.id) {
      publishMyPublicKey().catch(() => {});
      fetchMyProfile();
      loadFriendState();
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
      const nextProfiles = data.profiles || [];
      setProfiles(nextProfiles.length ? nextProfiles : DEMO_PROFILES);
    } catch (error) {
      console.error('Failed to load pilot profiles', error);
      setProfiles(DEMO_PROFILES);
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

  async function loadFriendState() {
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        fetch('/api/friends'),
        fetch('/api/friends/requests'),
      ]);
      const friendsData = await friendsRes.json();
      const requestsData = await requestsRes.json();
      setFriends(friendsData.friends || []);
      setIncomingRequests(requestsData.incoming || []);
      setOutgoingRequests(requestsData.outgoing || []);
    } catch (error) {
      console.error('Failed to load friend status', error);
    }
  }

  async function sendFriendRequest(userId: string, initialMessage?: string) {
    try {
      let initialMessageEnvelope: string | null = null;
      const message = (initialMessage || '').trim();
      if (message) {
        const safety = checkMessageSafety(message);
        if (!safety.ok) {
          setFriendActionMessage(safety.error);
          return;
        }
        const encrypted = await encryptForUser(userId, message);
        if (encrypted.ok) initialMessageEnvelope = encrypted.envelopeString;
      }

      const res = await fetch('/api/friends/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: userId,
          initialMessageEnvelope: initialMessageEnvelope || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send request');
      }
      setFriendActionMessage('Friend request sent');
      setFriendDraftFor(null);
      setFriendDraftMessage('');
      await loadFriendState();
    } catch (error) {
      console.error(error);
      setFriendActionMessage(error instanceof Error ? error.message : 'Failed to send request');
    }
  }

  async function respondToRequest(requestId: string, action: 'accept' | 'decline') {
    try {
      const res = await fetch(`/api/friends/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, seedInitialMessage: action === 'accept' }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update request');
      }
      setFriendActionMessage(action === 'accept' ? 'Friend request accepted' : 'Friend request declined');
      await loadFriendState();

      if (action === 'accept' && data?.conversationId) {
        window.dispatchEvent(new CustomEvent('open-chat', { detail: { conversationId: data.conversationId } }));
      }
    } catch (error) {
      console.error(error);
      setFriendActionMessage(error instanceof Error ? error.message : 'Failed to update request');
    }
  }

  async function openChatWithUser(userId: string) {
    if (!session) {
      signIn();
      return;
    }
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start chat');
      }
      window.dispatchEvent(new CustomEvent('open-chat', { detail: { conversationId: data.conversationId } }));
    } catch (error) {
      console.error(error);
      setFriendActionMessage(error instanceof Error ? error.message : 'Failed to start chat');
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
          {friendActionMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-sm px-4 py-2 rounded-lg">
              {friendActionMessage}
            </div>
          )}
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
                      {profile.user?.id ? (
                        <Link
                          href={`/pilots/${encodeURIComponent(profile.user?.username || profile.user.id)}`}
                          className="hover:underline"
                        >
                          {profile.user?.name || profile.user?.username || 'Anonymous Pilot'}
                        </Link>
                      ) : (
                        profile.user?.name || profile.user?.username || 'Anonymous Pilot'
                      )}
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
                {profile.user?.id && profile.user.id !== session?.user?.id && (
                  (() => {
                    const incomingRequest = incomingRequests.find((req) => req.requester?.id === profile.user?.id);
                    const outgoingRequest = outgoingRequests.find((req) => req.recipient?.id === profile.user?.id);
                    const isFriend = friends.some((friend) => friend.id === profile.user?.id);

                    return (
                   <div className="mt-3 flex flex-wrap gap-2">
                    {isFriend ? (
                      <button
                        onClick={() => openChatWithUser(profile.user!.id)}
                        className="px-3 py-1 rounded-full text-xs bg-emerald-500/20 border border-emerald-400 text-emerald-200"
                      >
                        Chat
                      </button>
                    ) : outgoingRequest ? (
                      <span className="px-3 py-1 rounded-full text-xs bg-slate-700 text-slate-300">
                        Request Sent
                      </span>
                    ) : incomingRequest ? (
                      <>
                        <button
                          onClick={() => respondToRequest(incomingRequest.id, 'accept')}
                          className="px-3 py-1 rounded-full text-xs bg-emerald-500/20 border border-emerald-400 text-emerald-200"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => respondToRequest(incomingRequest.id, 'decline')}
                          className="px-3 py-1 rounded-full text-xs bg-slate-700 text-slate-300"
                        >
                          Decline
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setFriendDraftFor(profile.user!.id);
                            setFriendDraftMessage('');
                          }}
                          className="px-3 py-1 rounded-full text-xs bg-slate-700 text-slate-200"
                        >
                          Add Friend
                        </button>
                        {friendDraftFor === profile.user!.id && (
                          <div className="w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl p-3">
                            <div className="text-xs text-slate-400 mb-2">
                              Optional note (max 3 sentences). Sent encrypted (requires recipient E2EE key).
                            </div>
                            <textarea
                              value={friendDraftMessage}
                              onChange={(e) => setFriendDraftMessage(e.target.value)}
                              rows={3}
                              placeholder="Hey — want to connect?"
                              className="w-full bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                            />
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <div className={`text-xs ${countSentences(friendDraftMessage) > 3 ? 'text-amber-300' : 'text-slate-500'}`}>
                                {countSentences(friendDraftMessage)}/3 sentences
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setFriendDraftFor(null);
                                    setFriendDraftMessage('');
                                  }}
                                  className="px-3 py-1 rounded-full text-xs bg-slate-800 text-slate-300"
                                >
                                  Cancel
                                </button>
                                <button
                                  disabled={countSentences(friendDraftMessage) > 3}
                                  onClick={() => sendFriendRequest(profile.user!.id, friendDraftMessage)}
                                  className="px-3 py-1 rounded-full text-xs bg-emerald-500/20 border border-emerald-400 text-emerald-200 disabled:opacity-50"
                                >
                                  Send
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  );
                })()
              )}
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
                <div className="text-xs text-slate-500 mt-3">
                  Use friend request + chat to connect.
                </div>
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
