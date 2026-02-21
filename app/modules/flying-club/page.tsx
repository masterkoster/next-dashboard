'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Settings,
  Loader2,
  User,
  Home
} from "lucide-react"

// Types
interface GroupAircraft {
  id: string
  nNumber: string
  nickname: string | null
  make: string | null
  model: string | null
  year: number | null
  status: string | null
  hourlyRate: number | null
  hobbsHours: number | null
  groupName?: string
}

interface Group {
  id: string
  name: string
  description: string | null
  role: string
  aircraft: GroupAircraft[]
  members?: number
}

interface Booking {
  id: string
  aircraftId: string
  aircraft?: GroupAircraft
  userId: string
  user?: { name: string | null; email: string }
  startTime: string
  endTime: string
  purpose: string | null
}

interface Maintenance {
  id: string
  aircraftId: string
  aircraft?: GroupAircraft
  description: string
  status: string
  priority: string
  reportedDate: string
  dueDate: string | null
}

interface FlightLog {
  id: string
  aircraftId: string
  aircraft?: GroupAircraft
  userId: string
  user?: { name: string | null }
  date: string
  hobbsIn: number
  hobbsOut: number
  route: string | null
  notes: string | null
}

interface Member {
  id: string
  userId: string
  user: { id: string; name: string | null; email: string }
  role: string
  joinedAt: string
}

interface ChatMessage {
  id: string
  groupId: string
  userId: string
  user: { name: string; initials: string; color: string }
  message: string
  timestamp: string
}

// Demo chat messages
const demoChatMessages: ChatMessage[] = [
  { id: 'c1', groupId: 'demo-1', userId: 'u1', user: { name: 'Frank Miller', initials: 'FM', color: 'bg-primary' }, message: "Hey everyone! Anyone flying this weekend?", timestamp: '2026-02-21T10:30:00' },
  { id: 'c2', groupId: 'demo-1', userId: 'u2', user: { name: 'Sarah Johnson', initials: 'SJ', color: 'bg-green-500' }, message: "I'm thinking Saturday morning for some IFR practice!", timestamp: '2026-02-21T10:45:00' },
  { id: 'c3', groupId: 'demo-1', userId: 'u3', user: { name: 'Mike Wilson', initials: 'MW', color: 'bg-blue-500' }, message: "Count me in! The 182 is available", timestamp: '2026-02-21T11:00:00' },
  { id: 'c4', groupId: 'demo-1', userId: 'u1', user: { name: 'Frank Miller', initials: 'FM', color: 'bg-primary' }, message: "Great! Let's meet at 8am", timestamp: '2026-02-21T11:15:00' },
]

// Demo data
const demoGroups: Group[] = [
  {
    id: 'demo-1',
    name: 'Sky High Flying Club',
    description: 'A welcoming club for pilots of all experience levels',
    role: 'ADMIN',
    aircraft: [
      { id: 'a1', nNumber: 'N172SP', nickname: 'Skyhawk', make: 'Cessna', model: '172S', year: 2025, status: 'Available', hourlyRate: 165, hobbsHours: 98.2 },
      { id: 'a2', nNumber: 'N9876P', nickname: 'Warrior', make: 'Piper', model: 'PA-28-161', year: 2019, status: 'Maintenance', hourlyRate: 145, hobbsHours: 1842.3 }
    ],
    members: 5
  },
  {
    id: 'demo-2',
    name: 'Weekend Warriors',
    description: 'Casual flying group for weekend adventures',
    role: 'MEMBER',
    aircraft: [
      { id: 'a3', nNumber: 'N345AB', nickname: 'Cherokee', make: 'Piper', model: 'PA-32-300', year: 1978, status: 'Available', hourlyRate: 135, hobbsHours: 4890.5 }
    ],
    members: 2
  }
]

