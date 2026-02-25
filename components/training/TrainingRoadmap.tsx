'use client'

import { useState } from 'react'
import { getGoalById, TrainingGoalData, Milestone } from '@/lib/training/requirements'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip'
import { Check, Circle, Clock, ChevronRight, Plane, Target } from 'lucide-react'

interface TrainingRoadmapProps {
  goalType?: string
  progress: Record<string, number>
  milestonesCompleted?: string[]
}

export default function TrainingRoadmap({ 
  goalType, 
  progress = {},
  milestonesCompleted = [] 
}: TrainingRoadmapProps) {
  const [hoveredMilestone, setHoveredMilestone] = useState<string | null>(null)

  if (!goalType) {
    return (
      <Card className="p-6 text-center">
        <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Goal Selected</h3>
        <p className="text-muted-foreground">Choose a training goal above to see your roadmap</p>
      </Card>
    )
  }

  const goal = getGoalById(goalType as any)
  
  if (!goal) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">Invalid goal selected</p>
      </Card>
    )
  }

  // Calculate overall progress
  const totalRequirements = goal.requirements.length
  const completedRequirements = goal.requirements.filter(
    req => (progress[req.key] || 0) >= req.required
  ).length
  const overallProgress = Math.round((completedRequirements / totalRequirements) * 100)

  // Determine milestone status based on requirements
  const getMilestoneStatus = (milestone: Milestone): 'complete' | 'in-progress' | 'pending' => {
    // Check if all requirements for this milestone are met
    const allMet = milestone.requirements.every(
      reqKey => (progress[reqKey] || 0) >= 
        (goal.requirements.find(r => r.key === reqKey)?.required || 0)
    )
    
    if (allMet) return 'complete'
    
    // Check if any requirements are in progress
    const anyProgress = milestone.requirements.some(
      reqKey => (progress[reqKey] || 0) > 0
    )
    
    if (anyProgress) return 'in-progress'
    
    return 'pending'
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-primary" />
              <CardTitle>{goal.name} Roadmap</CardTitle>
            </div>
            <Badge variant="outline">{overallProgress}% Complete</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress bar */}
          <div className="mb-6">
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          {/* Milestones timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />

            <div className="space-y-6">
              {goal.milestones.map((milestone, index) => {
                const status = getMilestoneStatus(milestone)
                const isHovered = hoveredMilestone === milestone.id

                return (
                  <Tooltip key={milestone.id}>
                    <TooltipTrigger asChild>
                      <div 
                        className={`relative flex items-start gap-4 cursor-pointer transition-opacity ${
                          status === 'pending' ? 'opacity-60' : ''
                        }`}
                        onMouseEnter={() => setHoveredMilestone(milestone.id)}
                        onMouseLeave={() => setHoveredMilestone(null)}
                      >
                        {/* Status icon */}
                        <div className={`
                          relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2
                          ${status === 'complete' ? 'bg-green-500 border-green-500' : ''}
                          ${status === 'in-progress' ? 'bg-yellow-500 border-yellow-500' : ''}
                          ${status === 'pending' ? 'bg-background border-muted-foreground' : ''}
                        `}>
                          {status === 'complete' && <Check className="h-4 w-4 text-white" />}
                          {status === 'in-progress' && <Clock className="h-4 w-4 text-white" />}
                          {status === 'pending' && <Circle className="h-3 w-3 text-muted-foreground" />}
                        </div>

                        {/* Content */}
                        <div className={`
                          flex-1 p-3 rounded-lg border transition-all
                          ${isHovered ? 'bg-muted/50 border-primary/50' : 'bg-muted/20'}
                          ${status === 'complete' ? 'border-green-500/30' : ''}
                          ${status === 'in-progress' ? 'border-yellow-500/30' : ''}
                        `}>
                          <div className="flex items-center justify-between">
                            <span className={`
                              font-medium
                              ${status === 'complete' ? 'text-green-600' : ''}
                              ${status === 'in-progress' ? 'text-yellow-600' : ''}
                            `}>
                              {milestone.title}
                            </span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                          
                          {/* Requirements preview */}
                          {milestone.requirements.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {milestone.requirements.slice(0, 3).map(reqKey => {
                                const req = goal.requirements.find(r => r.key === reqKey)
                                const current = progress[reqKey] || 0
                                const required = req?.required || 0
                                const met = current >= required
                                
                                return (
                                  <Badge 
                                    key={reqKey} 
                                    variant="outline" 
                                    className={`text-xs ${met ? 'bg-green-500/10 text-green-600' : ''}`}
                                  >
                                    {req?.label}: {current}/{required}
                                  </Badge>
                                )
                              })}
                              {milestone.requirements.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{milestone.requirements.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </TooltipTrigger>
                    
                    {/* Tooltip with full details */}
                    <TooltipContent
                      side="top"
                      align="center"
                      sideOffset={8}
                      collisionPadding={16}
                      avoidCollisions
                      className="w-80 max-w-[calc(100vw-2rem)]"
                    >
                      <div className="space-y-2">
                        <h4 className="font-semibold">{milestone.title}</h4>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        
                        <div className="border-t pt-2">
                          <h5 className="text-sm font-medium mb-1">Requirements:</h5>
                          <div className="space-y-1">
                            {milestone.requirements.map(reqKey => {
                              const req = goal.requirements.find(r => r.key === reqKey)
                              const current = progress[reqKey] || 0
                              const required = req?.required || 0
                              const met = current >= required
                              
                              return (
                                <div key={reqKey} className="flex justify-between text-xs">
                                  <span className={met ? 'text-green-600' : ''}>
                                    {req?.label || reqKey}
                                  </span>
                                  <span className={met ? 'text-green-600 font-medium' : ''}>
                                    {current} / {required} {req?.unit || 'hrs'}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
