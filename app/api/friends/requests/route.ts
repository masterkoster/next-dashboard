import { NextResponse } from 'next/server';
import { auth, prisma } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const incoming = await prisma.friendRequest.findMany({
      where: { recipientId: session.user.id, status: 'pending' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        createdAt: true,
        requester: { select: { id: true, name: true, username: true } },
      },
    });

    const outgoing = await prisma.friendRequest.findMany({
      where: { requesterId: session.user.id, status: 'pending' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        createdAt: true,
        recipient: { select: { id: true, name: true, username: true } },
      },
    });

    return NextResponse.json({ incoming, outgoing });
  } catch (error) {
    console.error('Friend requests GET failed', error);
    return NextResponse.json({ error: 'Failed to load friend requests' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const recipientId = (body?.recipientId || '').toString();
    if (!recipientId) {
      return NextResponse.json({ error: 'Recipient is required' }, { status: 400 });
    }
    if (recipientId === session.user.id) {
      return NextResponse.json({ error: 'Cannot friend yourself' }, { status: 400 });
    }

    const existingDirect = await prisma.friendRequest.findFirst({
      where: {
        requesterId: session.user.id,
        recipientId,
      },
    });

    if (existingDirect?.status === 'pending') {
      return NextResponse.json({ error: 'Friend request already sent' }, { status: 409 });
    }

    if (existingDirect?.status === 'accepted') {
      return NextResponse.json({ error: 'Already friends' }, { status: 409 });
    }

    const existingReverse = await prisma.friendRequest.findFirst({
      where: {
        requesterId: recipientId,
        recipientId: session.user.id,
        status: 'pending',
      },
    });

    if (existingReverse) {
      return NextResponse.json({ error: 'They already sent you a request' }, { status: 409 });
    }

    const friendRequest = await prisma.friendRequest.create({
      data: {
        requesterId: session.user.id,
        recipientId,
        status: 'pending',
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        recipient: { select: { id: true, name: true, username: true } },
      },
    });

    return NextResponse.json({ request: friendRequest });
  } catch (error) {
    console.error('Friend request POST failed', error);
    return NextResponse.json({ error: 'Failed to send friend request' }, { status: 500 });
  }
}
