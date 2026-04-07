export const MV_GALAXY_GLOW_KEY = "mv_galaxy_glow";
export const MV_NEBULA_SPEED_KEY = "mv_nebula_speed";
export const MV_VISUAL_PREF_EVENT = "mv-visual-preferences-changed";

export const DEFAULT_GALAXY_GLOW = 64;
export const DEFAULT_NEBULA_SPEED = 42;

export type VisualPreferences = {
  galaxyGlow: number;
  nebulaSpeed: number;
};

export const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const parseStoredNumber = (value: string | null, fallback: number) => {
  if (value == null) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? clampPercent(parsed) : fallback;
};

export const readVisualPreferences = (): VisualPreferences => {
  if (typeof window === "undefined") {
    return {
      galaxyGlow: DEFAULT_GALAXY_GLOW,
      nebulaSpeed: DEFAULT_NEBULA_SPEED,
    };
  }

  return {
    galaxyGlow: parseStoredNumber(window.localStorage.getItem(MV_GALAXY_GLOW_KEY), DEFAULT_GALAXY_GLOW),
    nebulaSpeed: parseStoredNumber(window.localStorage.getItem(MV_NEBULA_SPEED_KEY), DEFAULT_NEBULA_SPEED),
  };
};

export const saveVisualPreferences = (next: VisualPreferences) => {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(MV_GALAXY_GLOW_KEY, String(clampPercent(next.galaxyGlow)));
  window.localStorage.setItem(MV_NEBULA_SPEED_KEY, String(clampPercent(next.nebulaSpeed)));
};
