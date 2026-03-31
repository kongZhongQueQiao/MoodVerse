import type { MoodRecord } from "@/app/lib/mood-records";
import type { MoodKey } from "@/app/lib/mood-meta";

type MoodAnalytics = {
  trendConvergence: number;
  triggerTag: string;
  triggerContribution: number;
  breathingHabitRate: number;
  breathingImpact: number;
  bars: number[];
};

type DashboardAnalytics = {
  mood: MoodKey;
  alignmentScore: number;
  companionMoods: MoodKey[];
  awakePulseDelta: number;
  timeStability: number;
  avgHeartRate: number;
  avgSleepHours: number;
  avgEnergyKcal: number;
  avgStability: number;
  latestHeartRate: number;
  latestSleep: number;
  latestEnergyKcal: number;
  latestStability: number;
  moodDistribution: Record<MoodKey, number>;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const MOOD_SCORE_WEIGHT = {
  joy: 1.08,
  calm: 1.02,
  focus: 1,
  sad: 0.9,
} as const;

function toChronological(records: MoodRecord[]) {
  return [...records].reverse();
}

function calcVolatility(records: MoodRecord[]) {
  if (records.length < 3) return 0;

  const series: number[] = [];
  for (let i = 1; i < records.length; i += 1) {
    const prev = records[i - 1];
    const curr = records[i];
    const dStability = Math.abs(curr.stability - prev.stability);
    const dSleep = Math.abs(curr.sleep - prev.sleep);
    const dEnergy = Math.abs(curr.energy - prev.energy);
    const dHeart = Math.abs(curr.heartRate - prev.heartRate);

    series.push(dStability * 0.5 + dSleep * 0.2 + dEnergy * 0.2 + dHeart * 0.1);
  }

  const half = Math.max(1, Math.floor(series.length / 2));
  const early = series.slice(0, half);
  const late = series.slice(half);
  const avg = (items: number[]) => (items.length ? items.reduce((sum, n) => sum + n, 0) / items.length : 0);
  const earlyAvg = avg(early);
  const lateAvg = avg(late);

  if (earlyAvg <= 0) return 0;
  return clamp(Math.round(((earlyAvg - lateAvg) / earlyAvg) * 100), 0, 95);
}

function calcTriggerContribution(records: MoodRecord[]) {
  const pool = new Map<string, number>();
  let total = 0;

  for (const item of records) {
    const tags = item.tags.length ? item.tags : ["未标记"];
    const qualityScore =
      (item.stability * 0.52 + item.sleep * 0.24 + item.energy * 0.16 + (140 - item.heartRate) * 0.08) *
      MOOD_SCORE_WEIGHT[item.mood];
    const each = qualityScore / tags.length;

    for (const tag of tags) {
      const next = (pool.get(tag) ?? 0) + each;
      pool.set(tag, next);
      total += each;
    }
  }

  if (total <= 0 || pool.size === 0) {
    return { triggerTag: "未标记", triggerContribution: 0 };
  }

  let topTag = "工作成就";
  let topScore = 0;
  for (const [tag, score] of pool.entries()) {
    if (score > topScore) {
      topTag = tag;
      topScore = score;
    }
  }

  return {
    triggerTag: topTag,
    triggerContribution: clamp(Math.round((topScore / total) * 100), 12, 92),
  };
}

function calcBreathingImpact(records: MoodRecord[]) {
  if (!records.length) {
    return { breathingHabitRate: 0, breathingImpact: 0 };
  }

  const slowGroup = records.filter((item) => item.heartRate <= 90);
  const normalGroup = records.filter((item) => item.heartRate > 90);
  const avg = (items: MoodRecord[]) =>
    items.length ? items.reduce((sum, item) => sum + item.stability, 0) / items.length : 0;

  const habitRate = clamp(Math.round((slowGroup.length / records.length) * 100), 0, 100);
  const slowAvg = avg(slowGroup);
  const normalAvg = avg(normalGroup);
  const delta = normalGroup.length ? slowAvg - normalAvg : slowAvg - avg(records);
  const impact = clamp(Math.round(delta * 0.85 + habitRate * 0.12), 0, 42);

  return {
    breathingHabitRate: habitRate,
    breathingImpact: impact,
  };
}

function calcBars(records: MoodRecord[]) {
  const latestSeven = records.slice(0, 7).reverse();
  if (!latestSeven.length) {
    return [];
  }

  const normalized = latestSeven.map((item) => clamp(Math.round(item.stability), 20, 100));
  while (normalized.length < 7) {
    normalized.unshift(normalized[0] ?? 40);
  }

  return normalized;
}

function topCompanionMoods(records: MoodRecord[], topMood: MoodKey) {
  const pool = new Map<MoodKey, number>();
  for (const item of records) {
    if (item.mood === topMood) continue;
    pool.set(item.mood, (pool.get(item.mood) ?? 0) + 1);
  }

  const sorted = [...pool.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([mood]) => mood);

  const allMoods: MoodKey[] = ["calm", "focus", "sad", "joy"];
  const fallback = allMoods.filter((item) => item !== topMood);
  return [...sorted, ...fallback].slice(0, 2);
}

function toEnergyKcal(energy: number) {
  return Math.round((energy / 100) * 2800);
}

function calcMoodDistribution(records: MoodRecord[]) {
  const total = records.length;
  if (!total) {
    return {
      joy: 0,
      calm: 0,
      focus: 0,
      sad: 0,
    };
  }

  const counts: Record<MoodKey, number> = {
    joy: 0,
    calm: 0,
    focus: 0,
    sad: 0,
  };

  for (const item of records) {
    counts[item.mood] += 1;
  }

  return {
    joy: clamp(Math.round((counts.joy / total) * 100), 0, 100),
    calm: clamp(Math.round((counts.calm / total) * 100), 0, 100),
    focus: clamp(Math.round((counts.focus / total) * 100), 0, 100),
    sad: clamp(Math.round((counts.sad / total) * 100), 0, 100),
  };
}

function std(numbers: number[]) {
  if (numbers.length <= 1) return 0;
  const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  const variance = numbers.reduce((sum, n) => sum + (n - mean) ** 2, 0) / numbers.length;
  return Math.sqrt(variance);
}

function calcAwakePulseDelta(records: MoodRecord[]) {
  if (records.length < 2) return 0;

  const arousal = (item: MoodRecord) => item.energy * 0.6 + item.sleep * 0.25 + (140 - item.heartRate) * 0.15;
  const recent = records.slice(0, Math.min(3, records.length));
  const baseline = records.slice(Math.min(3, records.length), Math.min(10, records.length));

  const avg = (items: MoodRecord[]) => (items.length ? items.reduce((sum, item) => sum + arousal(item), 0) / items.length : 0);
  const recentAvg = avg(recent);
  const baselineAvg = avg(baseline.length ? baseline : records);

  if (baselineAvg <= 0) return 0;
  return clamp(Math.round(((recentAvg - baselineAvg) / baselineAvg) * 1000) / 10, -35, 35);
}

function calcTimeStability(records: MoodRecord[]) {
  if (!records.length) return 66;

  const sample = records.slice(0, 14);
  const stabilityStd = std(sample.map((item) => item.stability));
  const heartStd = std(sample.map((item) => item.heartRate));
  const avgSleep = sample.reduce((sum, item) => sum + item.sleep, 0) / sample.length;

  const score = 100 - stabilityStd * 2.1 - heartStd * 0.6 + avgSleep * 0.15;
  return clamp(Math.round(score), 20, 99);
}

export function buildMoodAnalytics(records: MoodRecord[]): MoodAnalytics {
  const sample = toChronological(records.slice(0, 32));
  if (!sample.length) {
    return {
      trendConvergence: 0,
      triggerTag: "未标记",
      triggerContribution: 0,
      breathingHabitRate: 0,
      breathingImpact: 0,
      bars: [],
    };
  }

  return {
    trendConvergence: calcVolatility(sample),
    ...calcTriggerContribution(sample),
    ...calcBreathingImpact(sample),
    bars: calcBars(records),
  };
}

export function buildDashboardAnalytics(records: MoodRecord[]): DashboardAnalytics {
  const sample = records.slice(0, 21);
  const latest = records[0];

  if (!latest || !sample.length) {
    return {
      mood: "joy",
      alignmentScore: 0,
      companionMoods: ["calm", "focus"],
      awakePulseDelta: 0,
      timeStability: 0,
      avgHeartRate: 0,
      avgSleepHours: 0,
      avgEnergyKcal: 0,
      avgStability: 0,
      latestHeartRate: 0,
      latestSleep: 0,
      latestEnergyKcal: 0,
      latestStability: 0,
      moodDistribution: {
        joy: 0,
        calm: 0,
        focus: 0,
        sad: 0,
      },
    };
  }

  const avgHeart = sample.reduce((sum, item) => sum + item.heartRate, 0) / sample.length;
  const avgSleep = sample.reduce((sum, item) => sum + item.sleep, 0) / sample.length;
  const avgEnergy = sample.reduce((sum, item) => sum + item.energy, 0) / sample.length;
  const avgStability = sample.reduce((sum, item) => sum + item.stability, 0) / sample.length;

  return {
    mood: latest.mood,
    alignmentScore: clamp(Math.round(latest.stability), 0, 100),
    companionMoods: topCompanionMoods(sample, latest.mood),
    awakePulseDelta: calcAwakePulseDelta(sample),
    timeStability: calcTimeStability(sample),
    avgHeartRate: Math.round(avgHeart),
    avgSleepHours: Math.round((avgSleep / 10) * 10) / 10,
    avgEnergyKcal: toEnergyKcal(avgEnergy),
    avgStability: clamp(Math.round(avgStability), 0, 100),
    latestHeartRate: Math.round(latest.heartRate),
    latestSleep: Math.round(latest.sleep),
    latestEnergyKcal: toEnergyKcal(latest.energy),
    latestStability: clamp(Math.round(latest.stability), 0, 100),
    moodDistribution: calcMoodDistribution(sample),
  };
}

export type { MoodAnalytics, DashboardAnalytics };
