'use client'

import { useState } from 'react'
import { TRAINING_GOALS, getGoalById, arePrerequisitesMet, GoalType } from '@/lib/training/requirements'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Lock, ChevronRight, Plane, Helicopter, GraduationCap, Briefcase, Award } from 'lucide-react'

interface GoalSelectorProps {
  currentGoal?: string
  completedGoals?: GoalType[]
  onSelectGoal: (goalType: GoalType) => void
  isLoading?: boolean
}

export default function GoalSelector({ 
  currentGoal, 
  completedGoals = [],
  onSelectGoal, 
  isLoading = false 
}: GoalSelectorProps) {
  const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(currentGoal as GoalType || null)
  const [showAll, setShowAll] = useState(false)

  const handleSelect = async (goalType: GoalType) => {
    setSelectedGoal(goalType)
    onSelectGoal(goalType)
  }

  // Get icon based on category
  const getIcon = (category: 'airplane' | 'helicopter') => {
    if (category === 'helicopter') return <Helicopter className="h-8 w-8" />
    return <Plane className="h-8 w-8" />
  }

  // Get icon for specific goals
  const getGoalIcon = (goalId: GoalType) => {
    switch (goalId) {
      case 'PPL': return <Plane className="h-8 w-8" />
      case 'IR': return <Award className="h-8 w-8" />
      case 'CPL': return <Briefcase className="h-8 w-8" />
      case 'CFI':
      case 'CFII':
      case 'MEI': return <GraduationCap className="h-8 w-8" />
      case 'ATP': return <Award className="h-8 w-8" />
      case 'HELICOPTER': return <Helicopter className="h-8 w-8" />
      default: return <Plane className="h-8 w-8" />
    }
  }

  // Filter goals - show first 4 by default (most common)
  const displayedGoals = showAll ? TRAINING_GOALS : TRAINING_GOALS.slice(0, 4)
  const availableGoals = TRAINING_GOALS.filter(goal => 
    arePrerequisitesMet(goal.prerequisites || [], completedGoals)
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Choose Your Training Goal</h2>
          <p className="text-muted-foreground">Select the certification you're working toward</p>
        </div>
        {!showAll && TRAINING_GOALS.length > 4 && (
          <Button variant="outline" onClick={() => setShowAll(true)}>
            View All {TRAINING_GOALS.length} Goals
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {displayedGoals.map((goal) => {
          const isSelected = selectedGoal === goal.id
          const isComplete = completedGoals.includes(goal.id)
          const isLocked = !arePrerequisitesMet(goal.prerequisites || [], completedGoals)
          const hasTarget = currentGoal === goal.id

          return (
            <Card 
              key={goal.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'border-primary bg-primary/5' : ''
              } ${isComplete ? 'border-green-500 bg-green-500/5' : ''} ${isLocked ? 'opacity-60' : ''}`}
              onClick={() => !isLocked && handleSelect(goal.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${isComplete ? 'bg-green-100' : isSelected ? 'bg-primary/10' : 'bg-muted'}`}>
                    {getGoalIcon(goal.id)}
                  </div>
                  <div className="flex gap-1">
                    {isComplete && (
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                        <Check className="h-3 w-3 mr-1" /> Done
                      </Badge>
                    )}
                    {hasTarget && !isComplete && (
                      <Badge className="bg-primary">Active</Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-lg mt-2">{goal.name}</CardTitle>
                <CardDescription className="text-xs">{goal.shortName} - {goal.totalHoursRequired}+ hours</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {goal.description}
                </p>
                
                {isLocked && goal.prerequisites && goal.prerequisites.length > 0 && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    <span>Requires: {goal.prerequisites.join(', ')}</span>
                  </div>
                )}
                
                {isSelected && !isComplete && (
                  <Button className="w-full mt-3" size="sm" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Set as Goal'}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Goal Progress Summary */}
      {completedGoals.length > 0 && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-2">Your Progress</h3>
          <div className="flex flex-wrap gap-2">
            {completedGoals.map(goalId => {
              const goal = getGoalById(goalId)
              return goal ? (
                <Badge key={goalId} variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                  <Check className="h-3 w-3 mr-1" /> {goal.shortName}
                </Badge>
              ) : null
            })}
          </div>
        </div>
      )}
    </div>
  )
}
