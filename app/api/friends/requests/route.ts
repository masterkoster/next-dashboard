import { NextResponse } from 'next/server';
import { auth, prisma } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { validateE2eeEnvelopeString } from '@/lib/e2ee';

function getClientKey(request: Request, userId: string) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  return `${userId}:${ip}`;
}

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
        initialMessageEnvelope: true,
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
        initialMessageEnvelope: true,
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

    const rl = rateLimit({ key: `friend-request:${getClientKey(request, session.user.id)}`, limit: 10, windowMs: 60_000 });
    if (!rl.ok) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    const recipientId = (body?.recipientId || '').toString().trim();
    if (!recipientId) {
      return NextResponse.json({ error: 'Recipient is required' }, { status: 400 });
    }
    if (recipientId === session.user.id) {
      return NextResponse.json({ error: 'Cannot friend yourself' }, { status: 400 });
    }

    const recipientExists = await prisma.user.findUnique({ where: { id: recipientId }, select: { id: true } });
    if (!recipientExists) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    let initialMessageEnvelope: string | null = null;
    if (body?.initialMessageEnvelope != null) {
      const validated = validateE2eeEnvelopeString(body.initialMessageEnvelope, { maxLen: 5_000 });
      if (!validated.ok) {
        return NextResponse.json({ error: validated.error }, { status: 400 });
      }

      // If they attach an encrypted initial message, ensure the recipient has an E2EE key set.
      const recipient = await prisma.user.findUnique({
        where: { id: recipientId },
        select: { id: true, e2eePublicKeyJwk: true },
      });

      // recipient existence already checked above
      if (!recipient) return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });

      if (!recipient.e2eePublicKeyJwk) {
        return NextResponse.json({ error: 'Recipient has not set an E2EE public key' }, { status: 409 });
      }

      initialMessageEnvelope = validated.envelopeString;
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
        initialMessageEnvelope,
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        initialMessageEnvelope: true,
        recipient: { select: { id: true, name: true, username: true } },
      },
    });

    return NextResponse.json({ request: friendRequest });
  } catch (error) {
    console.error('Friend request POST failed', error);
    return NextResponse.json({ error: 'Failed to send friend request' }, { status: 500 });
  }
}
