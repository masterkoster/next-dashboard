'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Wrench, Plus, RefreshCw, AlertTriangle, CheckCircle, Clock, Plane, Search, XCircle, DollarSign } from 'lucide-react'

interface Squawk {
  id: string
  aircraftName: string
  description: string
  status: 'NEEDED' | 'IN_PROGRESS' | 'COMPLETED'
  maintenanceType: 'PERSONAL' | 'CLUB'
  isGrounded: boolean
  reportedDate: string
  resolvedDate: string | null
  cost: number | null
  reportedBy: string
}

const demoSquawks: Squawk[] = [
  { id: '1', aircraftName: 'N123AB (C172)', description: 'Left mag dropping on runup', status: 'NEEDED', maintenanceType: 'CLUB', isGrounded: true, reportedDate: '2024-02-15', resolvedDate: null, cost: null, reportedBy: 'John Smith' },
  { id: '2', aircraftName: 'N456CD (C182)', description: 'Annual inspection due', status: 'IN_PROGRESS', maintenanceType: 'CLUB', isGrounded: true, reportedDate: '2024-02-01', resolvedDate: null, cost: null, reportedBy: 'Sarah Johnson' },
  { id: '3', aircraftName: 'N123AB (C172)', description: 'Nav lights not working', status: 'COMPLETED', maintenanceType: 'CLUB', isGrounded: false, reportedDate: '2024-01-20', resolvedDate: '2024-01-22', cost: 150, reportedBy: 'Mike Davis' },
  { id: '4', aircraftName: 'N789EF (PA28)', description: 'Oil change needed', status: 'NEEDED', maintenanceType: 'CLUB', isGrounded: false, reportedDate: '2024-02-18', resolvedDate: null, cost: null, reportedBy: 'Emily Chen' },
  { id: '5', aircraftName: 'N111AA (C150)', description: 'Annual inspection due', status: 'NEEDED', maintenanceType: 'PERSONAL', isGrounded: true, reportedDate: '2024-02-10', resolvedDate: null, cost: null, reportedBy: 'John Smith' },
]

