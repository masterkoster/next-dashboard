import { auth } from "@/lib/auth";
import { prisma } from "@/lib/auth";
import { NextResponse } from "next/server";

// DELETE /api/auth/delete-account
// Requires authentication - deletes the user's account and all associated data
export async function DELETE() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Delete user's aircraft first (cascade should handle this, but being explicit)
    await prisma.userAircraft.deleteMany({
      where: { userId: session.user.id }
    });

    // Delete the user
    await prisma.user.delete({
      where: { email: session.user.email }
    });

    return NextResponse.json({ success: true, message: "Account deleted" });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
