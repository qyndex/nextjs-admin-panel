import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/", "/admin", "/users"];
const publicPaths = ["/auth/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (isPublic) {
    return NextResponse.next();
  }

  // Check if path is protected
  const isProtected =
    pathname === "/" ||
    protectedPaths.some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    );
  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for Supabase config
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // If Supabase is not configured, allow access (dev convenience)
    return NextResponse.next();
  }

  // Look for auth token in cookies
  const cookies = request.cookies;
  let hasSession = false;

  for (const [name] of cookies) {
    if (name.includes("auth-token")) {
      hasSession = true;
      break;
    }
  }

  // Also check Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    hasSession = true;
  }

  if (!hasSession) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};
