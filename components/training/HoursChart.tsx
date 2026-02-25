'use client'

import { useMemo } from 'react'
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface FlightLogEntry {
  date: string
  totalTime?: number
  soloTime?: number
  nightTime?: number
  instrumentTime?: number
  crossCountryTime?: number
}

interface HoursChartProps {
  logs?: FlightLogEntry[]
  progress?: {
    totalHours: number
    soloHours: number
    nightHours: number
    instrumentHours: number
    crossCountryHours: number
  }
}

export default function HoursChart({ logs = [], progress }: HoursChartProps) {
  // Process log data into monthly aggregates
  const monthlyData = useMemo(() => {
    if (logs.length === 0) {
      // Demo data if no logs
      return [
        { month: 'Jan', total: 5, solo: 2, night: 0, instrument: 1, xc: 0 },
        { month: 'Feb', total: 8, solo: 3, night: 1, instrument: 2, xc: 3 },
        { month: 'Mar', total: 12, solo: 4, night: 2, instrument: 4, xc: 5 },
        { month: 'Apr', total: 15, solo: 5, night: 2, instrument: 5, xc: 7 },
        { month: 'May', total: 18, solo: 6, night: 3, instrument: 6, xc: 8 },
        { month: 'Jun', total: 22, solo: 7, night: 3, instrument: 7, xc: 10 },
      ]
    }

    // Aggregate logs by month
    const monthly: Record<string, any> = {}
    
    logs.forEach(log => {
      const date = new Date(log.date)
      const monthKey = date.toLocaleString('default', { month: 'short' })
      
      if (!monthly[monthKey]) {
        monthly[monthKey] = { month: monthKey, total: 0, solo: 0, night: 0, instrument: 0, xc: 0 }
      }
      
      monthly[monthKey].total += log.totalTime || 0
      monthly[monthKey].solo += log.soloTime || 0
      monthly[monthKey].night += log.nightTime || 0
      monthly[monthKey].instrument += log.instrumentTime || 0
      monthly[monthKey].xc += log.crossCountryTime || 0
    })
    
    return Object.values(monthly)
  }, [logs])

  // Calculate totals
  const totals = useMemo(() => {
    if (progress) return progress
    
    return {
      totalHours: monthlyData.reduce((sum, m) => sum + m.total, 0),
      soloHours: monthlyData.reduce((sum, m) => sum + m.solo, 0),
      nightHours: monthlyData.reduce((sum, m) => sum + m.night, 0),
      instrumentHours: monthlyData.reduce((sum, m) => sum + m.instrument, 0),
      crossCountryHours: monthlyData.reduce((sum, m) => sum + m.xc, 0),
    }
  }, [progress, monthlyData])

  // Project completion based on average monthly rate
  const projection = useMemo(() => {
    if (monthlyData.length < 2) return null
    
    const recentMonths = monthlyData.slice(-3)
    const avgHoursPerMonth = recentMonths.reduce((sum, m) => sum + m.total, 0) / recentMonths.length
    
    return {
      avgHoursPerMonth: avgHoursPerMonth.toFixed(1),
      projectedDate: null // Could calculate if target hours provided
    }
  }, [monthlyData])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">{entry.value.toFixed(1)} hrs</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Flight Hours Progress</CardTitle>
            <p className="text-sm text-muted-foreground">Your training timeline</p>
          </div>
          {projection && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Avg. {projection.avgHoursPerMonth} hrs/month</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stacked" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="stacked">Stacked</TabsTrigger>
            <TabsTrigger value="total">Total Only</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stacked" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="solo" name="Solo" stackId="a" fill="#22c55e" />
                <Bar dataKey="night" name="Night" stackId="a" fill="#3b82f6" />
                <Bar dataKey="instrument" name="Instrument" stackId="a" fill="#8b5cf6" />
                <Bar dataKey="xc" name="Cross Country" stackId="a" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="total" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  name="Total Hours"
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>

        {/* Summary Cards */}
        <div className="grid grid-cols-5 gap-2 mt-6">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{totals.totalHours}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="bg-green-500/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{totals.soloHours}</p>
            <p className="text-xs text-muted-foreground">Solo</p>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{totals.nightHours}</p>
            <p className="text-xs text-muted-foreground">Night</p>
          </div>
          <div className="bg-purple-500/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-purple-600">{totals.instrumentHours}</p>
            <p className="text-xs text-muted-foreground">Instrument</p>
          </div>
          <div className="bg-amber-500/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">{totals.crossCountryHours}</p>
            <p className="text-xs text-muted-foreground">XC</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
