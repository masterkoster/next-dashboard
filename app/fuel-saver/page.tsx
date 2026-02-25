'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Plane,
  MapPin,
  Fuel,
  Plus,
  X,
  Save,
  Upload,
  Download,
  Settings,
  Search,
  Navigation,
  Clock,
  DollarSign,
  AlertTriangle,
  ChevronLeft,
  Menu,
  FileText,
  Target,
  CloudRain,
  Bell,
  Info,
  Calculator,
  Route as RouteIcon,
  GripVertical,
  Trash2,
  FolderOpen,
  Share2,
  Copy
} from "lucide-react"

// Dynamically import LeafletMap to avoid SSR issues
const LeafletMap = dynamic(() => import('@/app/modules/fuel-saver/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
      <div className="text-center">
        <MapPin className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50 animate-pulse" />
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    </div>
  )
})

// Mock aircraft data
const AIRCRAFT_PROFILES = [
  { 
    name: 'Cessna 172S (2022)', manufacturer: 'Cessna', year: 2022, 
    fuelCapacity: 56, burnRate: 9.9, speed: 122, type: '100LL',
    emptyWeight: 1689, maxWeight: 2550
  },
  { 
    name: 'Cessna 182T (2020)', manufacturer: 'Cessna', year: 2020, 
    fuelCapacity: 92, burnRate: 12.5, speed: 140, type: '100LL',
    emptyWeight: 1710, maxWeight: 3100
  },
  { 
    name: 'Piper Cherokee Six (2020)', manufacturer: 'Piper', year: 2020, 
    fuelCapacity: 84, burnRate: 10.5, speed: 132, type: '100LL',
    emptyWeight: 1530, maxWeight: 2800
  },
  { 
    name: 'Cirrus SR22 (2024)', manufacturer: 'Cirrus', year: 2024, 
    fuelCapacity: 92, burnRate: 12.5, speed: 158, type: '100LL',
    emptyWeight: 3410, maxWeight: 3600
  },
  { 
    name: 'Diamond DA40 (2024)', manufacturer: 'Diamond', year: 2024, 
    fuelCapacity: 58, burnRate: 8.8, speed: 142, type: '100LL',
    emptyWeight: 1660, maxWeight: 2700
  }
]

interface Waypoint {
  id: string
  icao: string
  name: string
  city?: string
  latitude: number
  longitude: number
  sequence: number
  fuelPrice?: number
}

