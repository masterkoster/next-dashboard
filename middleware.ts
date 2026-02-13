import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard")
  const isOnModules = req.nextUrl.pathname.startsWith("/modules")

  if (isOnDashboard || isOnModules) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/dashboard/:path*", "/modules/:path*"],
}
