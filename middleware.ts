import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip auth check for public routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/"
  ) {
    return NextResponse.next()
  }
  
  // Check for auth token
  const authToken = request.cookies.get("next-auth.session-token")
  
  if (!authToken && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/modules/:path*"
  ],
}
