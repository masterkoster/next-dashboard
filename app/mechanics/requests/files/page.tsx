'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type FileRequest = {
  id: string
  requestedFiles: string
  status: string
  maintenanceRequest: { id: string; title: string }
  mechanic: { name: string; businessName?: string | null }
}

export default function PilotFileRequestsPage() {
  const { data: session, status } = useSession()
  const [requests, setRequests] = useState<FileRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const res = await fetch('/api/mechanics/requests/files')
      if (res.ok) {
        const data = await res.json()
        if (active) setRequests(Array.isArray(data.requests) ? data.requests : [])
      }
      setLoading(false)
    }
    if (session?.user) load()
    return () => {
      active = false
    }
  }, [session?.user])

  const updateStatus = async (requestId: string, status: 'SENT' | 'DECLINED') => {
    setUpdatingId(requestId)
    await fetch('/api/mechanics/file-requests', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, status }),
    })
    const res = await fetch('/api/mechanics/requests/files')
    if (res.ok) {
      const data = await res.json()
      setRequests(Array.isArray(data.requests) ? data.requests : [])
    }
    setUpdatingId(null)
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
          <h1 className="text-2xl font-bold">File Requests</h1>
          <p className="text-sm text-muted-foreground">Mechanics requesting additional documents.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {requests.length === 0 && (
              <p className="text-sm text-muted-foreground">No requests yet.</p>
            )}
            {requests.map((request) => (
              <div key={request.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{request.maintenanceRequest.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {request.mechanic.businessName || request.mechanic.name}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {JSON.parse(request.requestedFiles).map((file: string) => (
                        <Badge key={file} variant="outline" className="text-[10px]">{file}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => updateStatus(request.id, 'SENT')} disabled={updatingId === request.id}>
                      Upload
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => updateStatus(request.id, 'DECLINED')} disabled={updatingId === request.id}>
                      Decline
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
