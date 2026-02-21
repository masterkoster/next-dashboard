'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getPusherClient } from '@/lib/pusher-client';
import { checkMessageSafety } from '@/lib/message-safety';
import {
  ensureIdentityKeypair,
  publishMyPublicKey,
  decryptWithUser,
  encryptForUser,
  validateE2eeEnvelopeString,
} from '@/lib/e2ee';

type ConversationItem = {
  id: string;
  updatedAt: string;
  listingId?: string | null;
  listing?: { id: string; title: string; airportIcao: string } | null;
  participants: { user: { id: string; name?: string | null; username?: string | null } }[];
  messages: { id: string; body: string; createdAt: string; senderId: string }[];
};

type MessageItem = {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
  sender: { id: string; name?: string | null; username?: string | null };
};

type InviteItem = {
  id: string;
  role: string;
  createdAt: string;
  group: { id: string; name: string; description?: string | null };
};

type PilotProfile = {
  id: string;
  userId: string;
  homeAirport?: string | null;
  user?: { id: string; name?: string | null; username?: string | null; image?: string | null; age?: number | null } | null;
};

type AirportDetails = {
  icao?: string;
  name?: string;
  city?: string;
  state?: string;
};

type UserMeta = {
  id: string;
  displayName: string;
  username?: string | null;
  image?: string | null;
  age?: number | null;
  homeAirport?: string | null;
  isOnline?: boolean;
  lastSeenAt?: string | null;
};

type FriendWithStatus = {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  homeAirport: string | null;
  isOnline: boolean;
  lastSeenAt: string | null;
};

function initials(name?: string | null) {
  const raw = (name || '').trim();
  if (!raw) return '?';
  const parts = raw.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || '?';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
  return (first + last).toUpperCase();
}

function buildProfileHref(userId: string, username?: string | null) {
  return `/pilots/${encodeURIComponent(username || userId)}`;
}

function formatLocation(homeAirport?: string | null, airport?: AirportDetails | null) {
  const icao = (homeAirport || '').toString().trim().toUpperCase();
  if (!icao) return 'No home airport';
  if (!airport) return icao;
  const place = [airport.city, airport.state].filter(Boolean).join(', ');
  const name = airport.name ? `${airport.name}` : 'Airport';
  return `${airport.state || '—'} • ${name}${place ? ` (${place})` : ''} • ${icao}`;
}

