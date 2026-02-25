import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRow = await prisma.$queryRawUnsafe(`
      SELECT id FROM [User] WHERE email = '${session.user.email}'
    `) as any[];

    if (!userRow || userRow.length === 0) {
      return NextResponse.json({ error: '[User] not found' }, { status: 404 });
    }

    const userId = userRow[0].id;

    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get('days') || '7';
    const now = new Date();
    const windowEnd = daysParam === 'all'
      ? null
      : new Date(now.getTime() + Number(daysParam) * 24 * 60 * 60 * 1000);

    const startFilter = now.toISOString();
    const endFilter = windowEnd ? windowEnd.toISOString() : null;

    const bookings = await prisma.$queryRawUnsafe(`
      SELECT 
        b.id, b.aircraftId, b.userId, b.startTime, b.endTime, b.purpose, b.createdAt, b.updatedAt,
        a.nNumber, a.customName, a.nickname, a.make, a.model, a.groupId as aircraftGroupId,
        g.name as groupName,
        u.name as userName, u.email as userEmail
      FROM Booking b
      JOIN ClubAircraft a ON b.aircraftId = a.id
      JOIN [User] u ON b.userId = u.id
      JOIN FlyingGroup g ON a.groupId = g.id
      JOIN GroupMember gm ON gm.groupId = g.id AND gm.userId = '${userId}'
      WHERE b.userId = '${userId}'
        AND b.startTime >= '${startFilter}'
        ${endFilter ? `AND b.startTime <= '${endFilter}'` : ''}
      ORDER BY b.startTime ASC
    `) as any[];

    const formattedBookings = (bookings || []).map((b: any) => ({
      id: b.id,
      aircraftId: b.aircraftId,
      userId: b.userId,
      startTime: b.startTime,
      endTime: b.endTime,
      purpose: b.purpose,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      groupId: b.aircraftGroupId,
      groupName: b.groupName,
      aircraft: {
        id: b.aircraftId,
        nNumber: b.nNumber,
        customName: b.customName,
        nickname: b.nickname,
        make: b.make,
        model: b.model,
        groupId: b.aircraftGroupId,
      },
      user: {
        id: b.userId,
        name: b.userName,
        email: b.userEmail,
      },
      source: 'club',
    }));

    const personalRows = await prisma.$queryRawUnsafe(`
      SELECT 
        pb.id, pb.userId, pb.userAircraftId, pb.startTime, pb.endTime, pb.purpose, pb.createdAt, pb.updatedAt,
        ua.nNumber, ua.nickname
      FROM PersonalBooking pb
      JOIN UserAircraft ua ON pb.userAircraftId = ua.id
      WHERE pb.userId = '${userId}'
        AND pb.startTime >= '${startFilter}'
        ${endFilter ? `AND pb.startTime <= '${endFilter}'` : ''}
      ORDER BY pb.startTime ASC
    `) as any[];

    const personalBookings = (personalRows || []).map((b: any) => ({
      id: b.id,
      userId: b.userId,
      userAircraftId: b.userAircraftId,
      startTime: b.startTime,
      endTime: b.endTime,
      purpose: b.purpose,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      aircraft: {
        id: b.userAircraftId,
        nNumber: b.nNumber,
        nickname: b.nickname,
      },
      source: 'personal',
    }));

    return NextResponse.json({ bookings: [...formattedBookings, ...personalBookings] });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
