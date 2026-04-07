import { NextRequest, NextResponse } from "next/server";
import { getSessionEmail } from "@/app/lib/auth-session";
import { importMoodRecords, type ImportedMoodRecordInput } from "@/app/lib/mood-records";
import { appendEngagementEvent } from "@/app/lib/engagement-events";
import type { MoodKey } from "@/app/lib/mood-meta";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_MOODS = new Set<MoodKey>(["joy", "calm", "focus", "sad"]);

const toNumber = (value: unknown) => (typeof value === "number" ? value : Number.NaN);

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, Math.round(value)));

export async function POST(request: NextRequest) {
  const email = await getSessionEmail(request);
  if (!email) {
    return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
  }

  let payload: { records?: unknown; source?: unknown } = {};

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "请求体格式错误" }, { status: 400 });
  }

  const recordsInput = Array.isArray(payload.records) ? payload.records : null;
  if (!recordsInput || recordsInput.length === 0) {
    return NextResponse.json({ success: false, message: "请提供要导入的记录数组" }, { status: 400 });
  }

  if (recordsInput.length > 1200) {
    return NextResponse.json({ success: false, message: "单次导入最多 1200 条" }, { status: 400 });
  }

  const normalized: ImportedMoodRecordInput[] = [];

  for (const item of recordsInput) {
    if (!item || typeof item !== "object") {
      return NextResponse.json({ success: false, message: "导入记录格式不正确" }, { status: 400 });
    }

    const row = item as Record<string, unknown>;
    const mood = typeof row.mood === "string" ? (row.mood as MoodKey) : undefined;
    const heartRate = toNumber(row.heartRate);
    const sleep = toNumber(row.sleep);
    const energy = toNumber(row.energy);
    const stability = toNumber(row.stability);

    if (!mood || !VALID_MOODS.has(mood)) {
      return NextResponse.json({ success: false, message: "检测到无效 mood" }, { status: 400 });
    }

    if (!Number.isFinite(heartRate) || !Number.isFinite(sleep) || !Number.isFinite(energy) || !Number.isFinite(stability)) {
      return NextResponse.json({ success: false, message: "检测到无效数值字段" }, { status: 400 });
    }

    const tags = Array.isArray(row.tags)
      ? row.tags.filter((tag): tag is string => typeof tag === "string").map((tag) => tag.trim()).filter(Boolean)
      : [];

    normalized.push({
      mood,
      heartRate: clamp(heartRate, 40, 140),
      sleep: clamp(sleep, 10, 100),
      energy: clamp(energy, 10, 100),
      stability: clamp(stability, 20, 100),
      note: typeof row.note === "string" ? row.note.trim().slice(0, 1000) : "",
      tags,
      createdAt: typeof row.createdAt === "string" ? row.createdAt : undefined,
    });
  }

  const source = typeof payload.source === "string" && payload.source.trim() ? payload.source.trim().slice(0, 48) : "external";
  const result = await importMoodRecords(email, normalized);

  await appendEngagementEvent(email, "import_completed", {
    source,
    count: normalized.length,
  });

  return NextResponse.json({
    success: true,
    importedCount: result.importedCount,
    totalCount: result.totalCount,
    message: "导入完成",
  });
}
