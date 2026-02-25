'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plane,
  Sun,
  Moon,
  Gauge,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  User,
  Users,
  Filter,
  Download
} from 'lucide-react'

interface MemberCurrency {
  id: string
  userId: string
  userName: string
  userEmail: string
  // Day currency
  dayLandings: number
  dayLandingsDate: string | null
  dayCurrencyStatus: 'current' | 'expiring' | 'expired'
  // Night currency
  nightLandings: number
  nightLandingsDate: string | null
  nightCurrencyStatus: 'current' | 'expiring' | 'expired'
  // Instrument currency
  approaches: number
  instrumentTime: number
  instrumentCurrencyStatus: 'current' | 'expiring' | 'expired'
}

// Demo data for display
const demoMembers: MemberCurrency[] = [
  {
    id: '1',
    userId: '1',
    userName: 'John Smith',
    userEmail: 'john@example.com',
    dayLandings: 5,
    dayLandingsDate: '2024-02-15',
    dayCurrencyStatus: 'current',
    nightLandings: 3,
    nightLandingsDate: '2024-02-10',
    nightCurrencyStatus: 'current',
    approaches: 8,
    instrumentTime: 15.5,
    instrumentCurrencyStatus: 'current',
  },
  {
    id: '2',
    userId: '2',
    userName: 'Sarah Johnson',
    userEmail: 'sarah@example.com',
    dayLandings: 2,
    dayLandingsDate: '2024-01-20',
    dayCurrencyStatus: 'expired',
    nightLandings: 1,
    nightLandingsDate: '2024-01-15',
    nightCurrencyStatus: 'expired',
    approaches: 3,
    instrumentTime: 8.0,
    instrumentCurrencyStatus: 'expiring',
  },
  {
    id: '3',
    userId: '3',
    userName: 'Mike Davis',
    userEmail: 'mike@example.com',
    dayLandings: 4,
    dayLandingsDate: '2024-02-01',
    dayCurrencyStatus: 'current',
    nightLandings: 0,
    nightLandingsDate: null,
    nightCurrencyStatus: 'expired',
    approaches: 10,
    instrumentTime: 22.0,
    instrumentCurrencyStatus: 'current',
  },
  {
    id: '4',
    userId: '4',
    userName: 'Emily Chen',
    userEmail: 'emily@example.com',
    dayLandings: 3,
    dayLandingsDate: '2024-02-18',
    dayCurrencyStatus: 'current',
    nightLandings: 3,
    nightLandingsDate: '2024-02-18',
    nightCurrencyStatus: 'current',
    approaches: 6,
    instrumentTime: 12.0,
    instrumentCurrencyStatus: 'current',
  },
]

