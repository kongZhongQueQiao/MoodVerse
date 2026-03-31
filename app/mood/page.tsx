"use client";

import { AppShell } from "@/app/components/app-shell";
import { MoodPlanet } from "@/app/components/mood-planet";
import { useEffect, useMemo, useState } from "react";
import { MOOD_META, type MoodKey } from "@/app/lib/mood-meta";

type MoodAnalytics = {
  trendConvergence: number;
  triggerTag: string;
  triggerContribution: number;
  breathingHabitRate: number;
  breathingImpact: number;
  bars: number[];
};

type MoodSummaryResponse = {
  success?: boolean;
  count?: number;
  latest?: {
    mood?: MoodKey;
    stability?: number;
  } | null;
  analytics?: MoodAnalytics;
};

const fallbackAnalytics: MoodAnalytics = {
  trendConvergence: 0,
  triggerTag: "未标记",
  triggerContribution: 0,
  breathingHabitRate: 0,
  breathingImpact: 0,
  bars: [],
};

export default function MoodPage() {
  const [moodKey, setMoodKey] = useState<MoodKey>("joy");
  const [score, setScore] = useState(0);
  const [count, setCount] = useState(0);
  const [analytics, setAnalytics] = useState<MoodAnalytics>(fallbackAnalytics);

  useEffect(() => {
    let active = true;

    const loadLatestMood = async () => {
      try {
        const response = await fetch("/api/mood", { cache: "no-store" });
        if (!response.ok) return;

        const data = (await response.json()) as MoodSummaryResponse;
        if (!active || !data.success) return;

        const nextMood = data.latest?.mood;
        if (nextMood && MOOD_META[nextMood]) {
          setMoodKey(nextMood);
        }

        if (typeof data.latest?.stability === "number") {
          const safeScore = Math.max(0, Math.min(100, Math.round(data.latest.stability)));
          setScore(safeScore);
        }

        if (data.analytics) {
          setAnalytics({
            trendConvergence: Math.max(0, Math.min(95, Math.round(data.analytics.trendConvergence))),
            triggerTag: data.analytics.triggerTag || "未标记",
            triggerContribution: Math.max(0, Math.min(99, Math.round(data.analytics.triggerContribution))),
            breathingHabitRate: Math.max(0, Math.min(100, Math.round(data.analytics.breathingHabitRate))),
            breathingImpact: Math.max(0, Math.min(42, Math.round(data.analytics.breathingImpact))),
            bars: Array.isArray(data.analytics.bars) && data.analytics.bars.length
              ? data.analytics.bars.slice(0, 7)
              : [],
          });
        }

        setCount(typeof data.count === "number" ? data.count : 0);
      } catch {
        // ignore and keep defaults
      }
    };

    void loadLatestMood();

    return () => {
      active = false;
    };
  }, []);

  const mood = useMemo(() => MOOD_META[moodKey], [moodKey]);

  return (
    <AppShell
      title={
        <>
          <span style={{ color: mood.color }}>{mood.label}</span>
          <span>行星</span>
        </>
      }
      subtitle={`当前已累计记录 ${count} 条情绪数据，最新状态为「${mood.label}」，星核会根据最新记录动态演化。`}
      primaryAction={{ label: "记录心情", href: "/mood/new" }}
      secondaryAction={{ label: "查看星系图", href: "/timeline" }}
    >
      <MoodPlanet moodKey={moodKey} score={score} />

      <article className="mv-card mv-chart-card">
        <h3>趋势分析</h3>
        <p>过去 7 天情绪振幅收敛了 {analytics.trendConvergence}%，波动曲线更平滑。</p>
        <div className="mv-bars">
          {analytics.bars.map((value, index) => (
            <span
              key={index}
              style={{
                height: `${Math.max(18, Math.min(100, value))}%`,
                background: `linear-gradient(180deg, ${mood.color}f2, rgba(76, 105, 255, 0.32))`,
              }}
            />
          ))}
        </div>
      </article>

      <article className="mv-card mv-inline-info">
        <h4>触发点</h4>
        <p>
          高亮事件 <strong>{analytics.triggerTag}</strong> 为你的{mood.label}体验贡献超过 {analytics.triggerContribution}%。
        </p>
      </article>

      <article className="mv-card mv-inline-info">
        <h4>呼吸影响</h4>
        <p>{analytics.breathingHabitRate}% 以上的慢呼吸习惯可令神经恢复效率提升 {analytics.breathingImpact}%。</p>
      </article>
    </AppShell>
  );
}
