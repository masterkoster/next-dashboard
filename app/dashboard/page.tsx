'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Plane, 
  MapPin,
  Wind,
  Fuel,
  Cloud,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Settings,
  Bell,
  Search,
  FileText,
  Wrench,
  GraduationCap,
  Gauge,
  ArrowRight,
  Eye,
  Edit,
  Plus,
  X,
  LayoutDashboard,
  EyeOff,
  Loader2,
  Navigation,
  User
} from "lucide-react"
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from "recharts"

// Demo data markers - TODO: Connect to real database tables
// - LogbookEntry table for flight hours
// - FlightPlan table for saved plans  
// - UserAircraft table for maintenance
// - PilotProfile for home airport
// - NEW TABLE NEEDED: Credential tracking (medical, flight review, etc)
// - NEW API NEEDED: Weather/METAR integration

// Widget definitions
type WidgetType = 
  | 'airport-weather'
  | 'quick-alerts'
  | 'flight-hours'
  | 'upcoming-flights'
  | 'maintenance'
  | 'currency'
  | 'flight-plans'

const WIDGET_INFO: Record<WidgetType, { name: string; description: string }> = {
  'airport-weather': { name: 'Home Airport Weather', description: 'Current conditions at your home airport' },
  'quick-alerts': { name: 'Quick Alerts', description: 'Urgent maintenance, next flight, and hours' },
  'flight-hours': { name: 'Flight Hours Chart', description: 'Your flying activity over time' },
  'upcoming-flights': { name: 'Upcoming Flights', description: 'Your scheduled flights and lessons' },
  'maintenance': { name: 'Aircraft Maintenance', description: 'Due maintenance items' },
  'currency': { name: 'Currency & Licenses', description: 'Credential expiration tracking' },
  'flight-plans': { name: 'Saved Flight Plans', description: 'Quick access to your routes' },
}

// Flight hours over past 6 months
const flightHoursData = [
  { month: "Sep", hours: 12.5 },
  { month: "Oct", hours: 15.2 },
  { month: "Nov", hours: 9.8 },
  { month: "Dec", hours: 18.4 },
  { month: "Jan", hours: 14.6 },
  { month: "Feb", hours: 16.2 },
]

// Demo currency - NOT IMPLEMENTED - needs new table
const currencyItems = [
  { id: 1, type: "Medical Certificate", class: "Class 2", expiryDate: "Dec 15, 2026", daysRemaining: 297, status: "ok" },
  { id: 2, type: "Flight Review", requirement: "BFR", expiryDate: "May 8, 2026", daysRemaining: 77, status: "warning" },
  { id: 3, type: "Night Currency", requirement: "3 T/O & Landings", expiryDate: "Apr 2, 2026", daysRemaining: 41, status: "warning" },
  { id: 4, type: "IFR Currency", requirement: "6 Approaches", expiryDate: "Aug 22, 2026", daysRemaining: 183, status: "ok" },
]

// Demo maintenance - CONNECT TO UserAircraft table
const maintenanceItems = [
  { id: 1, item: "100-Hour Inspection", aircraft: "N12345", dueDate: "Mar 15, 2026", hoursRemaining: 8.5, status: "warning" },
  { id: 2, item: "Annual Inspection", aircraft: "N12345", dueDate: "Jun 20, 2026", hoursRemaining: 98.2, status: "ok" },
  { id: 3, item: "Oil Change", aircraft: "N12345", dueDate: "Mar 1, 2026", hoursRemaining: 2.3, status: "urgent" },
  { id: 4, item: "ELT Battery", aircraft: "N12345", dueDate: "Aug 10, 2026", hoursRemaining: 156.0, status: "ok" },
]

// Upcoming lessons/flights - CONNECT TO FlightPlan table
const upcomingFlights = [
  { id: 1, type: "lesson", title: "IFR Training - Approaches", instructor: "John Smith, CFI-I", date: "Feb 23, 2026", time: "14:00", aircraft: "N12345" },
  { id: 2, type: "flight", title: "Cross Country - KBOS to KALB", date: "Feb 25, 2026", time: "09:00", aircraft: "N12345" },
  { id: 3, type: "lesson", title: "Commercial Maneuvers", instructor: "Sarah Johnson, CFI", date: "Feb 28, 2026", time: "10:30", aircraft: "N12345" },
]

// Saved flight plans - CONNECT TO FlightPlan table
const savedFlightPlans = [
  { id: 1, name: "Weekend Getaway - KBOS to KMVY", distance: 68, duration: "0:45", route: "Direct", lastUpdated: "2 days ago" },
  { id: 2, name: "Cross Country - KBOS to KALB", distance: 143, duration: "1:15", route: "V3 ALB", lastUpdated: "1 week ago" },
  { id: 3, name: "Practice Area - KBOS Local", distance: 25, duration: "1:30", route: "Local", lastUpdated: "3 days ago" },
]