export default function FuelSaverPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])
  const [selectedAircraft, setSelectedAircraft] = useState(AIRCRAFT_PROFILES[0])
  const [activeTab, setActiveTab] = useState('route')
  
  // Map state
  const [airports, setAirports] = useState<any[]>([])
  const [fuelPrices, setFuelPrices] = useState<Record<string, any>>({})
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.8283, -98.5795])
  const [mapZoom, setMapZoom] = useState(4)
  const [mapBounds, setMapBounds] = useState({
    minLat: 25,
    maxLat: 50,
    minLon: -125,
    maxLon: -65
  })
  
  // Flight plan fields
  const [flightPlanName, setFlightPlanName] = useState('')
  const [callsign, setCallsign] = useState('')
  const [aircraftType, setAircraftType] = useState('')
  const [pilotName, setPilotName] = useState('')
  const [departureTime, setDepartureTime] = useState('')
  const [cruisingAlt, setCruisingAlt] = useState(5500)
  const [alternateIcao, setAlternateIcao] = useState('')
  const [remarks, setRemarks] = useState('')
  const [soulsOnBoard, setSoulsOnBoard] = useState(1)
  const [departureFuel, setDepartureFuel] = useState(100)
  
  // Settings
  const [showAllAirports, setShowAllAirports] = useState(false)
  const [showWeather, setShowWeather] = useState(false)
  const [showNotams, setShowNotams] = useState(false)
  const [includeLandingFees, setIncludeLandingFees] = useState(true)
  const [includeFboFees, setIncludeFboFees] = useState(false)
  
  // Fetch airports when bounds change
  const handleBoundsChange = async (bounds: typeof mapBounds) => {
    setMapBounds(bounds)
    try {
      const response = await fetch(`/api/airports/nearby?minLat=${bounds.minLat}&maxLat=${bounds.maxLat}&minLon=${bounds.minLon}&maxLon=${bounds.maxLon}`)
      if (response.ok) {
        const data = await response.json()
        setAirports(data.airports || [])
      }
    } catch (error) {
      console.error('Error fetching airports:', error)
    }
  }
  
  // Handle airport click
  const handleAirportClick = (airport: any) => {
    if (airport.icao) {
      addWaypoint(airport.icao)
    }
  }

  const addWaypoint = async (icao: string) => {
    const upperIcao = icao.toUpperCase()
    
    // Check if waypoint already exists
    if (waypoints.some(w => w.icao === upperIcao)) {
      return
    }
    
    try {
      // Try to fetch airport data
      const response = await fetch(`/api/airports/search?q=${upperIcao}`)
      if (response.ok) {
        const data = await response.json()
        const airport = data.airports?.[0]
        
        if (airport) {
          const newWaypoint: Waypoint = {
            id: Date.now().toString(),
            icao: upperIcao,
            name: airport.name || 'Airport',
            city: airport.city,
            latitude: airport.latitude || 40.0,
            longitude: airport.longitude || -100.0,
            sequence: waypoints.length,
            fuelPrice: airport.fuel?.price100ll
          }
          setWaypoints([...waypoints, newWaypoint])
          return
        }
      }
    } catch (error) {
      console.error('Error fetching airport:', error)
    }
    
    // Fallback if API fails
    const newWaypoint: Waypoint = {
      id: Date.now().toString(),
      icao: upperIcao,
      name: 'Airport',
      latitude: 40.0,
      longitude: -100.0,
      sequence: waypoints.length
    }
    setWaypoints([...waypoints, newWaypoint])
  }

  const removeWaypoint = (id: string) => {
    setWaypoints(waypoints.filter(w => w.id !== id))
  }

  // Fetch initial airports on mount
  useEffect(() => {
    handleBoundsChange(mapBounds)
  }, [])
  
  // Update map center when waypoints change
  useEffect(() => {
    if (waypoints.length > 0) {
      const lastWaypoint = waypoints[waypoints.length - 1]
      setMapCenter([lastWaypoint.latitude, lastWaypoint.longitude])
      setMapZoom(8)
    }
  }, [waypoints])

  const calculateStats = () => {
    if (waypoints.length < 2) return null
    const distance = 250 // Mock
    const time = distance / selectedAircraft.speed
    const fuel = time * selectedAircraft.burnRate * 1.25
    const cost = fuel * 6.50
    return { distance, time, fuel, cost }
  }

  const stats = calculateStats()

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Collapsible Sidebar */}
      <aside 
        className={`bg-card border-r border-border transition-all duration-300 flex flex-col ${
          sidebarOpen ? 'w-[420px]' : 'w-0'
        } overflow-hidden`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Navigation className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Flight Planner</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarOpen(false)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-5 mx-4 my-2 shrink-0">
            <TabsTrigger value="route" className="text-xs">Route</TabsTrigger>
            <TabsTrigger value="plan" className="text-xs">Plan</TabsTrigger>
            <TabsTrigger value="tools" className="text-xs">Tools</TabsTrigger>
            <TabsTrigger value="weather" className="text-xs">Weather</TabsTrigger>
            <TabsTrigger value="saved" className="text-xs">Saved</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            {/* Route Tab */}
            <TabsContent value="route" className="h-full overflow-y-auto p-4 pt-2 space-y-4 mt-0">
              {/* Quick Stats */}
              {stats && (
                <div className="grid grid-cols-2 gap-2">
                  <Card className="border-primary/50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Navigation className="h-3 w-3" />
                        Distance
                      </div>
                      <div className="text-xl font-bold">{stats.distance} NM</div>
                    </CardContent>
                  </Card>
                  <Card className="border-chart-3/50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Clock className="h-3 w-3" />
                        Time
                      </div>
                      <div className="text-xl font-bold">{stats.time.toFixed(1)} hrs</div>
                    </CardContent>
                  </Card>
                  <Card className="border-chart-4/50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Fuel className="h-3 w-3" />
                        Fuel
                      </div>
                      <div className="text-xl font-bold">{stats.fuel.toFixed(1)} gal</div>
                    </CardContent>
                  </Card>
                  <Card className="border-chart-2/50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <DollarSign className="h-3 w-3" />
                        Cost
                      </div>
                      <div className="text-xl font-bold text-primary">${stats.cost.toFixed(0)}</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Add Waypoint */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Add Waypoint</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    const icao = formData.get('icao') as string
                    if (icao) {
                      addWaypoint(icao)
                      e.currentTarget.reset()
                    }
                  }} className="flex gap-2">
                    <Input 
                      name="icao"
                      placeholder="ICAO (KBOS)" 
                      className="flex-1"
                      maxLength={4}
                    />
                    <Button type="submit" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Waypoints List */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">Route Waypoints</CardTitle>
                      <CardDescription className="text-xs">
                        {waypoints.length} waypoint{waypoints.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                    {waypoints.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setWaypoints([])}
                        className="h-7 text-xs"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {waypoints.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No waypoints</p>
                      <p className="text-xs mt-1">Add departure & destination</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {waypoints.map((waypoint, index) => (
                        <div 
                          key={waypoint.id}
                          className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                        >
                          <div className="cursor-move">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{waypoint.icao}</span>
                              {index === 0 && <Badge variant="secondary" className="text-xs h-4">DEP</Badge>}
                              {index === waypoints.length - 1 && <Badge variant="secondary" className="text-xs h-4">ARR</Badge>}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {waypoint.name}
                            </div>
                          </div>
                          {waypoint.fuelPrice && (
                            <div className="text-xs font-medium text-chart-2">
                              ${waypoint.fuelPrice.toFixed(2)}
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => removeWaypoint(waypoint.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Aircraft Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Aircraft</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <select
                    value={selectedAircraft.name}
                    onChange={(e) => setSelectedAircraft(AIRCRAFT_PROFILES.find(a => a.name === e.target.value) || AIRCRAFT_PROFILES[0])}
                    className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm"
                  >
                    {AIRCRAFT_PROFILES.map(ac => (
                      <option key={ac.name} value={ac.name}>{ac.name}</option>
                    ))}
                  </select>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-muted p-2 text-center">
                      <div className="text-lg font-bold">{selectedAircraft.speed}</div>
                      <div className="text-xs text-muted-foreground">kts</div>
                    </div>
                    <div className="rounded-lg bg-muted p-2 text-center">
                      <div className="text-lg font-bold">{selectedAircraft.burnRate}</div>
                      <div className="text-xs text-muted-foreground">gph</div>
                    </div>
                    <div className="rounded-lg bg-muted p-2 text-center">
                      <div className="text-lg font-bold">{selectedAircraft.fuelCapacity}</div>
                      <div className="text-xs text-muted-foreground">gal</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="depFuel" className="text-xs">Departure Fuel (%)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="depFuel"
                        type="number"
                        value={departureFuel}
                        onChange={(e) => setDepartureFuel(Number(e.target.value))}
                        min="0"
                        max="100"
                        className="h-8"
                      />
                      <span className="text-sm text-muted-foreground shrink-0">
                        {((selectedAircraft.fuelCapacity * departureFuel) / 100).toFixed(1)} gal
                      </span>
                    </div>
                    <Progress value={departureFuel} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => alert('Import flight plan - Coming soon!')}
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Import
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => {
                    const data = JSON.stringify({ waypoints, aircraft: selectedAircraft, flightPlan: { name: flightPlanName, callsign, cruisingAlt } }, null, 2)
                    const blob = new Blob([data], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `flight-plan-${Date.now()}.json`
                    a.click()
                  }}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => {
                    localStorage.setItem('fuel-saver-plan', JSON.stringify({ waypoints, aircraft: selectedAircraft, flightPlan: { name: flightPlanName, callsign, cruisingAlt } }))
                    alert('Flight plan saved!')
                  }}
                  disabled={waypoints.length === 0}
                >
                  <Save className="h-3 w-3 mr-1" />
                  Save
                </Button>
              </div>
            </TabsContent>

            {/* Flight Plan Tab */}
            <TabsContent value="plan" className="h-full overflow-y-auto p-4 pt-2 space-y-4 mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Flight Plan Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="planName" className="text-xs">Plan Name</Label>
                    <Input
                      id="planName"
                      value={flightPlanName}
                      onChange={(e) => setFlightPlanName(e.target.value)}
                      placeholder="My Flight Plan"
                      className="h-8"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="callsign" className="text-xs">Callsign</Label>
                      <Input
                        id="callsign"
                        value={callsign}
                        onChange={(e) => setCallsign(e.target.value)}
                        placeholder="N12345"
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="aircraftType" className="text-xs">Aircraft Type</Label>
                      <Input
                        id="aircraftType"
                        value={aircraftType}
                        onChange={(e) => setAircraftType(e.target.value)}
                        placeholder="C172"
                        className="h-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pilotName" className="text-xs">Pilot Name</Label>
                    <Input
                      id="pilotName"
                      value={pilotName}
                      onChange={(e) => setPilotName(e.target.value)}
                      placeholder="John Doe"
                      className="h-8"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="depTime" className="text-xs">Departure Time</Label>
                      <Input
                        id="depTime"
                        type="datetime-local"
                        value={departureTime}
                        onChange={(e) => setDepartureTime(e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cruiseAlt" className="text-xs">Cruising Alt (ft)</Label>
                      <Input
                        id="cruiseAlt"
                        type="number"
                        value={cruisingAlt}
                        onChange={(e) => setCruisingAlt(Number(e.target.value))}
                        step="500"
                        className="h-8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="alternate" className="text-xs">Alternate</Label>
                      <Input
                        id="alternate"
                        value={alternateIcao}
                        onChange={(e) => setAlternateIcao(e.target.value)}
                        placeholder="KBWI"
                        maxLength={4}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="souls" className="text-xs">Souls on Board</Label>
                      <Input
                        id="souls"
                        type="number"
                        value={soulsOnBoard}
                        onChange={(e) => setSoulsOnBoard(Number(e.target.value))}
                        min="1"
                        className="h-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="remarks" className="text-xs">Remarks</Label>
                    <textarea
                      id="remarks"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Additional notes..."
                      className="w-full h-20 rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Cost Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm">Include Landing Fees</span>
                    <input
                      type="checkbox"
                      checked={includeLandingFees}
                      onChange={(e) => setIncludeLandingFees(e.target.checked)}
                      className="h-4 w-4 rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm">Include FBO Fees</span>
                    <input
                      type="checkbox"
                      checked={includeFboFees}
                      onChange={(e) => setIncludeFboFees(e.target.checked)}
                      className="h-4 w-4 rounded"
                    />
                  </label>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tools Tab */}
            <TabsContent value="tools" className="h-full overflow-y-auto p-4 pt-2 space-y-4 mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Trip Finder
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Find destinations, plan stops, or locate cheap fuel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    Trip Finder tools: Plan mode, Find mode, Cheapest fuel
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Performance Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    Weight & Balance, Takeoff/Landing distances
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <RouteIcon className="h-4 w-4" />
                    Range Rings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    Calculate aircraft range from any airport
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Weather Tab */}
            <TabsContent value="weather" className="h-full overflow-y-auto p-4 pt-2 space-y-4 mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CloudRain className="h-4 w-4" />
                    Route Weather
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    size="sm"
                    disabled={waypoints.length < 2}
                    onClick={async () => {
                      const icaos = waypoints.map(w => w.icao).join(',')
                      try {
                        const response = await fetch(`/api/weather/metar?airports=${icaos}`)
                        if (response.ok) {
                          const data = await response.json()
                          alert('Weather data fetched! Check console for details.')
                          console.log('Weather data:', data)
                        } else {
                          alert('Weather data not available')
                        }
                      } catch (error) {
                        alert('Error fetching weather')
                      }
                    }}
                  >
                    Fetch Weather
                  </Button>
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    {waypoints.length < 2 
                      ? 'Add waypoints to fetch weather'
                      : 'Click to get METAR & TAF data'}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    NOTAMs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    size="sm"
                    disabled={waypoints.length === 0}
                    onClick={() => {
                      setShowNotams(!showNotams)
                      alert(showNotams ? 'NOTAMs hidden on map' : 'NOTAMs shown on map')
                    }}
                  >
                    {showNotams ? 'Hide' : 'Show'} NOTAMs
                  </Button>
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    View TFRs, runway closures, and notices
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    State Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    Click any state on the map for info
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Saved Plans Tab */}
            <TabsContent value="saved" className="h-full overflow-y-auto p-4 pt-2 space-y-4 mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    My Flight Plans
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Your saved routes and plans
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Save className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No saved plans</p>
                    <p className="text-xs mt-1">Save your current route to access it later</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Share Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    size="sm"
                    variant="outline"
                    disabled={waypoints.length < 2}
                    onClick={() => {
                      const routeString = waypoints.map(w => w.icao).join('-')
                      const shareUrl = `${window.location.origin}/fuel-saver?route=${routeString}`
                      navigator.clipboard.writeText(shareUrl)
                      alert('Share link copied to clipboard!')
                    }}
                  >
                    <Copy className="h-3 w-3 mr-2" />
                    Copy Share Link
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="border-b border-border bg-card/95 backdrop-blur shrink-0">
          <div className="flex h-14 items-center gap-4 px-4">
            {!sidebarOpen && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Fuel className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-sm font-semibold">Fuel Saver</h1>
                <p className="text-xs text-muted-foreground">Flight Planning & Optimization</p>
              </div>
            </div>

            {stats && (
              <div className="ml-auto flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{stats.distance} NM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{stats.time.toFixed(1)} hrs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Fuel className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{stats.fuel.toFixed(1)} gal</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-primary">${stats.cost.toFixed(0)}</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Map Area */}
        <div className="flex-1 relative bg-muted/30">
          {/* Integrated LeafletMap Component */}
          <LeafletMap 
            waypoints={waypoints}
            airports={airports}
            fuelPrices={fuelPrices}
            mapCenter={mapCenter}
            mapZoom={mapZoom}
            onBoundsChange={handleBoundsChange}
            onAirportClick={handleAirportClick}
            showNotams={showNotams}
            showTfrs={showNotams}
            showStateOverlay={showAllAirports}
          />

          {/* Getting Started Hint */}
          {waypoints.length === 0 && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <Card className="shadow-2xl border-primary/50">
                <CardContent className="flex items-center gap-3 p-4">
                  <AlertTriangle className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">Start Planning Your Flight</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Add departure and destination in the sidebar or click airports on the map
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
