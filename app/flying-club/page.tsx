'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Plane,
  Calendar,
  Users,
  Wrench,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Download,
  MoreVertical,
  MapPin,
  Fuel,
  BookOpen,
  Settings
} from "lucide-react"
import { FlightCompleteWizard } from "@/components/flight-complete/FlightCompleteWizard"

// Mock data structure
const mockGroups = [
  {
    id: '1',
    name: 'Sky High Flying Club',
    description: 'A welcoming club for pilots of all experience levels',
    aircraft: [
      {
        id: 'a1',
        nNumber: 'N172SP',
        nickname: 'Skyhawk',
        make: 'Cessna',
        model: '172S',
        year: 2025,
        status: 'Available',
        hourlyRate: 165,
        hobbsHours: 98.2
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
        hobbsHours: 1842.3
      }
    ],
    members: 5
  },
  {
    id: '2',
    name: 'Weekend Warriors',
    description: 'Casual flying group for weekend adventures',
    aircraft: [
      {
        id: 'a3',
        nNumber: 'N345AB',
        nickname: 'Cherokee',
        make: 'Piper',
        model: 'PA-32-300',
        year: 1978,
        status: 'Available',
        hourlyRate: 135,
        hobbsHours: 4890.5
      }
    ],
    members: 2
  }
]

const mockBookings = [
  { id: 'b1', aircraft: 'N172SP', pilot: 'Demo Admin', date: '2024-02-23', time: '14:00 - 16:00', purpose: 'Local practice' },
  { id: 'b2', aircraft: 'N345AB', pilot: 'Mike Wilson', date: '2024-02-24', time: '09:00 - 12:00', purpose: 'Cross country' },
  { id: 'b3', aircraft: 'N172SP', pilot: 'Sarah Johnson', date: '2024-02-25', time: '10:30 - 13:30', purpose: 'IFR practice' }
]

const mockMaintenance = [
  { id: 'm1', aircraft: 'N9876P', description: 'Annual inspection', status: 'In Progress', dueDate: '2024-08-20', priority: 'high' },
  { id: 'm2', aircraft: 'N172SP', description: 'Oil change', status: 'Needed', dueDate: '2024-03-01', priority: 'medium' }
]

// Types for real bookings
interface Booking {
  id: string
  aircraftId: string
  aircraftName?: string
  userId: string
  userName?: string
  date: string
  startTime: string
  endTime: string
  purpose?: string
  status?: string
}

