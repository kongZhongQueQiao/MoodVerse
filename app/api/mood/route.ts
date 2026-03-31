import { NextRequest, NextResponse } from "next/server";
import { clearMoodRecords, createMoodRecord, readMoodRecords } from "@/app/lib/mood-records";
import { buildDashboardAnalytics, buildMoodAnalytics } from "@/app/lib/mood-analytics";
import type { MoodKey } from "@/app/lib/mood-meta";
import { getSessionEmail } from "@/app/lib/auth-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_MOODS = new Set<MoodKey>(["joy", "calm", "focus", "sad"]);

const toNumber = (value: unknown) => (typeof value === "number" ? value : Number.NaN);

export async function GET(request: NextRequest) {
  const email = await getSessionEmail(request);
  if (!email) {
    return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
  }

  const records = await readMoodRecords(email);
  const latest = records[0] ?? null;
  const analytics = buildMoodAnalytics(records);
  const dashboard = buildDashboardAnalytics(records);

  return NextResponse.json({
    success: true,
    count: records.length,
    latest: latest
      ? {
          mood: latest.mood,
          heartRate: latest.heartRate,
          sleep: latest.sleep,
          energy: latest.energy,
          stability: latest.stability,
          createdAt: latest.createdAt,
        }
      : null,
    analytics,
    dashboard,
  });
}

export async function POST(request: NextRequest) {
  const email = await getSessionEmail(request);
  if (!email) {
    return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
  }

  let payload: Record<string, unknown> = {};

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "请求体格式错误" }, { status: 400 });
  }

  const mood = typeof payload.mood === "string" ? (payload.mood as MoodKey) : undefined;
  const heartRate = toNumber(payload.heartRate);
  const sleep = toNumber(payload.sleep);
  const energy = toNumber(payload.energy);
  const stability = toNumber(payload.stability);
  const note = typeof payload.note === "string" ? payload.note.trim() : "";
  const tags = Array.isArray(payload.tags)
    ? payload.tags.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)
    : [];

  if (!mood || !VALID_MOODS.has(mood)) {
    return NextResponse.json({ success: false, message: "无效的心情类型" }, { status: 400 });
  }

  if (!Number.isFinite(heartRate) || heartRate < 40 || heartRate > 140) {
    return NextResponse.json({ success: false, message: "心率范围无效" }, { status: 400 });
  }

  if (!Number.isFinite(sleep) || sleep < 10 || sleep > 100) {
    return NextResponse.json({ success: false, message: "睡眠范围无效" }, { status: 400 });
  }

  if (!Number.isFinite(energy) || energy < 10 || energy > 100) {
    return NextResponse.json({ success: false, message: "能量范围无效" }, { status: 400 });
  }

  if (!Number.isFinite(stability) || stability < 20 || stability > 100) {
    return NextResponse.json({ success: false, message: "稳定性范围无效" }, { status: 400 });
  }

  const { count } = await createMoodRecord(email, {
    mood,
    heartRate: Math.round(heartRate),
    sleep: Math.round(sleep),
    energy: Math.round(energy),
    stability: Math.round(stability),
    note,
    tags,
  });

  return NextResponse.json({ success: true, count, message: "记录成功" });
}

export async function DELETE(request: NextRequest) {
  const email = await getSessionEmail(request);
  if (!email) {
    return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
  }

  const { removedCount } = await clearMoodRecords(email);
  return NextResponse.json({ success: true, removedCount, message: "个人心情数据已清除" });
}
