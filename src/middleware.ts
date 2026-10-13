import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("tdc_session");
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");
  const isApiPath = request.nextUrl.pathname.startsWith("/api");

  // Allow API routes through
  if (isApiPath) {
    return NextResponse.next();
  }

  // If user is not authenticated and trying to view dashboard pages
  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user is already authenticated and visits login, send to dashboard
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};