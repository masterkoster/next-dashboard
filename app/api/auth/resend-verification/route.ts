import { prisma } from "@/lib/auth";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

// POST /api/auth/resend-verification
// Resends the verification email to the user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Don't reveal whether user exists
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists, a verification email has been sent",
      });
    }

    // Already verified
    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: "Email is already verified",
      });
    }

    // Generate new token
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verifyToken,
        verifyTokenExpiry,
      },
    });

    // Send verification email
    const result = await sendVerificationEmail(
      normalizedEmail,
      verifyToken,
      user.username || user.name || "there"
    );

    if (!result.success) {
      console.error("Failed to send verification email:", result.error);
      // Still return success to not reveal system errors
    }

    return NextResponse.json({
      success: true,
      message: "Verification email sent",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
