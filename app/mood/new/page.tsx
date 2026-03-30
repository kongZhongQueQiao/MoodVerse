"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Range, getTrackBackground } from "react-range";
import { Droplets, Sparkles, Cloud, Zap, HeartPulse, MoonStar, Flame, ShieldCheck } from "lucide-react";
import { MOOD_META } from "@/app/lib/mood-meta";

const PlanetCore = dynamic(
  () => import("@/app/components/planet-core").then((module) => module.PlanetCore),
  { ssr: false },
);

const moods = [
  { key: "joy", label: MOOD_META.joy.label, icon: Sparkles, color: MOOD_META.joy.color },
  { key: "calm", label: MOOD_META.calm.label, icon: Droplets, color: MOOD_META.calm.color },
  { key: "focus", label: MOOD_META.focus.label, icon: Zap, color: MOOD_META.focus.color },
  { key: "sad", label: MOOD_META.sad.label, icon: Cloud, color: MOOD_META.sad.color },
] as const;

const planetStyles = {
  joy: {
    labelColor: "#d64eff",
  },
  calm: {
    labelColor: "#22d3ee",
  },
  focus: {
    labelColor: "#9f67ff",
  },
  sad: {
    labelColor: "#7392ff",
  },
} as const;

const metrics = [
  { key: "heart", label: "心率 (BPM)", icon: HeartPulse, color: "#f07aff" },
  { key: "sleep", label: "深度睡眠 (目标)", icon: MoonStar, color: "#22d3ee" },
  { key: "energy", label: "能量消耗 (kcal)", icon: Flame, color: "#ff6b9f" },
  { key: "stability", label: "神经稳定性", icon: ShieldCheck, color: "#9f67ff" },
] as const;

const triggerTags = ["通勤", "工作", "关系", "睡眠", "运动", "饮食"] as const;

type MoodSummaryResponse = {
  success?: boolean;
  count?: number;
};

