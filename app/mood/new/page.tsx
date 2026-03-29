"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Droplets, Sparkles, Cloud, Zap } from "lucide-react";

const moods = [
  { key: "joy", label: "喜悦", icon: Sparkles, color: "#d64eff" },
  { key: "calm", label: "冷静", icon: Droplets, color: "#22d3ee" },
  { key: "focus", label: "活力", icon: Zap, color: "#9f67ff" },
  { key: "sad", label: "沉思", icon: Cloud, color: "#7392ff" },
] as const;

export default function MoodCapturePage() {
  const [selectedMood, setSelectedMood] = useState<(typeof moods)[number]["key"]>("joy");
  const [heartRate, setHeartRate] = useState(72);
  const [sleep, setSleep] = useState(72);
  const [energy, setEnergy] = useState(84);
  const [stability, setStability] = useState(94);

  const moodTitle = useMemo(
    () => moods.find((mood) => mood.key === selectedMood)?.label ?? "喜悦",
    [selectedMood],
  );

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
            <div className="mv-capture-planet" />
            <p>{moodTitle} 星核</p>
          </motion.div>

          <h1 className="mv-title">你的宇宙如何？</h1>
          <p className="mv-subtitle">选择当下最接近你的能量状态</p>

          <section className="mv-mood-grid" aria-label="情绪选择">
            {moods.map((mood) => {
              const active = mood.key === selectedMood;

              return (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  key={mood.key}
                  onClick={() => setSelectedMood(mood.key)}
                  className={`mv-mood-option ${active ? "active" : ""}`}
                  style={active ? { borderColor: mood.color, boxShadow: `0 0 24px ${mood.color}55` } : undefined}
                >
                  <mood.icon size={18} />
                  <span>{mood.label}</span>
                </motion.button>
              );
            })}
          </section>

          <section className="mv-stat-list">
            <label className="mv-slider">
              <span>心率 (BPM)</span>
              <strong>{heartRate}</strong>
              <input type="range" min={40} max={140} value={heartRate} onChange={(event) => setHeartRate(Number(event.target.value))} />
            </label>
            <label className="mv-slider">
              <span>深度睡眠 (目标)</span>
              <strong>{sleep}%</strong>
              <input type="range" min={10} max={100} value={sleep} onChange={(event) => setSleep(Number(event.target.value))} />
            </label>
            <label className="mv-slider">
              <span>能量消耗 (kcal)</span>
              <strong>{Math.round((energy / 100) * 2800)} kcal</strong>
              <input type="range" min={10} max={100} value={energy} onChange={(event) => setEnergy(Number(event.target.value))} />
            </label>
            <label className="mv-slider">
              <span>神经稳定性</span>
              <strong>{stability}%</strong>
              <input type="range" min={20} max={100} value={stability} onChange={(event) => setStability(Number(event.target.value))} />
            </label>
          </section>

          <textarea className="mv-note-box" rows={3} placeholder="今天有什么事件触发了这个情绪？" />

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
