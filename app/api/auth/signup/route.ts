import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

// Singleton pattern to prevent multiple instances
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    console.log("Signup attempt")
    
    const { name, email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }
    
    const normalizedEmail = email.trim().toLowerCase()
    
    console.log("Checking existing user:", normalizedEmail)
    
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      )
    }
    
    console.log("Hashing password")
    const hashedPassword = await bcrypt.hash(password, 10)
    
    console.log("Creating user")
    const user = await prisma.user.create({
      data: {
        name: name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        password: hashedPassword,
        purchasedModules: "[]",
        credits: 10
      }
    })
    
    console.log("User created:", user.id)
    
    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, email: user.email } 
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
