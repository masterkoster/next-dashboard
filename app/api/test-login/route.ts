import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    console.log("Test login for:", email)
    console.log("Password provided:", password)
    
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    })
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }
    
    if (!user.password) {
      return NextResponse.json({ error: "No password" }, { status: 401 })
    }
    
    const isValid = await bcrypt.compare(password, user.password)
    
    return NextResponse.json({
      success: true,
      userFound: true,
      hasPassword: true,
      passwordValid: isValid,
      userEmail: user.email,
      storedPasswordLength: user.password.length
    })
  } catch (error) {
    console.error("Test login error:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
