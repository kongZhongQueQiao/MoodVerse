"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
} from "recharts";
import { AppShell } from "@/app/components/app-shell";
import { MOOD_META, type MoodKey } from "@/app/lib/mood-meta";

type DashboardPayload = {
  mood: MoodKey;
  alignmentScore: number;
  awakePulseDelta: number;
  avgSleepHours: number;
  moodDistribution?: Record<MoodKey, number>;
};

type MoodAnalytics = {
  bars: number[];
};

type MoodApiResponse = {
  success?: boolean;
  count?: number;
  dashboard?: DashboardPayload | null;
  analytics?: MoodAnalytics;
};

const weekLabels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

export default function TimelinePage() {
  const [count, setCount] = useState(0);
  const [harmony, setHarmony] = useState(0);
  const [pulseDelta, setPulseDelta] = useState(0);
  const [sleepHours, setSleepHours] = useState(0);
  const [bars, setBars] = useState<number[]>([]);
  const [distribution, setDistribution] = useState<Record<MoodKey, number>>({
    joy: 0,
    calm: 0,
    focus: 0,
    sad: 0,
  });

  useEffect(() => {
    void fetch("/api/engagement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "weekly_review_view" }),
      cache: "no-store",
    }).catch(() => {
      // non-blocking tracking
    });
  }, []);

  useEffect(() => {
    let active = true;

    const loadTimeline = async () => {
      try {
        const response = await fetch(`/api/mood?ts=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as MoodApiResponse;
        if (!active || !data.success) return;

        const dashboard = data.dashboard;
        const nextCount = typeof data.count === "number" ? data.count : 0;
        setCount(nextCount);

        if (!dashboard || nextCount === 0) {
          setHarmony(0);
          setPulseDelta(0);
          setSleepHours(0);
          setBars([]);
          setDistribution({ joy: 0, calm: 0, focus: 0, sad: 0 });
          return;
        }

        setHarmony(Math.max(0, Math.min(100, dashboard.alignmentScore)));
        setPulseDelta(dashboard.awakePulseDelta ?? 0);
        setSleepHours(dashboard.avgSleepHours ?? 0);
        setBars(Array.isArray(data.analytics?.bars) ? data.analytics.bars.slice(0, 7) : []);
        setDistribution(
          dashboard.moodDistribution ?? {
            joy: 0,
            calm: 0,
            focus: 0,
            sad: 0,
          },
        );
      } catch {
        // keep empty state
      }
    };

    void loadTimeline();

    return () => {
      active = false;
    };
  }, []);

  const lineData = useMemo(
    () => weekLabels.map((label, index) => ({ label, value: bars[index] ?? 0 })),
    [bars],
  );

  const donutData = useMemo(
    () => [
      { name: MOOD_META.joy.label, value: distribution.joy, color: MOOD_META.joy.color },
      { name: MOOD_META.calm.label, value: distribution.calm, color: MOOD_META.calm.color },
      { name: MOOD_META.focus.label, value: distribution.focus, color: MOOD_META.focus.color },
      { name: MOOD_META.sad.label, value: distribution.sad, color: MOOD_META.sad.color },
    ],
    [distribution],
  );

  const dominantMood = useMemo(
    () => donutData.reduce((top, item) => (item.value > top.value ? item : top), donutData[0]),
    [donutData],
  );

  const pulseProgress = count > 0 ? Math.max(6, Math.min(100, Math.abs(pulseDelta) * 5)) : 0;
  const sleepProgress = count > 0 ? Math.max(0, Math.min(100, (sleepHours / 10) * 100)) : 0;

  return (
    <AppShell
      title="你的内在宇宙"
      subtitle="分析、生产力与稳定性在你的时间轴中持续共振。"
      showFab
    >
      <article className="mv-card mv-tl-hero-card">
        <Image
          src="/image/Image.svg"
          alt="和谐度背景"
          fill
          sizes="100vw"
          className="mv-tl-hero-bg"
        />
        <div className="mv-tl-hero-copy">
          <strong>{count > 0 ? `${harmony}%` : "--"}</strong>
          <span>星际和谐度</span>
        </div>
      </article>

      <section className="mv-tl-metric-carousel" aria-label="关键洞察">
        <article className="mv-card mv-tl-metric-slide">
          <div className="mv-tl-metric-top">
            <p>光感洞察</p>
            <span aria-hidden>☀</span>
          </div>
          <strong>{count > 0 ? `${pulseDelta >= 0 ? "+" : ""}${pulseDelta.toFixed(1)}%` : "--"}</strong>
          <div className="mv-tl-metric-progress" role="presentation">
            <i style={{ width: `${pulseProgress}%` }} />
          </div>
          <small>{count > 0 ? "昼夜节律正在趋稳" : "暂无数据"}</small>
        </article>

        <article className="mv-card mv-tl-metric-slide">
          <div className="mv-tl-metric-top">
            <p>深度睡眠</p>
            <span aria-hidden>☾</span>
          </div>
          <strong>{count > 0 ? `${sleepHours.toFixed(1)}h` : "--"}</strong>
          <div className="mv-tl-metric-progress mv-tl-metric-progress-pink" role="presentation">
            <i style={{ width: `${sleepProgress}%` }} />
          </div>
          <small>{count > 0 ? "恢复效率保持在良好区间" : "暂无数据"}</small>
        </article>
      </section>

      <article className="mv-card mv-chart-card mv-tl-line-chart">
        <h3>强度映射</h3>
        <div className="mv-tl-chart-canvas">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={lineData} margin={{ left: -20, right: 4, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="mvTlArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#db7cff" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="#db7cff" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={true} horizontal={false} />
              <XAxis dataKey="label" tick={{ fill: "#8f9ac6", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Area type="monotone" dataKey="value" stroke="#d97bff" strokeWidth={3} fill="url(#mvTlArea)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="mv-card mv-chart-card mv-tl-donut-card">
        <h3>主导地位</h3>
        <div className="mv-tl-dominant-head">
          <strong>{count > 0 ? dominantMood.name : "--"}</strong>
          <span>{count > 0 ? "当前主导状态" : "暂无数据"}</span>
        </div>
        <div className="mv-tl-simple-chart">
          <ResponsiveContainer width="100%" height={170}>
            <PieChart margin={{ top: 4, right: 10, left: 10, bottom: 4 }}>
              <Pie
                data={donutData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={66}
                paddingAngle={3}
                stroke="none"
              >
                {donutData.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="mv-tl-legend">
          {donutData.map((item) => (
            <li key={item.name}>
              <i style={{ backgroundColor: item.color }} />
              <span>{item.name}</span>
              <strong>{count > 0 ? `${item.value}%` : "--"}</strong>
            </li>
          ))}
        </ul>
      </article>
    </AppShell>
  );
}
