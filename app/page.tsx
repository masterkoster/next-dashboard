'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  FileText,
  Wrench,
  GraduationCap,
  Navigation,
  Gauge,
  ArrowRight,
  Eye,
  Edit,
  Plus,
  X,
  LayoutDashboard,
  EyeOff
} from "lucide-react"
import { AreaChart, Area, LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from "recharts"

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

// Generate flight hours data at different granularities
const generateFlightHoursData = (zoomLevel: 'year' | 'months' | 'weeks' | 'days') => {
  switch (zoomLevel) {
    case 'year':
      return [
        { label: "2020", hours: 145 },
        { label: "2021", hours: 168 },
        { label: "2022", hours: 142 },
        { label: "2023", hours: 156 },
        { label: "2024", hours: 87 },
      ]
    case 'months':
      return [
        { label: "Sep", hours: 12.5 },
        { label: "Oct", hours: 15.2 },
        { label: "Nov", hours: 9.8 },
        { label: "Dec", hours: 18.4 },
        { label: "Jan", hours: 14.6 },
        { label: "Feb", hours: 16.2 },
      ]
    case 'weeks':
      return [
        { label: "W1", hours: 3.2 },
        { label: "W2", hours: 4.1 },
        { label: "W3", hours: 2.8 },
        { label: "W4", hours: 6.1 },
        { label: "W5", hours: 3.5 },
        { label: "W6", hours: 4.7 },
        { label: "W7", hours: 3.9 },
        { label: "W8", hours: 5.2 },
      ]
    case 'days':
      return [
        { label: "Mon", hours: 0 },
        { label: "Tue", hours: 1.2 },
        { label: "Wed", hours: 0 },
        { label: "Thu", hours: 2.1 },
        { label: "Fri", hours: 0 },
        { label: "Sat", hours: 3.8 },
        { label: "Sun", hours: 2.5 },
      ]
  }
}

// Upcoming maintenance items
const maintenanceItems = [
  { id: 1, item: "100-Hour Inspection", aircraft: "N12345", dueDate: "Mar 15, 2024", hoursRemaining: 8.5, status: "warning" },
  { id: 2, item: "Annual Inspection", aircraft: "N12345", dueDate: "Jun 20, 2024", hoursRemaining: 98.2, status: "ok" },
  { id: 3, item: "Oil Change", aircraft: "N12345", dueDate: "Mar 1, 2024", hoursRemaining: 2.3, status: "urgent" },
  { id: 4, item: "ELT Battery", aircraft: "N12345", dueDate: "Aug 10, 2024", hoursRemaining: 156.0, status: "ok" },
]

// License & currency requirements
const currencyItems = [
  { id: 1, type: "Medical Certificate", class: "Class 2", expiryDate: "Dec 15, 2024", daysRemaining: 297, status: "ok" },
  { id: 2, type: "Flight Review", requirement: "BFR", expiryDate: "May 8, 2024", daysRemaining: 77, status: "warning" },
  { id: 3, type: "Night Currency", requirement: "3 T/O & Landings", expiryDate: "Apr 2, 2024", daysRemaining: 41, status: "warning" },
  { id: 4, type: "IFR Currency", requirement: "6 Approaches", expiryDate: "Aug 22, 2024", daysRemaining: 183, status: "ok" },
]

// Upcoming lessons/flights
const upcomingFlights = [
  { id: 1, type: "lesson", title: "IFR Training - Approaches", instructor: "John Smith, CFI-I", date: "Feb 23, 2024", time: "14:00", aircraft: "N12345" },
  { id: 2, type: "flight", title: "Cross Country - KBOS to KALB", date: "Feb 25, 2024", time: "09:00", aircraft: "N12345" },
  { id: 3, type: "lesson", title: "Commercial Maneuvers", instructor: "Sarah Johnson, CFI", date: "Feb 28, 2024", time: "10:30", aircraft: "N12345" },
]

// Saved flight plans
const savedFlightPlans = [
  { id: 1, name: "Weekend Getaway - KBOS to KMVY", distance: 68, duration: "0:45", route: "Direct", lastUpdated: "2 days ago" },
  { id: 2, name: "Cross Country - KBOS to KALB", distance: 143, duration: "1:15", route: "V3 ALB", lastUpdated: "1 week ago" },
  { id: 3, name: "Practice Area - KBOS Local", distance: 25, duration: "1:30", route: "Local", lastUpdated: "3 days ago" },
]

export default function PilotDashboard() {
  const router = useRouter()
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
  const [chartZoomLevel, setChartZoomLevel] = useState<'year' | 'months' | 'weeks' | 'days'>('months')

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
  
  // Calculate summary stats based on zoom level
  const getChartSummary = () => {
    const data = generateFlightHoursData(chartZoomLevel)
    const total = data.reduce((sum, item) => sum + item.hours, 0)
    const average = total / data.length
    
    const labels = {
      year: { period: 'Past 5 years', unit: 'per year' },
      months: { period: 'Past 6 months', unit: 'per month' },
      weeks: { period: 'Past 8 weeks', unit: 'per week' },
      days: { period: 'This week', unit: 'per day' }
    }
    
    return {
      total: total.toFixed(1),
      average: average.toFixed(1),
      period: labels[chartZoomLevel].period,
      unit: labels[chartZoomLevel].unit
    }
  }
  
  const chartSummary = getChartSummary()

  return (
    <div className="min-h-screen bg-background pt-[44px]">
      <main className="p-6">
        <div className="mx-auto max-w-[1600px] space-y-6">
          {/* Welcome Section */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, Captain!</h1>
            <p className="text-muted-foreground">
              {"Here's your flight status and what needs your attention."}
            </p>
          </div>

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
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => router.push('/flying-club?tab=maintenance')}
                  >
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
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/trips')}
                  >
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
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/modules/logbook')}
                  >
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
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Flight Hours</CardTitle>
                    <CardDescription>
                      {chartZoomLevel === 'year' && 'Your flying activity over the past 5 years'}
                      {chartZoomLevel === 'months' && 'Your flying activity over the past 6 months'}
                      {chartZoomLevel === 'weeks' && 'Your flying activity over the past 8 weeks'}
                      {chartZoomLevel === 'days' && 'Your flying activity this week'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => {
                        const levels: Array<'year' | 'months' | 'weeks' | 'days'> = ['days', 'weeks', 'months', 'year']
                        const currentIndex = levels.indexOf(chartZoomLevel)
                        if (currentIndex < levels.length - 1) {
                          setChartZoomLevel(levels[currentIndex + 1])
                        }
                      }}
                      disabled={chartZoomLevel === 'year'}
                      title="Zoom out"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                      </svg>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => {
                        const levels: Array<'year' | 'months' | 'weeks' | 'days'> = ['year', 'months', 'weeks', 'days']
                        const currentIndex = levels.indexOf(chartZoomLevel)
                        if (currentIndex < levels.length - 1) {
                          setChartZoomLevel(levels[currentIndex + 1])
                        }
                      }}
                      disabled={chartZoomLevel === 'days'}
                      title="Zoom in"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pl-2">
                <div 
                  onWheel={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const levels: Array<'year' | 'months' | 'weeks' | 'days'> = ['year', 'months', 'weeks', 'days']
                    const currentIndex = levels.indexOf(chartZoomLevel)
                    
                    if (e.deltaY < 0) {
                      // Scroll up = zoom in
                      if (currentIndex < levels.length - 1) {
                        setChartZoomLevel(levels[currentIndex + 1])
                      }
                    } else {
                      // Scroll down = zoom out
                      if (currentIndex > 0) {
                        setChartZoomLevel(levels[currentIndex - 1])
                      }
                    }
                  }}
                  style={{ position: 'relative' }}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={generateFlightHoursData(chartZoomLevel)}>
                    <defs>
                      <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis 
                      dataKey="label" 
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      stroke="#475569"
                    />
                    <YAxis 
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      stroke="#475569"
                      label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                    />
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#f1f5f9'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="hours" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorHours)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Hours ({chartSummary.period})</p>
                    <p className="text-2xl font-bold">{chartSummary.total} hrs</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Average {chartSummary.unit}</p>
                    <p className="text-2xl font-bold">{chartSummary.average} hrs</p>
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
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => router.push('/flying-club?tab=calendar')}
                  >
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
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => router.push('/flying-club?tab=maintenance')}
                  >
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
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 text-xs"
                            onClick={() => router.push('/flying-club?tab=maintenance')}
                          >
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
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => router.push('/profile')}
                  >
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
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 text-xs"
                            onClick={() => alert('Renew certification - Link to FAA or aviation authority')}
                          >
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
                <Button 
                  size="sm" 
                  variant="default"
                  onClick={() => router.push('/fuel-saver')}
                >
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
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => router.push(`/fuel-saver/view/${plan.id}`)}
                        title="View flight plan"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => router.push(`/fuel-saver?plan=${plan.id}`)}
                        title="Edit flight plan"
                      >
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
