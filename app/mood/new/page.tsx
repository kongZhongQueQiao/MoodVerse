"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Droplets, Sparkles, Cloud, Zap, HeartPulse, MoonStar, Flame, ShieldCheck } from "lucide-react";

const moods = [
  { key: "joy", label: "喜悦", icon: Sparkles, color: "#d64eff" },
  { key: "calm", label: "冷静", icon: Droplets, color: "#22d3ee" },
  { key: "focus", label: "活力", icon: Zap, color: "#9f67ff" },
  { key: "sad", label: "沉思", icon: Cloud, color: "#7392ff" },
] as const;

const planetStyles = {
  joy: {
    background:
      "radial-gradient(circle at 43% 30%, #f9a5ff 0%, #d24eff 45%, #5b0ca4 100%), radial-gradient(circle at 60% 56%, rgba(34, 226, 255, 0.7), transparent 70%)",
    boxShadow: "0 0 44px rgba(214, 86, 255, 0.6), inset 0 -10px 36px rgba(44, 7, 93, 0.6)",
    labelColor: "#d64eff",
  },
  calm: {
    background:
      "radial-gradient(circle at 43% 30%, #8bf7ff 0%, #22d3ee 46%, #0f3e88 100%), radial-gradient(circle at 62% 56%, rgba(123, 224, 255, 0.7), transparent 70%)",
    boxShadow: "0 0 44px rgba(34, 211, 238, 0.5), inset 0 -10px 36px rgba(7, 40, 93, 0.55)",
    labelColor: "#22d3ee",
  },
  focus: {
    background:
      "radial-gradient(circle at 43% 30%, #d2b4ff 0%, #9f67ff 45%, #4520a7 100%), radial-gradient(circle at 62% 56%, rgba(173, 120, 255, 0.68), transparent 70%)",
    boxShadow: "0 0 44px rgba(159, 103, 255, 0.55), inset 0 -10px 36px rgba(43, 20, 99, 0.58)",
    labelColor: "#9f67ff",
  },
  sad: {
    background:
      "radial-gradient(circle at 43% 30%, #c7d6ff 0%, #7392ff 46%, #243f99 100%), radial-gradient(circle at 62% 56%, rgba(122, 173, 255, 0.66), transparent 70%)",
    boxShadow: "0 0 44px rgba(115, 146, 255, 0.52), inset 0 -10px 36px rgba(18, 37, 98, 0.55)",
    labelColor: "#7392ff",
  },
} as const;

const metrics = [
  { key: "heart", label: "心率 (BPM)", icon: HeartPulse, color: "#f07aff" },
  { key: "sleep", label: "深度睡眠 (目标)", icon: MoonStar, color: "#22d3ee" },
  { key: "energy", label: "能量消耗 (kcal)", icon: Flame, color: "#ff6b9f" },
  { key: "stability", label: "神经稳定性", icon: ShieldCheck, color: "#9f67ff" },
] as const;

