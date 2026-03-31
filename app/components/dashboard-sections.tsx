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
  latestHeartRate?: number;
  latestSleep?: number;
  latestEnergyKcal?: number;
  latestStability?: number;
};

type MoodApiResponse = {
  success?: boolean;
  count?: number;
  dashboard?: DashboardPayload | null;
};

const emptyDashboard: DashboardPayload = {
  mood: "joy",
  alignmentScore: 0,
  companionMoods: ["calm", "focus"],
  awakePulseDelta: 0,
  timeStability: 0,
  avgHeartRate: 0,
  avgSleepHours: 0,
  avgEnergyKcal: 0,
  avgStability: 0,
};

const metricMeta = [
  {
    key: "heart",
    icon: "/icons/Container (2).svg",
    iconAlt: "心率图标",
    iconSize: { width: 14, height: 13 },
    title: "最新心率",
    toneClass: "heart",
  },
  {
    key: "sleep",
    icon: "/icons/Container (1).svg",
    iconAlt: "睡眠图标",
    iconSize: { width: 14, height: 14 },
    title: "最新睡眠",
    toneClass: "sleep",
  },
  {
    key: "energy",
    icon: "/icons/Icon.svg",
    iconAlt: "能量图标",
    iconSize: { width: 12, height: 15 },
    title: "最新能量",
    toneClass: "energy",
  },
  {
    key: "stable",
    icon: "/icons/Icon (1).svg",
    iconAlt: "稳定图标",
    iconSize: { width: 14, height: 12 },
    title: "最新稳定性",
    toneClass: "stable",
  },
];

export function DashboardSections() {
  const [dashboard, setDashboard] = useState<DashboardPayload>(emptyDashboard);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const response = await fetch(`/api/mood?ts=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) return;

        const data = (await response.json()) as MoodApiResponse;
        if (!active || !data.success) return;
        const nextHasData = typeof data.count === "number" && data.count > 0 && !!data.dashboard;
        setHasData(nextHasData);
        setDashboard(data.dashboard ?? emptyDashboard);
      } catch {
        if (active) {
          setHasData(false);
          setDashboard(emptyDashboard);
        }
      }
    };

    void loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const moodMeta = useMemo(() => MOOD_META[dashboard.mood], [dashboard.mood]);
  const latestHeartRate = dashboard.latestHeartRate ?? dashboard.avgHeartRate;
  const latestSleep = dashboard.latestSleep ?? Math.round(dashboard.avgSleepHours * 10);
  const latestEnergyKcal = dashboard.latestEnergyKcal ?? dashboard.avgEnergyKcal;
  const latestStability = dashboard.latestStability ?? dashboard.avgStability;

  const metrics = useMemo(
    () => [
      {
        ...metricMeta[0],
        value: hasData ? `${latestHeartRate} BPM` : "--",
      },
      {
        ...metricMeta[1],
        value: hasData ? `${latestSleep}%` : "--",
      },
      {
        ...metricMeta[2],
        value: hasData ? `${latestEnergyKcal} kcal` : "--",
      },
      {
        ...metricMeta[3],
        value: hasData ? `${latestStability}% 稳定性` : "--",
      },
    ],
    [hasData, latestEnergyKcal, latestHeartRate, latestSleep, latestStability],
  );

  const pulseSign = dashboard.awakePulseDelta >= 0 ? "+" : "";
  const pulseProgress = hasData ? Math.max(8, Math.min(100, Math.abs(dashboard.awakePulseDelta) * 2.2)) : 0;

  return (
    <>
      <article className="mv-card mv-orbit-card mv-orbit-card-redesign">
        <div className="mv-orbit-core-live-wrap">
          <PlanetCore moodKey={dashboard.mood} />
        </div>
        <p className="mv-orbit-main-label" style={{ color: moodMeta.color }}>{hasData ? moodMeta.label : "暂无记录"}</p>
        <div className="mv-orbit-score-wrap">
          <strong style={{ color: moodMeta.color }}>{hasData ? `${dashboard.alignmentScore}%` : "--"}</strong>
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
          <strong>{hasData ? `${pulseSign}${dashboard.awakePulseDelta.toFixed(1)}%` : "--"}</strong>
        </div>
        <div className="mv-progress">
          <i style={{ width: `${pulseProgress}%` }} />
        </div>
        <div className="mv-progress-row">
          <span>时间稳定性</span>
          <strong>{hasData ? `${dashboard.timeStability}%` : "--"}</strong>
        </div>
        <div className="mv-progress purple">
          <i style={{ width: `${hasData ? dashboard.timeStability : 0}%` }} />
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
