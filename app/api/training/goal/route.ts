import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GoalType } from '@/lib/training/requirements'

// GET /api/training/goal - Get user's current training goal
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const goal = await prisma.trainingGoal.findUnique({
      where: { userId: session.user.id }
    })
    
    return NextResponse.json(goal)
  } catch (error) {
    console.error('Error fetching training goal:', error)
    return NextResponse.json({ error: 'Failed to fetch goal' }, { status: 500 })
  }
}

// POST /api/training/goal - Set/update training goal
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { goalType, targetDate } = body
    
    if (!goalType) {
      return NextResponse.json({ error: 'goalType is required' }, { status: 400 })
    }
    
    // Validate goalType
    const validGoals: GoalType[] = ['PPL', 'IR', 'CPL', 'CFI', 'CFII', 'MEI', 'ATP', 'HELICOPTER']
    if (!validGoals.includes(goalType)) {
      return NextResponse.json({ error: 'Invalid goal type' }, { status: 400 })
    }
    
    // Deactivate any existing goal and create new one
    const goal = await prisma.trainingGoal.upsert({
      where: { userId: session.user.id },
      update: {
        goalType,
        targetDate: targetDate ? new Date(targetDate) : null,
        isActive: true,
      },
      create: {
        userId: session.user.id,
        goalType,
        targetDate: targetDate ? new Date(targetDate) : null,
        isActive: true,
      }
    })
    
    return NextResponse.json(goal)
  } catch (error) {
    console.error('Error setting training goal:', error)
    return NextResponse.json({ error: 'Failed to set goal' }, { status: 500 })
  }
}

// DELETE /api/training/goal - Clear training goal
export async function DELETE() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    await prisma.trainingGoal.deleteMany({
      where: { userId: session.user.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing training goal:', error)
    return NextResponse.json({ error: 'Failed to clear goal' }, { status: 500 })
  }
}
