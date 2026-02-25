'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RefreshCw, Calendar, Link2, Download, ExternalLink, Check, AlertTriangle, Trash2, Plus } from 'lucide-react'

interface CalendarIntegration {
  id: string
  type: 'google' | 'ical'
  name: string
  enabled: boolean
  lastSync: string | null
  aircraftId: string | null
  aircraftName: string | null
}

interface ClubAircraft {
  id: string
  nNumber: string
  customName: string
}

const demoIntegrations: CalendarIntegration[] = [
  { id: '1', type: 'google', name: 'Google Calendar - N123AB', enabled: true, lastSync: '2024-02-20T10:00:00Z', aircraftId: '1', aircraftName: 'N123AB (C172)' },
  { id: '2', type: 'ical', name: 'Outlook - N456CD', enabled: true, lastSync: '2024-02-19T15:30:00Z', aircraftId: '2', aircraftName: 'N456CD (C182)' },
]

const demoAircraft: ClubAircraft[] = [
  { id: '1', nNumber: 'N123AB', customName: 'Cessna 172' },
  { id: '2', nNumber: 'N456CD', customName: 'Cessna 182' },
  { id: '3', nNumber: 'N789EF', customName: 'Piper Archer' },
]

export default function CalendarSyncPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>([])
  const [syncing, setSyncing] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newIntegration, setNewIntegration] = useState({ type: 'google' as 'google' | 'ical', aircraftId: '' })

  useEffect(() => {
    setIntegrations(demoIntegrations)
    setLoading(false)
  }, [session])

  const handleConnectGoogle = (aircraftId: string) => {
    // In production, this would redirect to OAuth
    const aircraft = demoAircraft.find(a => a.id === aircraftId)
    const newInt: CalendarIntegration = {
      id: crypto.randomUUID(),
      type: 'google',
      name: `Google Calendar - ${aircraft?.nNumber}`,
      enabled: true,
      lastSync: new Date().toISOString(),
      aircraftId,
      aircraftName: aircraft?.customName || aircraft?.nNumber || null,
    }
    setIntegrations([...integrations, newInt])
    setShowAddModal(false)
  }

  const handleGenerateICal = (aircraftId: string) => {
    const aircraft = demoAircraft.find(a => a.id === aircraftId)
    const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AviationHub//Club Calendar//EN
BEGIN:VEVENT
UID:${crypto.randomUUID()}@aviationhub.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:Flight - ${aircraft?.nNumber}
DESCRIPTION:Aircraft: ${aircraft?.customName}
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Flight reminder
END:VALARM
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([icalContent], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `calendar-${aircraft?.nNumber}.ics`
    a.click()
    URL.revokeObjectURL(url)

    const newInt: CalendarIntegration = {
      id: crypto.randomUUID(),
      type: 'ical',
      name: `iCal Export - ${aircraft?.nNumber}`,
      enabled: true,
      lastSync: new Date().toISOString(),
      aircraftId,
      aircraftName: aircraft?.customName || aircraft?.nNumber || null,
    }
    setIntegrations([...integrations, newInt])
    setShowAddModal(false)
  }

  const handleSync = async (id: string) => {
    setSyncing(id)
    await new Promise(r => setTimeout(r, 2000))
    setIntegrations(integrations.map(i => i.id === id ? { ...i, lastSync: new Date().toISOString() } : i))
    setSyncing(null)
  }

  const handleDelete = (id: string) => {
    setIntegrations(integrations.filter(i => i.id !== id))
  }

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleString() : 'Never'

  if (status === 'loading' || loading) return <div className="min-h-screen bg-background flex items-center justify-center"><RefreshCw className="h-8 w-8 animate-spin text-primary" /></div>
  if (!session) return <div className="min-h-screen bg-background flex items-center justify-center p-4"><Card className="max-w-md w-full"><CardContent className="pt-6 text-center"><Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><h2 className="text-xl font-bold mb-2">Calendar Sync</h2><p className="text-muted-foreground mb-4">Sign in to sync your club calendar</p><Button asChild><a href="/login">Sign In</a></Button></CardContent></Card></div>

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 pt-16">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold flex items-center gap-2"><Calendar className="h-8 w-8" />Calendar Sync</h1><p className="text-muted-foreground">Sync club bookings with Google Calendar or export iCal files</p></div>
          <Button className="gap-2" onClick={() => setShowAddModal(true)}><Plus className="h-4 w-4" />Add Integration</Button>
        </div>

        {/* How it works */}
        <Card>
          <CardHeader><CardTitle>How It Works</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2"><ExternalLink className="h-5 w-5 text-blue-500" /><h3 className="font-semibold">Google Calendar</h3></div>
                <p className="text-sm text-muted-foreground">Connect your Google Calendar to automatically sync aircraft bookings. New bookings appear in your calendar automatically.</p>
              </div>
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2"><Download className="h-5 w-5 text-green-500" /><h3 className="font-semibold">iCal Export</h3></div>
                <p className="text-sm text-muted-foreground">Download an .ics file to import into Apple Calendar, Outlook, or any calendar app that supports iCal format.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card>
          <CardHeader><CardTitle>Active Integrations</CardTitle><CardDescription>Manage your calendar connections</CardDescription></CardHeader>
          <CardContent>
            {integrations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No calendar integrations yet</p>
                <Button className="mt-4" onClick={() => setShowAddModal(true)}>Add Integration</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {integrations.map((int) => (
                  <div key={int.id} className="p-4 rounded-lg border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${int.type === 'google' ? 'bg-blue-100' : 'bg-green-100'}`}>
                        {int.type === 'google' ? <ExternalLink className="h-5 w-5 text-blue-600" /> : <Download className="h-5 w-5 text-green-600" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{int.name}</h3>
                          {int.enabled && <Badge variant="outline" className="text-xs"><Check className="h-3 w-3 mr-1" />Active</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">Last synced: {formatDate(int.lastSync)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleSync(int.id)} disabled={syncing === int.id}>
                        <RefreshCw className={`h-4 w-4 mr-1 ${syncing === int.id ? 'animate-spin' : ''}`} />
                        Sync
                      </Button>
                      {int.type === 'ical' && (
                        <Button variant="outline" size="sm" onClick={() => handleGenerateICal(int.aircraftId!)}>
                          <Download className="h-4 w-4 mr-1" />
                          Re-export
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(int.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md m-4">
              <CardHeader><CardTitle>Add Calendar Integration</CardTitle><CardDescription>Connect a calendar for aircraft bookings</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Calendar Type</Label>
                  <div className="flex gap-2 mt-2">
                    <Button variant={newIntegration.type === 'google' ? 'default' : 'outline'} onClick={() => setNewIntegration({ ...newIntegration, type: 'google' })} className="flex-1"><ExternalLink className="h-4 w-4 mr-2" />Google</Button>
                    <Button variant={newIntegration.type === 'ical' ? 'default' : 'outline'} onClick={() => setNewIntegration({ ...newIntegration, type: 'ical' })} className="flex-1"><Download className="h-4 w-4 mr-2" />iCal</Button>
                  </div>
                </div>
                <div><Label>Aircraft</Label>
                  <select className="w-full mt-1 p-2 border rounded-md" value={newIntegration.aircraftId} onChange={(e) => setNewIntegration({ ...newIntegration, aircraftId: e.target.value })}>
                    <option value="">Select aircraft...</option>
                    {demoAircraft.map(a => <option key={a.id} value={a.id}>{a.nNumber} - {a.customName}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
                  <Button className="flex-1" disabled={!newIntegration.aircraftId} onClick={() => newIntegration.type === 'google' ? handleConnectGoogle(newIntegration.aircraftId) : handleGenerateICal(newIntegration.aircraftId)}>
                    {newIntegration.type === 'google' ? 'Connect' : 'Export'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
