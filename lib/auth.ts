import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

// Singleton pattern to prevent multiple instances
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export const authOptions: any = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any) {
        console.log("Authorize called with:", credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials")
          return null
        }
        
        try {
          const user: any = await prisma.user.findUnique({
            where: { email: credentials.email as string }
          })
          
          console.log("User found:", !!user, "Has password:", !!user?.password)
          
          if (!user || !user.password) {
            console.log("No user or no password")
            return null
          }
          
          const isValid = await bcrypt.compare(
            credentials.password as string, 
            user.password
          )
          
          console.log("Password valid:", isValid)
          
          if (!isValid) return null
          
          return { id: user.id, email: user.email, name: user.name }
        } catch (error) {
          console.error("Authorize error:", error)
          throw error
        }
      }
    })
  ],
  session: { strategy: "jwt" as const },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id
      }
      return session
    }
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
