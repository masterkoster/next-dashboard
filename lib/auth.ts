import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error"] : ["error"],
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Auth secret - use env or fallback
const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret-change-in-production-12345"
const siteUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || "https://next-dashboard-davids-projects.vercel.app"

export const authOptions: any = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any) {
        console.log("Authorize called with:", credentials?.username)
        
        if (!credentials?.username || !credentials?.password) {
          console.log("Missing credentials")
          return null
        }
        
        try {
          const input = (credentials.username as string).trim().toLowerCase()
          
          // Try to find user by username first, then by email
          let user: any = await prisma.user.findUnique({
            where: { username: input }
          })
          
          // If not found by username, try email (for backward compatibility)
          if (!user) {
            user = await prisma.user.findUnique({
              where: { email: input }
            })
          }
          
          console.log("User found:", !!user, "Has password:", !!user?.password)
          
          if (!user || !user.password) {
            console.log("No user or no password")
            return null
          }
          
          let isValid = false
          
          // Check if password is bcrypt hash (starts with $2) or plain text
          if (user.password.startsWith('$2')) {
            // It's a hashed password
            isValid = await bcrypt.compare(credentials.password as string, user.password)
          } else {
            // Plain text password - direct comparison
            isValid = user.password === credentials.password
            // If valid, upgrade to hashed password
            if (isValid) {
              const hashed = await bcrypt.hash(credentials.password as string, 10)
              await prisma.user.update({
                where: { id: user.id },
                data: { password: hashed }
              })
            }
          }
          
          console.log("Password valid:", isValid)
          
          if (!isValid) return null
          
          return { 
            id: user.id, 
            email: user.email, 
            name: user.name,
            username: user.username,
            emailVerified: user.emailVerified,
            role: user.role 
          }
        } catch (error) {
          console.error("Authorize error:", error)
          throw error
        }
      }
    })
  ],
  secret: authSecret,
  url: siteUrl,
  session: { 
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: { signIn: "/login" },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      },
    },
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.emailVerified = user.emailVerified
        token.role = user.role
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id
        session.user.username = token.username
        session.user.emailVerified = token.emailVerified
        session.user.role = token.role
      }
      return session
    }
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
export { prisma }
