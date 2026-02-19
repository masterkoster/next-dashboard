import { NextResponse } from 'next/server';
import { auth, prisma } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const accepted = await prisma.friendRequest.findMany({
      where: {
        status: 'accepted',
        OR: [
          { requesterId: session.user.id },
          { recipientId: session.user.id },
        ],
      },
      select: {
        requesterId: true,
        recipientId: true,
        requester: { select: { id: true, name: true, username: true } },
        recipient: { select: { id: true, name: true, username: true } },
      },
    });

    const friends = accepted.map((item) => {
      return item.requesterId === session.user.id ? item.recipient : item.requester;
    });

    return NextResponse.json({ friends });
  } catch (error) {
    console.error('Friends GET failed', error);
    return NextResponse.json({ error: 'Failed to load friends' }, { status: 500 });
  }
}
