import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// TEMPORARY: One-time endpoint to set owner role
// Remove after use!

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Find user by email and update role
    const result = await prisma.$queryRawUnsafe(`
      UPDATE [User] SET role = 'owner' WHERE email = '${email.toLowerCase()}'
    `);

    return NextResponse.json({ success: true, message: `Set role to owner for ${email}` });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
