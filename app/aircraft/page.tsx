'use client'

import { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plane } from 'lucide-react'

type Aircraft = {
  id: string
  nNumber: string
  nickname?: string | null
  categoryClass?: string | null
}

export default function AircraftPage() {
  const { data: session, status } = useSession()
  const [aircraft, setAircraft] = useState<Aircraft[]>([])
  const [nNumber, setNNumber] = useState('')

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/aircraft')
      .then((res) => res.json())
      .then((data) => setAircraft(data.aircraft || []))
  }, [status])

  if (status === 'loading') return <div className="min-h-screen bg-background p-6">Loading…</div>
  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold mb-2">My Aircraft</h1>
            <p className="text-muted-foreground mb-6">Sign in to manage your aircraft.</p>
            <Button onClick={() => signIn()}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Plane className="h-6 w-6" /> My Aircraft</h1>
          <p className="text-sm text-muted-foreground">Manage your personal aircraft profiles.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add Aircraft</CardTitle>
            <CardDescription>Track aircraft for logbook and currency.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input placeholder="N-Number" value={nNumber} onChange={(e) => setNNumber(e.target.value)} />
            <Button onClick={async () => {
              await fetch('/api/aircraft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nNumber }),
              })
              const res = await fetch('/api/aircraft')
              const data = await res.json()
              setAircraft(data.aircraft || [])
              setNNumber('')
            }}>Add</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Aircraft</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {aircraft.length === 0 && <p className="text-sm text-muted-foreground">No aircraft yet.</p>}
            {aircraft.map((plane) => (
              <div key={plane.id} className="rounded-md border border-border p-3">
                <p className="font-medium">{plane.nNumber}</p>
                <p className="text-xs text-muted-foreground">{plane.categoryClass || 'Unassigned'}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