const demoBookings: Booking[] = [
  { id: 'b1', aircraftId: 'a1', aircraft: demoGroups[0].aircraft[0], userId: 'u1', user: { name: 'Demo Admin', email: 'demo@test.com' }, startTime: '2026-02-23T14:00', endTime: '2026-02-23T16:00', purpose: 'Local practice' },
  { id: 'b2', aircraftId: 'a3', aircraft: demoGroups[1].aircraft[0], userId: 'u2', user: { name: 'Mike Wilson', email: 'mike@test.com' }, startTime: '2026-02-24T09:00', endTime: '2026-02-24T12:00', purpose: 'Cross country' },
  { id: 'b3', aircraftId: 'a1', aircraft: demoGroups[0].aircraft[0], userId: 'u3', user: { name: 'Sarah Johnson', email: 'sarah@test.com' }, startTime: '2026-02-25T10:30', endTime: '2026-02-25T13:30', purpose: 'IFR practice' }
]

const demoMaintenance: Maintenance[] = [
  { id: 'm1', aircraftId: 'a2', aircraft: demoGroups[0].aircraft[1], description: 'Annual inspection', status: 'In Progress', priority: 'high', reportedDate: '2026-01-15', dueDate: '2026-08-20' },
  { id: 'm2', aircraftId: 'a1', aircraft: demoGroups[0].aircraft[0], description: 'Oil change', status: 'Needed', priority: 'medium', reportedDate: '2026-02-01', dueDate: '2026-03-01' }
]

const demoMembers: Member[] = [
  { id: 'mb1', userId: 'u1', user: { id: 'u1', name: 'Demo Admin', email: 'demo@admin.com' }, role: 'ADMIN', joinedAt: '2024-01-01' },
  { id: 'mb2', userId: 'u2', user: { id: 'u2', name: 'Frank Miller', email: 'frank@demo.com' }, role: 'MEMBER', joinedAt: '2024-03-15' },
  { id: 'mb3', userId: 'u3', user: { id: 'u3', name: 'Sarah Johnson', email: 'sarah@demo.com' }, role: 'MEMBER', joinedAt: '2024-06-20' },
]

// Personal demo data
const personalAircraft: GroupAircraft[] = [
  { id: 'p1', nNumber: 'N12345', nickname: 'My Skyhawk', make: 'Cessna', model: '172S', year: 2020, status: 'Available', hourlyRate: 145, hobbsHours: 450.5 },
]

const personalBookings: Booking[] = [
  { id: 'pb1', aircraftId: 'p1', aircraft: personalAircraft[0], userId: 'u1', user: { name: 'Demo User', email: 'demo@test.com' }, startTime: '2026-02-22T10:00', endTime: '2026-02-22T12:00', purpose: 'Personal flight' },
]

