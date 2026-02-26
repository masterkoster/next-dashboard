'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Search } from 'lucide-react'

const MarketplaceMap = dynamic(() => import('../modules/marketplace/MarketplaceMap'), { ssr: false })

type Mechanic = {
  id: string
  name: string
  businessName?: string | null
  city?: string | null
  state?: string | null
  locationIcao?: string | null
  locationLat?: number | null
  locationLng?: number | null
  locationPrivacy?: string | null
  certifications?: string | null
  specialties?: string | null
  rating?: number | null
  reviewCount?: number | null
}

export default function MechanicsDirectoryPage() {
  const [query, setQuery] = useState('')
  const [certFilter, setCertFilter] = useState('')
  const [mechanics, setMechanics] = useState<Mechanic[]>([])
  const [loading, setLoading] = useState(false)
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const res = await fetch(`/api/mechanics/search?q=${encodeURIComponent(query)}&cert=${encodeURIComponent(certFilter)}`)
      if (!res.ok) {
        setLoading(false)
        return
      }
      const data = await res.json()
      if (active) {
        setMechanics(Array.isArray(data.mechanics) ? data.mechanics : [])
        setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [query, certFilter])

  const mapListings = useMemo(() => {
    return mechanics
      .filter((m) => m.locationPrivacy === 'ICAO' && typeof m.locationLat === 'number' && typeof m.locationLng === 'number')
      .map((m) => ({
        id: m.id,
        title: m.businessName || m.name,
        latitude: m.locationLat,
        longitude: m.locationLng,
        airportIcao: m.locationIcao || '—',
        type: 'mechanic',
      }))
  }, [mechanics])

  return (
    <div className="min-h-screen bg-background p-6 pt-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Mechanic Directory</h1>
          <p className="text-sm text-muted-foreground">
            Search certified mechanics by location, certifications, and specialties.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="City, state, or ICAO"
                  className="pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Input
                placeholder="Certification (A&P, IA, avionics)"
                value={certFilter}
                onChange={(e) => setCertFilter(e.target.value)}
              />
              <Button variant="outline" onClick={() => setShowMap((prev) => !prev)}>
                <MapPin className="mr-2 h-4 w-4" />
                {showMap ? 'Hide Map' : 'Show Map'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {showMap && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Map View</CardTitle>
            </CardHeader>
            <CardContent>
              <MarketplaceMap listings={mapListings} />
              <p className="mt-2 text-xs text-muted-foreground">
                Only mechanics who opted to share exact airport locations appear on the map.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && <p className="text-sm text-muted-foreground">Loading mechanics…</p>}
            {!loading && mechanics.length === 0 && (
              <p className="text-sm text-muted-foreground">No mechanics found yet.</p>
            )}
            {mechanics.map((m) => (
              <div key={m.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{m.businessName || m.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {[m.city, m.state, m.locationIcao].filter(Boolean).join(' • ') || 'Location not provided'}
                    </p>
                  </div>
                  <div className="text-right">
                    {typeof m.rating === 'number' && (
                      <p className="text-xs text-muted-foreground">Rating {m.rating.toFixed(1)}</p>
                    )}
                    {m.reviewCount ? (
                      <p className="text-xs text-muted-foreground">{m.reviewCount} reviews</p>
                    ) : null}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {m.certifications?.split(',').filter(Boolean).map((cert) => (
                    <Badge key={`${m.id}-${cert}`} variant="outline" className="text-[10px]">
                      {cert.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
