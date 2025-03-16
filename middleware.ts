import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function middleware(request: NextRequest) {
  // Create a Supabase client
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
    },
  })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes
  const protectedRoutes = ["/upload", "/gallery"]
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Auth routes
  const authRoutes = ["/login", "/register"]
  const isAuthRoute = authRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Redirect logic
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/gallery", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/upload/:path*", "/gallery/:path*", "/login", "/register"],
}

