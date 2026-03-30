import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const TOKEN_COOKIE = "mv_token";
const getSecret = () => new TextEncoder().encode(process.env.AUTH_SECRET ?? "mv-dev-secret");

async function isTokenValid(token?: string) {
  if (!token) return false;
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets and API routes without auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/image") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const valid = await isTokenValid(token);
  const isLoginPage = pathname === "/login";

  // If already authenticated and visiting login, send to home
  if (valid && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If not authenticated and visiting protected page, go to login
  if (!valid && !isLoginPage) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    if (token) {
      response.cookies.delete(TOKEN_COOKIE);
    }
    return response;
  }

  return NextResponse.next();
}
