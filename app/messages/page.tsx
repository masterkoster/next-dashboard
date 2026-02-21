'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Search, Plane, Users, Send, MoreHorizontal, Phone, Video, ExternalLink, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

type ConversationItem = {
  id: string
  updatedAt: string
  listingId?: string | null
  listing?: { id: string; title: string; airportIcao: string } | null
  participants: { user: { id: string; name?: string | null; username?: string | null } }[]
  messages: { id: string; body: string; createdAt: string; senderId: string }[]
}

function initials(name?: string | null) {
  const raw = (name || '').trim()
  if (!raw) return '?'
  const parts = raw.split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] || '?'
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : ''
  return (first + last).toUpperCase()
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return date.toLocaleDateString()
}

function MessagesContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showThread, setShowThread] = useState(false)
  const [tab, setTab] = useState<'marketplace' | 'friends'>('marketplace')
  const [search, setSearch] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentUserId = session?.user?.id

  useEffect(() => {
    const newConvoId = searchParams.get('newConversation')
    if (newConvoId) {
      setSelectedId(newConvoId)
      setShowThread(true)
      setTab('marketplace')
    }
  }, [searchParams])

  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/conversations').then(r => r.json()).then(d => { setConversations(d.conversations || []); setLoading(false) }).catch(() => setLoading(false))
    }
  }, [session])

  useEffect(() => {
    if (selectedId) {
      fetch(`/api/conversations/${selectedId}/messages`).then(r => r.json()).then(d => setMessages(d.messages || [])).catch(() => {})
    }
  }, [selectedId])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const marketplaceConversations = conversations.filter(c => c.listingId)
  const friendsConversations = conversations.filter(c => !c.listingId)
  const selectedConversation = conversations.find(c => c.id === selectedId)
  const otherParticipant = selectedConversation?.participants.find(p => p.user.id !== currentUserId)?.user
  const filteredConversations = tab === 'marketplace' ? marketplaceConversations : friendsConversations

  async function handleSend() {
    if (!newMessage.trim() || !selectedId) return
    await fetch(`/api/conversations/${selectedId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body: newMessage }) })
    setNewMessage('')
    fetch(`/api/conversations/${selectedId}/messages`).then(r => r.json()).then(d => setMessages(d.messages || [])).catch(() => {})
  }

  if (!session) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Please sign in to view messages.</p></div>

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="border-b border-border bg-card/50 px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-sm text-muted-foreground">Chat with sellers and friends</p>
        </div>
      </div>
      <main className="flex-1 overflow-hidden px-0 lg:px-8 lg:py-4">
        <div className="h-[calc(100vh-8rem)] border border-border rounded-xl overflow-hidden bg-card flex max-w-7xl mx-auto">
          <div className={`w-full lg:w-[340px] border-r border-border bg-card ${showThread ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'}`}>
            <div className="p-4 border-b border-border">
              <div className="flex rounded-lg bg-secondary/60 p-1">
                <button onClick={() => setTab('marketplace')} className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${tab === 'marketplace' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                  <Plane className="w-4 h-4" /><span>Marketplace</span>
                  {marketplaceConversations.length > 0 && <Badge className="bg-primary/20 text-primary border-0 px-1.5 text-xs">{marketplaceConversations.length}</Badge>}
                </button>
                <button onClick={() => setTab('friends')} className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${tab === 'friends' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                  <Users className="w-4 h-4" /><span>Friends</span>
                </button>
              </div>
            </div>
            <div className="p-4 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder={tab === 'marketplace' ? 'Search listings or sellers...' : 'Search friends...'} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {loading ? <div className="p-4 text-center text-muted-foreground">Loading...</div> : filteredConversations.length === 0 ? <div className="p-4 text-center text-muted-foreground">No conversations yet</div> : filteredConversations.map((convo) => {
                const participant = convo.participants.find(p => p.user.id !== currentUserId)?.user
                return (
                  <button key={convo.id} onClick={() => { setSelectedId(convo.id); setShowThread(true) }} className={`w-full text-left p-3 rounded-lg mb-1 ${selectedId === convo.id ? 'bg-secondary' : 'hover:bg-secondary/50'}`}>
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0"><span className="text-xs font-semibold text-muted-foreground">{initials(participant?.name || participant?.username)}</span></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{convo.listing?.title || participant?.name || 'Pilot'}</div>
                        {tab === 'marketplace' && convo.listing && <div className="flex items-center gap-1 mt-0.5"><Plane className="w-3 h-3 text-primary" /><span className="text-xs text-primary truncate">{convo.listing.title}</span></div>}
                        <div className="text-xs text-muted-foreground truncate">{participant?.name || participant?.username}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
          <div className={`flex-1 ${showThread ? 'flex flex-col' : 'hidden lg:flex'}`}>
            {selectedId && selectedConversation ? (
              <>
                <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-border bg-card/50">
                  <div className="flex items-center gap-3">
                    {showThread && <button onClick={() => setShowThread(false)} className="lg:hidden"><ChevronLeft className="w-5 h-5" /></button>}
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"><span className="text-xs font-semibold text-muted-foreground">{initials(otherParticipant?.name || otherParticipant?.username)}</span></div>
                    <div><h3 className="text-sm font-semibold">{otherParticipant?.name || 'Pilot'}</h3><span className="text-xs text-primary">Tap to view profile</span></div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9"><Phone className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9"><Video className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9"><MoreHorizontal className="w-4 h-4" /></Button>
                  </div>
                </div>
                {selectedConversation.listing && (
                  <div className="px-4 lg:px-6 py-3 border-b border-border bg-secondary/30">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-card border">
                      <div className="w-14 h-10 rounded-md bg-secondary flex items-center justify-center shrink-0"><Plane className="w-5 h-5 text-primary" /></div>
                      <div className="flex-1"><p className="text-sm font-medium truncate">{selectedConversation.listing.title}</p><p className="text-xs text-muted-foreground">{selectedConversation.listing.airportIcao}</p></div>
                      <Link href={`/modules/marketplace/listing/${selectedConversation.listing.id}`}><Button variant="ghost" size="sm" className="gap-1"><ExternalLink className="w-3.5 h-3.5" /><span className="hidden sm:inline text-xs">View</span></Button></Link>
                    </div>
                  </div>
                )}
                <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'} mb-4`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${msg.senderId === currentUserId ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>{msg.body}</div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="px-4 lg:px-6 py-4 border-t border-border bg-card/50">
                  <div className="flex gap-2">
                    <textarea rows={1} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }} placeholder="Type a message..." className="flex-1 resize-none bg-secondary/60 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none" />
                    <Button onClick={handleSend} disabled={!newMessage.trim()} className="h-10 w-10"><Send className="w-4 h-4" /></Button>
                  </div>
                </div>
              </>
            ) : <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a conversation</div>}
          </div>
        </div>
      </main>
    </div>
  )
}

function MessagesLoading() {
  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="text-muted-foreground">Loading messages...</div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesLoading />}>
      <MessagesContent />
    </Suspense>
  )
}
