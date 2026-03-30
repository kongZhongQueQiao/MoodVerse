import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { readAccounts, saveAccounts } from "@/app/lib/accounts-store";

const TOKEN_COOKIE = "mv_token";

export const runtime = "nodejs";

const getSecret = () => new TextEncoder().encode(process.env.AUTH_SECRET ?? "mv-dev-secret");

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const email = typeof payload.email === "string" ? payload.email : "";

    if (!email) {
      return NextResponse.json({ success: false, message: "无效用户" }, { status: 400 });
    }

    const accounts = await readAccounts();
    const nextAccounts = accounts.filter((account) => account.email !== email);
    await saveAccounts(nextAccounts);

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: TOKEN_COOKIE,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch {
    return NextResponse.json({ success: false, message: "认证失效" }, { status: 401 });
  }
}
