import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email") || "demo@demo.com"
  const password = searchParams.get("password") || "password123"
  
  try {
    console.log("Test login for:", email)
    console.log("Password provided:", password)
    
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    })
    
    if (!user) {
      return NextResponse.json({ error: "User not found", searchedEmail: email.trim().toLowerCase() }, { status: 401 })
    }
    
    if (!user.password) {
      return NextResponse.json({ error: "No password in DB" }, { status: 401 })
    }
    
    const isValid = await bcrypt.compare(password, user.password)
    
    return NextResponse.json({
      success: true,
      userFound: true,
      hasPassword: true,
      passwordValid: isValid,
      userEmail: user.email,
      storedPasswordLength: user.password.length,
      storedPasswordPrefix: user.password.substring(0, 10)
    })
  } catch (error) {
    console.error("Test login error:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
