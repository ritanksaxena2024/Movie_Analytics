import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt } from "./app/lib/auth";

const protectedRoutes = ["/api/dashboard-stats"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const token = req.cookies.get("token")?.value || null;
    
    console.log("Token from cookie:", token);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Add error handling and more detailed logging
    try {
      const payload = await verifyJwt<{ id: number; email: string; role: string }>(token);
      console.log("Decoded payload:", payload);
      
      if (!payload) {
        console.log("Token verification failed - invalid token");
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
      
      if (payload.role !== "client") {
        console.log("Access denied - role mismatch:", payload.role);
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Add the payload to request headers so it can be used in API routes
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-user-id', payload.id.toString());
      requestHeaders.set('x-user-email', payload.email);
      requestHeaders.set('x-user-role', payload.role);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
      
    } catch (error) {
      console.error("JWT verification error:", error);
      return NextResponse.json({ error: "Token verification failed" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};