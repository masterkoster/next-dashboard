'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

import GoalSelector from '@/components/training/GoalSelector'
import TrainingRoadmap from '@/components/training/TrainingRoadmap'
import HoursChart from '@/components/training/HoursChart'
import FinancialTracker from '@/components/training/FinancialTracker'
import { getGoalById, GoalType } from '@/lib/training/requirements'

interface TrainingProgress {
  totalHours: number
  soloHours: number
  nightHours: number
  instrumentHours: number
  crossCountryHours: number
  xcSoloHours: number
  dualGiven: number
}

interface TrainingGoal {
  id: string
  goalType: string
  targetDate: string | null
}

export default function TrainingPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [savingGoal, setSavingGoal] = useState(false)
  
  // Data states
  const [currentGoal, setCurrentGoal] = useState<TrainingGoal | null>(null)
  const [progress, setProgress] = useState<TrainingProgress>({
    totalHours: 0,
    soloHours: 0,
    nightHours: 0,
    instrumentHours: 0,
    crossCountryHours: 0,
    xcSoloHours: 0,
    dualGiven: 0,
  })
  const [completedGoals, setCompletedGoals] = useState<GoalType[]>([])

  const [currencyProgress, setCurrencyProgress] = useState<any[]>([])

  // Fetch data on mount
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      setLoading(false)
      return
    }

    async function fetchData() {
      try {
        // Fetch training goal
        const goalRes = await fetch('/api/training/goal')
        if (goalRes.ok) {
          const goalData = await goalRes.json()
          if (goalData) {
            setCurrentGoal(goalData)
          }
        }

        // Fetch training progress (existing API)
        const progressRes = await fetch('/api/training-progress')
        if (progressRes.ok) {
          const progressData = await progressRes.json()
          if (progressData) {
            setProgress({
              totalHours: progressData.totalHours || 0,
              soloHours: progressData.soloHours || 0,
              nightHours: progressData.nightHours || 0,
              instrumentHours: progressData.instrumentHours || 0,
              crossCountryHours: progressData.crossCountryHours || 0,
              xcSoloHours: progressData.xcSoloHours || 0,
              dualGiven: progressData.dualGiven || 0,
            })
          }
        }

        const currencyRes = await fetch('/api/logbook/currency/progress')
        if (currencyRes.ok) {
          const currencyData = await currencyRes.json()
          setCurrencyProgress(currencyData.progress || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session, status])

  // Handle goal selection
  const handleSelectGoal = async (goalType: GoalType) => {
    setSavingGoal(true)
    try {
      const res = await fetch('/api/training/goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalType })
      })
      
      if (res.ok) {
        const data = await res.json()
        setCurrentGoal(data)
      }
    } catch (error) {
      console.error('Error saving goal:', error)
    } finally {
      setSavingGoal(false)
    }
  }

  // Map progress to requirement keys for roadmap
  const progressMap: Record<string, number> = {
    totalTime: progress.totalHours,
    soloTime: progress.soloHours,
    night: progress.nightHours,
    instrument: progress.instrumentHours,
    crossCountry: progress.crossCountryHours,
    xcSolo: progress.xcSoloHours,
    dualGiven: progress.dualGiven,
    dualInstrument: progress.instrumentHours,
    picTime: progress.totalHours,
  }

  // Calculate hours remaining for financial projections
  const goalData = currentGoal?.goalType ? getGoalById(currentGoal.goalType as GoalType) : null
  const hoursRemaining = goalData 
    ? Math.max(0, goalData.totalHoursRequired - progress.totalHours)
    : 0

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="text-6xl mb-4">🎓</div>
            <h1 className="text-2xl font-bold mb-2">Training Progress Tracker</h1>
            <p className="text-muted-foreground mb-6">
              Sign in to track your flight training progress, choose your goals, and see financial projections
            </p>
            <Button onClick={() => signIn()}>
              Sign In to Track Progress
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
            <h1 className="text-3xl font-bold">🎓 Training Tracker</h1>
            <p className="text-muted-foreground">
              Track your progress toward pilot certification
            </p>
          </div>
        </div>

        <Tabs defaultValue="goals" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="currency">Currency</TabsTrigger>
            <TabsTrigger value="costs">Costs</TabsTrigger>
          </TabsList>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <GoalSelector 
              currentGoal={currentGoal?.goalType}
              completedGoals={completedGoals}
              onSelectGoal={handleSelectGoal}
              isLoading={savingGoal}
            />
            
            {currentGoal?.goalType && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">{progress.totalHours}</div>
                      <div className="text-sm text-muted-foreground">Total Hours</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-3xl font-bold text-green-600">{progress.soloHours}</div>
                      <div className="text-sm text-muted-foreground">Solo Hours</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-3xl font-bold text-purple-600">{progress.instrumentHours}</div>
                      <div className="text-sm text-muted-foreground">Instrument</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-3xl font-bold text-amber-600">{progress.crossCountryHours}</div>
                      <div className="text-sm text-muted-foreground">Cross Country</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Roadmap Tab */}
          <TabsContent value="roadmap">
            <TrainingRoadmap 
              goalType={currentGoal?.goalType}
              progress={progressMap}
            />
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <HoursChart progress={progress} />
            
            {/* Hours Input for manual entry */}
            <Card>
              <CardHeader>
                <CardTitle>Log Your Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Hours are synced from your logbook. Manual entry coming soon.
                </p>
                <Button variant="outline" asChild>
                  <a href="/modules/logbook" target="_blank">
                    Open Logbook
                  </a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="currency" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Currency Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currencyProgress.length === 0 && (
                  <p className="text-sm text-muted-foreground">No currency data yet.</p>
                )}
                {currencyProgress.map((rule) => (
                  <div key={rule.code} className="rounded-md border border-border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        <p className="text-xs text-muted-foreground">{rule.authority}</p>
                      </div>
                      <span className="text-xs rounded-md border px-2 py-0.5">{rule.status}</span>
                    </div>
                    <div className="mt-2 space-y-1 text-xs">
                      {rule.progress.map((p: any, idx: number) => (
                        <div key={idx} className="flex justify-between">
                          <span>{p.unit}</span>
                          <span>{p.completed} / {p.required}</span>
                        </div>
                      ))}
                    </div>
                    {rule.nextDueAt && (
                      <p className="mt-2 text-xs text-muted-foreground">Next due: {new Date(rule.nextDueAt).toLocaleDateString()}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Costs Tab */}
          <TabsContent value="costs">
            <FinancialTracker 
              goalType={currentGoal?.goalType}
              totalHours={progress.totalHours}
              hoursRemaining={hoursRemaining}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
