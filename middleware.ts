import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Placeholder for authentication middleware
  // Example: Check for auth token and redirect to login if missing
  return NextResponse.next();
}

export const config = {
  matcher: ["/cuaderno-obra/:path*"],
};