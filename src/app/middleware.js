import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"

export async function middleware(req) {
  const token = await getToken({ req })

  // Redirect if not logged in
  if (!token) {
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }

  // Restrict admin routes
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
}