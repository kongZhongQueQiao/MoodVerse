type DateLikeRecord = {
  createdAt: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function toDayNumber(value: string) {
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return null;
  return Math.floor(time / DAY_MS);
}

function uniqueSortedDays(records: DateLikeRecord[]) {
  const daySet = new Set<number>();

  for (const record of records) {
    const day = toDayNumber(record.createdAt);
    if (day == null) continue;
    daySet.add(day);
  }

  return Array.from(daySet).sort((a, b) => b - a);
}

export function calculateCurrentStreak(records: DateLikeRecord[], now: Date = new Date()) {
  const days = uniqueSortedDays(records);
  if (days.length === 0) return 0;

  const today = Math.floor(now.getTime() / DAY_MS);
  const first = days[0];

  if (first < today - 1) {
    return 0;
  }

  let streak = 0;
  let cursor = first;

  for (const day of days) {
    if (day === cursor) {
      streak += 1;
      cursor -= 1;
      continue;
    }

    if (day < cursor) {
      break;
    }
  }

  return streak;
}

export function calculateLongestStreak(records: DateLikeRecord[]) {
  const ascDays = uniqueSortedDays(records).sort((a, b) => a - b);
  if (ascDays.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < ascDays.length; i += 1) {
    if (ascDays[i] === ascDays[i - 1] + 1) {
      current += 1;
      if (current > longest) longest = current;
      continue;
    }

    current = 1;
  }

  return longest;
}
