'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Airport = {
  icao: string
  iata?: string | null
  name: string
  city?: string | null
  state?: string | null
  country?: string | null
  type?: string | null
}

export default function AirportsPage() {
  const [query, setQuery] = useState('')
  const [airports, setAirports] = useState<Airport[]>([])

  const search = async () => {
    const res = await fetch(`/api/airports?q=${encodeURIComponent(query)}`)
    const data = await res.json()
    setAirports(data.airports || [])
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Airports</h1>
          <p className="text-sm text-muted-foreground">Find airports, routes, and visited locations.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Find Airports</CardTitle>
            <CardDescription>Search by ICAO, IATA, city, or name.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search airports" />
            <Button onClick={search}>Search</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {airports.length === 0 && <p className="text-sm text-muted-foreground">No results.</p>}
            {airports.map((ap) => (
              <div key={ap.icao} className="rounded-md border border-border p-3">
                <p className="font-medium">{ap.icao} · {ap.name}</p>
                <p className="text-xs text-muted-foreground">{[ap.city, ap.state, ap.country].filter(Boolean).join(', ')}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
