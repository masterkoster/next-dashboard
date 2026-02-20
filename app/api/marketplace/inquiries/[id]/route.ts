import { NextResponse } from 'next/server';
import { auth, prisma } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id: inquiryId } = await params;
    const body = await request.json();
    const { status } = body;

    const validStatuses = ['unread', 'read', 'responded', 'archived'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Get the inquiry to verify ownership
    const inquiry = await prisma.aircraftInquiry.findUnique({
      where: { id: inquiryId },
      include: {
        listing: {
          select: { userId: true },
        },
      },
    });

    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    // Only the seller can update status
    if (inquiry.listing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const updated = await prisma.aircraftInquiry.update({
      where: { id: inquiryId },
      data: { status },
    });

    return NextResponse.json({ success: true, inquiry: updated });
  } catch (error) {
    console.error('Inquiry PATCH failed', error);
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 });
  }
}
