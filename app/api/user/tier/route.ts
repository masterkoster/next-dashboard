import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        tier: true,
        role: true,
        subscriptionEnd: true,
        emailVerified: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Admins and owners always have Pro+ access
    const isAdmin = user.role === 'admin' || user.role === 'owner';
    
    // Check if subscription is still valid
    const isSubscriptionValid = user.subscriptionEnd 
      ? new Date(user.subscriptionEnd) > new Date()
      : user.tier === 'free';

    // Return proplus if user is admin/owner OR has valid proplus subscription
    const effectiveTier = isAdmin || (user.tier === 'proplus' && isSubscriptionValid) ? 'proplus' : (isSubscriptionValid ? user.tier : 'free');

    return NextResponse.json({
      tier: effectiveTier,
      subscriptionEnd: user.subscriptionEnd,
      emailVerified: user.emailVerified,
    });
  } catch (error) {
    console.error('Error fetching user tier:', error);
    return NextResponse.json({ error: 'Failed to fetch tier' }, { status: 500 });
  }
}