export default function MoodCapturePage() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<(typeof moods)[number]["key"]>("joy");
  const [hoveredMood, setHoveredMood] = useState<(typeof moods)[number]["key"] | null>(null);
  const [heartRate, setHeartRate] = useState(72);
  const [sleep, setSleep] = useState(72);
  const [energy, setEnergy] = useState(84);
  const [stability, setStability] = useState(94);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState("");
  const [recordCount, setRecordCount] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(["工作"]);

  const metricStyle = (color: string) => ({
    ["--metric-color" as string]: color,
  });

  const displayMood = hoveredMood ?? selectedMood;

  const moodTitle = useMemo(
    () => moods.find((mood) => mood.key === displayMood)?.label ?? "喜悦",
    [displayMood],
  );

  const planetStyle = planetStyles[displayMood];

  useEffect(() => {
    let active = true;

    const loadCount = async () => {
      try {
        const response = await fetch("/api/mood", { cache: "no-store" });
        if (!response.ok) {
          if (active) setRecordCount(0);
          return;
        }

        const data = (await response.json()) as MoodSummaryResponse;
        if (active) {
          setRecordCount(typeof data.count === "number" ? data.count : 0);
        }
      } catch {
        if (active) setRecordCount(0);
      }
    };

    void loadCount();

    return () => {
      active = false;
    };
  }, []);

  const handleSubmitMood = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/mood", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mood: selectedMood,
          heartRate,
          sleep,
          energy,
          stability,
          note,
          tags: selectedTags.length ? selectedTags : ["未标记"],
        }),
      });

  const result = (await response.json()) as { success?: boolean; message?: string; count?: number };

      if (!response.ok || !result.success) {
        setToast(result.message ?? "记录失败，请稍后重试");
        return;
      }

      if (typeof result.count === "number") {
        setRecordCount(result.count);
      }

      setToast("记录成功");
      window.setTimeout(() => {
        router.replace("/");
      }, 500);
    } catch {
      setToast("记录失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
      window.setTimeout(() => {
        setToast("");
      }, 1800);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((item) => item !== tag);
      }

      if (prev.length >= 3) {
        return [...prev.slice(1), tag];
      }

      return [...prev, tag];
    });
  };

  return (
    <div className="mv-root">
      <section className="mv-phone mv-capture-screen">
        <header className="mv-capture-top">
          <Link href="/mood" className="mv-close-btn" aria-label="关闭">✕</Link>
          <p>MoodVerse</p>
          <span>{recordCount ?? "--"} 条 · 记录中</span>
        </header>

        <main className="mv-content mv-capture-content">
          <motion.div
            layout
            className="mv-capture-planet-wrap"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <PlanetCore moodKey={displayMood} />
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
            <label className="mv-slider mv-capture-slider" style={metricStyle(metrics[0].color)}>
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
              <Range
                step={1}
                min={40}
                max={140}
                values={[heartRate]}
                onChange={(values) => setHeartRate(values[0] ?? 40)}
                renderTrack={({ props, children }) => (
                  <div className="mv-capture-range-track-wrap" onMouseDown={props.onMouseDown} onTouchStart={props.onTouchStart}>
                    <div
                      ref={props.ref}
                      className="mv-capture-range-track"
                      style={{
                        background: getTrackBackground({
                          values: [heartRate],
                          colors: [`${metrics[0].color}CC`, "rgba(173, 181, 214, 0.34)"],
                          min: 40,
                          max: 140,
                        }),
                      }}
                    >
                      {children}
                    </div>
                  </div>
                )}
                renderThumb={({ props }) => {
                  const { key, ...thumbProps } = props;
                  return (
                    <div
                      key={key}
                      {...thumbProps}
                      className="mv-capture-range-thumb"
                      style={{
                        ...props.style,
                        background: metrics[0].color,
                        boxShadow: `0 0 6px ${metrics[0].color}66`,
                      }}
                    />
                  );
                }}
              />
            </label>
            <label className="mv-slider mv-capture-slider" style={metricStyle(metrics[1].color)}>
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
              <Range
                step={1}
                min={10}
                max={100}
                values={[sleep]}
                onChange={(values) => setSleep(values[0] ?? 10)}
                renderTrack={({ props, children }) => (
                  <div className="mv-capture-range-track-wrap" onMouseDown={props.onMouseDown} onTouchStart={props.onTouchStart}>
                    <div
                      ref={props.ref}
                      className="mv-capture-range-track"
                      style={{
                        background: getTrackBackground({
                          values: [sleep],
                          colors: [`${metrics[1].color}CC`, "rgba(173, 181, 214, 0.34)"],
                          min: 10,
                          max: 100,
                        }),
                      }}
                    >
                      {children}
                    </div>
                  </div>
                )}
                renderThumb={({ props }) => {
                  const { key, ...thumbProps } = props;
                  return (
                    <div
                      key={key}
                      {...thumbProps}
                      className="mv-capture-range-thumb"
                      style={{
                        ...props.style,
                        background: metrics[1].color,
                        boxShadow: `0 0 6px ${metrics[1].color}66`,
                      }}
                    />
                  );
                }}
              />
            </label>
            <label className="mv-slider mv-capture-slider" style={metricStyle(metrics[2].color)}>
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
              <Range
                step={1}
                min={10}
                max={100}
                values={[energy]}
                onChange={(values) => setEnergy(values[0] ?? 10)}
                renderTrack={({ props, children }) => (
                  <div className="mv-capture-range-track-wrap" onMouseDown={props.onMouseDown} onTouchStart={props.onTouchStart}>
                    <div
                      ref={props.ref}
                      className="mv-capture-range-track"
                      style={{
                        background: getTrackBackground({
                          values: [energy],
                          colors: [`${metrics[2].color}CC`, "rgba(173, 181, 214, 0.34)"],
                          min: 10,
                          max: 100,
                        }),
                      }}
                    >
                      {children}
                    </div>
                  </div>
                )}
                renderThumb={({ props }) => {
                  const { key, ...thumbProps } = props;
                  return (
                    <div
                      key={key}
                      {...thumbProps}
                      className="mv-capture-range-thumb"
                      style={{
                        ...props.style,
                        background: metrics[2].color,
                        boxShadow: `0 0 6px ${metrics[2].color}66`,
                      }}
                    />
                  );
                }}
              />
            </label>
            <label className="mv-slider mv-capture-slider" style={metricStyle(metrics[3].color)}>
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
              <Range
                step={1}
                min={20}
                max={100}
                values={[stability]}
                onChange={(values) => setStability(values[0] ?? 20)}
                renderTrack={({ props, children }) => (
                  <div className="mv-capture-range-track-wrap" onMouseDown={props.onMouseDown} onTouchStart={props.onTouchStart}>
                    <div
                      ref={props.ref}
                      className="mv-capture-range-track"
                      style={{
                        background: getTrackBackground({
                          values: [stability],
                          colors: [`${metrics[3].color}CC`, "rgba(173, 181, 214, 0.34)"],
                          min: 20,
                          max: 100,
                        }),
                      }}
                    >
                      {children}
                    </div>
                  </div>
                )}
                renderThumb={({ props }) => {
                  const { key, ...thumbProps } = props;
                  return (
                    <div
                      key={key}
                      {...thumbProps}
                      className="mv-capture-range-thumb"
                      style={{
                        ...props.style,
                        background: metrics[3].color,
                        boxShadow: `0 0 6px ${metrics[3].color}66`,
                      }}
                    />
                  );
                }}
              />
            </label>
          </section>

          <textarea
            className="mv-note-box mv-capture-note-box"
            rows={3}
            placeholder="今天有什么事件触发了这个情绪？"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />

          <div className="mv-chip-row">
            {triggerTags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  className={`mv-chip ${active ? "active" : ""}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          <button
            className="mv-btn mv-btn-primary mv-submit"
            type="button"
            onClick={handleSubmitMood}
            disabled={isSubmitting}
          >
            {isSubmitting ? "记录中..." : "记录情绪"}
          </button>

          <p className={`mv-auth-toast ${toast ? "show" : ""}`}>{toast}</p>
        </main>
      </section>
    </div>
  );
}
