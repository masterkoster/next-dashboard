'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type QueueItem = {
  id: string
  description: string
  notes?: string | null
  isGrounded?: boolean
  reportedDate?: string
}

export default function ClubMaintenanceRequestsPage() {
  const { data: session, status } = useSession()
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [groupId, setGroupId] = useState('')
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadGroups() {
      const res = await fetch('/api/groups')
      if (res.ok) {
        const data = await res.json()
        setGroups(Array.isArray(data) ? data : [])
      }
    }
    if (session?.user) loadGroups()
  }, [session?.user])

  useEffect(() => {
    if (!groupId) return
    let active = true
    async function load() {
      setLoading(true)
      const res = await fetch(`/api/flying-club/maintenance/queue?groupId=${groupId}`)
      if (res.ok) {
        const data = await res.json()
        if (active) setQueue(Array.isArray(data.queue) ? data.queue : [])
      }
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [groupId])

  const postToServiceBay = async (item: QueueItem) => {
    await fetch('/api/mechanics/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: item.description.slice(0, 120),
        description: item.description,
        category: 'OTHER',
        urgency: item.isGrounded ? 'URGENT' : 'NORMAL',
        source: 'squawk',
        anonymous: true,
        jobSize: 'MEDIUM',
        neededBy: null,
      }),
    })
  }

  if (status === 'loading') {
    return <div className="min-h-screen bg-background p-6">Loading…</div>
  }

  if (!session?.user) {
    return <div className="min-h-screen bg-background p-6">Please sign in.</div>
  }

  return (
    <div className="min-h-screen bg-background p-6 pt-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Club Maintenance Queue</h1>
          <p className="text-sm text-muted-foreground">Review squawks before posting to Service Bay.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Select Club</CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="text-xs text-muted-foreground">Club</Label>
            <select
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
            >
              <option value="">Select club...</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pending Squawks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && <p className="text-sm text-muted-foreground">Loading queue…</p>}
            {!loading && queue.length === 0 && (
              <p className="text-sm text-muted-foreground">No queued squawks.</p>
            )}
            {queue.map((item) => (
              <div key={item.id} className="rounded-lg border border-border p-4">
                <p className="font-medium">{item.description}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.isGrounded && <Badge variant="destructive" className="text-[10px]">Grounded</Badge>}
                </div>
                <div className="mt-3">
                  <Button size="sm" variant="outline" onClick={() => postToServiceBay(item)}>
                    Post to Service Bay
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
