import { NextResponse } from 'next/server';
import { auth, prisma } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: session.user.id },
        },
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        updatedAt: true,
        participants: { select: { user: { select: { id: true, name: true, username: true } } } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, body: true, createdAt: true, senderId: true },
        },
      },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Conversations GET failed', error);
    return NextResponse.json({ error: 'Failed to load conversations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const recipientId = (body?.userId || '').toString();
    if (!recipientId) {
      return NextResponse.json({ error: 'User is required' }, { status: 400 });
    }
    if (recipientId === session.user.id) {
      return NextResponse.json({ error: 'Cannot chat with yourself' }, { status: 400 });
    }

    const isFriend = await prisma.friendRequest.findFirst({
      where: {
        status: 'accepted',
        OR: [
          { requesterId: session.user.id, recipientId },
          { requesterId: recipientId, recipientId: session.user.id },
        ],
      },
    });

    if (!isFriend) {
      return NextResponse.json({ error: 'Friendship required' }, { status: 403 });
    }

    const existingConversation = await prisma.conversation.findFirst({
      where: {
        participants: { some: { userId: session.user.id } },
        AND: {
          participants: { some: { userId: recipientId } },
        },
        NOT: {
          participants: { some: { userId: { notIn: [session.user.id, recipientId] } } },
        },
      },
      select: { id: true },
    });

    if (existingConversation) {
      return NextResponse.json({ conversationId: existingConversation.id });
    }

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          createMany: {
            data: [
              { userId: session.user.id },
              { userId: recipientId },
            ],
          },
        },
      },
      select: { id: true },
    });

    return NextResponse.json({ conversationId: conversation.id });
  } catch (error) {
    console.error('Conversations POST failed', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}
