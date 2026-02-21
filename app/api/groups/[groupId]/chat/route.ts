import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await params;

    // Verify user is a member of this group
    const users = await prisma.$queryRawUnsafe(`
      SELECT id, name FROM [User] WHERE email = '${session.user.email}'
    `) as any[];

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = users[0].id;

    // Check membership
    const memberships = await prisma.$queryRawUnsafe(`
      SELECT * FROM GroupMember WHERE userId = '${userId}' AND groupId = '${groupId}'
    `) as any[];

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }

    // Fetch messages with user info
    const messages = await prisma.$queryRawUnsafe(`
      SELECT 
        gcm.id,
        gcm.groupId,
        gcm.userId,
        gcm.message,
        gcm.createdAt,
        u.name as userName
      FROM GroupChatMessage gcm
      JOIN [User] u ON gcm.userId = u.id
      WHERE gcm.groupId = '${groupId}'
      ORDER BY gcm.createdAt DESC
      LIMIT 100
    `) as any[];

    // Transform messages to include user info
    const transformedMessages = (messages || []).reverse().map((msg: any) => {
      const initials = msg.userName 
        ? msg.userName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        : '??';
      
      // Generate color based on userId
      const colors = ['bg-primary', 'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
      const colorIndex = msg.userId.charCodeAt(0) % colors.length;
      
      return {
        id: msg.id,
        groupId: msg.groupId,
        userId: msg.userId,
        user: {
          name: msg.userName || 'Unknown',
          initials,
          color: colors[colorIndex]
        },
        message: msg.message,
        timestamp: msg.createdAt
      };
    });

    return NextResponse.json(transformedMessages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await params;
    const body = await request.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get user
    const users = await prisma.$queryRawUnsafe(`
      SELECT id, name FROM [User] WHERE email = '${session.user.email}'
    `) as any[];

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = users[0].id;
    const userName = users[0].name;

    // Check membership
    const memberships = await prisma.$queryRawUnsafe(`
      SELECT * FROM GroupMember WHERE userId = '${userId}' AND groupId = '${groupId}'
    `) as any[];

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }

    // Create message
    const messageId = crypto.randomUUID();
    await prisma.$executeRawUnsafe(`
      INSERT INTO GroupChatMessage (id, groupId, userId, message, createdAt)
      VALUES ('${messageId}', '${groupId}', '${userId}', '${message.replace(/'/g, "''")}', GETDATE())
    `);

    // Generate response
    const initials = userName 
      ? userName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
      : '??';
    
    const colors = ['bg-primary', 'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
    const colorIndex = userId.charCodeAt(0) % colors.length;

    const newMessage = {
      id: messageId,
      groupId,
      userId,
      user: {
        name: userName || 'Unknown',
        initials,
        color: colors[colorIndex]
      },
      message: message.trim(),
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('Error sending chat message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
