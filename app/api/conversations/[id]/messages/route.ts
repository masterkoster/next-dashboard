import { NextResponse } from 'next/server';
import { auth, prisma } from '@/lib/auth';
import { triggerPusher } from '@/lib/pusher-server';

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

    const { id } = await params;
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId: id, userId: session.user.id },
    });
    if (!participant) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const body = await request.json();
    const messageBody = (body?.body || '').toString().trim();
    if (!messageBody) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: session.user.id,
        body: messageBody.slice(0, 2000),
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
