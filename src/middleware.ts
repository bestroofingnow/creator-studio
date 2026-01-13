import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Protected API routes that require authentication
const protectedApiRoutes = [
  "/api/chat",
  "/api/generate",
  "/api/analyze",
  "/api/transcribe",
  "/api/edit",
  "/api/search",
  "/api/credits",
  "/api/user",
  "/api/stripe/checkout",
  "/api/stripe/portal",
];

// Public routes that don't require authentication
const publicRoutes = [
  "/login",
  "/pricing",
  "/api/auth",
  "/api/stripe/webhook",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if it's a protected API route
  const isProtectedApi = protectedApiRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedApi && !req.auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Allow all other requests
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match API routes
    "/api/:path*",
    // Exclude static files and images
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
