"use client";

import dynamic from "next/dynamic";
import { MOOD_META, type MoodKey } from "@/app/lib/mood-meta";

const PlanetCore = dynamic(
  () => import("@/app/components/planet-core").then((module) => module.PlanetCore),
  { ssr: false },
);

type MoodPlanetProps = {
  moodKey: MoodKey;
  score: number;
};

export function MoodPlanet({ moodKey, score }: MoodPlanetProps) {
  const mood = MOOD_META[moodKey];

  return (
    <article className="mv-card mv-planet-card mv-planet-card-live">
      <div className="mv-planet-live-wrap">
        <PlanetCore moodKey={moodKey} />
      </div>
      <p className="mv-planet-live-label" style={{ color: mood.color }}>{mood.label} 星核</p>
      <div className="mv-planet-score">
        <strong style={{ color: mood.color }}>{score}%</strong>
        <span>对齐指数</span>
      </div>
    </article>
  );
}
