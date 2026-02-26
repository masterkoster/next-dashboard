'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Quote = {
  id: string
  amount?: number | null
  description: string
  status: string
  createdAt: string
  mechanic: {
    businessName?: string | null
    name: string
    city?: string | null
    state?: string | null
  }
  maintenanceRequest: {
    id: string
    title: string
    category: string
    urgency: string
  }
}

export default function PilotMechanicInbox() {
  const { data: session, status } = useSession()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const res = await fetch('/api/mechanics/quotes')
      if (res.ok) {
        const data = await res.json()
        if (active) {
          setQuotes(Array.isArray(data.quotes) ? data.quotes : [])
        }
      }
      setLoading(false)
    }

    if (session?.user) {
      load()
    }

    return () => {
      active = false
    }
  }, [session?.user])

  useEffect(() => {
    if (!session?.user) return
    fetch('/api/mechanics/quotes/mark-read', { method: 'POST' }).catch(() => {})
  }, [session?.user])

  if (status === 'loading' || loading) {
    return <div className="min-h-screen bg-background p-6">Loading…</div>
  }

  if (!session?.user) {
    return <div className="min-h-screen bg-background p-6">Please sign in.</div>
  }

  const updateStatus = async (id: string, status: 'ACCEPTED' | 'DECLINED') => {
    setUpdatingId(id)
    await fetch(`/api/mechanics/quotes/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await fetch('/api/mechanics/quotes/mark-read', { method: 'POST' }).catch(() => {})
    const res = await fetch('/api/mechanics/quotes')
    if (res.ok) {
      const data = await res.json()
      setQuotes(Array.isArray(data.quotes) ? data.quotes : [])
    }
    setUpdatingId(null)
  }

  return (
    <div className="min-h-screen bg-background p-6 pt-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Mechanic Responses</h1>
          <p className="text-sm text-muted-foreground">Quotes and messages from mechanics.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Inbox</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quotes.length === 0 && (
              <p className="text-sm text-muted-foreground">No responses yet.</p>
            )}
            {quotes.map((quote) => (
              <div key={quote.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">
                      {quote.mechanic.businessName || quote.mechanic.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[quote.mechanic.city, quote.mechanic.state].filter(Boolean).join(' • ') || 'Location hidden'}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{quote.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-[10px]">{quote.maintenanceRequest.category}</Badge>
                      <Badge variant="outline" className="text-[10px]">{quote.maintenanceRequest.urgency}</Badge>
                      <Badge variant="outline" className="text-[10px]">{quote.status}</Badge>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    {typeof quote.amount === 'number' && (
                      <div>
                        <p className="text-sm font-semibold">${quote.amount.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Quote</p>
                      </div>
                    )}
                    <div className="flex gap-2 justify-end">
                      <button
                        className="rounded-md border border-border px-2 py-1 text-xs"
                        disabled={updatingId === quote.id}
                        onClick={() => updateStatus(quote.id, 'ACCEPTED')}
                      >
                        Accept
                      </button>
                      <button
                        className="rounded-md border border-border px-2 py-1 text-xs"
                        disabled={updatingId === quote.id}
                        onClick={() => updateStatus(quote.id, 'DECLINED')}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{quote.maintenanceRequest.title}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
