/** @format */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes
const protectedRoutes = ["/admin", "/profile"];
const adminRoutes = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Get auth tokens from cookies or headers
    const accessToken =
      request.cookies.get("access_token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    console.log("Middleware - URL:", request.url);
    console.log("Middleware - Hostname:", request.nextUrl.hostname);
    console.log(
      "Middleware - All cookies:",
      request.cookies
        .getAll()
        .map((c) => `${c.name}=${c.value.substring(0, 20)}...`)
    );
    console.log(
      "Middleware - access token:",
      accessToken ? `${accessToken.substring(0, 20)}...` : "undefined"
    );

    if (!accessToken) {
      // Redirect to sign-in if no token
      const signInUrl = new URL("/auth/sign-in", request.url);
      signInUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // For admin routes, we could add additional checks here
    // Note: JWT verification would require the secret key which should be done server-side
    if (isAdminRoute) {
      // Additional admin checks could go here
      // For now, we'll let the component handle role-based access
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: ["/admin/:path*", "/profile/:path*"],
};
