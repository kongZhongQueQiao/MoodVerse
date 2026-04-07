import { NextRequest, NextResponse } from "next/server";
import { getSessionEmail } from "@/app/lib/auth-session";
import { readAccounts } from "@/app/lib/accounts-store";
import { readAllMoodRecordsByUser, readMoodRecords } from "@/app/lib/mood-records";
import { readEngagementEvents } from "@/app/lib/engagement-events";
import { buildProductMetricsSnapshot } from "@/app/lib/product-metrics";
import { calculateCurrentStreak, calculateLongestStreak } from "@/app/lib/streak";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const email = await getSessionEmail(request);
  if (!email) {
    return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
  }

  const [accounts, recordsByUser, events, userRecords] = await Promise.all([
    readAccounts(),
    readAllMoodRecordsByUser(),
    readEngagementEvents(),
    readMoodRecords(email),
  ]);

  const metrics = buildProductMetricsSnapshot(accounts, recordsByUser, events);
  const currentStreak = calculateCurrentStreak(userRecords);
  const longestStreak = calculateLongestStreak(userRecords);

  return NextResponse.json({
    success: true,
    metrics,
    my: {
      currentStreak,
      longestStreak,
      records: userRecords.length,
    },
  });
}
