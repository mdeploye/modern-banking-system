import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  // Let Auth.js resolve the secret from environment (AUTH_SECRET / NEXTAUTH_SECRET)
  const token = await getToken({
    req: request,
  })

  const isAuthPage = 
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register")

  const isCustomerPage = request.nextUrl.pathname.startsWith("/customer")
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin")
  
  // Redirect to login if accessing protected routes without auth
  if (!token && (isCustomerPage || isAdminPage)) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Redirect to appropriate dashboard if authenticated and accessing auth pages
  if (token && isAuthPage) {
    if (token.role === "CUSTOMER") {
      return NextResponse.redirect(new URL("/customer/dashboard", request.url))
    } else if (token.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }
  }

  // Role-based access control
  if (token) {
    if (isCustomerPage && token.role !== "CUSTOMER") {
      return NextResponse.redirect(new URL("/", request.url))
    }
    if (isAdminPage && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/customer/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
}