export default function PilotDashboard() {
  const { data: session, status } = useSession()
  const [customizeMode, setCustomizeMode] = useState(false)
  const [visibleWidgets, setVisibleWidgets] = useState<WidgetType[]>([
    'airport-weather',
    'quick-alerts',
    'flight-hours',
    'upcoming-flights',
    'maintenance',
    'currency',
    'flight-plans',
  ])

  // Load preferences from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('dashboard-widgets')
    if (saved) {
      try {
        setVisibleWidgets(JSON.parse(saved))
      } catch (e) {
        console.error('[v0] Failed to parse saved widgets:', e)
      }
    }
  }, [])

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('dashboard-widgets', JSON.stringify(visibleWidgets))
  }, [visibleWidgets])

  const toggleWidget = (widget: WidgetType) => {
    setVisibleWidgets(prev => 
      prev.includes(widget) 
        ? prev.filter(w => w !== widget)
        : [...prev, widget]
    )
  }

  const isWidgetVisible = (widget: WidgetType) => visibleWidgets.includes(widget)

  // Demo notice - shows what data needs real implementation
  const DemoNotice = () => (
    <div className="mb-4 rounded-lg bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-sm">
      <strong className="text-amber-600">Demo Data Notice:</strong>
      <span className="text-amber-600/80 ml-2">
        This dashboard shows demo data. To connect: LogbookEntry, FlightPlan, UserAircraft tables need API routes. 
        Currency/credentials need new table. Weather needs METAR integration.
      </span>
    </div>
  )

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to view your pilot dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/api/auth/signin">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Plane className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">Pilot Dashboard</span>
          </div>
          
          <div className="ml-auto flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search flights, plans..."
                className="h-9 w-64 rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button 
              variant={customizeMode ? "default" : "ghost"} 
              size="sm"
              onClick={() => setCustomizeMode(!customizeMode)}
              className="gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden md:inline">
                {customizeMode ? 'Done' : 'Customize'}
              </span>
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/profile" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">Profile</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/settings">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="mx-auto max-w-[1600px] space-y-6">
          {/* Welcome Section */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, Captain!</h1>
            <p className="text-muted-foreground">
              {"Here's your flight status and what needs your attention."}
            </p>
          </div>

          {/* Demo Data Notice */}
          <DemoNotice />

          {/* Customize Mode Panel */}
          {customizeMode && (
            <Card className="border-primary">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <LayoutDashboard className="h-5 w-5 text-primary" />
                      Customize Dashboard
                    </CardTitle>
                    <CardDescription>
                      Show or hide widgets to personalize your dashboard
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setCustomizeMode(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {(Object.keys(WIDGET_INFO) as WidgetType[]).map((widget) => {
                    const info = WIDGET_INFO[widget]
                    const visible = isWidgetVisible(widget)
                    return (
                      <button
                        key={widget}
                        onClick={() => toggleWidget(widget)}
                        className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-all hover:bg-muted/50 ${
                          visible 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border bg-background opacity-60'
                        }`}
                      >
                        <div className={`mt-1 rounded-md p-1.5 ${
                          visible ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          {visible ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{info.name}</p>
                          <p className="text-xs text-muted-foreground">{info.description}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Home Airport Weather & Info */}
          {isWidgetVisible('airport-weather') && (
          <Card className="border-primary/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Home Airport - KBOS (Boston Logan)
                  </CardTitle>
                  <CardDescription>Current conditions and information</CardDescription>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Updated 5 min ago
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Cloud className="h-4 w-4" />
                    Weather
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">42°F</div>
                    <p className="text-xs text-muted-foreground">Scattered clouds at 2,500ft</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Wind className="h-4 w-4" />
                    Winds
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">270° @ 12kt</div>
                    <p className="text-xs text-muted-foreground">Gusting to 18kt</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Gauge className="h-4 w-4" />
                    Altimeter
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">29.92</div>
                    <p className="text-xs text-muted-foreground">inHg (Standard)</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Fuel className="h-4 w-4" />
                    Fuel Price (100LL)
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">$5.89</div>
                    <p className="text-xs text-chart-2">-$0.12 vs last week</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Alerts & Important Items */}
          {isWidgetVisible('quick-alerts') && (
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <CardTitle className="text-base">Urgent Maintenance</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Oil Change Due Soon</p>
                  <p className="text-xs text-muted-foreground">N12345 - Due in 2.3 hours</p>
                  <Button size="sm" variant="destructive" className="w-full">
                    Schedule Now
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-chart-3/50 bg-chart-3/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-chart-3" />
                  <CardTitle className="text-base">Next Flight</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium">IFR Training</p>
                  <p className="text-xs text-muted-foreground">Tomorrow at 14:00 with John Smith</p>
                  <Button size="sm" variant="outline" className="w-full">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-chart-2/50 bg-chart-2/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-chart-2" />
                  <CardTitle className="text-base">Flight Hours</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold">16.2 hrs</p>
                  <p className="text-xs text-muted-foreground">Logged this month</p>
                  <Button size="sm" variant="outline" className="w-full">
                    View Logbook
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          )}

          {/* Flight Hours & Upcoming Items */}
          <div className="grid gap-4 lg:grid-cols-7">
            {isWidgetVisible('flight-hours') && (
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Flight Hours</CardTitle>
                <CardDescription>Your flying activity over the past 6 months</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={flightHoursData}>
                    <defs>
                      <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="month" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="hours" 
                      stroke="hsl(var(--chart-1))" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorHours)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Hours (Last 6 months)</p>
                    <p className="text-2xl font-bold">86.7 hrs</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Average per Month</p>
                    <p className="text-2xl font-bold">14.5 hrs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            )}

            {isWidgetVisible('upcoming-flights') && (
            <Card className="lg:col-span-3">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Upcoming Flights</CardTitle>
                    <CardDescription>Your schedule</CardDescription>
                  </div>
                  <Button size="sm" variant="outline">
                    <Plus className="mr-1 h-4 w-4" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingFlights.map((flight) => (
                    <div key={flight.id} className="space-y-2 rounded-lg border border-border p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {flight.type === 'lesson' ? (
                            <GraduationCap className="h-4 w-4 text-primary" />
                          ) : (
                            <Plane className="h-4 w-4 text-chart-2" />
                          )}
                          <div>
                            <p className="text-sm font-medium leading-none">{flight.title}</p>
                            {flight.instructor && (
                              <p className="mt-1 text-xs text-muted-foreground">{flight.instructor}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {flight.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {flight.time}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">{flight.aircraft}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            )}
          </div>

          {/* Maintenance & Currency */}
          <div className="grid gap-4 lg:grid-cols-2">
            {isWidgetVisible('maintenance') && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Aircraft Maintenance</CardTitle>
                    <CardDescription>Due items for N12345</CardDescription>
                  </div>
                  <Button size="sm" variant="outline">
                    <Wrench className="mr-1 h-4 w-4" />
                    Manage
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {maintenanceItems.map((item, index) => (
                    <div key={item.id}>
                      <div className="space-y-2 rounded-lg border border-border p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{item.item}</p>
                              <Badge 
                                variant={item.status === 'urgent' ? 'destructive' : item.status === 'warning' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {item.status === 'urgent' ? 'Urgent' : item.status === 'warning' ? 'Soon' : 'OK'}
                              </Badge>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">Due: {item.dueDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">{item.hoursRemaining.toFixed(1)} hours remaining</p>
                          <Button size="sm" variant="ghost" className="h-7 text-xs">
                            Details
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {index < maintenanceItems.length - 1 && <Separator className="my-3" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            )}

            {isWidgetVisible('currency') && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Currency & Licenses</CardTitle>
                    <CardDescription>Keep your credentials current</CardDescription>
                  </div>
                  <Button size="sm" variant="outline">
                    <FileText className="mr-1 h-4 w-4" />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currencyItems.map((item, index) => (
                    <div key={item.id}>
                      <div className="space-y-2 rounded-lg border border-border p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{item.type}</p>
                              <Badge 
                                variant={item.status === 'warning' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {item.status === 'warning' ? 'Expiring Soon' : 'Current'}
                              </Badge>
                            </div>
                            {item.class && <p className="mt-1 text-xs text-muted-foreground">{item.class}</p>}
                            {item.requirement && <p className="mt-1 text-xs text-muted-foreground">{item.requirement}</p>}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">Expires: {item.expiryDate} ({item.daysRemaining} days)</p>
                          <Button size="sm" variant="ghost" className="h-7 text-xs">
                            Renew
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {index < currencyItems.length - 1 && <Separator className="my-3" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            )}
          </div>

          {/* Saved Flight Plans */}
          {isWidgetVisible('flight-plans') && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Saved Flight Plans</CardTitle>
                  <CardDescription>Quick access to your routes</CardDescription>
                </div>
                <Button size="sm" variant="default">
                  <Plus className="mr-1 h-4 w-4" />
                  New Plan
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {savedFlightPlans.map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-lg bg-primary/10 p-2">
                        <Navigation className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{plan.name}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{plan.distance} nm</span>
                          <span>{plan.duration}</span>
                          <span>{plan.route}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Updated {plan.lastUpdated}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          )}
        </div>
      </main>
    </div>
  )
}
