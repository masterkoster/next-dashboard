import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import crypto from "crypto"
import { sendVerificationEmail } from "@/lib/email"

// Singleton pattern to prevent multiple instances
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    console.log("Signup attempt")
    
    const { name, email, password, username } = await request.json()
    
    if (!email || !password || !username) {
      return NextResponse.json(
        { error: "Username, email, and password are required" },
        { status: 400 }
      )
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }
    
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedUsername = username.toLowerCase()
    
    console.log("Checking existing email:", normalizedEmail)
    
    // Check if email exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })
    
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      )
    }
    
    // Check if username exists
    console.log("Checking username:", normalizedUsername)
    const existingUsername = await prisma.user.findUnique({
      where: { username: normalizedUsername }
    })
    
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already taken. Please choose another." },
        { status: 400 }
      )
    }
    
    console.log("Hashing password")
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Generate verification token
    const verifyToken = crypto.randomBytes(32).toString("hex")
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    
    const finalUsername = existingUsername ? username + Math.floor(Math.random() * 10000) : username
    
    console.log("Creating user with username:", normalizedUsername)
    const user = await prisma.user.create({
      data: {
        username: normalizedUsername,
        name: name || normalizedUsername,
        email: normalizedEmail,
        password: hashedPassword,
        purchasedModules: "[]",
        credits: 10,
        verifyToken,
        verifyTokenExpiry,
        // emailVerified is null by default (not verified)
      }
    })
    
    console.log("User created:", user.id)
    
    // Send verification email
    console.log("Sending verification email...")
    const emailResult = await sendVerificationEmail(
      normalizedEmail,
      verifyToken,
      user.name || finalUsername
    )
    
    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error)
      // Don't fail signup if email fails - user can resend later
    }
    
    return NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        email: user.email,
        username: user.username,
        emailVerified: user.emailVerified
      },
      message: "Account created! Please check your email to verify your account."
    })
  } catch (error) {
    console.error("Signup error:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
