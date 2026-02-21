import { NextResponse } from 'next/server';
import { auth, prisma } from '@/lib/auth';
import { triggerPusher } from '@/lib/pusher-server';
import { rateLimit } from '@/lib/rate-limit';
import { encryptMessage, decryptMessage, getUserEncryptionKey } from '@/lib/server-encryption';

function getClientKey(request: Request, userId: string) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  return `${userId}:${ip}`;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      console.log('Messages GET: Not authenticated');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const currentUserId = session.user.id;
    
    // Get current user's encryption key
    let currentUserKey: string;
    try {
      currentUserKey = await getUserEncryptionKey(currentUserId);
    } catch (e) {
      // User doesn't have an encryption key yet - generate one
      const { createUserEncryptionKey } = await import('@/lib/server-encryption');
      currentUserKey = await createUserEncryptionKey(currentUserId);
    }
    
    // Get conversation to find other participants
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: { select: { id: true } }
          }
        }
      }
    });
    
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    
    const participant = conversation.participants.find(p => p.userId === currentUserId);
    if (!participant) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Get all messages
    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        body: true,
        bodyForSender: true,
        createdAt: true,
        senderId: true,
        sender: { select: { id: true, name: true, username: true } },
      },
    });

    // Decrypt messages for current user
    const decryptedMessages = await Promise.all(messages.map(async (m) => {
      let decryptedBody = '';
      
      // Try to decrypt with current user's key (they might be recipient or sender)
      if (m.body) {
        try {
          decryptedBody = decryptMessage(m.body, currentUserKey);
        } catch (e) {
          // If decrypt fails, try the sender copy
          if (m.bodyForSender) {
            try {
              decryptedBody = decryptMessage(m.bodyForSender, currentUserKey);
            } catch (e2) {
              // Both fail - return encrypted blob as-is
              decryptedBody = m.body;
            }
          } else {
            decryptedBody = m.body;
          }
        }
      }
      
      return {
        id: m.id,
        body: decryptedBody,
        createdAt: m.createdAt.toISOString(),
        senderId: m.senderId,
        sender: m.sender,
      };
    }));

    return NextResponse.json({ messages: decryptedMessages });
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
    const senderId = session.user.id;
    
    // Get conversation to find recipient
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: { select: { id: true } }
          }
        }
      }
    });
    
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    
    const participant = conversation.participants.find(p => p.userId === senderId);
    if (!participant) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    
    // Find the recipient (the other participant)
    const recipient = conversation.participants.find(p => p.userId !== senderId);
    if (!recipient) {
      return NextResponse.json({ error: 'No recipient found' }, { status: 400 });
    }
    
    const recipientId = recipient.userId;
    const body = await request.json().catch(() => null);
    const messageText = body?.body;
    
    // Validate message body
    if (!messageText || typeof messageText !== 'string' || messageText.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    
    if (messageText.length > 12_000) {
      return NextResponse.json({ error: 'Message too long (max 12000 characters)' }, { status: 400 });
    }
    
    const plaintext = messageText.trim();
    
    // Get sender's key
    let senderKey: string;
    try {
      senderKey = await getUserEncryptionKey(senderId);
    } catch (e) {
      const { createUserEncryptionKey } = await import('@/lib/server-encryption');
      senderKey = await createUserEncryptionKey(senderId);
    }
    
    // Get recipient's key
    let recipientKey: string;
    try {
      recipientKey = await getUserEncryptionKey(recipientId);
    } catch (e) {
      const { createUserEncryptionKey } = await import('@/lib/server-encryption');
      recipientKey = await createUserEncryptionKey(recipientId);
    }
    
    // Encrypt message for recipient
    const encryptedForRecipient = encryptMessage(plaintext, recipientKey);
    
    // Encrypt message for sender (so they can read their own messages)
    const encryptedForSender = encryptMessage(plaintext, senderKey);

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: session.user.id,
        body: encryptedForRecipient,
        bodyForSender: encryptedForSender,
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

    // Return decrypted message to the sender for immediate display
    const returnMessage = {
      ...message,
      body: plaintext,
      createdAt: message.createdAt.toISOString(),
    };

    await triggerPusher(`conversation-${id}`, 'new-message', { message: returnMessage });

    return NextResponse.json({ message: returnMessage });
  } catch (error) {
    console.error('Messages POST failed', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
