import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { createPasswordHash, readAccounts, saveAccounts, verifyPassword } from "@/app/lib/accounts-store";

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const TOKEN_COOKIE = "mv_token";
const TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

export const runtime = "nodejs";

const getSecret = () => new TextEncoder().encode(process.env.AUTH_SECRET ?? "mv-dev-secret");

async function issueToken(email: string) {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function POST(request: NextRequest) {
  let payload: { email?: unknown; password?: unknown; action?: unknown } = {};

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "请求体格式错误" },
      { status: 400 },
    );
  }

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const password = typeof payload.password === "string" ? payload.password : "";
  const action = payload.action === "create" ? "create" : "login";

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { success: false, message: "邮箱格式不正确" },
      { status: 400 },
    );
  }

  let accounts = await readAccounts();

  if (action === "create") {
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "密码需至少6位" },
        { status: 400 },
      );
    }

    if (accounts.some((account) => account.email === email)) {
      return NextResponse.json(
        { success: false, message: "该邮箱已存在" },
        { status: 409 },
      );
    }

    const nextAccounts = [
      ...accounts,
      {
        email,
        passwordHash: createPasswordHash(password),
        createdAt: new Date().toISOString(),
      },
    ];

    await saveAccounts(nextAccounts);

    const token = await issueToken(email);
    const response = NextResponse.json({ success: true, action: "create" });
    response.cookies.set({
      name: TOKEN_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: TOKEN_MAX_AGE_SECONDS,
    });

    return response;
  }

  accounts = await readAccounts();
  const account = accounts.find((item) => item.email === email);
  const validPassword = account && verifyPassword(password, account.passwordHash);

  if (validPassword) {
    const token = await issueToken(email);
    const response = NextResponse.json({ success: true, action: "login" });
    response.cookies.set({
      name: TOKEN_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: TOKEN_MAX_AGE_SECONDS,
    });

    return response;
  }

  return NextResponse.json(
    { success: false, message: "登录失败，邮箱或密码错误" },
    { status: 401 },
  );
}
