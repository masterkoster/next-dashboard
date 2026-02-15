import { NextResponse } from 'next/server';

// Simple in-memory storage (for demo purposes)
// In production, this would connect to a database
const flightPlans: any[] = [];

export async function GET() {
  try {
    // Return all flight plans (demo mode - no auth required)
    return NextResponse.json({ flightPlans });
  } catch (error) {
    console.error('Error fetching flight plans:', error);
    return NextResponse.json({ error: 'Failed to fetch flight plans' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newPlan = {
      id: crypto.randomUUID(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    flightPlans.push(newPlan);
    
    return NextResponse.json({ flightPlan: newPlan, totalPlans: flightPlans.length });
  } catch (error) {
    console.error('Error creating flight plan:', error);
    return NextResponse.json({ error: 'Failed to create flight plan' }, { status: 500 });
  }
}
