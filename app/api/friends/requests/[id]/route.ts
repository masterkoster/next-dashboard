import { NextResponse } from 'next/server';
import { auth, prisma } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

function getClientKey(request: Request, userId: string) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  return `${userId}:${ip}`;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const rl = rateLimit({ key: `friend-request-action:${getClientKey(request, session.user.id)}`, limit: 30, windowMs: 60_000 });
    if (!rl.ok) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => null);
    const action = (body?.action || '').toString();
    const seedInitialMessage = body?.seedInitialMessage === true;

    const friendRequest = await prisma.friendRequest.findUnique({ where: { id } });
    if (!friendRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const isRecipient = friendRequest.recipientId === session.user.id;
    const isRequester = friendRequest.requesterId === session.user.id;

    if (action === 'accept') {
      if (!isRecipient) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }

      const updated = await prisma.friendRequest.update({
        where: { id },
        data: { status: 'accepted' },
      });

      const existingConversation = await prisma.conversation.findFirst({
        where: {
          participants: {
            some: { userId: friendRequest.requesterId },
          },
          AND: {
            participants: {
              some: { userId: friendRequest.recipientId },
            },
          },
          NOT: {
            participants: {
              some: { userId: { notIn: [friendRequest.requesterId, friendRequest.recipientId] } },
            },
          },
        },
        select: { id: true },
      });

      const conversationId = existingConversation?.id
        ? existingConversation.id
        : (
            await prisma.conversation.create({
              data: {
                participants: {
                  createMany: {
                    data: [
                      { userId: friendRequest.requesterId },
                      { userId: friendRequest.recipientId },
                    ],
                  },
                },
              },
              select: { id: true },
            })
          ).id;

      if (seedInitialMessage && friendRequest.initialMessageEnvelope) {
        const existingMessageCount = await prisma.message.count({ where: { conversationId } });
        if (existingMessageCount === 0) {
          await prisma.message.create({
            data: {
              conversationId,
              senderId: friendRequest.requesterId,
              body: friendRequest.initialMessageEnvelope,
            },
          });

          await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
          });
        }
      }

      return NextResponse.json({ request: updated, conversationId });
    }

    if (action === 'decline') {
      if (!isRecipient) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }
      const updated = await prisma.friendRequest.update({
        where: { id },
        data: { status: 'declined' },
      });
      return NextResponse.json({ request: updated });
    }

    if (action === 'cancel') {
      if (!isRequester) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }
      const updated = await prisma.friendRequest.update({
        where: { id },
        data: { status: 'cancelled' },
      });
      return NextResponse.json({ request: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Friend request PATCH failed', error);
    return NextResponse.json({ error: 'Failed to update friend request' }, { status: 500 });
  }
}
