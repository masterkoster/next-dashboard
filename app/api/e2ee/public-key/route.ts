import { NextResponse } from 'next/server';
import { auth, prisma } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { validateEcdhP256PublicJwk } from '@/lib/e2ee';

function getClientKey(request: Request, userId: string) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  return `${userId}:${ip}`;
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, e2eePublicKeyJwk: true, e2eePublicKeyUpdatedAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.e2eePublicKeyJwk) {
      return NextResponse.json({ error: 'Public key not set' }, { status: 404 });
    }

    let publicKeyJwk: unknown;
    try {
      publicKeyJwk = JSON.parse(user.e2eePublicKeyJwk);
    } catch {
      return NextResponse.json({ error: 'Stored public key is invalid' }, { status: 500 });
    }

    return NextResponse.json({
      userId: user.id,
      publicKeyJwk,
      updatedAt: user.e2eePublicKeyUpdatedAt,
    });
  } catch (error) {
    console.error('E2EE public key GET failed', error);
    return NextResponse.json({ error: 'Failed to load public key' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const rl = rateLimit({ key: `e2ee-pk-set:${getClientKey(request, session.user.id)}`, limit: 5, windowMs: 60_000 });
    if (!rl.ok) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    const check = validateEcdhP256PublicJwk(body?.publicKeyJwk);
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        e2eePublicKeyJwk: JSON.stringify(check.jwk),
        e2eePublicKeyUpdatedAt: new Date(),
      },
      select: { id: true, e2eePublicKeyUpdatedAt: true },
    });

    return NextResponse.json({
      userId: updated.id,
      updatedAt: updated.e2eePublicKeyUpdatedAt,
    });
  } catch (error) {
    console.error('E2EE public key PUT failed', error);
    return NextResponse.json({ error: 'Failed to set public key' }, { status: 500 });
  }
}
