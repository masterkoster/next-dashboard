'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Plane,
  MapPin,
  Fuel,
  Clock,
  Navigation,
  Cloud,
  Calculator,
  Save,
  FolderOpen,
  Download,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Search,
  Settings,
  Loader2,
  Route,
  Wind,
  Gauge,
  Users,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Maximize2,
  GripVertical
} from "lucide-react"

// Dynamic imports for Leaflet components (no SSR)
const LeafletMap = dynamic(() => import('./LeafletMap'), { ssr: false })
const ExportDropdown = dynamic(() => import('./components/ExportDropdown'), { ssr: false })

// Types
export interface Airport {
  icao: string
  iata?: string
  name: string
  city?: string
  country?: string
  latitude: number
  longitude: number
  type?: string
  elevation_ft?: number
}

interface Waypoint {
  id: string
  icao: string
  name: string
  city?: string
  state?: string
  latitude: number
  longitude: number
  altitude?: number
  sequence: number
  type?: string
}

interface FuelPrice {
  icao: string
  price100ll: number | null
  priceJetA: number | null
  lastUpdated: string
  source?: string
}

// Aircraft profiles
const AIRCRAFT_PROFILES = [
  { 
    name: 'Cessna 172S', manufacturer: 'Cessna', year: 2022, 
    fuelCapacity: 56, burnRate: 9.9, speed: 122, type: '100LL',
    emptyWeight: 1689, emptyCG: 39.1, maxWeight: 2550,
    arms: { frontSeats: 37.0, rearSeats: 73.0, baggage1: 95.0, baggage2: 123.0, fuel: 48.0 },
    cgLimits: { forward: 35.0, aft: 47.3 }
  },
  { 
    name: 'Cessna 182T', manufacturer: 'Cessna', year: 2020, 
    fuelCapacity: 92, burnRate: 12.5, speed: 140, type: '100LL',
    emptyWeight: 1710, emptyCG: 39.0, maxWeight: 3100,
    arms: { frontSeats: 37.0, rearSeats: 73.0, baggage1: 95.0, baggage2: 123.0, fuel: 48.0 },
    cgLimits: { forward: 35.0, aft: 47.3 }
  },
  { 
    name: 'Piper Cherokee', manufacturer: 'Piper', year: 2020, 
    fuelCapacity: 84, burnRate: 10.5, speed: 132, type: '100LL',
    emptyWeight: 1530, emptyCG: 35.5, maxWeight: 2800,
    arms: { frontSeats: 32.5, rearSeats: 75.0, baggage1: 95.0, baggage2: 123.0, fuel: 47.0 },
    cgLimits: { forward: 31.0, aft: 47.3 }
  },
  { 
    name: 'Diamond DA40', manufacturer: 'Diamond', year: 2024, 
    fuelCapacity: 58, burnRate: 8.8, speed: 142, type: '100LL',
    emptyWeight: 1660, emptyCG: 93.0, maxWeight: 2700,
    arms: { frontSeats: 85.0, rearSeats: 85.0, baggage1: 90.0, fuel: 90.0 },
    cgLimits: { forward: 82.0, aft: 96.0 }
  },
  { 
    name: 'Cirrus SR22', manufacturer: 'Cirrus', year: 2024, 
    fuelCapacity: 92, burnRate: 12.5, speed: 158, type: '100LL',
    emptyWeight: 3410, emptyCG: 35.0, maxWeight: 3600,
    arms: { frontSeats: 35.0, rearSeats: 66.0, baggage1: 86.0, baggage2: 86.0, fuel: 48.0 },
    cgLimits: { forward: 33.0, aft: 47.3 }
  },
  { 
    name: 'Beechcraft Bonanza A36', manufacturer: 'Beechcraft', year: 2024, 
    fuelCapacity: 102, burnRate: 13.5, speed: 158, type: '100LL',
    emptyWeight: 2560, emptyCG: 82.0, maxWeight: 3600,
    arms: { frontSeats: 82.5, rearSeats: 95.0, baggage1: 122.0, fuel: 95.0 },
    cgLimits: { forward: 77.0, aft: 93.0 }
  },
]

