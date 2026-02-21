import { NextResponse } from 'next/server';
import { auth, prisma } from '@/lib/auth';
import { encryptMessage, getUserEncryptionKey } from '@/lib/server-encryption';

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
        listingId: true,
        participants: { select: { user: { select: { id: true, name: true, username: true } } } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, body: true, createdAt: true, senderId: true },
        },
      },
    });

    // Fetch listing info for conversations with listingId
    const listingIds = conversations.filter(c => c.listingId).map(c => c.listingId!);
    const listings = await prisma.marketplaceListing.findMany({
      where: { id: { in: listingIds } },
      select: { id: true, title: true, airportIcao: true },
    });
    const listingMap = Object.fromEntries(listings.map(l => [l.id, l]));

    const conversationsWithListings = conversations.map(c => ({
      id: c.id,
      updatedAt: c.updatedAt.toISOString(),
      listingId: c.listingId,
      listing: c.listingId ? listingMap[c.listingId] || null : null,
      participants: c.participants,
      messages: c.messages.map(m => ({ ...m, createdAt: m.createdAt.toISOString() })),
    }));

    return NextResponse.json({ conversations: conversationsWithListings });
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
    const listingId = (body?.listingId || '').toString();
    const initialMessage = body?.message as string | undefined;
    
    if (!recipientId) {
      return NextResponse.json({ error: 'User is required' }, { status: 400 });
    }
    if (recipientId === session.user.id) {
      return NextResponse.json({ error: 'Cannot chat with yourself' }, { status: 400 });
    }

    // Check if this is a marketplace inquiry (listingId provided) - no friendship required
    let isMarketplaceInquiry = false;
    let listingTitle = null;
    if (listingId) {
      const listing = await prisma.marketplaceListing.findUnique({
        where: { id: listingId },
        select: { id: true, userId: true, title: true },
      });
      if (listing && listing.userId === recipientId) {
        isMarketplaceInquiry = true;
        listingTitle = listing.title;
      }
    }

    // Only require friendship for non-marketplace conversations
    if (!isMarketplaceInquiry) {
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
    }

    // For marketplace conversations, check if conversation with this listing already exists
    // For friend conversations, check if a non-marketplace conversation exists
    let existingConversation = null;
    
    if (isMarketplaceInquiry && listingId) {
      // Look for existing marketplace conversation about this listing
      existingConversation = await prisma.conversation.findFirst({
        where: {
          listingId: listingId,
          participants: { some: { userId: session.user.id } },
          AND: {
            participants: { some: { userId: recipientId } },
          },
        },
        select: { id: true },
      });
    } else {
      // Look for existing friend conversation (no listingId)
      existingConversation = await prisma.conversation.findFirst({
        where: {
          listingId: null,
          participants: { some: { userId: session.user.id } },
          AND: {
            participants: { some: { userId: recipientId } },
          },
        },
        select: { id: true },
      });
    }

    if (existingConversation) {
      // If there's an initial message, send it to existing conversation
      if (initialMessage) {
        // Encrypt message for recipient
        const recipientKey = await getUserEncryptionKey(recipientId);
        const senderKey = await getUserEncryptionKey(session.user.id);
        const encryptedForRecipient = encryptMessage(initialMessage, recipientKey);
        const encryptedForSender = encryptMessage(initialMessage, senderKey);
        
        await prisma.message.create({
          data: {
            conversationId: existingConversation.id,
            senderId: session.user.id,
            body: encryptedForRecipient,
            bodyForSender: encryptedForSender,
          },
        });
      }
      return NextResponse.json({ 
        conversationId: existingConversation.id,
        isMarketplace: isMarketplaceInquiry,
        listingTitle 
      });
    }

    const conversation = await prisma.conversation.create({
      data: {
        listingId: isMarketplaceInquiry ? listingId : null,
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

    // Send initial message if provided
    if (initialMessage) {
      // Encrypt message for recipient
      const recipientKey = await getUserEncryptionKey(recipientId);
      const senderKey = await getUserEncryptionKey(session.user.id);
      const encryptedForRecipient = encryptMessage(initialMessage, recipientKey);
      const encryptedForSender = encryptMessage(initialMessage, senderKey);
      
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: session.user.id,
          body: encryptedForRecipient,
          bodyForSender: encryptedForSender,
        },
      });
    }

    return NextResponse.json({ 
      conversationId: conversation.id,
      isMarketplace: isMarketplaceInquiry,
      listingTitle 
    });
  } catch (error) {
    console.error('Conversations POST failed', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}
