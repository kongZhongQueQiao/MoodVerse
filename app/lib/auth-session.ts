import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";

const TOKEN_COOKIE = "mv_token";

const getSecret = () => new TextEncoder().encode(process.env.AUTH_SECRET ?? "mv-dev-secret");

export async function getSessionEmail(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    return email || null;
  } catch {
    return null;
  }
}