// Demo airports
const DEMO_AIRPORTS: Airport[] = [
  { icao: 'KORD', iata: 'ORD', name: "Chicago O'Hare International", city: 'Chicago', latitude: 41.9742, longitude: -87.9073, type: 'large_airport' },
  { icao: 'KLAX', iata: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', latitude: 33.9425, longitude: -118.4081, type: 'large_airport' },
  { icao: 'KJFK', iata: 'JFK', name: 'John F. Kennedy International', city: 'New York', latitude: 40.6413, longitude: -73.7781, type: 'large_airport' },
  { icao: 'KSFO', iata: 'SFO', name: 'San Francisco International', city: 'San Francisco', latitude: 37.6213, longitude: -122.379, type: 'large_airport' },
  { icao: 'KDEN', iata: 'DEN', name: 'Denver International', city: 'Denver', latitude: 39.8561, longitude: -104.6737, type: 'large_airport' },
  { icao: 'KDFW', iata: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas', latitude: 32.8998, longitude: -97.0403, type: 'large_airport' },
  { icao: 'KLAS', iata: 'LAS', name: 'Harry Reid International', city: 'Las Vegas', latitude: 36.084, longitude: -115.1537, type: 'large_airport' },
  { icao: 'KMIA', iata: 'MIA', name: 'Miami International', city: 'Miami', latitude: 25.7959, longitude: -80.287, type: 'large_airport' },
]

// Calculate distance (NM)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3440.065
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Calculate bearing
function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = (lon2 - lon1) * Math.PI / 180
  const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180)
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
    Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon)
  return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360
}

