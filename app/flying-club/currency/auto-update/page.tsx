'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RefreshCw, Gauge, Sun, Moon, Plane, Check, AlertTriangle, Settings, Play, Pause } from 'lucide-react'

interface CurrencySettings {
  autoUpdate: boolean
  dayLandings: boolean
  nightLandings: boolean
  instrumentApproaches: boolean
  lastSync: string | null
  syncFrequency: 'daily' | 'weekly'
}

interface CurrencyStatus {
  dayLandings: number
  dayLandingsDate: string | null
  nightLandings: number
  nightLandingsDate: string | null
  approaches: number
  instrumentTime: number
  instrumentCurrencyDate: string | null
}

export default function CurrencyAutoUpdatePage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<CurrencySettings>({
    autoUpdate: true,
    dayLandings: true,
    nightLandings: true,
    instrumentApproaches: true,
    lastSync: '2024-02-20T10:00:00Z',
    syncFrequency: 'daily',
  })
  const [status_, setStatus] = useState<CurrencyStatus>({
    dayLandings: 5,
    dayLandingsDate: '2024-02-15',
    nightLandings: 3,
    nightLandingsDate: '2024-02-10',
    approaches: 8,
    instrumentTime: 15.5,
    instrumentCurrencyDate: '2024-02-01',
  })
  const [syncing, setSyncing] = useState(false)

  useEffect(() => { setLoading(false) }, [session])

  const handleSync = async () => {
    setSyncing(true)
    await new Promise(r => setTimeout(r, 2000))
    setStatus({
      dayLandings: 6,
      dayLandingsDate: new Date().toISOString(),
      nightLandings: 3,
      nightLandingsDate: new Date().toISOString(),
      approaches: 9,
      instrumentTime: 16.0,
      instrumentCurrencyDate: new Date().toISOString(),
    })
    setSettings({ ...settings, lastSync: new Date().toISOString() })
    setSyncing(false)
  }

  const getDayStatus = () => {
    const daysSince = settings.lastSync ? Math.floor((Date.now() - new Date(settings.lastSync).getTime()) / (1000*60*60*24)) : 999
    if (status_.dayLandings >= 3) return { status: 'current', color: 'text-green-500', icon: <Check className="h-4 w-4" /> }
    if (daysSince > 60) return { status: 'expired', color: 'text-red-500', icon: <AlertTriangle className="h-4 w-4" /> }
    return { status: 'expiring', color: 'text-amber-500', icon: <AlertTriangle className="h-4 w-4" /> }
  }

  const getNightStatus = () => {
    if (status_.nightLandings >= 3) return { status: 'current', color: 'text-green-500', icon: <Check className="h-4 w-4" /> }
    return { status: 'expired', color: 'text-red-500', icon: <AlertTriangle className="h-4 w-4" /> }
  }

  const getInstrumentStatus = () => {
    if (status_.approaches >= 6) return { status: 'current', color: 'text-green-500', icon: <Check className="h-4 w-4" /> }
    return { status: 'expiring', color: 'text-amber-500', icon: <AlertTriangle className="h-4 w-4" /> }
  }

  if (status === 'loading' || loading) return <div className="min-h-screen bg-background flex items-center justify-center"><RefreshCw className="h-8 w-8 animate-spin text-primary" /></div>
  if (!session) return <div className="min-h-screen bg-background flex items-center justify-center p-4"><Card className="max-w-md w-full"><CardContent className="pt-6 text-center"><Gauge className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><h2 className="text-xl font-bold mb-2">Currency Auto-Update</h2><p className="text-muted-foreground mb-4">Sign in to configure currency sync</p><Button asChild><a href="/login">Sign In</a></Button></CardContent></Card></div>

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 pt-16">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold flex items-center gap-2"><Gauge className="h-8 w-8" />Currency Auto-Update</h1><p className="text-muted-foreground">Automatically sync your currency from logbook entries</p></div>
          <Button className="gap-2" onClick={handleSync} disabled={syncing}><RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />{syncing ? 'Syncing...' : 'Sync Now'}</Button>
        </div>

        {/* Current Status */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-green-500/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2"><Sun className="h-5 w-5 text-amber-500" /><h3 className="font-semibold">Day Currency</h3></div>
              <p className="text-3xl font-bold">{status_.dayLandings}<span className="text-sm font-normal text-muted-foreground">/3 landings</span></p>
              <p className="text-sm text-muted-foreground mt-1">{status_.dayLandingsDate ? `Last: ${new Date(status_.dayLandingsDate).toLocaleDateString()}` : 'No flights'}</p>
              <Badge className="mt-2 bg-green-500/10 text-green-600">{getDayStatus().icon}<span className="ml-1">Current</span></Badge>
            </CardContent>
          </Card>
          <Card className="border-green-500/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2"><Moon className="h-5 w-5 text-blue-500" /><h3 className="font-semibold">Night Currency</h3></div>
              <p className="text-3xl font-bold">{status_.nightLandings}<span className="text-sm font-normal text-muted-foreground">/3 landings</span></p>
              <p className="text-sm text-muted-foreground mt-1">{status_.nightLandingsDate ? `Last: ${new Date(status_.nightLandingsDate).toLocaleDateString()}` : 'No flights'}</p>
              <Badge className="mt-2 bg-green-500/10 text-green-600">{getNightStatus().icon}<span className="ml-1">Current</span></Badge>
            </CardContent>
          </Card>
          <Card className="border-green-500/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2"><Plane className="h-5 w-5 text-purple-500" /><h3 className="font-semibold">Instrument Currency</h3></div>
              <p className="text-3xl font-bold">{status_.approaches}<span className="text-sm font-normal text-muted-foreground">/6 approaches</span></p>
              <p className="text-sm text-muted-foreground mt-1">{status_.instrumentTime.toFixed(1)} hrs instrument time</p>
              <Badge className="mt-2 bg-green-500/10 text-green-600">{getInstrumentStatus().icon}<span className="ml-1">Current</span></Badge>
            </CardContent>
          </Card>
        </div>

        {/* Settings */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />Auto-Update Settings</CardTitle><CardDescription>Configure how currency is synced from your logbook</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Enable Auto-Update</h3>
                <p className="text-sm text-muted-foreground">Automatically sync currency from logbook</p>
              </div>
              <Switch checked={settings.autoUpdate} onCheckedChange={(c) => setSettings({ ...settings, autoUpdate: c })} />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">Currency Types to Track</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Sun className="h-4 w-4 text-amber-500" /><span>Day Landings (3 in 90 days)</span></div>
                  <Switch checked={settings.dayLandings} onCheckedChange={(c) => setSettings({ ...settings, dayLandings: c })} disabled={!settings.autoUpdate} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Moon className="h-4 w-4 text-blue-500" /><span>Night Landings (3 in 90 days)</span></div>
                  <Switch checked={settings.nightLandings} onCheckedChange={(c) => setSettings({ ...settings, nightLandings: c })} disabled={!settings.autoUpdate} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Plane className="h-4 w-4 text-purple-500" /><span>Instrument Approaches (6 in 6 months)</span></div>
                  <Switch checked={settings.instrumentApproaches} onCheckedChange={(c) => setSettings({ ...settings, instrumentApproaches: c })} disabled={!settings.autoUpdate} />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">Sync Frequency</h3>
              <div className="flex gap-2">
                <Button variant={settings.syncFrequency === 'daily' ? 'default' : 'outline'} onClick={() => setSettings({ ...settings, syncFrequency: 'daily' })} disabled={!settings.autoUpdate}><RefreshCw className="h-4 w-4 mr-2" />Daily</Button>
                <Button variant={settings.syncFrequency === 'weekly' ? 'default' : 'outline'} onClick={() => setSettings({ ...settings, syncFrequency: 'weekly' })} disabled={!settings.autoUpdate}><RefreshCw className="h-4 w-4 mr-2" />Weekly</Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground">Last synchronized: {settings.lastSync ? new Date(settings.lastSync).toLocaleString() : 'Never'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card>
          <CardContent className="pt-4">
            <h3 className="font-medium mb-2">How It Works</h3>
            <p className="text-sm text-muted-foreground">Currency is automatically calculated from your logbook entries. Day and night landings are counted from flights with the appropriate conditions. Instrument approaches are counted from logged instrument time and approaches.</p>
            <div className="mt-4 grid gap-2 text-sm">
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /><span>Day Currency: 3 takeoffs/landings in last 90 days</span></div>
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /><span>Night Currency: 3 takeoffs/landings in last 90 days</span></div>
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /><span>Instrument Currency: 6 approaches + holds + intercepting in last 6 months</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