export default function FlyingClubPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedGroup, setSelectedGroup] = useState('all')
  const [viewingGroupDetails, setViewingGroupDetails] = useState<string | null>(null)
  
  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  
  // Flight completion wizard state
  const [showFlightComplete, setShowFlightComplete] = useState(false)
  const [activeFlight, setActiveFlight] = useState<{id: string; aircraftId: string; aircraftName: string; userId: string; userName: string; hobbsStart?: number; date?: string; time?: string} | null>(null)

  // Fetch bookings
  useEffect(() => {
    async function fetchBookings() {
      setBookingsLoading(true)
      try {
        const res = await fetch('/api/bookings')
        const data = await res.json()
        if (data.bookings) {
          // Transform API bookings to our format
          const transformed: Booking[] = data.bookings.map((b: any) => ({
            id: b.id,
            aircraftId: b.aircraftId || '',
            aircraftName: b.aircraftName || b.aircraft || '',
            userId: b.userId || '',
            userName: b.userName || b.pilot || '',
            date: b.date || b.startTime?.split('T')[0] || '',
            startTime: b.startTime || '',
            endTime: b.endTime || '',
            purpose: b.purpose || '',
            status: b.status || 'scheduled'
          }))
          setBookings(transformed)
        }
      } catch (err) {
        console.error('Failed to fetch bookings:', err)
      } finally {
        setBookingsLoading(false)
      }
    }
    fetchBookings()
  }, [])

  // Get today's date string
  const today = new Date().toISOString().split('T')[0]
  
  // Get flights scheduled for today (or that should have started today)
  const todaysFlights = bookings.filter(booking => {
    const bookingDate = booking.date || booking.startTime?.split('T')[0]
    return bookingDate === today
  })

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    
    const days: (number | null)[] = []
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  return (
    <div className="min-h-screen bg-background pt-[44px]">
      {/* Main Content */}
      <main className="mx-auto max-w-[1600px] p-6">
        <div className="flex flex-col gap-4 pb-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h1 className="text-xl font-semibold">Flying Club</h1>
            <div className="flex flex-wrap items-center gap-3">
              {/* Quick link to Active Flights */}
              <Link href="/flying-club/active">
                <Button variant="outline" size="sm">
                  <Plane className="mr-2 h-4 w-4" />
                  Active Flights
                  {todaysFlights.length > 0 && (
                    <Badge variant="default" className="ml-2 bg-emerald-500">{todaysFlights.length}</Badge>
                  )}
                </Button>
              </Link>
              {mockGroups.length > 1 && (
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="h-8 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="all">All Groups</option>
                  {mockGroups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              )}
              <Button size="sm" variant="outline" onClick={() => window.location.href = '/flying-club/admin'}>
                <Settings className="mr-2 h-4 w-4" />
                Club Admin
              </Button>
              <Button 
                size="sm"
                onClick={() => alert('Create new group functionality - Coming soon!')}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Group
              </Button>
            </div>
          </div>
          <div className="flex gap-0 overflow-x-auto rounded-md border border-border bg-card">
            {(['dashboard', 'calendar', 'bookings', 'aircraft', 'flights', 'maintenance', 'billing', 'members'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative shrink-0 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Aircraft</CardTitle>
                  <Plane className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground mt-1">2 available, 1 maintenance</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockBookings.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Next: Today at 14:00</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">7</div>
                  <p className="text-xs text-muted-foreground mt-1">Across 2 groups</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Maintenance Items</CardTitle>
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{mockMaintenance.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">1 high priority</p>
                </CardContent>
              </Card>
            </div>

            {/* Groups Overview */}
            <div className="grid gap-6 lg:grid-cols-2">
              {mockGroups.map((group) => (
                <Card key={group.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{group.name}</CardTitle>
                        <CardDescription className="mt-1">{group.description}</CardDescription>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col space-y-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Plane className="h-4 w-4" />
                        <span>{group.aircraft.length} aircraft</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{group.members} members</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex-1 space-y-3">
                      <p className="text-sm font-medium">Aircraft</p>
                      {group.aircraft.map((aircraft) => (
                        <div key={aircraft.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{aircraft.nNumber}</p>
                              <Badge variant={aircraft.status === 'Available' ? 'secondary' : 'destructive'} className="text-xs">
                                {aircraft.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {aircraft.year} {aircraft.make} {aircraft.model}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">${aircraft.hourlyRate}/hr</p>
                            <p className="text-xs text-muted-foreground">{aircraft.hobbsHours} hrs</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto pt-4">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setViewingGroupDetails(group.id)}
                      >
                        View Group Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Upcoming Bookings & Maintenance */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Upcoming Bookings</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setActiveTab('bookings')}
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{booking.aircraft}</p>
                            <span className="text-xs text-muted-foreground">•</span>
                            <p className="text-sm text-muted-foreground">{booking.pilot}</p>
                          </div>
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
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setActiveTab('maintenance')}
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockMaintenance.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{item.aircraft}</p>
                            <Badge variant={item.status === 'In Progress' ? 'default' : 'secondary'} className="text-xs">
                              {item.status}
                            </Badge>
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
          </div>
        )}

        {activeTab === 'calendar' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Flight Schedule</CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium w-32 text-center">
                    {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </span>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  {/* Complete Flight - only show if there are flights today */}
                  {todaysFlights.length > 0 && (
                    <div className="flex items-center gap-2">
                      <select 
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                        onChange={(e) => {
                          const flight = todaysFlights.find(f => f.id === e.target.value)
                          if (flight) {
                            setActiveFlight({
                              id: flight.id,
                              aircraftId: flight.aircraftId,
                              aircraftName: flight.aircraftName || 'Unknown Aircraft',
                              userId: flight.userId,
                              userName: flight.userName || 'Unknown Pilot',
                              hobbsStart: 0,
                              date: flight.date,
                              time: flight.startTime
                            })
                            setShowFlightComplete(true)
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>Complete flight...</option>
                          {todaysFlights.map(flight => (
                          <option key={flight.id} value={flight.id}>
                            {flight.aircraftName || 'Aircraft'} - {flight.userName || 'Pilot'} ({flight.startTime || flight.time})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {todaysFlights.length === 0 && !bookingsLoading && (
                    <span className="text-xs text-muted-foreground">No flights scheduled today</span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="space-y-2">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
                  {DAYS.map(day => (
                    <div key={day} className="bg-card p-3 text-center">
                      <span className="text-xs font-medium text-muted-foreground">{day}</span>
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
                  {getDaysInMonth().map((day, index) => (
                    <div
                      key={index}
                      className={`bg-card min-h-[100px] p-2 ${
                        day ? 'hover:bg-muted/50 cursor-pointer transition-colors' : ''
                      }`}
                    >
                      {day && (
                        <>
                          <span className="text-sm font-medium">{day}</span>
                          {/* Show bookings on certain days */}
                          {(day === 23 || day === 24 || day === 25) && (
                            <div className="mt-2 space-y-1">
                              <div className="rounded bg-primary/10 border border-primary/20 px-2 py-1">
                                <p className="text-xs font-medium text-primary">N172SP</p>
                                <p className="text-xs text-muted-foreground">14:00</p>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'aircraft' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockGroups.flatMap(group => group.aircraft).map((aircraft) => (
              <Card key={aircraft.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {aircraft.nNumber}
                        <Badge variant={aircraft.status === 'Available' ? 'secondary' : 'destructive'}>
                          {aircraft.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {aircraft.year} {aircraft.make} {aircraft.model}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>${aircraft.hourlyRate}/hr</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{aircraft.hobbsHours} hrs</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Next Maintenance</span>
                      <span className="font-medium">250 hrs</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setActiveTab('calendar')
                        alert(`Booking ${aircraft.nNumber} - Calendar view opened`)
                      }}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Book
                    </Button>
                    <Button variant="outline" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'bookings' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Bookings</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => alert('New booking form - Coming soon!')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Booking
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Plane className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{booking.aircraft}</p>
                        <p className="text-xs text-muted-foreground">{booking.purpose}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-medium">{booking.pilot}</p>
                        <p className="text-xs text-muted-foreground">{booking.date} • {booking.time}</p>
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
        )}

        {activeTab === 'maintenance' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Maintenance Tracking</CardTitle>
                <Button 
                  size="sm"
                  onClick={() => alert('Report maintenance issue - Coming soon!')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Report Issue
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockMaintenance.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        item.priority === 'high' ? 'bg-destructive/10' : 'bg-muted'
                      }`}>
                        <Wrench className={`h-5 w-5 ${item.priority === 'high' ? 'text-destructive' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{item.aircraft}</p>
                          <Badge variant={item.status === 'In Progress' ? 'default' : 'secondary'}>
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-medium">Due: {item.dueDate}</p>
                        {item.priority === 'high' && (
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <AlertCircle className="h-3 w-3 text-destructive" />
                            <p className="text-xs text-destructive">High Priority</p>
                          </div>
                        )}
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
        )}

        {['flights', 'billing', 'members'].includes(activeTab) && (
          <Card>
            <CardHeader>
              <CardTitle>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</CardTitle>
              <CardDescription>Manage your {activeTab} here</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  {activeTab === 'flights' && <BookOpen className="h-8 w-8 text-muted-foreground" />}
                  {activeTab === 'billing' && <DollarSign className="h-8 w-8 text-muted-foreground" />}
                  {activeTab === 'members' && <Users className="h-8 w-8 text-muted-foreground" />}
                </div>
                <h3 className="text-lg font-semibold mb-2">No {activeTab} yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Get started by adding your first {activeTab.slice(0, -1)}</p>
                <Button
                  onClick={() => alert(`Add ${activeTab.slice(0, -1)} - Coming soon!`)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Flight Completion Wizard */}
        {activeFlight && (
          <FlightCompleteWizard
            open={showFlightComplete}
            onOpenChange={setShowFlightComplete}
            flight={activeFlight}
            onComplete={async (data) => {
              console.log('Flight completed:', data);
              alert('Flight logged! (Demo - API not connected yet)');
            }}
          />
        )}
      </main>
    </div>
  )
}