function formatLastSeen(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function ChatWidget() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'list' | 'chat'>('list');
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);
  const [pendingInvites, setPendingInvites] = useState<InviteItem[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [userMeta, setUserMeta] = useState<Record<string, UserMeta>>({});
  const [airportCache, setAirportCache] = useState<Record<string, AirportDetails>>({});
  const [decryptedBodies, setDecryptedBodies] = useState<Record<string, string>>({});
  const [e2eeNotice, setE2eeNotice] = useState<string | null>(null);
  const [friends, setFriends] = useState<FriendWithStatus[]>([]);

  const currentUserId = session?.user?.id;

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) || null,
    [conversations, activeConversationId]
  );

  const otherParticipant = useMemo(() => {
    if (!activeConversation || !currentUserId) return null;
    const participant = activeConversation.participants.find((p) => p.user.id !== currentUserId);
    return participant?.user || null;
  }, [activeConversation, currentUserId]);

  useEffect(() => {
    if (!session?.user?.id) return;
    
    // Check for newConversation query param to open a specific conversation
    const urlParams = new URLSearchParams(window.location.search);
    const newConversationId = urlParams.get('newConversation');
    
    ensureIdentityKeypair().catch(() => {});
    publishMyPublicKey().catch(() => {});
    loadConversations().then(() => {
      // If there's a newConversation param, open that conversation
      if (newConversationId) {
        openConversation(newConversationId);
        // Clean up the URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    });
    loadRequests();
    loadInvites();
    loadFriends();

    // Heartbeat every 30 seconds to maintain online presence
    const heartbeat = () => {
      fetch('/api/presence/heartbeat', { method: 'POST' }).catch(() => {});
    };
    heartbeat();
    const interval = setInterval(heartbeat, 30000);

    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail || {};
      if (detail?.conversationId) {
        setOpen(true);
        openConversation(detail.conversationId);
      }
    };
    window.addEventListener('open-chat', handler as EventListener);
    return () => window.removeEventListener('open-chat', handler as EventListener);
  }, []);

  useEffect(() => {
    if (!activeConversationId) return;
    const client = getPusherClient();
    if (!client) return;

    const channel = client.subscribe(`conversation-${activeConversationId}`);
    channel.bind('new-message', (data: { message: MessageItem }) => {
      setMessages((prev) => [...prev, data.message]);
      loadConversations();
    });

    return () => {
      channel.unbind_all();
      client.unsubscribe(`conversation-${activeConversationId}`);
    };
  }, [activeConversationId]);

  async function loadConversations() {
    try {
      const res = await fetch('/api/conversations');
      const data = await res.json();
      const nextConversations: ConversationItem[] = data.conversations || [];
      setConversations(nextConversations);
      hydrateConversationMeta(nextConversations);
    } catch (error) {
      console.error('Failed to load conversations', error);
    }
  }

  async function hydrateConversationMeta(nextConversations: ConversationItem[]) {
    try {
      const otherUsers = nextConversations
        .map((c) => c.participants.map((p) => p.user))
        .flat()
        .filter((u) => u.id !== currentUserId);

      const missingIds = Array.from(new Set(otherUsers.map((u) => u.id))).filter((id) => !userMeta[id]);
      if (missingIds.length === 0) return;

      const pilotsRes = await fetch('/api/pilots');
      const pilotsData = await pilotsRes.json();
      const profiles: PilotProfile[] = pilotsData.profiles || [];

      const profileByUserId = new Map<string, PilotProfile>();
      for (const p of profiles) {
        const id = p.user?.id || p.userId;
        if (id) profileByUserId.set(id, p);
      }

      const nextMeta: Record<string, UserMeta> = {};
      const neededIcaos = new Set<string>();

      for (const id of missingIds) {
        const fallback = otherUsers.find((u) => u.id === id);
        const profile = profileByUserId.get(id);
        const displayName =
          profile?.user?.name || profile?.user?.username || fallback?.name || fallback?.username || 'Pilot';
        const homeAirport = profile?.homeAirport || null;
        if (homeAirport) neededIcaos.add(homeAirport.toString().trim().toUpperCase());

        nextMeta[id] = {
          id,
          displayName,
          username: profile?.user?.username || fallback?.username || null,
          image: profile?.user?.image || null,
          age: typeof profile?.user?.age === 'number' ? profile.user.age : null,
          homeAirport,
        };
      }

      if (Object.keys(nextMeta).length) {
        setUserMeta((prev) => ({ ...prev, ...nextMeta }));
      }

      const missingIcaos = Array.from(neededIcaos).filter((icao) => icao && !airportCache[icao]);
      if (missingIcaos.length) {
        const entries = await Promise.all(
          missingIcaos.map(async (icao) => {
            try {
              const res = await fetch(`/api/airports/${encodeURIComponent(icao)}`);
              if (!res.ok) return null;
              const data = await res.json();
              const details: AirportDetails = {
                icao: data.icao || icao,
                name: data.name,
                city: data.city,
                state: data.state,
              };
              return [icao, details] as const;
            } catch {
              return null;
            }
          }),
        );

        const nextAirports: Record<string, AirportDetails> = {};
        for (const entry of entries) {
          if (!entry) continue;
          nextAirports[entry[0]] = entry[1];
        }
        if (Object.keys(nextAirports).length) {
          setAirportCache((prev) => ({ ...prev, ...nextAirports }));
        }
      }
    } catch (error) {
      console.error('Failed to load participant metadata', error);
    }
  }

  async function loadRequests() {
    try {
      const res = await fetch('/api/friends/requests');
      const data = await res.json();
      setIncomingRequests(data.incoming || []);
      setOutgoingRequests(data.outgoing || []);
    } catch (error) {
      console.error('Failed to load requests', error);
    }
  }

  async function loadInvites() {
    try {
      const res = await fetch('/api/invitations');
      if (!res.ok) {
        setPendingInvites([]);
        return;
      }
      const data = await res.json();
      setPendingInvites(Array.isArray(data) ? (data as InviteItem[]) : []);
    } catch (error) {
      console.error('Failed to load invites', error);
      setPendingInvites([]);
    }
  }

  async function loadFriends() {
    try {
      const res = await fetch('/api/friends/with-status');
      const data = await res.json();
      setFriends(data.friends || []);
    } catch (error) {
      console.error('Failed to load friends', error);
      setFriends([]);
    }
  }

  async function acceptInvite(inviteId: string) {
    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to accept invitation');
      }
      setPendingInvites((prev) => prev.filter((i) => i.id !== inviteId));
    } catch (error) {
      console.error(error);
    }
  }

  async function openConversation(conversationId: string) {
    setActiveConversationId(conversationId);
    setView('chat');
    setDecryptedBodies({});
    setE2eeNotice(null);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load messages', error);
    }
  }

  async function startConversation(userId: string) {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('Failed to start conversation:', data.error);
        return;
      }
      await loadConversations();
      if (data.conversationId) {
        await openConversation(data.conversationId);
      }
    } catch (error) {
      console.error('Failed to start conversation', error);
    }
  }

  async function sendMessage() {
    if (!activeConversationId || !messageInput.trim()) return;
    try {
      const peerId = otherParticipant?.id;
      const rawText = messageInput.trim();

      const safety = checkMessageSafety(rawText);
      if (!safety.ok) {
        setE2eeNotice(safety.error);
        return;
      }

      if (!peerId) return;
      const encrypted = await encryptForUser(peerId, rawText);
      if (!encrypted.ok) {
        setE2eeNotice(encrypted.reason);
        return;
      }

      const res = await fetch(`/api/conversations/${activeConversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: encrypted.envelopeString }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message');
      }
      setMessages((prev) => [...prev, data.message]);
      setMessageInput('');
      loadConversations();
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (!currentUserId) return;
    if (!activeConversationId) return;

    let cancelled = false;
    async function run() {
      const peerId = otherParticipant?.id;
      const next: Record<string, string> = {};

      await Promise.all(
        messages.map(async (message) => {
          const validated = validateE2eeEnvelopeString(message.body, { maxLen: 50_000 });
          if (!validated.ok) return;

          const decryptPeerId = message.senderId === currentUserId ? peerId : message.senderId;
          if (!decryptPeerId) return;
          const plaintext = await decryptWithUser(decryptPeerId, message.body);
          if (plaintext.ok) next[message.id] = plaintext.plaintext;
        }),
      );

      if (!cancelled && Object.keys(next).length) {
        setDecryptedBodies((prev) => ({ ...prev, ...next }));
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [messages, activeConversationId, currentUserId, otherParticipant?.id]);

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
      await loadRequests();
      await loadConversations();

      if (action === 'accept' && data?.conversationId) {
        await openConversation(data.conversationId);
      }
    } catch (error) {
      console.error(error);
    }
  }

  if (!session?.user?.id) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-full px-4 py-3 shadow-lg"
      >
        {open ? 'Close Chat' : 'Chat'}
      </button>

      {open && (
        <div className="mt-3 w-[320px] max-h-[70vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <div className="text-white font-semibold">Messages</div>
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-slate-700 text-slate-300">E2EE</span>
            </div>
            {view === 'chat' && (
              <button
                onClick={() => setView('list')}
                className="text-xs text-slate-400 hover:text-white"
              >
                Back
              </button>
            )}
          </div>

          {view === 'list' && (
            <div className="flex-1 overflow-y-auto">
              {pendingInvites.length > 0 && (
                <div className="p-3 border-b border-slate-800">
                  <div className="text-xs uppercase text-slate-500 mb-2">Invitations</div>
                  <div className="space-y-2">
                    {pendingInvites.map((invite) => (
                      <div key={invite.id} className="bg-slate-800 rounded-lg p-2">
                        <div className="text-sm text-white">{invite.group?.name || 'Flying club'}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Role: {invite.role}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => acceptInvite(invite.id)}
                            className="flex-1 text-xs bg-emerald-500/20 border border-emerald-400 text-emerald-200 rounded-full py-1"
                          >
                            Accept
                          </button>
                          <Link
                            href={`/modules/flying-club/groups/${encodeURIComponent(invite.group?.id || '')}`}
                            className="flex-1 text-center text-xs bg-slate-700 text-slate-300 rounded-full py-1"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {incomingRequests.length > 0 && (
                <div className="p-3 border-b border-slate-800">
                  <div className="text-xs uppercase text-slate-500 mb-2">Requests</div>
                  <div className="space-y-2">
                    {incomingRequests.map((req) => (
                      <div key={req.id} className="bg-slate-800 rounded-lg p-2">
                        <div className="flex items-center justify-between gap-2">
                          <Link
                            href={buildProfileHref(req.requester?.id, req.requester?.username)}
                            className="text-sm text-white hover:underline"
                          >
                            {req.requester?.name || req.requester?.username || 'Pilot'}
                          </Link>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => respondToRequest(req.id, 'accept')}
                            className="flex-1 text-xs bg-emerald-500/20 border border-emerald-400 text-emerald-200 rounded-full py-1"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => respondToRequest(req.id, 'decline')}
                            className="flex-1 text-xs bg-slate-700 text-slate-300 rounded-full py-1"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3">
                {friends.length > 0 && (
                  <>
                    <div className="text-xs uppercase text-slate-500 mb-2">Friends</div>
                    <div className="space-y-2 mb-4">
                      {friends.map((friend) => {
                        const homeAirport = friend.homeAirport || null;
                        const airport = homeAirport ? airportCache[homeAirport.toString().trim().toUpperCase()] : null;
                        return (
                          <button
                            key={friend.id}
                            onClick={() => startConversation(friend.id)}
                            className="w-full text-left bg-slate-800 rounded-lg p-2 hover:bg-slate-700"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="relative flex-shrink-0">
                                {friend.image ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={friend.image}
                                    alt=""
                                    className="h-8 w-8 rounded-full border border-slate-700 object-cover"
                                  />
                                ) : (
                                  <div className="h-8 w-8 rounded-full bg-slate-700/70 border border-slate-600 flex items-center justify-center text-white text-xs font-semibold">
                                    {initials(friend.name || friend.username)}
                                  </div>
                                )}
                                <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-900 ${friend.isOnline ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm text-white truncate">
                                  {friend.isOnline && <span className="text-emerald-400 mr-1">●</span>}
                                  {friend.name || friend.username || 'Pilot'}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate">
                                  {friend.isOnline ? 'Online' : friend.lastSeenAt ? `Last seen ${formatLastSeen(friend.lastSeenAt)}` : formatLocation(homeAirport, airport || null)}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                <div className="text-xs uppercase text-slate-500 mb-2">Chats</div>
                {conversations.length === 0 ? (
                  <div className="text-sm text-slate-400">No conversations yet.</div>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((conversation) => {
                      const participant = conversation.participants.find((p) => p.user.id !== currentUserId)?.user;
                      const friendStatus = friends.find(f => f.id === participant?.id);
                      const isOnline = friendStatus?.isOnline || false;
                      const meta = participant?.id ? userMeta[participant.id] : null;
                      const homeAirport = meta?.homeAirport || null;
                      const airport = homeAirport ? airportCache[homeAirport.toString().trim().toUpperCase()] : null;
                      const lastMessage = conversation.messages[0];
                      const preview = !lastMessage
                        ? 'No messages yet'
                        : 'Encrypted message';
                      const isMarketplace = !!conversation.listingId;
                      return (
                        <button
                          key={conversation.id}
                          onClick={() => openConversation(conversation.id)}
                          className="w-full text-left bg-slate-800 rounded-lg p-2 hover:bg-slate-700"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <Link
                                href={buildProfileHref(participant?.id || '', meta?.username || participant?.username)}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-2 min-w-0"
                              >
                                <div className="relative flex-shrink-0">
                                  {meta?.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={meta.image}
                                      alt=""
                                      className="h-8 w-8 rounded-full border border-slate-700 object-cover flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="h-8 w-8 rounded-full bg-slate-700/70 border border-slate-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                        {initials(meta?.displayName || participant?.name || participant?.username)}
                                    </div>
                                  )}
                                  <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-900 ${isOnline ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1">
                                    {isMarketplace && (
                                      <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">Market</span>
                                    )}
                                    <span className="text-sm text-white truncate">
                                      {conversation.listing?.title || meta?.displayName || participant?.name || participant?.username || 'Pilot'}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-400 truncate">
                                    {isMarketplace 
                                      ? `Listing: ${conversation.listing?.title}`
                                      : `${typeof meta?.age === 'number' ? `${meta.age} • ` : ''}${formatLocation(homeAirport, airport || null)}`
                                    }
                                  </div>
                                </div>
                              </Link>
                            </div>
                          </div>
                          <div className="text-xs text-slate-400 truncate">
                            {preview}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {view === 'chat' && (
            <div className="flex-1 flex flex-col">
              {/* Header with participant and optional listing info */}
              <div className="px-4 py-2 border-b border-slate-800">
                {activeConversation?.listing && (
                  <Link
                    href={`/modules/marketplace/listing/${activeConversation.listing.id}`}
                    className="flex items-center gap-2 text-xs text-primary hover:underline mb-1"
                  >
                    <span className="bg-primary/10 px-2 py-0.5 rounded">Listing</span>
                    <span className="truncate">{activeConversation.listing.title}</span>
                  </Link>
                )}
                <div className="flex items-center justify-between gap-2">
                  {otherParticipant ? (
                    <Link
                      href={buildProfileHref(otherParticipant.id, otherParticipant.username)}
                      className="hover:underline text-sm text-slate-300"
                    >
                      {otherParticipant?.name || otherParticipant?.username || 'Conversation'}
                    </Link>
                  ) : (
                    <span className="text-sm text-slate-300">Conversation</span>
                  )}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/modules/social/messages?newConversation=${activeConversationId}`}
                      className="text-[10px] text-primary hover:underline"
                      target="_blank"
                    >
                      Full Page
                    </Link>
                    <span className="text-[11px] text-slate-500">E2EE</span>
                  </div>
                </div>
              </div>
              {e2eeNotice && (
                <div className="px-4 py-2 border-b border-slate-800 text-[11px] text-amber-200 bg-amber-500/10">
                  {e2eeNotice}
                </div>
              )}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.map((message) => {
                    const shown =
                      decryptedBodies[message.id] ??
                      'Encrypted message';
                    return (
                  <div
                    key={message.id}
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      message.senderId === currentUserId
                        ? 'ml-auto bg-emerald-500/20 text-emerald-100'
                        : 'bg-slate-800 text-slate-100'
                    }`}
                  >
                    {shown}
                  </div>
                );
                  })}
              </div>
              <div className="border-t border-slate-800 p-2 flex gap-2">
                <input
                  value={messageInput}
                  onChange={(event) => setMessageInput(event.target.value)}
                  placeholder="Type a message"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
                <button
                  onClick={sendMessage}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white text-sm px-3 rounded-lg"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
