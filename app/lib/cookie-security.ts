import type { NextRequest } from "next/server";

/**
 * Decide whether auth cookies should be marked as secure.
 *
 * Priority:
 * 1) COOKIE_SECURE env override: "true" | "false"
 * 2) x-forwarded-proto (reverse proxy)
 * 3) request URL protocol
 */
export function shouldUseSecureCookie(request: NextRequest): boolean {
  const override = process.env.COOKIE_SECURE?.trim().toLowerCase();
  if (override === "true") return true;
  if (override === "false") return false;

  // If current request URL is explicitly HTTP, never mark cookie as Secure.
  // This prevents browsers from rejecting Set-Cookie in plain HTTP deployments.
  if (request.nextUrl.protocol === "http:") {
    return false;
  }

  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
  if (forwardedProto) {
    return forwardedProto === "https";
  }

  return request.nextUrl.protocol === "https:";
}