export default function SquawkLogPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [squawks, setSquawks] = useState<Squawk[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newSquawk, setNewSquawk] = useState({
    aircraft: '',
    description: '',
    isGrounded: false,
    maintenanceType: 'CLUB' as 'PERSONAL' | 'CLUB',
    postToMarketplace: false,
    postAnonymously: true,
    neededBy: '',
    jobSize: 'MEDIUM',
    allowTailNumber: false,
    groupId: '',
  })

  const [groups, setGroups] = useState<any[]>([])

  useEffect(() => { setSquawks(demoSquawks); setLoading(false) }, [session])

  useEffect(() => {
    async function loadGroups() {
      const res = await fetch('/api/groups')
      if (res.ok) {
        const data = await res.json()
        setGroups(Array.isArray(data) ? data : [])
      }
    }
    if (session) loadGroups()
  }, [session])

  const handleAddSquawk = async () => {
    const squawk: Squawk = { 
      id: crypto.randomUUID(), 
      aircraftName: newSquawk.aircraft, 
      description: newSquawk.description, 
      status: 'NEEDED', 
      maintenanceType: newSquawk.maintenanceType,
      isGrounded: newSquawk.isGrounded, 
      reportedDate: new Date().toISOString(), 
      resolvedDate: null, 
      cost: null, 
      reportedBy: session?.user?.name || 'You' 
    }
    setSquawks([squawk, ...squawks])
    setIsDialogOpen(false)
    setNewSquawk({ aircraft: '', description: '', isGrounded: false, maintenanceType: 'CLUB', postToMarketplace: false, postAnonymously: true, neededBy: '', jobSize: 'MEDIUM', allowTailNumber: false, groupId: '' })

    if (newSquawk.postToMarketplace && newSquawk.maintenanceType === 'PERSONAL') {
      const aircraftTypeMatch = newSquawk.aircraft.match(/\(([^)]+)\)/)
      const aircraftType = aircraftTypeMatch ? aircraftTypeMatch[1] : null
      try {
        const normalizedSize = newSquawk.jobSize || (newSquawk.description.toLowerCase().includes('overhaul') || newSquawk.description.toLowerCase().includes('rebuild') ? 'LARGE' : 'MEDIUM')
        await fetch('/api/mechanics/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newSquawk.description.slice(0, 120),
            description: newSquawk.description,
            category: 'OTHER',
            urgency: newSquawk.isGrounded ? 'URGENT' : 'NORMAL',
            aircraftType,
            source: 'squawk',
            anonymous: newSquawk.postAnonymously,
            neededBy: newSquawk.neededBy || null,
            jobSize: normalizedSize,
            allowTailNumber: newSquawk.allowTailNumber,
          }),
        })
      } catch (error) {
        console.error('Failed to post squawk to marketplace', error)
      }
    }

    if (newSquawk.postToMarketplace && newSquawk.maintenanceType === 'CLUB') {
      try {
        await fetch('/api/flying-club/maintenance/queue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: newSquawk.description,
            aircraftLabel: newSquawk.aircraft,
            isGrounded: newSquawk.isGrounded,
            neededBy: newSquawk.neededBy || null,
            jobSize: newSquawk.jobSize,
            allowTailNumber: newSquawk.allowTailNumber,
            groupId: newSquawk.groupId || null,
          }),
        })
      } catch (error) {
        console.error('Failed to send squawk to club queue', error)
      }
    }
  }

  const handleStatusChange = (id: string, newStatus: 'NEEDED' | 'IN_PROGRESS' | 'COMPLETED') => {
    setSquawks(squawks.map(s => s.id === id ? { ...s, status: newStatus, resolvedDate: newStatus === 'COMPLETED' ? new Date().toISOString() : null } : s))
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const filteredSquawks = squawks.filter(sq => filter === 'all' || sq.status === filter).filter(sq => !searchQuery || sq.description.toLowerCase().includes(searchQuery.toLowerCase()))

  const stats = { total: squawks.length, needed: squawks.filter(s => s.status === 'NEEDED').length, inProgress: squawks.filter(s => s.status === 'IN_PROGRESS').length, grounded: squawks.filter(s => s.isGrounded && s.status !== 'COMPLETED').length, totalCost: squawks.reduce((sum, s) => sum + (s.cost || 0), 0) }

  const getStatusIcon = (s: string) => s === 'NEEDED' ? <AlertTriangle className="h-4 w-4 text-amber-500" /> : s === 'IN_PROGRESS' ? <Clock className="h-4 w-4 text-blue-500" /> : <CheckCircle className="h-4 w-4 text-green-500" />
  const getStatusColor = (s: string) => s === 'NEEDED' ? 'bg-amber-500/10 text-amber-600' : s === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-600' : 'bg-green-500/10 text-green-600'

  if (status === 'loading' || loading) return <div className="min-h-screen bg-background flex items-center justify-center"><RefreshCw className="h-8 w-8 animate-spin text-primary" /></div>
  if (!session) return <div className="min-h-screen bg-background flex items-center justify-center p-4"><Card className="max-w-md w-full"><CardContent className="pt-6 text-center"><Wrench className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><h2 className="text-xl font-bold mb-2">Maintenance Squawk Log</h2><p className="text-muted-foreground mb-4">Sign in to report issues</p><Button asChild><a href="/login">Sign In</a></Button></CardContent></Card></div>

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 pt-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold flex items-center gap-2"><Wrench className="h-8 w-8" />Maintenance Squawk Log</h1><p className="text-muted-foreground">Report and track aircraft issues</p></div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Report Issue</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>Report New Squawk</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div><Label>Type</Label>
                  <select className="w-full mt-1 p-2 border rounded-md" value={newSquawk.maintenanceType} onChange={(e) => setNewSquawk({ ...newSquawk, maintenanceType: e.target.value as 'PERSONAL' | 'CLUB' })}>
                    <option value="CLUB">Club Aircraft</option>
                    <option value="PERSONAL">Personal Aircraft</option>
                  </select>
                </div>
                {newSquawk.maintenanceType === 'CLUB' && (
                  <div>
                    <Label>Club</Label>
                    <select className="w-full mt-1 p-2 border rounded-md" value={newSquawk.groupId} onChange={(e) => setNewSquawk({ ...newSquawk, groupId: e.target.value })}>
                      <option value="">Select club...</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div><Label>Aircraft</Label><select className="w-full mt-1 p-2 border rounded-md" value={newSquawk.aircraft} onChange={(e) => setNewSquawk({ ...newSquawk, aircraft: e.target.value })}><option value="">Select...</option><option>N123AB (C172)</option><option>N456CD (C182)</option><option>N789EF (PA28)</option></select></div>
                <div><Label>Description</Label><Textarea placeholder="Describe..." value={newSquawk.description} onChange={(e) => setNewSquawk({ ...newSquawk, description: e.target.value })} /></div>
                <div className="flex items-center gap-2"><input type="checkbox" checked={newSquawk.isGrounded} onChange={(e) => setNewSquawk({ ...newSquawk, isGrounded: e.target.checked })} /><Label>Ground aircraft</Label></div>
                <div className="flex items-center gap-2"><input type="checkbox" checked={newSquawk.postToMarketplace} onChange={(e) => setNewSquawk({ ...newSquawk, postToMarketplace: e.target.checked })} /><Label>Post to Service Bay</Label></div>
                {newSquawk.postToMarketplace && (
                  <div className="flex items-center gap-2 pl-6">
                    <input type="checkbox" checked={newSquawk.postAnonymously} onChange={(e) => setNewSquawk({ ...newSquawk, postAnonymously: e.target.checked })} />
                    <Label>Hide my identity</Label>
                  </div>
                )}
                {newSquawk.postToMarketplace && (
                  <div className="space-y-3 pl-6">
                    <div>
                      <Label className="text-xs">Needed by</Label>
                      <Input type="date" value={newSquawk.neededBy} onChange={(e) => setNewSquawk({ ...newSquawk, neededBy: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs">Job size</Label>
                      <select className="w-full mt-1 p-2 border rounded-md" value={newSquawk.jobSize} onChange={(e) => setNewSquawk({ ...newSquawk, jobSize: e.target.value })}>
                        <option value="SMALL">Small</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LARGE">Large</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={newSquawk.allowTailNumber} onChange={(e) => setNewSquawk({ ...newSquawk, allowTailNumber: e.target.checked })} />
                      <Label>Share tail number with mechanics</Label>
                    </div>
                    {newSquawk.maintenanceType === 'CLUB' && (
                      <p className="text-xs text-muted-foreground">Club squawks are sent to the admin queue for approval.</p>
                    )}
                  </div>
                )}
                <Button onClick={handleAddSquawk} className="w-full">Submit</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <Card><CardContent className="pt-4"><div><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{stats.total}</p></div></CardContent></Card>
          <Card className="border-amber-500/30"><CardContent className="pt-4"><div><p className="text-sm text-muted-foreground">Needed</p><p className="text-2xl font-bold text-amber-600">{stats.needed}</p></div></CardContent></Card>
          <Card className="border-blue-500/30"><CardContent className="pt-4"><div><p className="text-sm text-muted-foreground">In Progress</p><p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p></div></CardContent></Card>
          <Card className="border-red-500/30"><CardContent className="pt-4"><div><p className="text-sm text-muted-foreground">Grounded</p><p className="text-2xl font-bold text-red-600">{stats.grounded}</p></div></CardContent></Card>
          <Card className="border-green-500/30"><CardContent className="pt-4"><div><p className="text-sm text-muted-foreground">Cost</p><p className="text-2xl font-bold text-green-600">${stats.totalCost}</p></div></CardContent></Card>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
          <div className="flex gap-2"><Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>All</Button><Button variant={filter === 'NEEDED' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('NEEDED')}>Needed</Button><Button variant={filter === 'IN_PROGRESS' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('IN_PROGRESS')}>In Progress</Button><Button variant={filter === 'COMPLETED' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('COMPLETED')}>Done</Button></div>
        </div>

        <Card><CardHeader><CardTitle>Maintenance Items</CardTitle></CardHeader><CardContent>
          <div className="space-y-3">{filteredSquawks.map((squawk) => (
            <div key={squawk.id} className={`p-4 rounded-lg border ${squawk.isGrounded && squawk.status !== 'COMPLETED' ? 'border-red-500/50 bg-red-500/5' : 'bg-card'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Plane className="h-4 w-4" />
                    <span className="font-medium">{squawk.aircraftName}</span>
                    <Badge variant="outline" className={squawk.maintenanceType === 'CLUB' ? 'border-blue-500/50 text-blue-600' : 'border-purple-500/50 text-purple-600'}>
                      {squawk.maintenanceType === 'CLUB' ? 'Club' : 'Personal'}
                    </Badge>
                    {squawk.isGrounded && squawk.status !== 'COMPLETED' && <Badge variant="destructive">GROUNDED</Badge>}
                  </div>
                  <p className="text-sm">{squawk.description}</p>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground"><span>{squawk.reportedBy}</span><span>{formatDate(squawk.reportedDate)}</span>{squawk.cost && <span className="text-green-600">${squawk.cost}</span>}</div>
                </div>
                <div className="flex items-center gap-2"><Badge className={getStatusColor(squawk.status)}>{getStatusIcon(squawk.status)}<span className="ml-1">{squawk.status}</span></Badge>
                  {squawk.status !== 'COMPLETED' && <select className="text-xs border rounded px-2 py-1" value={squawk.status} onChange={(e) => handleStatusChange(squawk.id, e.target.value as any)}><option value="NEEDED">Needed</option><option value="IN_PROGRESS">In Progress</option><option value="COMPLETED">Done</option></select>}
                </div>
              </div>
            </div>
          ))}</div>
        </CardContent></Card>
      </div>
    </div>
  )
}
