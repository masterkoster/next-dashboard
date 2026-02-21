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
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }
    
    const { name, email, password, username } = body
    
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
    const normalizedUsername = username.trim().toLowerCase()

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    if (!emailOk) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const usernameOk = /^[a-z0-9_]{3,20}$/.test(normalizedUsername)
    if (!usernameOk) {
      return NextResponse.json(
        { error: 'Username must be 3-20 characters (a-z, 0-9, underscore)' },
        { status: 400 }
      )
    }
    
    // Check if email exists
    let existingEmail
    try {
      existingEmail = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      })
    } catch (dbError) {
      console.error("Database error checking email:", dbError)
      return NextResponse.json(
        { error: "Database error. Please try again." },
        { status: 500 }
      )
    }
    
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      )
    }
    
    // Check if username exists
    let existingUsername
    try {
      existingUsername = await prisma.user.findUnique({
        where: { username: normalizedUsername }
      })
    } catch (dbError) {
      console.error("Database error checking username:", dbError)
      return NextResponse.json(
        { error: "Database error. Please try again." },
        { status: 500 }
      )
    }
    
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already taken. Please choose another." },
        { status: 400 }
      )
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Generate verification token
    const verifyToken = crypto.randomBytes(32).toString("hex")
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    
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
    
    // Send verification email
    const emailResult = await sendVerificationEmail(
      normalizedEmail,
      verifyToken,
      user.name || normalizedUsername
    )
    
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error)
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
    // Check for specific Prisma/database errors
    if (errorMessage.includes('column') || errorMessage.includes('table')) {
      return NextResponse.json(
        { error: "Database schema mismatch. Please contact support." },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
