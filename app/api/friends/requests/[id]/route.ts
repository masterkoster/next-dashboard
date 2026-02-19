import { NextResponse } from 'next/server';
import { auth, prisma } from '@/lib/auth';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const action = (body?.action || '').toString();

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
      });

      if (!existingConversation) {
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
        });
      }

      return NextResponse.json({ request: updated });
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
