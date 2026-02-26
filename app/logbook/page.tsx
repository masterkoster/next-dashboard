'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plane, Download, Plus, FileText, ShieldCheck, Upload } from 'lucide-react'

type Authority = 'FAA' | 'EASA' | 'BOTH'

interface LogbookEntry {
  id: string
  date: string
  aircraft: string
  routeFrom: string
  routeTo: string
  totalTime: number
  picTime: number
  sicTime: number
  soloTime: number
  dualGiven: number
  dualReceived: number
  nightTime: number
  instrumentTime: number
  crossCountryTime: number
  dayLandings: number
  nightLandings: number
  remarks?: string | null
  authority?: Authority
  isPending?: boolean
}

interface StartingTotals {
  totalTime: number
  picTime: number
  sicTime: number
  nightTime: number
  instrumentTime: number
  crossCountryTime: number
  landingsDay: number
  landingsNight: number
  asOfDate?: string | null
}

const TAB_KEYS = [
  'add',
  'search',
  'totals',
  'currency',
  'analysis',
  'download',
  'import',
  'starting-totals',
  'check-flights',
  'print-view',
  'pending',
] as const

type TabKey = typeof TAB_KEYS[number]

function LogbookContent() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get('tab') as TabKey) || 'add'
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab)

  const [entries, setEntries] = useState<LogbookEntry[]>([])
  const [startingTotals, setStartingTotals] = useState<StartingTotals | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [authority, setAuthority] = useState<Authority>('FAA')
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    aircraft: '',
    routeFrom: '',
    routeTo: '',
    totalTime: '',
    picTime: '',
    sicTime: '',
    soloTime: '',
    dualGiven: '',
    dualReceived: '',
    nightTime: '',
    instrumentTime: '',
    crossCountryTime: '',
    dayLandings: '0',
    nightLandings: '0',
    remarks: '',
    isPending: false,
  })

  const [filters, setFilters] = useState({ year: 'all', aircraft: 'all', search: '' })

  useEffect(() => {
    if (status !== 'authenticated') return
    loadEntries()
    loadStartingTotals()
  }, [status])

  useEffect(() => {
    if (TAB_KEYS.includes(initialTab)) setActiveTab(initialTab)
  }, [initialTab])

  const loadEntries = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/logbook')
      if (!res.ok) throw new Error('Failed to load logbook')
      const data = await res.json()
      setEntries(Array.isArray(data.entries) ? data.entries : [])
    } catch {
      setError('Failed to load logbook')
    } finally {
      setLoading(false)
    }
  }

  const loadStartingTotals = async () => {
    try {
      const res = await fetch('/api/logbook/starting-totals')
      if (!res.ok) return
      const data = await res.json()
      setStartingTotals(data.totals ?? null)
    } catch {
      setStartingTotals(null)
    }
  }

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (filters.year !== 'all' && new Date(entry.date).getFullYear().toString() !== filters.year) return false
      if (filters.aircraft !== 'all' && entry.aircraft !== filters.aircraft) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        return (
          entry.aircraft.toLowerCase().includes(q) ||
          entry.routeFrom.toLowerCase().includes(q) ||
          entry.routeTo.toLowerCase().includes(q) ||
          (entry.remarks || '').toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [entries, filters])

  const totals = useMemo(() => {
    return filteredEntries.reduce(
      (acc, entry) => ({
        totalTime: acc.totalTime + entry.totalTime,
        picTime: acc.picTime + entry.picTime,
        sicTime: acc.sicTime + entry.sicTime,
        soloTime: acc.soloTime + entry.soloTime,
        dualGiven: acc.dualGiven + entry.dualGiven,
        dualReceived: acc.dualReceived + entry.dualReceived,
        nightTime: acc.nightTime + entry.nightTime,
        instrumentTime: acc.instrumentTime + entry.instrumentTime,
        crossCountryTime: acc.crossCountryTime + entry.crossCountryTime,
        dayLandings: acc.dayLandings + entry.dayLandings,
        nightLandings: acc.nightLandings + entry.nightLandings,
      }),
      {
        totalTime: 0,
        picTime: 0,
        sicTime: 0,
        soloTime: 0,
        dualGiven: 0,
        dualReceived: 0,
        nightTime: 0,
        instrumentTime: 0,
        crossCountryTime: 0,
        dayLandings: 0,
        nightLandings: 0,
      }
    )
  }, [filteredEntries])

  const submitEntry = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/logbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          authority,
          totalTime: parseFloat(formData.totalTime) || 0,
          picTime: parseFloat(formData.picTime) || 0,
          sicTime: parseFloat(formData.sicTime) || 0,
          soloTime: parseFloat(formData.soloTime) || 0,
          dualGiven: parseFloat(formData.dualGiven) || 0,
          dualReceived: parseFloat(formData.dualReceived) || 0,
          nightTime: parseFloat(formData.nightTime) || 0,
          instrumentTime: parseFloat(formData.instrumentTime) || 0,
          crossCountryTime: parseFloat(formData.crossCountryTime) || 0,
          dayLandings: parseInt(formData.dayLandings) || 0,
          nightLandings: parseInt(formData.nightLandings) || 0,
        }),
      })
      if (!res.ok) throw new Error('Failed to save entry')
      await loadEntries()
      setActiveTab('search')
    } catch {
      setError('Failed to save entry')
    } finally {
      setLoading(false)
    }
  }

  const saveStartingTotals = async (totals: StartingTotals) => {
    await fetch('/api/logbook/starting-totals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(totals),
    })
    await loadStartingTotals()
  }

  const exportCsv = () => {
    const headers = ['Date', 'Aircraft', 'From', 'To', 'Total', 'PIC', 'SIC', 'Solo', 'Dual Given', 'Dual Received', 'Night', 'Instrument', 'XC', 'Day Landings', 'Night Landings', 'Remarks']
    const rows = filteredEntries.map((entry) => [
      entry.date,
      entry.aircraft,
      entry.routeFrom,
      entry.routeTo,
      entry.totalTime,
      entry.picTime,
      entry.sicTime,
      entry.soloTime,
      entry.dualGiven,
      entry.dualReceived,
      entry.nightTime,
      entry.instrumentTime,
      entry.crossCountryTime,
      entry.dayLandings,
      entry.nightLandings,
      `"${entry.remarks || ''}"`,
    ].join(','))
    const content = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `logbook_export_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (status === 'loading') {
    return <div className="min-h-screen bg-background p-6">Loading…</div>
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="text-5xl mb-4">📘</div>
            <h1 className="text-2xl font-bold mb-2">Logbook</h1>
            <p className="text-muted-foreground mb-6">Sign in to access your logbook, endorsements, and reports.</p>
            <Button onClick={() => signIn()}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const uniqueAircraft = [...new Set(entries.map((e) => e.aircraft))]
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2"><Plane className="h-6 w-6" /> Logbook</h1>
            <p className="text-sm text-muted-foreground">FAA + EASA logbook with endorsements, currency, and reports.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={authority === 'FAA' ? 'default' : 'outline'} size="sm" onClick={() => setAuthority('FAA')}>FAA</Button>
            <Button variant={authority === 'EASA' ? 'default' : 'outline'} size="sm" onClick={() => setAuthority('EASA')}>EASA</Button>
            <Button variant={authority === 'BOTH' ? 'default' : 'outline'} size="sm" onClick={() => setAuthority('BOTH')}>Both</Button>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabKey)}>
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="add">Add Flights</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="totals">Totals</TabsTrigger>
            <TabsTrigger value="currency">Currency</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="download">Download</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="starting-totals">Starting Totals</TabsTrigger>
            <TabsTrigger value="check-flights">Check Flights</TabsTrigger>
            <TabsTrigger value="print-view">Print View</TabsTrigger>
            <TabsTrigger value="pending">Pending Flights</TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add Flight</CardTitle>
                <CardDescription>Log a new flight with FAA/EASA fields.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                <Input placeholder="Aircraft" value={formData.aircraft} onChange={(e) => setFormData({ ...formData, aircraft: e.target.value })} />
                <Input placeholder="From" value={formData.routeFrom} onChange={(e) => setFormData({ ...formData, routeFrom: e.target.value })} />
                <Input placeholder="To" value={formData.routeTo} onChange={(e) => setFormData({ ...formData, routeTo: e.target.value })} />
                <Input placeholder="Total Time" value={formData.totalTime} onChange={(e) => setFormData({ ...formData, totalTime: e.target.value })} />
                <Input placeholder="PIC" value={formData.picTime} onChange={(e) => setFormData({ ...formData, picTime: e.target.value })} />
                <Input placeholder="SIC" value={formData.sicTime} onChange={(e) => setFormData({ ...formData, sicTime: e.target.value })} />
                <Input placeholder="Solo" value={formData.soloTime} onChange={(e) => setFormData({ ...formData, soloTime: e.target.value })} />
                <Input placeholder="Dual Given" value={formData.dualGiven} onChange={(e) => setFormData({ ...formData, dualGiven: e.target.value })} />
                <Input placeholder="Dual Received" value={formData.dualReceived} onChange={(e) => setFormData({ ...formData, dualReceived: e.target.value })} />
                <Input placeholder="Night" value={formData.nightTime} onChange={(e) => setFormData({ ...formData, nightTime: e.target.value })} />
                <Input placeholder="Instrument" value={formData.instrumentTime} onChange={(e) => setFormData({ ...formData, instrumentTime: e.target.value })} />
                <Input placeholder="Cross Country" value={formData.crossCountryTime} onChange={(e) => setFormData({ ...formData, crossCountryTime: e.target.value })} />
                <Input placeholder="Day Landings" value={formData.dayLandings} onChange={(e) => setFormData({ ...formData, dayLandings: e.target.value })} />
                <Input placeholder="Night Landings" value={formData.nightLandings} onChange={(e) => setFormData({ ...formData, nightLandings: e.target.value })} />
                <Textarea placeholder="Remarks" value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} className="md:col-span-2" />
                <label className="flex items-center gap-2 text-sm md:col-span-2">
                  <input type="checkbox" checked={formData.isPending} onChange={(e) => setFormData({ ...formData, isPending: e.target.checked })} />
                  Mark as pending (instructor approval)
                </label>
                <Button onClick={submitEntry} disabled={loading} className="md:col-span-2">
                  <Plus className="mr-2 h-4 w-4" /> Save Flight
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Search</CardTitle>
                <CardDescription>Filter logbook entries.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                <Input placeholder="Search" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
                <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })}>
                  <option value="all">All Years</option>
                  {years.map((year) => <option key={year} value={year}>{year}</option>)}
                </select>
                <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={filters.aircraft} onChange={(e) => setFilters({ ...filters, aircraft: e.target.value })}>
                  <option value="all">All Aircraft</option>
                  {uniqueAircraft.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Entries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
                {!loading && filteredEntries.length === 0 && <p className="text-sm text-muted-foreground">No entries.</p>}
                {filteredEntries.map((entry) => (
                  <div key={entry.id} className="rounded-md border border-border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{entry.aircraft} · {entry.routeFrom} → {entry.routeTo}</p>
                        <p className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString()} · {entry.totalTime.toFixed(1)} hrs</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {entry.authority && <Badge variant="secondary">{entry.authority}</Badge>}
                        {entry.isPending && <Badge variant="outline">Pending</Badge>}
                      </div>
                    </div>
                    {entry.remarks && <p className="text-xs text-muted-foreground mt-2">{entry.remarks}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="totals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Totals</CardTitle>
                <CardDescription>Filtered totals for FAA/EASA.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                {Object.entries(totals).map(([key, value]) => (
                  <div key={key} className="rounded-md border border-border p-3">
                    <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="text-lg font-semibold">{typeof value === 'number' ? value.toFixed(1) : value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="currency" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Currency</CardTitle>
                <CardDescription>FAA + EASA currency rules dashboard.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={async () => {
                  await fetch('/api/logbook/currency/calc', { method: 'POST' })
                }}>
                  <ShieldCheck className="mr-2 h-4 w-4" /> Refresh Currency
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analysis</CardTitle>
                <CardDescription>Visualize trends and readiness.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Charts and analysis will appear here (hours by month, instrument vs night, etc.).</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="download" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Download</CardTitle>
                <CardDescription>Export your logbook.</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button onClick={exportCsv}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
                <Button variant="outline" onClick={() => setActiveTab('print-view')}><FileText className="mr-2 h-4 w-4" />Print View</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Import</CardTitle>
                <CardDescription>Upload CSV, MyFlightbook, ForeFlight, or Garmin exports.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" id="import-source">
                  <option value="CSV">CSV/Excel</option>
                  <option value="MYFLIGHTBOOK">MyFlightbook</option>
                  <option value="FOREFLIGHT">ForeFlight</option>
                  <option value="GARMIN">Garmin</option>
                </select>
                <Input type="file" />
                <Button onClick={async () => {
                  const source = (document.getElementById('import-source') as HTMLSelectElement)?.value
                  await fetch('/api/logbook/imports', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ source, summaryJson: '{}' }),
                  })
                }}>
                  <Upload className="mr-2 h-4 w-4" />Start Import
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="starting-totals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Starting Totals</CardTitle>
                <CardDescription>Set your baseline totals before digital logging.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                <Input placeholder="Total Time" defaultValue={startingTotals?.totalTime ?? ''} onBlur={(e) => saveStartingTotals({
                  totalTime: parseFloat(e.target.value) || 0,
                  picTime: startingTotals?.picTime || 0,
                  sicTime: startingTotals?.sicTime || 0,
                  nightTime: startingTotals?.nightTime || 0,
                  instrumentTime: startingTotals?.instrumentTime || 0,
                  crossCountryTime: startingTotals?.crossCountryTime || 0,
                  landingsDay: startingTotals?.landingsDay || 0,
                  landingsNight: startingTotals?.landingsNight || 0,
                  asOfDate: startingTotals?.asOfDate || null,
                })} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="check-flights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Check Flights</CardTitle>
                <CardDescription>Validate compliance issues and missing fields.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Validation engine will flag missing times, endorsements, and currency gaps.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="print-view" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Print View</CardTitle>
                <CardDescription>FAA and EASA formatted print layouts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredEntries.slice(0, 20).map((entry) => (
                  <div key={entry.id} className="border-b border-border py-2 text-sm">
                    {entry.date} · {entry.aircraft} · {entry.routeFrom} → {entry.routeTo} · {entry.totalTime.toFixed(1)} hrs
                  </div>
                ))}
                <Button variant="outline" onClick={() => window.print()}><FileText className="mr-2 h-4 w-4" />Print</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Flights</CardTitle>
                <CardDescription>Flights awaiting instructor approval.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {entries.filter((e) => e.isPending).length === 0 && (
                  <p className="text-sm text-muted-foreground">No pending flights.</p>
                )}
                {entries.filter((e) => e.isPending).map((entry) => (
                  <div key={entry.id} className="rounded-md border border-border p-3">
                    <p className="font-medium">{entry.aircraft} · {entry.routeFrom} → {entry.routeTo}</p>
                    <p className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function LogbookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background p-6">Loading…</div>}>
      <LogbookContent />
    </Suspense>
  )
}
