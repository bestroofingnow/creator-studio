import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
  "/api/admin",
];

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/signin",
  "/register",
  "/pricing",
  "/api/auth",
  "/api/stripe/webhook",
];

// Protected page routes that require authentication
const protectedPageRoutes = [
  "/dashboard",
  "/account",
  "/admin",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes (exact match for "/" or startsWith for others)
  const isPublic = publicRoutes.some((route) =>
    route === "/" ? pathname === "/" : pathname.startsWith(route)
  );

  if (isPublic) {
    return NextResponse.next();
  }

  // Check if it's a protected API route
  const isProtectedApi = protectedApiRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedApi) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Check if it's a protected page route
  const isProtectedPage = protectedPageRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedPage) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      const url = new URL("/signin", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Allow all other requests
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match API routes and protected pages
    "/api/:path*",
    "/dashboard/:path*",
    "/account/:path*",
    "/admin/:path*",
  ],
};
