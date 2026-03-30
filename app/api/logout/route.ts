import { NextResponse } from "next/server";

const TOKEN_COOKIE = "mv_token";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: TOKEN_COOKIE,
    value: "",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
  return response;
}
