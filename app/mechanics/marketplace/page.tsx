'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

type Listing = {
  id: string
  title: string
  description: string
  category: string
  urgency: string
  aircraftType?: string | null
  airportIcao?: string | null
  city?: string | null
  state?: string | null
  anonymous?: boolean
  source?: string
}

export default function MechanicMarketplacePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(false)
  const [respondingId, setRespondingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [quoteAmount, setQuoteAmount] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const res = await fetch('/api/mechanics/listings')
      if (!res.ok) {
        setError('Unable to load listings')
        setLoading(false)
        return
      }
      const data = await res.json()
      if (active) {
        setListings(Array.isArray(data.listings) ? data.listings : [])
        setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    async function ensureProfile() {
      if (!session?.user || (session.user.role !== 'mechanic' && session.user.role !== 'admin')) return
      const res = await fetch('/api/mechanics/profile')
      if (active && res.status === 404) {
        router.push('/mechanics/onboarding')
      }
    }
    ensureProfile()
    return () => {
      active = false
    }
  }, [session?.user, router])

  const handleRespond = async (id: string) => {
    const res = await fetch(`/api/mechanics/listings/${id}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        quoteAmount: quoteAmount ? Number(quoteAmount) : undefined,
      }),
    })
    if (res.ok) {
      setRespondingId(null)
      setMessage('')
      setQuoteAmount('')
      setError(null)
    } else {
      setError('Failed to send response')
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen bg-background p-6">Loading…</div>
  }

  if (!session?.user) {
    return <div className="min-h-screen bg-background p-6">Please sign in.</div>
  }

  if (session.user.role !== 'mechanic' && session.user.role !== 'admin') {
    return <div className="min-h-screen bg-background p-6">Mechanic access only.</div>
  }

  return (
    <div className="min-h-screen bg-background p-6 pt-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Mechanic Marketplace</h1>
          <p className="text-sm text-muted-foreground">Browse open maintenance requests.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Open Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && <p className="text-sm text-muted-foreground">Loading listings…</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
            {!loading && listings.length === 0 && (
              <p className="text-sm text-muted-foreground">No open requests yet.</p>
            )}
            {listings.map((listing) => (
              <div key={listing.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{listing.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {[listing.city, listing.state, listing.airportIcao].filter(Boolean).join(' • ') || 'Location hidden'}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{listing.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-[10px]">{listing.category}</Badge>
                      <Badge variant="outline" className="text-[10px]">{listing.urgency}</Badge>
                      {listing.aircraftType && (
                        <Badge variant="outline" className="text-[10px]">{listing.aircraftType}</Badge>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setRespondingId(listing.id)}>
                    Respond
                  </Button>
                </div>

                {respondingId === listing.id && (
                  <div className="mt-4 space-y-3 border-t border-border pt-4">
                    <Textarea
                      placeholder="Message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Quote amount (optional)"
                      value={quoteAmount}
                      onChange={(e) => setQuoteAmount(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => handleRespond(listing.id)}>Send</Button>
                      <Button variant="outline" onClick={() => setRespondingId(null)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
