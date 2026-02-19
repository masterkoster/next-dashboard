import { prisma } from "@/lib/auth";
import { NextResponse, NextRequest } from "next/server";

// GET /api/auth/verify-email
// Verifies a user's email address using the token from the email link
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      return NextResponse.redirect(
        new URL("/verify-email?error=missing-params", request.url)
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user with matching email and token
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.redirect(
        new URL("/verify-email?error=user-not-found", request.url)
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.redirect(
        new URL("/verify-email?success=already-verified", request.url)
      );
    }

    // Check if token matches
    if (user.verifyToken !== token) {
      return NextResponse.redirect(
        new URL("/verify-email?error=invalid-token", request.url)
      );
    }

    // Check if token expired (24 hours)
    if (user.verifyTokenExpiry && user.verifyTokenExpiry < new Date()) {
      return NextResponse.redirect(
        new URL("/verify-email?error=token-expired", request.url)
      );
    }

    // Verify the user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verifyToken: null,
        verifyTokenExpiry: null,
      },
    });

    // Redirect to success page
    return NextResponse.redirect(
      new URL("/verify-email?success=verified", request.url)
    );
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.redirect(
      new URL("/verify-email?error=server-error", request.url)
    );
  }
}