export default function FlyingClubPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedView, setSelectedView] = useState<string>('personal')
  const [groups, setGroups] = useState<Group[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [maintenance, setMaintenance] = useState<Maintenance[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [loading, setLoading] = useState(true)

  // Fetch user's groups
  useEffect(() => {
    if (status === 'loading') return
    
    async function fetchData() {
      setLoading(true)
      try {
        if (session?.user?.id) {
          // Fetch real groups from API
          const groupsRes = await fetch('/api/groups')
          if (groupsRes.ok) {
            const groupsData = await groupsRes.json()
            setGroups(groupsData)
          }
          // Fetch personal bookings from API
          const bookingsRes = await fetch('/api/bookings')
          if (bookingsRes.ok) {
            const bookingsData = await bookingsRes.json()
            setBookings(bookingsData)
          }
          // Set empty for demo-like state when logged in
          setMaintenance([])
          setMembers([])
        } else {
          // Demo mode - only show demo data when NOT logged in
          setGroups(demoGroups)
          setBookings([...personalBookings, ...demoBookings])
          setMaintenance(demoMaintenance)
          setMembers(demoMembers)
          setChatMessages(demoChatMessages)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        if (!session?.user?.id) {
          // Only load demo data on error if not logged in
          setGroups(demoGroups)
          setBookings([...personalBookings, ...demoBookings])
          setMaintenance(demoMaintenance)
          setMembers(demoMembers)
        }
      }
      setLoading(false)
    }
    
    fetchData()
  }, [session, status])

  // Fetch group-specific data when view changes
  useEffect(() => {
    if (!session?.user?.id) return
    if (selectedView === 'personal') {
      // Fetch personal bookings
      fetch('/api/bookings').then(r => r.ok && r.json()).then(data => { if (data) setBookings(data) })
      setMaintenance([])
      setMembers([])
      return
    }
    
    async function fetchGroupData() {
      try {
        const bookingsRes = await fetch(`/api/groups/${selectedView}/bookings`)
        if (bookingsRes.ok) setBookings(await bookingsRes.json())
        const membersRes = await fetch(`/api/groups/${selectedView}/members`)
        if (membersRes.ok) setMembers(await membersRes.json())
        
        // Fetch group chat messages
        if (selectedView !== 'personal') {
          const chatRes = await fetch(`/api/groups/${selectedView}/chat`)
          if (chatRes.ok) {
            const chatData = await chatRes.json()
            setChatMessages(chatData)
          }
        }
      } catch (error) {
        console.error('Error fetching group data:', error)
      }
    }

    fetchGroupData()
  }, [selectedView, session])

  // Send chat message
  const handleSendChat = async () => {
    if (!chatInput.trim() || selectedView === 'personal' || !session?.user?.id) return
    
    try {
      const res = await fetch(`/api/groups/${selectedView}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatInput.trim() })
      })
      if (res.ok) {
        const newMessage = await res.json()
        setChatMessages([...chatMessages, newMessage])
        setChatInput('')
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const isDemo = !session?.user?.id
  const isPersonal = selectedView === 'personal'
  const selectedGroup = groups.find(g => g.id === selectedView)
  
  // Filter data based on selected view
  const displayAircraft = isPersonal ? personalAircraft : (selectedGroup?.aircraft || [])
  const displayBookings = isPersonal 
    ? personalBookings 
    : bookings.filter(b => displayAircraft.some(a => a.id === b.aircraftId))
  const displayMaintenance = isPersonal ? [] : maintenance.filter(m => displayAircraft.some(a => a.id === m.aircraftId))
  const displayMembers = isPersonal ? [] : members

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-[1600px] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Flying Club</h1>
              <p className="text-muted-foreground mt-1">Manage your aviation group and aircraft</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedView}
                onChange={(e) => setSelectedView(e.target.value)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm min-w-[200px]"
              >
                <option value="personal">👤 Personal</option>
                <optgroup label="✈️ Flying Clubs">
                  {(isDemo ? demoGroups : groups).map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </optgroup>
              </select>
              {isPersonal && (
                <Button size="sm" variant="outline">
                  <Plus className="mr-1 h-3 w-3" />
                  Add Aircraft
                </Button>
              )}
              {!isPersonal && (
                <Button size="sm">
                  <Plus className="mr-1 h-3 w-3" />
                  New Group
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-1 border-b border-border overflow-x-auto">
            {(['dashboard', 'calendar', 'bookings', 'aircraft', 'flights', 'maintenance', 'billing', 'members'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors relative ${
                  activeTab === tab
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1600px] p-6">
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
                  <div className="text-2xl font-bold">{displayBookings.length}</div>
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
                  <div className="text-2xl font-bold text-destructive">{displayMaintenance.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">1 high priority</p>
                </CardContent>
              </Card>
            </div>

            {/* Groups Overview - Only show for clubs */}
            {!isPersonal && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* First column: Groups */}
              {(selectedView === 'all' ? groups : [selectedGroup].filter(Boolean)).map((group) => group && (
                <Card key={group.id}>
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
                  <CardContent className="space-y-4">
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

                    <div className="space-y-3">
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

                    <Button variant="outline" className="w-full">
                      View Group Details
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {/* Second column: Group Chat when only 1 or fewer clubs */}
              {(selectedView === 'all' ? groups : [selectedGroup].filter(Boolean)).length < 2 && (
                <Card className="flex flex-col h-[500px]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Group Chat</CardTitle>
                        <CardDescription>Chat with club members</CardDescription>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col p-0">
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {(isDemo || chatMessages.length > 0) ? (
                        chatMessages.length > 0 ? (
                          chatMessages.map((msg) => (
                            <div key={msg.id} className="flex gap-3">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs ${msg.user.color || 'bg-primary'}`}>
                                {msg.user.initials}
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium">{msg.user.name}</p>
                                  <span className="text-xs text-muted-foreground">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <p className="text-sm text-muted-foreground bg-muted p-2 rounded-lg rounded-tl-none">{msg.message}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="flex gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm">FM</div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium">Frank Miller</p>
                                  <span className="text-xs text-muted-foreground">10:30 AM</span>
                                </div>
                                <p className="text-sm text-muted-foreground bg-muted p-2 rounded-lg rounded-tl-none">Hey everyone! Anyone flying this weekend?</p>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">SJ</div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium">Sarah Johnson</p>
                                  <span className="text-xs text-muted-foreground">10:45 AM</span>
                                </div>
                                <p className="text-sm text-muted-foreground bg-muted p-2 rounded-lg rounded-tl-none">I'm thinking Saturday morning for some IFR practice!</p>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">MW</div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium">Mike Wilson</p>
                                  <span className="text-xs text-muted-foreground">11:00 AM</span>
                                </div>
                                <p className="text-sm text-muted-foreground bg-muted p-2 rounded-lg rounded-tl-none">Count me in! The 182 is available</p>
                              </div>
                            </div>
                          </>
                        )
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          <p className="text-sm">No messages yet</p>
                          <p className="text-xs">Start a conversation with your club</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Chat Input */}
                    <div className="p-3 border-t">
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Type a message..." 
                          className="flex-1"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                          disabled={!session?.user?.id || selectedView === 'personal'}
                        />
                        <Button 
                          size="sm" 
                          disabled={!session?.user?.id || selectedView === 'personal' || !chatInput.trim()}
                          onClick={handleSendChat}
                        >
                          Send
                        </Button>
                      </div>
                      {selectedView === 'personal' ? (
                        <p className="text-xs text-muted-foreground mt-2 text-center">Select a club to chat with members</p>
                      ) : !session?.user?.id && (
                        <p className="text-xs text-muted-foreground mt-2 text-center">Sign in to chat</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            )}

            {/* Upcoming Bookings & Maintenance */}
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
                    {displayBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{booking.aircraft?.nNumber || booking.aircraftId}</p>
                            <span className="text-xs text-muted-foreground">•</span>
                            <p className="text-sm text-muted-foreground">{booking.user?.name || 'Unknown'}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">{booking.purpose}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{booking.startTime ? new Date(booking.startTime).toLocaleDateString() : 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">{booking.startTime && booking.endTime ? `${new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'N/A'}</p>
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
                    {displayMaintenance.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{item.aircraft?.nNumber || item.aircraftId}</p>
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
            {displayAircraft.map((aircraft) => (
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
                    <Button variant="outline" className="flex-1">
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
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    New Booking
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {displayBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Plane className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{booking.aircraft?.nNumber || booking.aircraftId}</p>
                        <p className="text-xs text-muted-foreground">{booking.purpose}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-medium">{booking.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{booking.startTime ? new Date(booking.startTime).toLocaleDateString() : 'N/A'}</p>
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
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Report Issue
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {displayMaintenance.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        item.priority === 'high' ? 'bg-destructive/10' : 'bg-muted'
                      }`}>
                        <Wrench className={`h-5 w-5 ${item.priority === 'high' ? 'text-destructive' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{item.aircraft?.nNumber || item.aircraftId}</p>
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
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
