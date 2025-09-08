/** @format */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Allow public routes
  const publicPaths = [
    "/auth/sign-in",
    "/auth/sign-up",
    "/auth/callback",
    "/auth/reset-password",
    "/api",
    "/favicon.ico",
    "/opengraph-image",
    "/robots.txt",
    "/sitemap.xml",
    "/about",
    "/contact",
    "/faq",
    "/how-it-works",
    "/privacy-policy",
    "/terms",
  ];
  const { pathname } = request.nextUrl;
  if (
    publicPaths.some(
      (path) => pathname === path || pathname.startsWith(path + "/")
    )
  ) {
    return NextResponse.next();
  }

  // Check for session cookie (NextAuth.js default)
  const hasSession =
    request.cookies.get("next-auth.session-token") ||
    request.cookies.get("__Secure-next-auth.session-token");
  if (!hasSession) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|static|favicon.ico|opengraph-image|robots.txt|sitemap.xml|api).*)",
  ],
};
