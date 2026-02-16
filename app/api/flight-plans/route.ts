import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/auth';

// GET - Fetch user's flight plans
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      // Return empty list if not logged in
      return NextResponse.json({ flightPlans: [], message: 'Not authenticated' });
    }

    const flightPlans = await prisma.flightPlan.findMany({
      where: { userId: session.user.id },
      include: { waypoints: { orderBy: { sequence: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ flightPlans });
  } catch (error) {
    console.error('Error fetching flight plans:', error);
    return NextResponse.json({ error: 'Failed to fetch flight plans' }, { status: 500 });
  }
}

// POST - Create new flight plan
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    
    const {
      name,
      callsign,
      aircraftType,
      pilotName,
      departureTime,
      cruisingAlt,
      alternateIcao,
      remarks,
      soulsOnBoard,
      departureIcao,
      arrivalIcao,
      departureFuel,
      waypoints,
    } = body;

    // Create flight plan with waypoints in a transaction
    const flightPlan = await prisma.flightPlan.create({
      data: {
        userId: session.user.id,
        name: name || `Flight Plan ${new Date().toLocaleDateString()}`,
        callsign,
        aircraftType,
        pilotName,
        departureTime: departureTime ? new Date(departureTime) : null,
        departureFuel,
        cruisingAlt,
        arrivalIcao,
        alternateIcao,
        remarks,
        soulsOnBoard,
        departureIcao,
        waypoints: waypoints ? {
          create: waypoints.map((wp: any, index: number) => ({
            sequence: index,
            icao: wp.icao,
            name: wp.name,
            city: wp.city,
            latitude: wp.latitude,
            longitude: wp.longitude,
            altitude: wp.altitude,
          }))
        } : undefined,
      },
      include: { waypoints: { orderBy: { sequence: 'asc' } } },
    });

    return NextResponse.json({ flightPlan, message: 'Flight plan saved' });
  } catch (error) {
    console.error('Error creating flight plan:', error);
    return NextResponse.json({ error: 'Failed to create flight plan' }, { status: 500 });
  }
}

// DELETE - Delete a flight plan
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Flight plan ID required' }, { status: 400 });
    }

    // Only delete if it belongs to the user
    await prisma.flightPlan.deleteMany({
      where: { id, userId: session.user.id },
    });

    return NextResponse.json({ message: 'Flight plan deleted' });
  } catch (error) {
    console.error('Error deleting flight plan:', error);
    return NextResponse.json({ error: 'Failed to delete flight plan' }, { status: 500 });
  }
}

// PUT - Update a flight plan
export async function PUT(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Flight plan ID required' }, { status: 400 });
    }

    const body = await request.json();
    
    const {
      name,
      callsign,
      aircraftType,
      pilotName,
      departureTime,
      cruisingAlt,
      alternateIcao,
      remarks,
      soulsOnBoard,
      departureIcao,
      arrivalIcao,
      departureFuel,
      waypoints,
    } = body;

    // First delete existing waypoints
    await prisma.flightPlanWaypoint.deleteMany({
      where: { flightPlanId: id },
    });

    // Then update the flight plan with new waypoints
    const flightPlan = await prisma.flightPlan.update({
      where: { id, userId: session.user.id },
      data: {
        name: name || `Flight Plan ${new Date().toLocaleDateString()}`,
        callsign,
        aircraftType,
        pilotName,
        departureTime: departureTime ? new Date(departureTime) : null,
        departureFuel,
        cruisingAlt,
        arrivalIcao,
        alternateIcao,
        remarks,
        soulsOnBoard,
        departureIcao,
        waypoints: waypoints && waypoints.length > 0 ? {
          create: waypoints.map((wp: any, index: number) => ({
            sequence: index,
            icao: wp.icao,
            name: wp.name,
            city: wp.city,
            latitude: wp.latitude,
            longitude: wp.longitude,
            altitude: wp.altitude,
          }))
        } : undefined,
      },
      include: { waypoints: { orderBy: { sequence: 'asc' } } },
    });

    return NextResponse.json({ flightPlan, message: 'Flight plan updated' });
  } catch (error) {
    console.error('Error updating flight plan:', error);
    return NextResponse.json({ error: 'Failed to update flight plan' }, { status: 500 });
  }
}
