export type MoodKey = "joy" | "calm" | "focus" | "sad";

export const MOOD_META: Record<MoodKey, { label: string; color: string }> = {
  joy: { label: "喜悦", color: "#d64eff" },
  calm: { label: "冷静", color: "#22d3ee" },
  focus: { label: "活力", color: "#9f67ff" },
  sad: { label: "沉思", color: "#7392ff" },
};
