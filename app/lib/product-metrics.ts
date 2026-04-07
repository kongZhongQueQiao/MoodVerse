import type { Account } from "@/app/lib/accounts-store";
import type { MoodRecord } from "@/app/lib/mood-records";
import type { EngagementEvent } from "@/app/lib/engagement-events";
import { calculateCurrentStreak } from "@/app/lib/streak";

const DAY_MS = 24 * 60 * 60 * 1000;

export type ProductMetricsSnapshot = {
  firstRecordMinutesMedian: number | null;
  day7RetentionRate: number | null;
  medianCurrentStreakDays: number;
  weeklyReviewViewRate: number | null;
  import30DayRetentionRate: number | null;
  samples: {
    firstRecordUsers: number;
    day7CohortUsers: number;
    streakUsers: number;
    weeklyActiveUsers: number;
    importCohortUsers: number;
  };
};

const median = (values: number[]) => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return sorted[mid];
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const dayNumber = (value: string) => {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.floor(parsed / DAY_MS);
};

const hasRecordBetweenDays = (records: MoodRecord[], startDay: number, endDay: number) => {
  return records.some((record) => {
    const day = dayNumber(record.createdAt);
    return day != null && day >= startDay && day <= endDay;
  });
};

export function buildProductMetricsSnapshot(
  accounts: Account[],
  recordsByUser: Record<string, MoodRecord[]>,
  events: EngagementEvent[],
  now: Date = new Date(),
): ProductMetricsSnapshot {
  const nowDay = Math.floor(now.getTime() / DAY_MS);

  const firstRecordMins: number[] = [];
  const day7Cohort: string[] = [];
  let day7Retained = 0;
  const streaks: number[] = [];

  for (const account of accounts) {
    const email = normalizeEmail(account.email);
    const records = recordsByUser[email] ?? [];
    const signupMs = Date.parse(account.createdAt);

    if (records.length > 0 && Number.isFinite(signupMs)) {
      const firstRecord = records.reduce((earliest, current) => {
        const earliestMs = Date.parse(earliest.createdAt);
        const currentMs = Date.parse(current.createdAt);
        if (!Number.isFinite(currentMs)) return earliest;
        if (!Number.isFinite(earliestMs) || currentMs < earliestMs) return current;
        return earliest;
      }, records[0]);

      const firstRecordMs = Date.parse(firstRecord.createdAt);
      if (Number.isFinite(firstRecordMs) && firstRecordMs >= signupMs) {
        firstRecordMins.push((firstRecordMs - signupMs) / 60000);
      }
    }

    if (records.length > 0) {
      streaks.push(calculateCurrentStreak(records, now));
    }

    const signupDay = dayNumber(account.createdAt);
    if (signupDay == null) continue;
    if (nowDay - signupDay < 7) continue;

    day7Cohort.push(email);
    const retained = hasRecordBetweenDays(records, signupDay + 7, signupDay + 8);
    if (retained) day7Retained += 1;
  }

  const weeklyActiveUsers = new Set<string>();
  for (const [email, records] of Object.entries(recordsByUser)) {
    if (hasRecordBetweenDays(records, nowDay - 6, nowDay)) {
      weeklyActiveUsers.add(normalizeEmail(email));
    }
  }

  const weeklyReviewViewedUsers = new Set(
    events
      .filter((event) => event.type === "weekly_review_view")
      .filter((event) => {
        const day = dayNumber(event.createdAt);
        return day != null && day >= nowDay - 6 && day <= nowDay;
      })
      .map((event) => normalizeEmail(event.email)),
  );

  let importRetained = 0;
  const importCohortEmails = new Set<string>();

  for (const event of events) {
    if (event.type !== "import_completed") continue;
    const importDay = dayNumber(event.createdAt);
    if (importDay == null) continue;
    if (nowDay - importDay < 30) continue;

    const email = normalizeEmail(event.email);
    if (importCohortEmails.has(email)) continue;
    importCohortEmails.add(email);

    const records = recordsByUser[email] ?? [];
    if (hasRecordBetweenDays(records, importDay + 30, importDay + 37)) {
      importRetained += 1;
    }
  }

  return {
    firstRecordMinutesMedian: median(firstRecordMins),
    day7RetentionRate: day7Cohort.length ? (day7Retained / day7Cohort.length) * 100 : null,
    medianCurrentStreakDays: median(streaks) ?? 0,
    weeklyReviewViewRate: weeklyActiveUsers.size
      ? (Array.from(weeklyActiveUsers).filter((email) => weeklyReviewViewedUsers.has(email)).length / weeklyActiveUsers.size) * 100
      : null,
    import30DayRetentionRate: importCohortEmails.size ? (importRetained / importCohortEmails.size) * 100 : null,
    samples: {
      firstRecordUsers: firstRecordMins.length,
      day7CohortUsers: day7Cohort.length,
      streakUsers: streaks.length,
      weeklyActiveUsers: weeklyActiveUsers.size,
      importCohortUsers: importCohortEmails.size,
    },
  };
}
