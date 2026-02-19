'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getPusherClient } from '@/lib/pusher-client';

type ConversationItem = {
  id: string;
  updatedAt: string;
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

export default function ChatWidget() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'list' | 'chat'>('list');
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');

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
    loadConversations();
    loadRequests();
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
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Failed to load conversations', error);
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

  async function openConversation(conversationId: string) {
    setActiveConversationId(conversationId);
    setView('chat');
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load messages', error);
    }
  }

  async function sendMessage() {
    if (!activeConversationId || !messageInput.trim()) return;
    try {
      const res = await fetch(`/api/conversations/${activeConversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: messageInput }),
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

  async function respondToRequest(requestId: string, action: 'accept' | 'decline') {
    try {
      const res = await fetch(`/api/friends/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update request');
      }
      await loadRequests();
      await loadConversations();
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
            <div className="text-white font-semibold">Messages</div>
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
              {incomingRequests.length > 0 && (
                <div className="p-3 border-b border-slate-800">
                  <div className="text-xs uppercase text-slate-500 mb-2">Requests</div>
                  <div className="space-y-2">
                    {incomingRequests.map((req) => (
                      <div key={req.id} className="bg-slate-800 rounded-lg p-2">
                        <div className="text-sm text-white">
                          {req.requester?.name || req.requester?.username || 'Pilot'}
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
                <div className="text-xs uppercase text-slate-500 mb-2">Chats</div>
                {conversations.length === 0 ? (
                  <div className="text-sm text-slate-400">No conversations yet.</div>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((conversation) => {
                      const participant = conversation.participants.find((p) => p.user.id !== currentUserId)?.user;
                      const lastMessage = conversation.messages[0];
                      return (
                        <button
                          key={conversation.id}
                          onClick={() => openConversation(conversation.id)}
                          className="w-full text-left bg-slate-800 rounded-lg p-2 hover:bg-slate-700"
                        >
                          <div className="text-sm text-white">
                            {participant?.name || participant?.username || 'Pilot'}
                          </div>
                          <div className="text-xs text-slate-400 truncate">
                            {lastMessage ? lastMessage.body : 'No messages yet'}
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
              <div className="px-4 py-2 border-b border-slate-800 text-sm text-slate-300">
                {otherParticipant?.name || otherParticipant?.username || 'Conversation'}
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      message.senderId === currentUserId
                        ? 'ml-auto bg-emerald-500/20 text-emerald-100'
                        : 'bg-slate-800 text-slate-100'
                    }`}
                  >
                    {message.body}
                  </div>
                ))}
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
