import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all groups the user is a member of - with error handling
    let memberships = [];
    try {
      memberships = await prisma.groupMember.findMany({
        where: { userId: user.id },
        include: {
          group: {
            include: {
              aircraft: {
                include: {
                  bookings: {
                    include: {
                      user: { select: { id: true, name: true, email: true } },
                    },
                  },
                },
              },
            },
          },
        },
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Return empty array if database has issues
      return NextResponse.json([]);
    }

    // Flatten all bookings from all groups
    const allBookings: any[] = [];
    
    for (const membership of memberships) {
      const group = membership.group;
      for (const aircraft of group.aircraft) {
        for (const booking of aircraft.bookings) {
          allBookings.push({
            ...booking,
            aircraft: {
              ...aircraft,
              groupName: group.name,
            },
            groupName: group.name,
          });
        }
      }
    }

    // Sort by start time
    allBookings.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    return NextResponse.json(allBookings);
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    return NextResponse.json([]);
  }
}
