import { NextResponse } from 'next/server';
import { auth, prisma } from '@/lib/auth';
import { triggerPusher } from '@/lib/pusher-server';
import { rateLimit } from '@/lib/rate-limit';
import { validateE2eeEnvelopeString } from '@/lib/e2ee';

function getClientKey(request: Request, userId: string) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  return `${userId}:${ip}`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId: id, userId: session.user.id },
    });
    if (!participant) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        body: true,
        createdAt: true,
        senderId: true,
        sender: { select: { id: true, name: true, username: true } },
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Messages GET failed', error);
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const rl = rateLimit({ key: `message-send:${getClientKey(request, session.user.id)}`, limit: 60, windowMs: 60_000 });
    if (!rl.ok) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { id } = await params;
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId: id, userId: session.user.id },
    });
    if (!participant) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const validated = validateE2eeEnvelopeString(body?.body, { maxLen: 12_000 });
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: session.user.id,
        // Store ciphertext envelope JSON only (server cannot decrypt).
        body: validated.envelopeString,
      },
      select: {
        id: true,
        body: true,
        createdAt: true,
        senderId: true,
        sender: { select: { id: true, name: true, username: true } },
      },
    });

    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    await triggerPusher(`conversation-${id}`, 'new-message', { message });

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Messages POST failed', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
