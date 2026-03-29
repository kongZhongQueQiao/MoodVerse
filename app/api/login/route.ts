import { NextRequest, NextResponse } from "next/server";

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export async function POST(request: NextRequest) {
  let payload: { email?: unknown; password?: unknown } = {};

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "请求体格式错误" },
      { status: 400 },
    );
  }

  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const password = typeof payload.password === "string" ? payload.password : "";

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { success: false, message: "邮箱格式不正确" },
      { status: 400 },
    );
  }

  if (email === "example@gmail.com" && password === "123456") {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { success: false, message: "登录失败，邮箱或密码错误" },
    { status: 401 },
  );
}
