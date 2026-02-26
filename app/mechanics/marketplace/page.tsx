'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Wrench } from 'lucide-react'

type Listing = {
  id: string
  title: string
  description: string
  category: string
  urgency: string
  neededBy?: string | null
  jobSize?: string | null
  allowTailNumber?: boolean
  aircraftSnapshot?: string | null
  logbookSnapshot?: string | null
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
  const [laborRate, setLaborRate] = useState('')
  const [laborHours, setLaborHours] = useState('')
  const [partsEstimate, setPartsEstimate] = useState('')
  const [requiresApproval, setRequiresApproval] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterSize, setFilterSize] = useState<string>('ALL')
  const [filterCategory, setFilterCategory] = useState<string>('ALL')
  const [fileRequestId, setFileRequestId] = useState<string | null>(null)
  const [requestedFiles, setRequestedFiles] = useState<string[]>([])

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      if (filterSize !== 'ALL' && listing.jobSize !== filterSize) return false
      if (filterCategory !== 'ALL' && listing.category !== filterCategory) return false
      return true
    })
  }, [listings, filterSize, filterCategory])

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
        laborRate: laborRate ? Number(laborRate) : undefined,
        laborHours: laborHours ? Number(laborHours) : undefined,
        partsEstimate: partsEstimate ? Number(partsEstimate) : undefined,
        requiresApproval,
      }),
    })
    if (res.ok) {
      setRespondingId(null)
      setMessage('')
      setQuoteAmount('')
      setLaborRate('')
      setLaborHours('')
      setPartsEstimate('')
      setRequiresApproval(false)
      setError(null)
    } else {
      setError('Failed to send response')
    }
  }

  const handleFileRequest = async (listingId: string) => {
    const res = await fetch('/api/mechanics/file-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maintenanceRequestId: listingId, requestedFiles }),
    })

    if (res.ok) {
      setFileRequestId(null)
      setRequestedFiles([])
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
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Service Bay</h1>
          <p className="text-sm text-muted-foreground">Work orders available to mechanics.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-xs text-muted-foreground">Job size</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {['ALL', 'SMALL', 'MEDIUM', 'LARGE'].map((size) => (
                  <Button
                    key={size}
                    size="sm"
                    variant={filterSize === size ? 'default' : 'outline'}
                    onClick={() => setFilterSize(size)}
                  >
                    {size === 'ALL' ? 'All' : size}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Category</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {['ALL', 'ENGINE', 'AVIONICS', 'AIRFRAME', 'ELECTRICAL', 'OTHER'].map((category) => (
                  <Button
                    key={category}
                    size="sm"
                    variant={filterCategory === category ? 'default' : 'outline'}
                    onClick={() => setFilterCategory(category)}
                  >
                    {category === 'ALL' ? 'All' : category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Open Work Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && <p className="text-sm text-muted-foreground">Loading listings…</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
            {!loading && filteredListings.length === 0 && (
              <p className="text-sm text-muted-foreground">No open requests yet.</p>
            )}
            {filteredListings.map((listing) => (
              <div key={listing.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-primary" />
                      <p className="font-medium">{listing.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {[listing.city, listing.state, listing.airportIcao].filter(Boolean).join(' • ') || 'Location hidden'}
                    </p>
                    <p className="text-sm text-muted-foreground">{listing.description}</p>
                    {listing.aircraftSnapshot && (
                      <details className="text-xs text-muted-foreground">
                        <summary className="cursor-pointer">View aircraft details</summary>
                        <pre className="mt-2 rounded-md bg-muted p-2 text-[10px] overflow-auto">
                          {listing.aircraftSnapshot}
                        </pre>
                      </details>
                    )}
                    {listing.logbookSnapshot && (
                      <details className="text-xs text-muted-foreground">
                        <summary className="cursor-pointer">View logbook snapshot</summary>
                        <pre className="mt-2 rounded-md bg-muted p-2 text-[10px] overflow-auto">
                          {listing.logbookSnapshot}
                        </pre>
                      </details>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {listing.jobSize && <Badge variant="secondary" className="text-[10px]">{listing.jobSize} job</Badge>}
                      <Badge variant="outline" className="text-[10px]">{listing.category}</Badge>
                      {listing.aircraftType && (
                        <Badge variant="outline" className="text-[10px]">{listing.aircraftType}</Badge>
                      )}
                      {listing.neededBy && (
                        <Badge variant="outline" className="text-[10px]">Needed by {new Date(listing.neededBy).toLocaleDateString()}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setRespondingId(listing.id)}>
                      Respond
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setFileRequestId(listing.id)}>
                      Request files
                    </Button>
                  </div>
                </div>

                {respondingId === listing.id && (
                  <div className="mt-4 space-y-3 border-t border-border pt-4">
                    <Textarea
                      placeholder="Message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input
                        type="number"
                        placeholder="Labor rate (per hour)"
                        value={laborRate}
                        onChange={(e) => setLaborRate(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Estimated labor hours"
                        value={laborHours}
                        onChange={(e) => setLaborHours(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Parts estimate"
                        value={partsEstimate}
                        onChange={(e) => setPartsEstimate(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Flat total (optional)"
                        value={quoteAmount}
                        onChange={(e) => setQuoteAmount(e.target.value)}
                      />
                    </div>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={requiresApproval}
                        onChange={(e) => setRequiresApproval(e.target.checked)}
                        className="h-4 w-4"
                      />
                      Require approval if parts exceed estimate
                    </label>
                    <div className="flex gap-2">
                      <Button onClick={() => handleRespond(listing.id)}>Send</Button>
                      <Button variant="outline" onClick={() => setRespondingId(null)}>Cancel</Button>
                    </div>
                  </div>
                )}

                {fileRequestId === listing.id && (
                  <div className="mt-4 space-y-3 border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground">Request missing files from the pilot.</p>
                    <div className="flex flex-wrap gap-2">
                      {["Logbook PDF", "Annual inspection", "Engine history", "Maintenance summary"].map((file) => (
                        <label key={file} className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={requestedFiles.includes(file)}
                            onChange={(e) => {
                              setRequestedFiles((prev) =>
                                e.target.checked ? [...prev, file] : prev.filter((f) => f !== file)
                              )
                            }}
                            className="h-4 w-4"
                          />
                          {file}
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleFileRequest(listing.id)}>
                        Send Request
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setFileRequestId(null)}>
                        Cancel
                      </Button>
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
