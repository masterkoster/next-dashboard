'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plane, Clock, User, MapPin, Fuel, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"

interface ActiveFlight {
  id: string
  aircraftId: string
  aircraftName: string
  userId: string
  userName: string
  date: string
  scheduledDeparture: string
  scheduledArrival: string
  route?: string
  hobbsStart?: number
  status: 'scheduled' | 'in-progress' | 'completed'
}

export default function ActiveFlightsPage() {
  const [flights, setFlights] = useState<ActiveFlight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get today's date
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    async function fetchFlights() {
      setLoading(true)
      try {
        // Fetch from bookings API
        const res = await fetch('/api/bookings')
        const data = await res.json()
        
        if (data.bookings) {
          // Transform and filter for active flights (today and future)
          const activeFlights: ActiveFlight[] = data.bookings
            .filter((b: any) => {
              const bookingDate = b.date || b.startTime?.split('T')[0]
              return bookingDate >= today // Today or future
            })
            .map((b: any) => ({
              id: b.id,
              aircraftId: b.aircraftId || '',
              aircraftName: b.aircraftName || b.aircraft || 'Unknown',
              userId: b.userId || '',
              userName: b.userName || b.pilot || 'Unknown Pilot',
              date: b.date || b.startTime?.split('T')[0] || today,
              scheduledDeparture: b.startTime ? new Date(b.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : b.time?.split(' - ')[0] || 'TBD',
              scheduledArrival: b.endTime ? new Date(b.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : b.time?.split(' - ')[1] || 'TBD',
              route: b.purpose || b.route || 'Local',
              hobbsStart: b.hobbsStart || 0,
              status: b.status === 'completed' ? 'completed' : b.date === today ? 'in-progress' : 'scheduled'
            }))
          setFlights(activeFlights)
        } else {
          setFlights([])
        }
      } catch (err) {
        console.error('Failed to fetch flights:', err)
        setError('Failed to load flights')
      } finally {
        setLoading(false)
      }
    }
    fetchFlights()
  }, [today])

  // Group flights by status
  const inProgressFlights = flights.filter(f => f.status === 'in-progress')
  const scheduledFlights = flights.filter(f => f.status === 'scheduled')
  const completedFlights = flights.filter(f => f.status === 'completed')

  return (
    <div className="min-h-screen bg-background pt-[44px]">
      <main className="mx-auto max-w-6xl p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Active Flights</h1>
          <p className="text-muted-foreground">All scheduled, in-progress, and completed flights</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {error && (
          <Card className="border-destructive">
            <CardContent className="py-4">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && (
          <div className="space-y-6">
            {/* In Progress */}
            {inProgressFlights.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
                  <Plane className="h-5 w-5 text-emerald-500" />
                  In Progress
                  <Badge variant="default" className="bg-emerald-500">{inProgressFlights.length}</Badge>
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {inProgressFlights.map(flight => (
                    <FlightCard key={flight.id} flight={flight} />
                  ))}
                </div>
              </div>
            )}

            {/* Scheduled */}
            {scheduledFlights.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Scheduled
                  <Badge variant="outline">{scheduledFlights.length}</Badge>
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {scheduledFlights.map(flight => (
                    <FlightCard key={flight.id} flight={flight} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Today */}
            {completedFlights.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                  Completed Today
                  <Badge variant="secondary">{completedFlights.length}</Badge>
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {completedFlights.map(flight => (
                    <FlightCard key={flight.id} flight={flight} />
                  ))}
                </div>
              </div>
            )}

            {/* No flights */}
            {flights.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No flights scheduled</p>
                  <p className="text-muted-foreground">There are no upcoming flights in the system.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function FlightCard({ flight }: { flight: ActiveFlight }) {
  const isToday = flight.date === new Date().toISOString().split('T')[0]
  
  return (
    <Card className={flight.status === 'in-progress' ? 'border-emerald-500' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{flight.aircraftName}</CardTitle>
          <StatusBadge status={flight.status} />
        </div>
        <CardDescription className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {flight.userName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">
              {new Date(flight.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              {isToday && <Badge variant="default" className="ml-2 text-xs bg-emerald-500">Today</Badge>}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Time</span>
            <span className="font-medium">{flight.scheduledDeparture} - {flight.scheduledArrival}</span>
          </div>
          {flight.route && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Route</span>
              <span className="font-medium">{flight.route}</span>
            </div>
          )}
        </div>
        
        {flight.status === 'in-progress' && (
          <Button className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600" size="sm">
            <Plane className="mr-2 h-4 w-4" />
            Complete Flight
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'in-progress':
      return <Badge className="bg-emerald-500">In Progress</Badge>
    case 'scheduled':
      return <Badge variant="outline">Scheduled</Badge>
    case 'completed':
      return <Badge variant="secondary">Completed</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}
