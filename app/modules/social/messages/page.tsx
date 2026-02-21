'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  Search, Plane, Users, Send, MoreHorizontal, Phone, Video, 
  ExternalLink, ChevronLeft
} from 'lucide-react'
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

type MessageItem = {
  id: string
  body: string
  createdAt: string
  senderId: string
}

function initials(name?: string | null) {
  const raw = (name || '').trim()
  if (!raw) return '?'
  const parts = raw.split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] || '?'
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : ''
  return (first + last).toUpperCase()
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showThread, setShowThread] = useState(false)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'marketplace' | 'friends'>('marketplace')
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
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

  async function loadConversations() {
    try {
      const res = await fetch('/api/conversations')
      const data = await res.json()
      if (data.conversations) {
        setConversations(data.conversations)
      }
    } catch (err) {
      console.error('Failed to load conversations', err)
    } finally {
      setLoading(false)
    }
  }

  async function loadMessages(conversationId: string) {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`)
      const data = await res.json()
      if (data.messages) {
        setMessages(data.messages)
      }
    } catch (err) {
      console.error('Failed to load messages', err)
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      loadConversations()
    }
  }, [session])

  useEffect(() => {
    if (selectedId) {
      loadMessages(selectedId)
    }
  }, [selectedId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSelect = (id: string) => {
    setSelectedId(id)
    setShowThread(true)
  }

  const handleBack = () => {
    setShowThread(false)
  }

  async function handleSendMessage() {
    if (!newMessage.trim() || !selectedId || !session) return
    
    setSubmitting(true)
    try {
      const res = await fetch(`/api/conversations/${selectedId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: newMessage }),
      })

      if (res.ok) {
        setNewMessage('')
        loadMessages(selectedId)
        loadConversations()
      }
    } catch (err) {
      console.error('Failed to send message', err)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredConversations = conversations.filter(c => {
    const isMarketplace = !!c.listingId
    if (tab === 'marketplace' && !isMarketplace) return false
    if (tab === 'friends' && isMarketplace) return false
    return true
  })

  const marketplaceConversations = conversations.filter(c => c.listingId)
  const friendsConversations = conversations.filter(c => !c.listingId)
  const marketplaceUnread = marketplaceConversations.length
  const friendsUnread = friendsConversations.length

  const selectedConversation = conversations.find(c => c.id === selectedId)
  const otherParticipant = selectedConversation?.participants.find(p => p.user.id !== currentUserId)?.user

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

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Please sign in to view messages.</p>
        </div>
      </div>
    )
  }

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
          <div className={`w-full lg:w-[340px] lg:min-w-[340px] border-r border-border bg-card ${showThread ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'}`}>
            <div className="p-4 border-b border-border">
              <div className="flex rounded-lg bg-secondary/60 p-1">
                <button
                  onClick={() => setTab('marketplace')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${tab === 'marketplace' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Plane className="w-4 h-4" />
                  <span>Marketplace</span>
                  {marketplaceUnread > 0 && (
                    <Badge className="bg-primary/20 text-primary border-0 px-1.5 py-0 text-xs">{marketplaceUnread}</Badge>
                  )}
                </button>
                <button
                  onClick={() => setTab('friends')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${tab === 'friends' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Users className="w-4 h-4" />
                  <span>Friends</span>
                  {friendsUnread > 0 && (
                    <Badge className="bg-primary/20 text-primary border-0 px-1.5 py-0 text-xs">{friendsUnread}</Badge>
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={tab === 'marketplace' ? 'Search listings or sellers...' : 'Search friends...'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 pb-2">
    
