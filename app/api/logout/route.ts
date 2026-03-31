import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { shouldUseSecureCookie } from "@/app/lib/cookie-security";

const TOKEN_COOKIE = "mv_token";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const secure = shouldUseSecureCookie(request);
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: TOKEN_COOKIE,
    value: "",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure,
    maxAge: 0,
  });
  return response;
}
