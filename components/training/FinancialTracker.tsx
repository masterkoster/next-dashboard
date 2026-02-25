'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  Plane, 
  GraduationCap, 
  Calculator,
  TrendingUp,
  Calendar,
  CreditCard,
  Save,
  RefreshCw
} from 'lucide-react'

interface Financials {
  aircraftRate: number
  instructorRate: number
  checkrideFee: number
  examFees: number
  medicalFee: number
  monthlyDues: number
  equipmentCost: number
  flightsPerMonth: number
  avgFlightHours: number
}

interface FinancialTrackerProps {
  goalType?: string
  totalHours?: number
  hoursRemaining?: number
  onSave?: (financials: Financials) => void
}

export default function FinancialTracker({ 
  goalType,
  totalHours = 0,
  hoursRemaining = 40,
  onSave
}: FinancialTrackerProps) {
  const [financials, setFinancials] = useState<Financials>({
    aircraftRate: 0,
    instructorRate: 0,
    checkrideFee: 0,
    examFees: 0,
    medicalFee: 0,
    monthlyDues: 0,
    equipmentCost: 0,
    flightsPerMonth: 0,
    avgFlightHours: 0,
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'inputs' | 'projections'>('inputs')

  // Load financials from API
  useEffect(() => {
    async function loadFinancials() {
      try {
        const res = await fetch('/api/training/financials')
        if (res.ok) {
          const data = await res.json()
          if (data) {
            const nextFinancials = {
              aircraftRate: Number(data.aircraftRate) || 0,
              instructorRate: Number(data.instructorRate) || 0,
              checkrideFee: Number(data.checkrideFee) || 0,
              examFees: Number(data.examFees) || 0,
              medicalFee: Number(data.medicalFee) || 0,
              monthlyDues: Number(data.monthlyDues) || 0,
              equipmentCost: Number(data.equipmentCost) || 0,
              flightsPerMonth: data.flightsPerMonth || 0,
              avgFlightHours: Number(data.avgFlightHours) || 0,
            }
            setFinancials(nextFinancials)

            const hasSavedInputs = Object.values(nextFinancials).some((value) => Number(value) > 0)
            if (hasSavedInputs) {
              setActiveTab('projections')
            }
          }
        }
      } catch (error) {
        console.error('Error loading financials:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadFinancials()
  }, [])

  const handleInputChange = (field: keyof Financials, value: string) => {
    setFinancials(prev => ({
      ...prev,
      [field]: field === 'flightsPerMonth' ? parseInt(value) || 0 : parseFloat(value) || 0
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/training/financials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(financials)
      })
      
      if (res.ok) {
        onSave?.(financials)
      }
    } catch (error) {
      console.error('Error saving financials:', error)
    } finally {
      setSaving(false)
    }
  }

  // Calculate projections
  const projections = useMemo(() => {
    const flightCostPerHour = financials.aircraftRate + financials.instructorRate
    const avgFlightsPerMonth = financials.flightsPerMonth || 1
    const avgHoursPerFlight = financials.avgFlightHours || 1.5
    const hoursPerMonth = avgFlightsPerMonth * avgHoursPerFlight
    
    // Costs
    const oneTimeCosts = financials.checkrideFee + financials.examFees + 
                        financials.medicalFee + financials.equipmentCost
    const monthlyCosts = financials.monthlyDues
    
    // If we have hours remaining and flight rate
    const hoursToComplete = hoursRemaining > 0 ? hoursRemaining : 0
    const totalFlightCost = hoursToComplete * flightCostPerHour
    const totalCost = oneTimeCosts + totalFlightCost
    
    // Projections
    const monthsToComplete = hoursPerMonth > 0 ? Math.ceil(hoursToComplete / hoursPerMonth) : 0
    const monthlyFlightCost = hoursPerMonth * flightCostPerHour
    const totalMonthly = monthlyCosts + monthlyFlightCost
    
    // Cost per hour (if flying)
    const costPerHour = hoursPerMonth > 0 
      ? (monthlyFlightCost / hoursPerMonth) 
      : flightCostPerHour

    return {
      flightCostPerHour,
      oneTimeCosts,
      monthlyCosts,
      totalFlightCost,
      totalCost,
      hoursPerMonth,
      monthsToComplete,
      monthlyFlightCost,
      totalMonthly,
      costPerHour
    }
  }, [financials, hoursRemaining])

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Training Costs & Projections
            </CardTitle>
            <CardDescription>Track your training expenses and estimate total cost</CardDescription>
          </div>
          <Button onClick={handleSave} disabled={saving} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'inputs' | 'projections')} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="inputs">Cost Inputs</TabsTrigger>
            <TabsTrigger value="projections">Projections</TabsTrigger>
          </TabsList>
          
          <TabsContent value="inputs">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Flight Costs */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Plane className="h-4 w-4" />
                  Flight Costs (per hour)
                </h4>
                
                <div className="space-y-2">
                  <Label htmlFor="aircraftRate">Aircraft Rental ($/hr)</Label>
                  <Input
                    id="aircraftRate"
                    type="number"
                    min="0"
                    step="5"
                    value={financials.aircraftRate || ''}
                    onChange={(e) => handleInputChange('aircraftRate', e.target.value)}
                    placeholder="150"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instructorRate">Instructor ($/hr)</Label>
                  <Input
                    id="instructorRate"
                    type="number"
                    min="0"
                    step="5"
                    value={financials.instructorRate || ''}
                    onChange={(e) => handleInputChange('instructorRate', e.target.value)}
                    placeholder="60"
                  />
                </div>
              </div>

              {/* One-time Costs */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  One-Time Costs
                </h4>
                
                <div className="space-y-2">
                  <Label htmlFor="checkrideFee">Checkride Fee</Label>
                  <Input
                    id="checkrideFee"
                    type="number"
                    min="0"
                    value={financials.checkrideFee || ''}
                    onChange={(e) => handleInputChange('checkrideFee', e.target.value)}
                    placeholder="500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="examFees">Written Exam Fees</Label>
                  <Input
                    id="examFees"
                    type="number"
                    min="0"
                    value={financials.examFees || ''}
                    onChange={(e) => handleInputChange('examFees', e.target.value)}
                    placeholder="200"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="medicalFee">Medical Exam</Label>
                  <Input
                    id="medicalFee"
                    type="number"
                    min="0"
                    value={financials.medicalFee || ''}
                    onChange={(e) => handleInputChange('medicalFee', e.target.value)}
                    placeholder="150"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="equipmentCost">Headset/Equipment</Label>
                  <Input
                    id="equipmentCost"
                    type="number"
                    min="0"
                    value={financials.equipmentCost || ''}
                    onChange={(e) => handleInputChange('equipmentCost', e.target.value)}
                    placeholder="500"
                  />
                </div>
              </div>

              {/* Monthly & Flight Patterns */}
              <div className="space-y-4 md:col-span-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Monthly & Flight Patterns
                </h4>
                
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyDues">Monthly Dues ($/month)</Label>
                    <Input
                      id="monthlyDues"
                      type="number"
                      min="0"
                      value={financials.monthlyDues || ''}
                      onChange={(e) => handleInputChange('monthlyDues', e.target.value)}
                      placeholder="100"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="flightsPerMonth">Flights per Month</Label>
                    <Input
                      id="flightsPerMonth"
                      type="number"
                      min="0"
                      value={financials.flightsPerMonth || ''}
                      onChange={(e) => handleInputChange('flightsPerMonth', e.target.value)}
                      placeholder="4"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="avgFlightHours">Avg Hours per Flight</Label>
                    <Input
                      id="avgFlightHours"
                      type="number"
                      min="0"
                      step="0.5"
                      value={financials.avgFlightHours || ''}
                      onChange={(e) => handleInputChange('avgFlightHours', e.target.value)}
                      placeholder="1.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="projections">
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-blue-500/10 border-blue-500/30">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Total Estimated Cost</p>
                    <p className="text-3xl font-bold text-blue-600">
                      ${projections.totalCost.toLocaleString()}
                    </p>
                    {hoursRemaining > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {hoursRemaining} hours remaining
                      </p>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="bg-green-500/10 border-green-500/30">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">One-Time Costs</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${projections.oneTimeCosts.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Checkride, exams, equipment
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-amber-500/10 border-amber-500/30">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Monthly Cost</p>
                    <p className="text-2xl font-bold text-amber-600">
                      ${projections.totalMonthly.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Dues + flying
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-purple-500/10 border-purple-500/30">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Est. Months to Goal</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {projections.monthsToComplete || '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {projections.hoursPerMonth.toFixed(1)} hrs/month
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Cost Breakdown */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-4">Cost Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">One-time costs</span>
                    <span className="font-medium">${projections.oneTimeCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Flight costs ({hoursRemaining} hrs @ ${projections.flightCostPerHour}/hr)</span>
                    <span className="font-medium">${projections.totalFlightCost.toLocaleString()}</span>
                  </div>
                  {projections.monthsToComplete > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Monthly dues ({projections.monthsToComplete} months)</span>
                      <span className="font-medium">${(projections.monthlyCosts * projections.monthsToComplete).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-lg">${projections.totalCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Cost Per Hour */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Cost per Flight Hour</p>
                    <p className="text-2xl font-bold">${projections.costPerHour.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Flying cost</p>
                    <p className="font-medium">${projections.flightCostPerHour}/hr</p>
                    <p className="text-xs text-muted-foreground">
                      (${financials.aircraftRate}/aircraft + ${financials.instructorRate}/instructor)
                    </p>
                  </div>
                </div>
              </div>

              {projections.flightCostPerHour === 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  Enter your flight costs to see projections
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