export default function MoodCapturePage() {
  const [selectedMood, setSelectedMood] = useState<(typeof moods)[number]["key"]>("joy");
  const [hoveredMood, setHoveredMood] = useState<(typeof moods)[number]["key"] | null>(null);
  const [heartRate, setHeartRate] = useState(72);
  const [sleep, setSleep] = useState(72);
  const [energy, setEnergy] = useState(84);
  const [stability, setStability] = useState(94);

  const displayMood = hoveredMood ?? selectedMood;

  const moodTitle = useMemo(
    () => moods.find((mood) => mood.key === displayMood)?.label ?? "喜悦",
    [displayMood],
  );

  const planetStyle = planetStyles[displayMood];

  return (
    <div className="mv-root">
      <section className="mv-phone mv-capture-screen">
        <header className="mv-capture-top">
          <Link href="/mood" className="mv-close-btn" aria-label="关闭">✕</Link>
          <p>MoodVerse</p>
          <span>2/5 · 记录中</span>
        </header>

        <main className="mv-content mv-capture-content">
          <motion.div
            layout
            className="mv-capture-planet-wrap"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <div className="mv-capture-planet" style={{ background: planetStyle.background, boxShadow: planetStyle.boxShadow }} />
            <p style={{ color: planetStyle.labelColor }}>{moodTitle} 星核</p>
          </motion.div>

          <h1 className="mv-title">你的宇宙如何？</h1>
          <p className="mv-subtitle">选择当下最接近你的能量状态</p>

          <section className="mv-mood-grid mv-capture-mood-grid" aria-label="情绪选择">
            {moods.map((mood) => {
              const active = mood.key === selectedMood;

              return (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  key={mood.key}
                  onClick={() => setSelectedMood(mood.key)}
                  onMouseEnter={() => setHoveredMood(mood.key)}
                  onMouseLeave={() => setHoveredMood(null)}
                  onFocus={() => setHoveredMood(mood.key)}
                  onBlur={() => setHoveredMood(null)}
                  data-mood={mood.key}
                  className={`mv-mood-option mv-capture-mood-option ${active ? "active" : ""}`}
                  style={active ? { borderColor: mood.color, boxShadow: `0 0 24px ${mood.color}55` } : undefined}
                >
                  <mood.icon size={18} />
                  <span>{mood.label}</span>
                </motion.button>
              );
            })}
          </section>

          <section className="mv-stat-list mv-capture-stat-list">
            <label className="mv-slider mv-capture-slider" style={{ ["--metric-color" as string]: metrics[0].color }}>
              <div className="mv-capture-slider-head">
                <span className="mv-capture-slider-label">
                  <HeartPulse size={13} />
                  {metrics[0].label}
                </span>
                <strong className="mv-capture-slider-value">
                  <HeartPulse size={12} />
                  {heartRate}
                </strong>
              </div>
              <input type="range" min={40} max={140} value={heartRate} onChange={(event) => setHeartRate(Number(event.target.value))} />
            </label>
            <label className="mv-slider mv-capture-slider" style={{ ["--metric-color" as string]: metrics[1].color }}>
              <div className="mv-capture-slider-head">
                <span className="mv-capture-slider-label">
                  <MoonStar size={13} />
                  {metrics[1].label}
                </span>
                <strong className="mv-capture-slider-value">
                  <MoonStar size={12} />
                  {sleep}%
                </strong>
              </div>
              <input type="range" min={10} max={100} value={sleep} onChange={(event) => setSleep(Number(event.target.value))} />
            </label>
            <label className="mv-slider mv-capture-slider" style={{ ["--metric-color" as string]: metrics[2].color }}>
              <div className="mv-capture-slider-head">
                <span className="mv-capture-slider-label">
                  <Flame size={13} />
                  {metrics[2].label}
                </span>
                <strong className="mv-capture-slider-value">
                  <Flame size={12} />
                  {Math.round((energy / 100) * 2800)} kcal
                </strong>
              </div>
              <input type="range" min={10} max={100} value={energy} onChange={(event) => setEnergy(Number(event.target.value))} />
            </label>
            <label className="mv-slider mv-capture-slider" style={{ ["--metric-color" as string]: metrics[3].color }}>
              <div className="mv-capture-slider-head">
                <span className="mv-capture-slider-label">
                  <ShieldCheck size={13} />
                  {metrics[3].label}
                </span>
                <strong className="mv-capture-slider-value">
                  <ShieldCheck size={12} />
                  {stability}%
                </strong>
              </div>
              <input type="range" min={20} max={100} value={stability} onChange={(event) => setStability(Number(event.target.value))} />
            </label>
          </section>

          <textarea className="mv-note-box mv-capture-note-box" rows={3} placeholder="今天有什么事件触发了这个情绪？" />

          <div className="mv-chip-row">
            <span>通勤</span>
            <span>工作</span>
            <span>关系</span>
            <span>睡眠</span>
          </div>

          <button className="mv-btn mv-btn-primary mv-submit">记录情绪</button>
        </main>
      </section>
    </div>
  );
}