export default function CurrencyDashboardPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<MemberCurrency[]>([])
  const [filter, setFilter] = useState<'all' | 'current' | 'expiring' | 'expired'>('all')

  useEffect(() => {
    // In real app, fetch from API
    // For demo, using static data
    setMembers(demoMembers)
    setLoading(false)
  }, [session])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'current':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'expiring':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'bg-green-500/10 text-green-600 border-green-500/30'
      case 'expiring':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/30'
      case 'expired':
        return 'bg-red-500/10 text-red-600 border-red-500/30'
      default:
        return ''
    }
  }

  const getMemberStatus = (member: MemberCurrency): 'current' | 'expiring' | 'expired' => {
    if (member.dayCurrencyStatus === 'expired' || member.nightCurrencyStatus === 'expired' || member.instrumentCurrencyStatus === 'expired') {
      return 'expired'
    }
    if (member.dayCurrencyStatus === 'expiring' || member.nightCurrencyStatus === 'expiring' || member.instrumentCurrencyStatus === 'expiring') {
      return 'expiring'
    }
    return 'current'
  }

  const filteredMembers = members.filter(member => {
    if (filter === 'all') return true
    return getMemberStatus(member) === filter
  })

  const stats = {
    total: members.length,
    current: members.filter(m => getMemberStatus(m) === 'current').length,
    expiring: members.filter(m => getMemberStatus(m) === 'expiring').length,
    expired: members.filter(m => getMemberStatus(m) === 'expired').length,
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">Member Currency Dashboard</h2>
            <p className="text-muted-foreground mb-4">
              Sign in to view club member currency status
            </p>
            <Button asChild>
              <a href="/login">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Gauge className="h-8 w-8" />
              Member Currency Dashboard
            </h1>
            <p className="text-muted-foreground">
              FAA currency status for all club members at a glance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={() => setLoading(true)}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-green-500/30">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current</p>
                  <p className="text-2xl font-bold text-green-600">{stats.current}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-amber-500/30">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Expiring Soon</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.expiring}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-red-500/30">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Not Current</p>
                  <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter:</span>
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({stats.total})
          </Button>
          <Button 
            variant={filter === 'current' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('current')}
          >
            Current ({stats.current})
          </Button>
          <Button 
            variant={filter === 'expiring' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('expiring')}
          >
            Expiring ({stats.expiring})
          </Button>
          <Button 
            variant={filter === 'expired' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('expired')}
          >
            Not Current ({stats.expired})
          </Button>
        </div>

        {/* Members Table */}
        <Card>
          <CardHeader>
            <CardTitle>Member Currency Status</CardTitle>
            <CardDescription>
              FAA currency requirements: 3 takeoffs/landings in 90 days (day/night), 6 approaches + holds + intercepting in 6 months (instrument)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Member</th>
                    <th className="text-center p-3 font-medium">
                      <div className="flex items-center justify-center gap-1">
                        <Sun className="h-4 w-4" />
                        Day (3 in 90 days)
                      </div>
                    </th>
                    <th className="text-center p-3 font-medium">
                      <div className="flex items-center justify-center gap-1">
                        <Moon className="h-4 w-4" />
                        Night (3 in 90 days)
                      </div>
                    </th>
                    <th className="text-center p-3 font-medium">
                      <div className="flex items-center justify-center gap-1">
                        <Gauge className="h-4 w-4" />
                        Instrument (6mo)
                      </div>
                    </th>
                    <th className="text-center p-3 font-medium">Overall</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{member.userName}</p>
                            <p className="text-sm text-muted-foreground">{member.userEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-medium">{member.dayLandings}</span>
                          <Badge className={`text-xs ${getStatusColor(member.dayCurrencyStatus)}`}>
                            {getStatusIcon(member.dayCurrencyStatus)}
                            <span className="ml-1">
                              {member.dayLandings >= 3 ? 'Current' : member.dayLandings > 0 ? `${3 - member.dayLandings} more` : 'Expired'}
                            </span>
                          </Badge>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-medium">{member.nightLandings}</span>
                          <Badge className={`text-xs ${getStatusColor(member.nightCurrencyStatus)}`}>
                            {getStatusIcon(member.nightCurrencyStatus)}
                            <span className="ml-1">
                              {member.nightLandings >= 3 ? 'Current' : member.nightLandings > 0 ? `${3 - member.nightLandings} more` : 'Expired'}
                            </span>
                          </Badge>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-medium">{member.approaches}</span>
                          <span className="text-xs text-muted-foreground">{member.instrumentTime.toFixed(1)} hrs</span>
                          <Badge className={`text-xs ${getStatusColor(member.instrumentCurrencyStatus)}`}>
                            {getStatusIcon(member.instrumentCurrencyStatus)}
                            <span className="ml-1">
                              {member.approaches >= 6 ? 'Current' : `${6 - member.approaches} more`}
                            </span>
                          </Badge>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={`${getStatusColor(getMemberStatus(member))} px-3 py-1`}>
                          {getStatusIcon(getMemberStatus(member))}
                          <span className="ml-1 capitalize">{getMemberStatus(member)}</span>
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Current - Meets requirements</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>Expiring Soon - Will expire within 30 days</span>
              </div>
              <div className="flex items-center gap-1">
                <XCircle className="h-4 w-4 text-red-500" />
                <span>Not Current - Does not meet requirements</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
