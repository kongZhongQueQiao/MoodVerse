import { NextRequest, NextResponse } from "next/server";
import { getSessionEmail } from "@/app/lib/auth-session";
import { appendEngagementEvent, type EngagementEventType } from "@/app/lib/engagement-events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_EVENTS = new Set<EngagementEventType>(["weekly_review_view"]);

export async function POST(request: NextRequest) {
  const email = await getSessionEmail(request);
  if (!email) {
    return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
  }

  let payload: { event?: unknown } = {};

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "请求体格式错误" }, { status: 400 });
  }

  const event = typeof payload.event === "string" ? payload.event : "";
  if (!ALLOWED_EVENTS.has(event as EngagementEventType)) {
    return NextResponse.json({ success: false, message: "不支持的事件类型" }, { status: 400 });
  }

  await appendEngagementEvent(email, event as EngagementEventType);
  return NextResponse.json({ success: true });
}
