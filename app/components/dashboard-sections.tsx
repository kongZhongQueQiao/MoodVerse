"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { MOOD_META, type MoodKey } from "@/app/lib/mood-meta";

const PlanetCore = dynamic(
  () => import("@/app/components/planet-core").then((module) => module.PlanetCore),
  { ssr: false },
);

type DashboardPayload = {
  mood: MoodKey;
  alignmentScore: number;
  companionMoods: MoodKey[];
  awakePulseDelta: number;
  timeStability: number;
  avgHeartRate: number;
  avgSleepHours: number;
  avgEnergyKcal: number;
  avgStability: number;
};

type MoodApiResponse = {
  success?: boolean;
  dashboard?: DashboardPayload;
};

const fallbackDashboard: DashboardPayload = {
  mood: "joy",
  alignmentScore: 84,
  companionMoods: ["calm", "focus"],
  awakePulseDelta: 12.4,
  timeStability: 66,
  avgHeartRate: 72,
  avgSleepHours: 7.2,
  avgEnergyKcal: 2400,
  avgStability: 94,
};

const metricMeta = [
  {
    key: "heart",
    icon: "/icons/Container (2).svg",
    iconAlt: "心率图标",
    iconSize: { width: 14, height: 13 },
    title: "平均心率",
    toneClass: "heart",
  },
  {
    key: "sleep",
    icon: "/icons/Container (1).svg",
    iconAlt: "睡眠图标",
    iconSize: { width: 14, height: 14 },
    title: "睡眠周期",
    toneClass: "sleep",
  },
  {
    key: "energy",
    icon: "/icons/Icon.svg",
    iconAlt: "能量图标",
    iconSize: { width: 12, height: 15 },
    title: "活跃能量",
    toneClass: "energy",
  },
  {
    key: "stable",
    icon: "/icons/Icon (1).svg",
    iconAlt: "稳定图标",
    iconSize: { width: 14, height: 12 },
    title: "呼吸总制",
    toneClass: "stable",
  },
];

export function DashboardSections() {
  const [dashboard, setDashboard] = useState<DashboardPayload>(fallbackDashboard);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const response = await fetch("/api/mood", { cache: "no-store" });
        if (!response.ok) return;

        const data = (await response.json()) as MoodApiResponse;
        if (!active || !data.success || !data.dashboard) return;
        setDashboard(data.dashboard);
      } catch {
        // keep fallback
      }
    };

    void loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const moodMeta = useMemo(() => MOOD_META[dashboard.mood], [dashboard.mood]);
  const metrics = useMemo(
    () => [
      {
        ...metricMeta[0],
        value: `${dashboard.avgHeartRate} BPM`,
      },
      {
        ...metricMeta[1],
        value: `${dashboard.avgSleepHours.toFixed(1)}h 深度`,
      },
      {
        ...metricMeta[2],
        value: `${(dashboard.avgEnergyKcal / 1000).toFixed(1)}k kcal`,
      },
      {
        ...metricMeta[3],
        value: `${dashboard.avgStability}% 稳定性`,
      },
    ],
    [dashboard],
  );

  const pulseSign = dashboard.awakePulseDelta >= 0 ? "+" : "";
  const pulseProgress = Math.max(8, Math.min(100, Math.abs(dashboard.awakePulseDelta) * 2.2));

  return (
    <>
      <article className="mv-card mv-orbit-card mv-orbit-card-redesign">
        <div className="mv-orbit-core-live-wrap">
          <PlanetCore moodKey={dashboard.mood} />
        </div>
        <p className="mv-orbit-main-label" style={{ color: moodMeta.color }}>{moodMeta.label}</p>
        <div className="mv-orbit-score-wrap">
          <strong style={{ color: moodMeta.color }}>{dashboard.alignmentScore}%</strong>
          <span>对齐指数</span>
        </div>
      </article>

      <article className="mv-card mv-orbit-drift-card">
        <h3 className="mv-section-title">
          <Image src="/icons/Container.svg" alt="轨道图标" width={18} height={10} />
          轨道漂移
        </h3>
        <div className="mv-progress-row">
          <span>清醒脉冲</span>
          <strong>{`${pulseSign}${dashboard.awakePulseDelta.toFixed(1)}%`}</strong>
        </div>
        <div className="mv-progress">
          <i style={{ width: `${pulseProgress}%` }} />
        </div>
        <div className="mv-progress-row">
          <span>时间稳定性</span>
          <strong>{dashboard.timeStability}%</strong>
        </div>
        <div className="mv-progress purple">
          <i style={{ width: `${dashboard.timeStability}%` }} />
        </div>
      </article>

      <article className="mv-card mv-inline-info">
        <h4>星盘分析</h4>
        <p>你在黄昏时段达到最高的创造力模式。</p>
        <Link href="/timeline">查看洞察 →</Link>
      </article>

      <div className="mv-metrics-grid">
        {metrics.map((metric) => (
          <article key={metric.key} className="mv-card mv-metric">
            <span className={`mv-metric-icon ${metric.toneClass}`}>
              <Image
                src={metric.icon}
                alt={metric.iconAlt}
                width={metric.iconSize.width}
                height={metric.iconSize.height}
              />
            </span>

            <div className="mv-metric-copy">
              <span className="mv-metric-title">{metric.title}</span>
              <strong className="mv-metric-value">{metric.value}</strong>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
