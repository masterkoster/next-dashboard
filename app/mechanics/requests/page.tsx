'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Listing = {
  id: string
  title: string
  status: string
  category: string
  jobSize?: string | null
  neededBy?: string | null
}

export default function PilotRequestsPage() {
  const { data: session, status } = useSession()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const res = await fetch('/api/mechanics/listings/mine')
      if (res.ok) {
        const data = await res.json()
        if (active) {
          setListings(Array.isArray(data.listings) ? data.listings : [])
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

  const revoke = async (id: string) => {
    await fetch(`/api/mechanics/listings/${id}/revoke`, { method: 'POST' })
    const res = await fetch('/api/mechanics/listings/mine')
    if (res.ok) {
      const data = await res.json()
      setListings(Array.isArray(data.listings) ? data.listings : [])
    }
  }

  if (status === 'loading' || loading) {
    return <div className="min-h-screen bg-background p-6">Loading…</div>
  }

  if (!session?.user) {
    return <div className="min-h-screen bg-background p-6">Please sign in.</div>
  }

  return (
    <div className="min-h-screen bg-background p-6 pt-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Service Bay Requests</h1>
          <p className="text-sm text-muted-foreground">Track listings you posted to mechanics.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {listings.length === 0 && (
              <p className="text-sm text-muted-foreground">No listings yet.</p>
            )}
            {listings.map((listing) => (
              <div key={listing.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{listing.title}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-[10px]">{listing.status}</Badge>
                      <Badge variant="outline" className="text-[10px]">{listing.category}</Badge>
                      {listing.jobSize && (
                        <Badge variant="outline" className="text-[10px]">{listing.jobSize}</Badge>
                      )}
                      {listing.neededBy && (
                        <Badge variant="outline" className="text-[10px]">Needed by {new Date(listing.neededBy).toLocaleDateString()}</Badge>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => revoke(listing.id)}>
                    Revoke
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
