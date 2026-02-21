'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Plane,
  Calendar,
  Users,
  Wrench,
  Clock,
  AlertCircle,
  Plus,
  ChevronRight,
  Search,
  MoreVertical,
  Loader2
} from "lucide-react"

// Demo data for My Aircraft
const demoAircraft = [
  {
    id: 'a1',
    nNumber: 'N172SP',
    nickname: 'Skyhawk',
    make: 'Cessna',
    model: '172S',
    year: 2025,
    status: 'Available',
    hourlyRate: 165,
    hobbsHours: 98.2,
    tachHours: 125.4
  },
  {
    id: 'a2',
    nNumber: 'N9876P',
    nickname: 'Warrior',
    make: 'Piper',
    model: 'PA-28-161',
    year: 2019,
    status: 'Maintenance',
    hourlyRate: 145,
    hobbsHours: 1842.3,
    tachHours: 2100.5
  }
]

const demoMaintenance = [
  { id: 'm1', aircraft: 'N9876P', description: 'Annual inspection', status: 'In Progress', dueDate: '2026-08-20', priority: 'high' },
  { id: 'm2', aircraft: 'N172SP', description: 'Oil change', status: 'Needed', dueDate: '2026-03-01', priority: 'medium' }
]

const demoBookings = [
  { id: 'b1', aircraft: 'N172SP', date: '2026-02-23', time: '14:00 - 16:00', purpose: 'Local practice' },
  { id: 'b2', aircraft: 'N172SP', date: '2026-02-24', time: '09:00 - 12:00', purpose: 'Cross country' }
]

const demoFlights = [
  { id: 'f1', date: '2026-02-20', aircraft: 'N172SP', route: 'KBOS - KMVY - KBOS', hobbs: 1.2, purpose: 'Currency' },
  { id: 'f2', date: '2026-02-18', aircraft: 'N172SP', route: 'KBOS - KALB - KBOS', hobbs: 2.5, purpose: 'IFR Practice' }
]

// Demo data for Flying Clubs
const demoClubs = [
  {
    id: 'c1',
    name: 'Sky High Flying Club',
    description: 'A welcoming club for pilots of all experience levels',
    members: 5,
    aircraft: [
      { id: 'a1', nNumber: 'N172SP', nickname: 'Skyhawk', make: 'Cessna', model: '172S', status: 'Available', hourlyRate: 165 },
      { id: 'a2', nNumber: 'N9876P', nickname: 'Warrior', make: 'Piper', model: 'PA-28-161', status: 'Maintenance', hourlyRate: 145 }
    ]
  },
  {
    id: 'c2',
    name: 'Weekend Warriors',
    description: 'Casual flying group for weekend adventures',
    members: 2,
    aircraft: [
      { id: 'a3', nNumber: 'N345AB', nickname: 'Cherokee', make: 'Piper', model: 'PA-32-300', status: 'Available', hourlyRate: 135 }
    ]
  }
]