export default function FuelSaverPage() {
  const { data: session, status } = useSession()
  
  // Core state
  const [activeTab, setActiveTab] = useState<'plan' | 'route' | 'weather' | 'wb' | 'tools'>('plan')
  const [loading, setLoading] = useState(false)
  
  // Map state
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.8283, -98.5795])
  const [mapZoom, setMapZoom] = useState(5)
  const [mapBounds, setMapBounds] = useState({ minLat: 25, maxLat: 50, minLon: -130, maxLon: -65 })
  const [airports, setAirports] = useState<Airport[]>(DEMO_AIRPORTS)
  const [showPanel, setShowPanel] = useState(true)
  
  // Flight plan state
  const [flightPlanName, setFlightPlanName] = useState('')
  const [callsign, setCallsign] = useState('')
  const [pilotName, setPilotName] = useState('')
  const [departureTime, setDepartureTime] = useState('')
  const [cruisingAlt, setCruisingAlt] = useState(5500)
  const [alternateIcao, setAlternateIcao] = useState('')
  const [remarks, setRemarks] = useState('')
  const [soulsOnBoard, setSoulsOnBoard] = useState(1)
  const [departureFuel, setDepartureFuel] = useState(100)
  
  // Route state
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])
  const [selectedAircraft, setSelectedAircraft] = useState(AIRCRAFT_PROFILES[0])
  const [fuelPrices, setFuelPrices] = useState<Record<string, FuelPrice>>({})
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Airport[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  
  // Saved plans
  const [savedPlans, setSavedPlans] = useState<any[]>([])
  const [showSavedPlans, setShowSavedPlans] = useState(false)
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null)
  
  // W&B state
  const [wbFrontPax, setWbFrontPax] = useState(170)
  const [wbRearPax, setWbRearPax] = useState(170)
  const [wbBaggage, setWbBaggage] = useState(0)
  const [wbFuel, setWbFuel] = useState(40)
  
  // E6B state
  const [e6bHeading, setE6bHeading] = useState(360)
  const [e6bWindSpeed, setE6bWindSpeed] = useState(15)
  const [e6bWindDir, setE6bWindDir] = useState(270)
  const [e6bTAS, setE6bTAS] = useState(120)
  
  // User tier
  const userTier = (session?.user as any)?.tier || 'free'
  const isPro = userTier === 'pro' || (session?.user as any)?.role === 'owner'
  const isDemo = !session?.user?.id
  
  // Calculate route stats
  const routeStats = waypoints.length >= 2 ? (() => {
    let totalDistance = 0
    const legs: { from: string; to: string; distance: number; bearing: number }[] = []
    
    for (let i = 0; i < waypoints.length - 1; i++) {
      const from = waypoints[i]
      const to = waypoints[i + 1]
      const distance = calculateDistance(from.latitude, from.longitude, to.latitude, to.longitude)
      const bearing = calculateBearing(from.latitude, from.longitude, to.latitude, to.longitude)
      totalDistance += distance
      legs.push({ from: from.icao, to: to.icao, distance, bearing })
    }
    
    const flightTime = totalDistance / selectedAircraft.speed
    const fuelRequired = flightTime * selectedAircraft.burnRate
    const fuelAvailable = (selectedAircraft.fuelCapacity * departureFuel / 100)
    const reserve = fuelAvailable - fuelRequired
    
    return {
      totalDistance: Math.round(totalDistance),
      flightTime,
      fuelRequired: Math.round(fuelRequired * 10) / 10,
      fuelAvailable: Math.round(fuelAvailable * 10) / 10,
      reserve: Math.round(reserve * 10) / 10,
      legs
    }
  })() : null

  // Search airports
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    if (query.length >= 2) {
      const q = query.toUpperCase()
      const results = [...DEMO_AIRPORTS, ...airports].filter(a =>
        a.icao.includes(q) || a.iata?.includes(q) || 
        a.name.toUpperCase().includes(q) || a.city?.toUpperCase().includes(q)
      )
      // Dedupe
      const seen = new Set<string>()
      const unique = results.filter(a => {
        if (seen.has(a.icao)) return false
        seen.add(a.icao)
        return true
      })
      setSearchResults(unique.slice(0, 8))
      setShowSearchResults(true)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }, [airports])

  // Add waypoint
  const addWaypoint = (airport: Airport) => {
    if (waypoints.find(w => w.icao === airport.icao)) {
      return // Already in route
    }
    
    const wp: Waypoint = {
      id: crypto.randomUUID(),
      icao: airport.icao,
      name: airport.name,
      city: airport.city,
      latitude: airport.latitude,
      longitude: airport.longitude,
      sequence: waypoints.length,
      type: airport.type
    }
    
    setWaypoints([...waypoints, wp])
    setMapCenter([airport.latitude, airport.longitude])
    setMapZoom(8)
    setSearchQuery('')
    setShowSearchResults(false)
  }

  // Remove waypoint
  const removeWaypoint = (id: string) => {
    setWaypoints(waypoints.filter(w => w.id !== id).map((w, i) => ({ ...w, sequence: i })))
  }

  // Move waypoint
  const moveWaypoint = (id: string, direction: 'up' | 'down') => {
    const index = waypoints.findIndex(w => w.id === id)
    if (index < 0) return
    
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= waypoints.length) return
    
    const newWaypoints = [...waypoints]
    ;[newWaypoints[index], newWaypoints[newIndex]] = [newWaypoints[newIndex], newWaypoints[index]]
    setWaypoints(newWaypoints.map((w, i) => ({ ...w, sequence: i })))
  }

  // Clear route
  const clearRoute = () => {
    setWaypoints([])
    setFlightPlanName('')
    setCallsign('')
    setPilotName('')
    setCurrentPlanId(null)
  }

  // Save flight plan
  const saveFlightPlan = async () => {
    if (waypoints.length < 2) return
    
    const plan = {
      name: flightPlanName || `${waypoints[0].icao} to ${waypoints[waypoints.length - 1].icao}`,
      callsign,
      pilotName,
      aircraftType: selectedAircraft.name,
      departureTime,
      cruisingAlt,
      alternateIcao,
      remarks,
      soulsOnBoard,
      departureFuel,
      departureIcao: waypoints[0].icao,
      arrivalIcao: waypoints[waypoints.length - 1].icao,
      waypoints: waypoints.map(w => ({
        icao: w.icao,
        name: w.name,
        city: w.city,
        latitude: w.latitude,
        longitude: w.longitude,
        sequence: w.sequence
      }))
    }
    
    if (status === 'authenticated') {
      try {
        const method = currentPlanId ? 'PUT' : 'POST'
        const url = currentPlanId ? `/api/flight-plans?id=${currentPlanId}` : '/api/flight-plans'
        
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(plan)
        })
        
        if (res.ok) {
          const data = await res.json()
          if (currentPlanId) {
            setSavedPlans(prev => prev.map(p => p.id === currentPlanId ? data.flightPlan : p))
          } else {
            setSavedPlans(prev => [data.flightPlan, ...prev])
            setCurrentPlanId(data.flightPlan.id)
          }
        }
      } catch (e) {
        console.error('Error saving:', e)
      }
    } else {
      // Save to localStorage
      const localPlans = JSON.parse(localStorage.getItem('savedFlightPlans') || '[]')
      const newPlan = { ...plan, id: Date.now().toString(), createdAt: new Date().toISOString() }
      localStorage.setItem('savedFlightPlans', JSON.stringify([newPlan, ...localPlans]))
      setSavedPlans(prev => [newPlan, ...prev])
    }
  }

  // Load flight plan
  const loadFlightPlan = (plan: any) => {
    setFlightPlanName(plan.name || '')
    setCallsign(plan.callsign || '')
    setPilotName(plan.pilotName || '')
    setDepartureTime(plan.departureTime || '')
    setCruisingAlt(plan.cruisingAlt || 5500)
    setAlternateIcao(plan.alternateIcao || '')
    setRemarks(plan.remarks || '')
    setSoulsOnBoard(plan.soulsOnBoard || 1)
    setDepartureFuel(plan.departureFuel || 100)
    setCurrentPlanId(plan.id || null)
    
    if (plan.aircraftType) {
      const ac = AIRCRAFT_PROFILES.find(p => p.name === plan.aircraftType)
      if (ac) setSelectedAircraft(ac)
    }
    
    if (plan.waypoints?.length > 0) {
      const loadedWaypoints = plan.waypoints.map((w: any, i: number) => ({
        id: crypto.randomUUID(),
        icao: w.icao,
        name: w.name || w.icao,
        city: w.city,
        latitude: w.latitude,
        longitude: w.longitude,
        sequence: i
      }))
      setWaypoints(loadedWaypoints)
      setMapCenter([loadedWaypoints[0].latitude, loadedWaypoints[0].longitude])
      setMapZoom(6)
    }
    
    setShowSavedPlans(false)
  }

  // Load saved plans on mount
  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/flight-plans')
        .then(res => res.json())
        .then(data => {
          if (data.flightPlans) {
            setSavedPlans(data.flightPlans)
          }
        })
        .catch(console.error)
    } else {
      const localPlans = JSON.parse(localStorage.getItem('savedFlightPlans') || '[]')
      setSavedPlans(localPlans)
    }
  }, [status])

  // Calculate W&B
  const wbCalculation = (() => {
    const ac = selectedAircraft
    const fuelWeight = wbFuel * 6
    const totalWeight = ac.emptyWeight + wbFrontPax + wbRearPax + wbBaggage + fuelWeight
    const emptyMoment = ac.emptyWeight * ac.emptyCG
    const frontMoment = wbFrontPax * (ac.arms?.frontSeats || 37)
    const rearMoment = wbRearPax * (ac.arms?.rearSeats || 73)
    const bagMoment = wbBaggage * (ac.arms?.baggage1 || 95)
    const fuelMoment = fuelWeight * (ac.arms?.fuel || 48)
    const totalMoment = emptyMoment + frontMoment + rearMoment + bagMoment + fuelMoment
    const cg = totalMoment / totalWeight
    const isOverweight = totalWeight > ac.maxWeight
    const cgInLimits = cg >= (ac.cgLimits?.forward || 35) && cg <= (ac.cgLimits?.aft || 47.3)
    
    return { totalWeight, cg, isOverweight, cgInLimits, maxWeight: ac.maxWeight }
  })()

  // Calculate E6B
  const e6bResult = (() => {
    const headingRad = (e6bHeading * Math.PI) / 180
    const windRad = (e6bWindDir * Math.PI) / 180
    const windFrom = windRad + Math.PI
    const wx = e6bWindSpeed * Math.cos(windFrom)
    const wy = e6bWindSpeed * Math.sin(windFrom)
    const gsx = e6bTAS * Math.cos(headingRad) - wx
    const gsy = e6bTAS * Math.sin(headingRad) - wy
    const groundSpeed = Math.sqrt(gsx * gsx + gsy * gsy)
    const track = ((Math.atan2(gsy, gsx) * 180) / Math.PI + 360) % 360
    const windCorrection = track - e6bHeading
    
    return { groundSpeed: Math.round(groundSpeed), windCorrection: Math.round(windCorrection), track: Math.round(track) }
  })()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-[1800px] p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">Flight Planner</h1>
              <p className="text-muted-foreground text-sm mt-1">Plan routes, find fuel, calculate performance</p>
            </div>
            <div className="flex items-center gap-2 lg:gap-3">
              {isDemo && (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                  Demo Mode
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowSavedPlans(true)}>
                <FolderOpen className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Load</span>
              </Button>
              <Button size="sm" onClick={saveFlightPlan} disabled={waypoints.length < 2}>
                <Save className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Save</span>
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-1 border-b border-border overflow-x-auto">
            {([
              { id: 'plan', label: 'Plan', icon: Plane },
              { id: 'route', label: 'Route', icon: Route },
              { id: 'weather', label: 'Weather', icon: Cloud },
              { id: 'wb', label: 'W&B', icon: Gauge },
              { id: 'tools', label: 'Tools', icon: Calculator },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1800px]">
        <div className="flex flex-col lg:flex-row">
          {/* Left Panel */}
          <div className={`w-full lg:w-[380px] border-r border-border bg-card p-4 space-y-4 ${showPanel ? '' : 'hidden lg:hidden'}`}>
            
            {activeTab === 'plan' && (
              <div className="space-y-3">
                {/* Search */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Add Airport
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && searchResults[0] && addWaypoint(searchResults[0])}
                        placeholder="Search ICAO, name, or city..."
                        className="uppercase"
                      />
                      <Button 
                        size="sm"
                        onClick={() => searchResults[0] && addWaypoint(searchResults[0])}
                        disabled={!searchResults[0]}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {showSearchResults && searchResults.length > 0 && (
                      <div className="border border-border rounded-lg overflow-hidden">
                        {searchResults.map((airport) => (
                          <button
                            key={airport.icao}
                            onClick={() => addWaypoint(airport)}
                            className="w-full text-left px-3 py-2 hover:bg-muted transition-colors border-b border-border last:border-0"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{airport.icao}</span>
                              <Badge variant="outline" className="text-xs">
                                {airport.type?.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{airport.name}</p>
                          </button>
                        ))}
                      </div>
                    )}
                    </CardContent>
                </Card>

                {/* Aircraft Selector */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Plane className="h-4 w-4" />
                      Aircraft
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <select
                      value={selectedAircraft.name}
                      onChange={(e) => {
                        const ac = AIRCRAFT_PROFILES.find(p => p.name === e.target.value)
                        if (ac) setSelectedAircraft(ac)
                      }}
                      className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm"
                    >
                      {[...new Set(AIRCRAFT_PROFILES.map(p => p.manufacturer))].map(mfr => (
                        <optgroup key={mfr} label={mfr}>
                          {AIRCRAFT_PROFILES.filter(p => p.manufacturer === mfr).map(p => (
                            <option key={p.name} value={p.name}>{p.name}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                      <div className="p-2 bg-muted rounded">
                        <p className="text-xs text-muted-foreground">Capacity</p>
                        <p className="font-semibold text-sm">{selectedAircraft.fuelCapacity} gal</p>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <p className="text-xs text-muted-foreground">Burn</p>
                        <p className="font-semibold text-sm">{selectedAircraft.burnRate} gph</p>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <p className="text-xs text-muted-foreground">Speed</p>
                        <p className="font-semibold text-sm">{selectedAircraft.speed} kts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Import Flight Plan */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Import Flight Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs">Import from GPX, FPL, or JSON</Label>
                      <Input
                        type="file"
                        accept=".gpx,.fpl,.json,.txt"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          
                          try {
                            const text = await file.text()
                            let importedWaypoints: Waypoint[] = []
                            
                            if (file.name.endsWith('.gpx')) {
                              // Parse GPX
                              const parser = new DOMParser()
                              const doc = parser.parseFromString(text, 'text/xml')
                              const wpts = doc.querySelectorAll('wpt')
                              
                              wpts.forEach((wpt, i) => {
                                const lat = parseFloat(wpt.getAttribute('lat') || '0')
                                const lon = parseFloat(wpt.getAttribute('lon') || '0')
                                const name = wpt.querySelector('name')?.textContent || `WPT${i + 1}`
                                
                                importedWaypoints.push({
                                  id: crypto.randomUUID(),
                                  icao: name.substring(0, 4).toUpperCase(),
                                  name,
                                  latitude: lat,
                                  longitude: lon,
                                  sequence: i
                                })
                              })
                            } else if (file.name.endsWith('.json')) {
                              // Parse JSON
                              const data = JSON.parse(text)
                              const route = data.route || data.plan?.route || []
                              
                              route.forEach((wp: any, i: number) => {
                                importedWaypoints.push({
                                  id: crypto.randomUUID(),
                                  icao: wp.id?.substring(0, 4).toUpperCase() || wp.icao?.substring(0, 4).toUpperCase() || 'WPT',
                                  name: wp.name || wp.id || `WPT${i + 1}`,
                                  latitude: wp.lat || wp.latitude,
                                  longitude: wp.lon || wp.longitude,
                                  sequence: i
                                })
                              })
                            } else {
                              // Parse FPL (simple line-by-line)
                              const lines = text.split('\n')
                              let seq = 0
                              for (const line of lines) {
                                const match = line.match(/([A-Z]{4,5})/g)
                                if (match) {
                                  for (const wpId of match) {
                                    const airport = DEMO_AIRPORTS.find(a => a.icao === wpId)
                                    if (airport) {
                                      importedWaypoints.push({
                                        id: crypto.randomUUID(),
                                        icao: airport.icao,
                                        name: airport.name,
                                        city: airport.city,
                                        latitude: airport.latitude,
                                        longitude: airport.longitude,
                                        sequence: seq++
                                      })
                                    }
                                  }
                                }
                              }
                            }
                            
                            if (importedWaypoints.length > 0) {
                              setWaypoints(importedWaypoints)
                              setMapCenter([importedWaypoints[0].latitude, importedWaypoints[0].longitude])
                              setMapZoom(6)
                              setActiveTab('route')
                            } else {
                              alert('No waypoints found in file')
                            }
                          } catch (err) {
                            console.error('Import error:', err)
                            alert('Failed to parse file')
                          }
                        }}
                        className="mt-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Import from ForeFlight, Garmin Pilot, flightplandatabase.com, etc.
                    </p>
                  </CardContent>
                </Card>

                {/* Flight Details */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Flight Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label htmlFor="planName" className="text-xs">Plan Name</Label>
                      <Input
                        id="planName"
                        value={flightPlanName}
                        onChange={(e) => setFlightPlanName(e.target.value)}
                        placeholder="My Cross Country"
                        className="mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="callsign" className="text-xs">Callsign</Label>
                        <Input
                          id="callsign"
                          value={callsign}
                          onChange={(e) => setCallsign(e.target.value)}
                          placeholder="N12345"
                          className="mt-1 uppercase"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pilot" className="text-xs">Pilot</Label>
                        <Input
                          id="pilot"
                          value={pilotName}
                          onChange={(e) => setPilotName(e.target.value)}
                          placeholder="John Doe"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="alt" className="text-xs">Cruise Alt (ft)</Label>
                        <Input
                          id="alt"
                          type="number"
                          value={cruisingAlt}
                          onChange={(e) => setCruisingAlt(parseInt(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="souls" className="text-xs">Souls on Board</Label>
                        <Input
                          id="souls"
                          type="number"
                          min="1"
                          value={soulsOnBoard}
                          onChange={(e) => setSoulsOnBoard(parseInt(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="departure" className="text-xs">Departure Time</Label>
                      <Input
                        id="departure"
                        type="datetime-local"
                        value={departureTime}
                        onChange={(e) => setDepartureTime(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="alternate" className="text-xs">Alternate Airport</Label>
                      <Input
                        id="alternate"
                        value={alternateIcao}
                        onChange={(e) => setAlternateIcao(e.target.value.toUpperCase())}
                        placeholder="KABC"
                        className="mt-1 uppercase"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Departure Fuel: {departureFuel}%</Label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={departureFuel}
                        onChange={(e) => setDepartureFuel(parseInt(e.target.value))}
                        className="w-full mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Aircraft Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Plane className="h-4 w-4" />
                      {selectedAircraft.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Capacity</p>
                        <p className="font-semibold">{selectedAircraft.fuelCapacity} gal</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Burn Rate</p>
                        <p className="font-semibold">{selectedAircraft.burnRate} gph</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Speed</p>
                        <p className="font-semibold">{selectedAircraft.speed} kts</p>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Max Range @ {departureFuel}% Fuel</p>
                      <p className="text-lg font-bold text-primary">
                        {Math.round((selectedAircraft.fuelCapacity * departureFuel / 100 / selectedAircraft.burnRate) * selectedAircraft.speed)} NM
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'route' && (
              <div className="space-y-4">
                {/* Route Summary */}
                {routeStats && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Route Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground">Distance</p>
                          <p className="text-xl font-bold">{routeStats.totalDistance} NM</p>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground">Flight Time</p>
                          <p className="text-xl font-bold">{Math.floor(routeStats.flightTime)}h {Math.round((routeStats.flightTime % 1) * 60)}m</p>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground">Fuel Required</p>
                          <p className="text-xl font-bold">{routeStats.fuelRequired} gal</p>
                        </div>
                        <div className={`text-center p-3 rounded-lg ${routeStats.reserve < 0 ? 'bg-destructive/10' : 'bg-green-500/10'}`}>
                          <p className="text-xs text-muted-foreground">Reserve</p>
                          <p className={`text-xl font-bold ${routeStats.reserve < 0 ? 'text-destructive' : 'text-green-600'}`}>
                            {routeStats.reserve} gal
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Waypoints List */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Waypoints ({waypoints.length})</CardTitle>
                      {waypoints.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearRoute}>
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Clear
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {waypoints.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No waypoints added</p>
                        <p className="text-xs">Search for airports to add them to your route</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {waypoints.map((wp, index) => (
                          <div key={wp.id} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                            <div className="flex flex-col gap-0.5">
                              <button
                                onClick={() => moveWaypoint(wp.id, 'up')}
                                disabled={index === 0}
                                className="p-0.5 hover:bg-background rounded disabled:opacity-30"
                              >
                                <ChevronUp className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => moveWaypoint(wp.id, 'down')}
                                disabled={index === waypoints.length - 1}
                                className="p-0.5 hover:bg-background rounded disabled:opacity-30"
                              >
                                <ChevronDown className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Badge variant={index === 0 ? 'default' : index === waypoints.length - 1 ? 'secondary' : 'outline'}>
                                  {wp.icao}
                                </Badge>
                                {index < waypoints.length - 1 && routeStats?.legs[index] && (
                                  <span className="text-xs text-muted-foreground">
                                    → {Math.round(routeStats.legs[index].distance)} NM / {Math.round(routeStats.legs[index].bearing)}°
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{wp.name}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeWaypoint(wp.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'weather' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Cloud className="h-4 w-4" />
                      Route Weather
                    </CardTitle>
                    <CardDescription>Weather along your planned route</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {waypoints.length < 2 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Cloud className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Add waypoints to see weather</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {waypoints.map((wp) => (
                          <div key={wp.id} className="p-3 bg-muted rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <Badge>{wp.icao}</Badge>
                              <span className="text-xs text-muted-foreground">Loading...</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="text-center">
                                <Wind className="h-4 w-4 mx-auto text-muted-foreground" />
                                <p>-- kts</p>
                              </div>
                              <div className="text-center">
                                <Cloud className="h-4 w-4 mx-auto text-muted-foreground" />
                                <p>--</p>
                              </div>
                              <div className="text-center">
                                <Gauge className="h-4 w-4 mx-auto text-muted-foreground" />
                                <p>--°F</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'wb' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Gauge className="h-4 w-4" />
                      Weight & Balance
                    </CardTitle>
                    <CardDescription>{selectedAircraft.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Front Seats (lbs)</Label>
                        <Input
                          type="number"
                          value={wbFrontPax}
                          onChange={(e) => setWbFrontPax(Number(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Rear Seats (lbs)</Label>
                        <Input
                          type="number"
                          value={wbRearPax}
                          onChange={(e) => setWbRearPax(Number(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Baggage (lbs)</Label>
                        <Input
                          type="number"
                          value={wbBaggage}
                          onChange={(e) => setWbBaggage(Number(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Fuel (gal)</Label>
                        <Input
                          type="number"
                          value={wbFuel}
                          onChange={(e) => setWbFuel(Number(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Weight</span>
                        <span className={`font-bold ${wbCalculation.isOverweight ? 'text-destructive' : ''}`}>
                          {wbCalculation.totalWeight} lbs
                        </span>
                      </div>
                      <Progress 
                        value={(wbCalculation.totalWeight / wbCalculation.maxWeight) * 100} 
                        className={wbCalculation.isOverweight ? 'bg-destructive/20' : ''}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Max: {wbCalculation.maxWeight} lbs</span>
                        <span>{wbCalculation.isOverweight ? 'OVERWEIGHT' : `${Math.round((wbCalculation.totalWeight / wbCalculation.maxWeight) * 100)}%`}</span>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm">Center of Gravity</span>
                        <span className={`font-bold ${!wbCalculation.cgInLimits ? 'text-destructive' : 'text-green-600'}`}>
                          {wbCalculation.cg.toFixed(1)} in
                        </span>
                      </div>
                      <div className={`p-3 rounded-lg text-center ${wbCalculation.cgInLimits && !wbCalculation.isOverweight ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
                        {wbCalculation.cgInLimits && !wbCalculation.isOverweight ? (
                          <div className="flex items-center justify-center gap-2 text-green-600">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="font-medium">Within Limits</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            <span className="font-medium">Out of Limits</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'tools' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      E6B Wind Calculator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Heading (°)</Label>
                        <Input
                          type="number"
                          value={e6bHeading}
                          onChange={(e) => setE6bHeading(Number(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">TAS (kts)</Label>
                        <Input
                          type="number"
                          value={e6bTAS}
                          onChange={(e) => setE6bTAS(Number(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Wind Dir (°)</Label>
                        <Input
                          type="number"
                          value={e6bWindDir}
                          onChange={(e) => setE6bWindDir(Number(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Wind Speed (kts)</Label>
                        <Input
                          type="number"
                          value={e6bWindSpeed}
                          onChange={(e) => setE6bWindSpeed(Number(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">Ground Speed</p>
                        <p className="text-xl font-bold text-primary">{e6bResult.groundSpeed} kts</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">WCA</p>
                        <p className="text-xl font-bold">{e6bResult.windCorrection > 0 ? '+' : ''}{e6bResult.windCorrection}°</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">Track</p>
                        <p className="text-xl font-bold">{e6bResult.track}°</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Map Area */}
          <div className="flex-1 h-[calc(100vh-180px)] relative">
            {/* Stats Bar */}
            {routeStats && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-card/95 backdrop-blur border border-border rounded-lg px-4 py-2 flex items-center gap-6 shadow-lg">
                <div className="flex items-center gap-2">
                  <Route className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{routeStats.totalDistance} NM</span>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="font-semibold">{Math.floor(routeStats.flightTime)}h {Math.round((routeStats.flightTime % 1) * 60)}m</span>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-2">
                  <Fuel className="h-4 w-4 text-amber-500" />
                  <span className="font-semibold">{routeStats.fuelRequired} gal</span>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className={`flex items-center gap-2 ${routeStats.reserve < 0 ? 'text-destructive' : 'text-green-600'}`}>
                  {routeStats.reserve >= 0 ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  <span className="font-semibold">{routeStats.reserve >= 0 ? '+' : ''}{routeStats.reserve} gal reserve</span>
                </div>
              </div>
            )}
            
            {/* Toggle Panel Button */}
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 left-4 z-10"
              onClick={() => setShowPanel(!showPanel)}
            >
              {showPanel ? '← Hide Panel' : '→ Show Panel'}
            </Button>

            {/* Map */}
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }>
              <LeafletMap
                airports={airports}
                waypoints={waypoints}
                fuelPrices={fuelPrices}
                mapCenter={mapCenter}
                mapZoom={mapZoom}
                onBoundsChange={(bounds: any) => setMapBounds(bounds)}
                onAirportClick={(airport: Airport) => addWaypoint(airport)}
              />
            </Suspense>
          </div>
        </div>
      </main>

      {/* Saved Plans Dialog */}
      <Dialog open={showSavedPlans} onOpenChange={setShowSavedPlans}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Saved Flight Plans</DialogTitle>
            <DialogDescription>Load a previously saved flight plan</DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {savedPlans.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No saved flight plans</p>
              </div>
            ) : (
              savedPlans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => loadFlightPlan(plan)}
                  className="w-full text-left p-3 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{plan.name || 'Untitled'}</span>
                    <Badge variant="outline">
                      {plan.waypoints?.length || 0} waypoints
                    </Badge>
                  </div>
                  {plan.departureIcao && plan.arrivalIcao && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {plan.departureIcao} → {plan.arrivalIcao}
                    </p>
                  )}
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