export default function AircraftPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState('my-aircraft')
  const [showDemoNotice, setShowDemoNotice] = useState(true)

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const isDemo = !session?.user?.id

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Notice */}
      {isDemo && showDemoNotice && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-3">
          <div className="mx-auto max-w-[1600px] flex items-center justify-between">
            <p className="text-sm text-amber-600">
              <strong>Demo Mode:</strong> Viewing sample data. 
              <Link href="/api/auth/signin" className="underline ml-1">Sign in</Link> to see your own aircraft.
            </p>
            <Button variant="ghost" size="sm" onClick={() => setShowDemoNotice(false)}>
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-[1600px] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Aircraft</h1>
              <p className="text-muted-foreground mt-1">
                {activeTab === 'my-aircraft' 
                  ? 'Manage your personal aircraft and track maintenance'
                  : 'Join a flying club or manage your existing club'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              {activeTab === 'my-aircraft' && (
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Aircraft
                </Button>
              )}
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="mt-6 flex gap-1 border-b border-border">
            <button
              onClick={() => setActiveTab('my-aircraft')}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors relative ${
                activeTab === 'my-aircraft'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              My Aircraft
              {activeTab === 'my-aircraft' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('flying-club')}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors relative ${
                activeTab === 'flying-club'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Flying Clubs
              {activeTab === 'flying-club' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1600px] p-6">
        {/* MY AIRCRAFT TAB */}
        {activeTab === 'my-aircraft' && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Aircraft</CardTitle>
                  <Plane className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{demoAircraft.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {demoAircraft.filter(a => a.status === 'Available').length} available
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {demoAircraft.reduce((sum, a) => sum + a.hobbsHours, 0).toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Hobbs hours</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{demoBookings.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Next: {demoBookings[0]?.date}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{demoMaintenance.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {demoMaintenance.filter(m => m.priority === 'high').length} high priority
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Aircraft List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>My Aircraft</CardTitle>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Aircraft
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demoAircraft.map((aircraft) => (
                    <div key={aircraft.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-primary/10 p-3">
                          <Plane className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{aircraft.nNumber}</p>
                            <Badge variant={aircraft.status === 'Available' ? 'secondary' : 'destructive'}>
                              {aircraft.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {aircraft.year} {aircraft.make} {aircraft.model}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{aircraft.hobbsHours} hobbs hrs</span>
                            <span>{aircraft.tachHours} tach hrs</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">${aircraft.hourlyRate}/hr</p>
                          <p className="text-xs text-muted-foreground">hourly rate</p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bookings & Maintenance Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Upcoming Bookings</CardTitle>
                    <Button variant="ghost" size="sm">View All</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {demoBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{booking.aircraft}</p>
                          <p className="text-xs text-muted-foreground">{booking.purpose}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{booking.date}</p>
                          <p className="text-xs text-muted-foreground">{booking.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Maintenance Status</CardTitle>
                    <Button variant="ghost" size="sm">View All</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {demoMaintenance.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{item.aircraft}</p>
                            <Badge variant={item.status === 'In Progress' ? 'default' : 'secondary'} className="text-xs">{item.status}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Due: {item.dueDate}</p>
                          {item.priority === 'high' && (
                            <div className="flex items-center justify-end gap-1 mt-1">
                              <AlertCircle className="h-3 w-3 text-destructive" />
                              <p className="text-xs text-destructive">High Priority</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Flights */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Flights</CardTitle>
                  <Button variant="ghost" size="sm"><Plus className="mr-2 h-4 w-4" />Log Flight</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {demoFlights.map((flight) => (
                    <div key={flight.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{flight.aircraft}</p>
                          <Badge variant="outline" className="text-xs">{flight.purpose}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{flight.route}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{flight.date}</p>
                          <p className="text-xs text-muted-foreground">{flight.hobbs} hobbs</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* FLYING CLUB TAB */}
        {activeTab === 'flying-club' && (
          <div className="space-y-6">
            {/* Join or Create */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Join a Flying Club</CardTitle>
                  <CardDescription>Connect with other pilots and share aircraft access</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Browse Clubs</Button>
                </CardContent>
              </Card>
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" />Create a Club</CardTitle>
                  <CardDescription>Start your own flying club and manage members</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">Create Club</Button>
                </CardContent>
              </Card>
            </div>

            {/* Available Clubs */}
            <Card>
              <CardHeader>
                <CardTitle>Available Clubs</CardTitle>
                <CardDescription>Find a flying club near you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demoClubs.map((club) => (
                    <div key={club.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-primary/10 p-3"><Users className="h-5 w-5 text-primary" /></div>
                        <div className="space-y-1">
                          <p className="font-semibold">{club.name}</p>
                          <p className="text-sm text-muted-foreground">{club.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{club.members} members</span>
                            <span>{club.aircraft.length} aircraft</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">View</Button>
                        <Button size="sm">Request Join</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
