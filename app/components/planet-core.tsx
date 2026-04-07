"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { AdditiveBlending, BackSide, CanvasTexture, Color, RepeatWrapping, SRGBColorSpace } from "three";
import type { Group, Mesh } from "three";
import {
  DEFAULT_GALAXY_GLOW,
  DEFAULT_NEBULA_SPEED,
  MV_VISUAL_PREF_EVENT,
  clampPercent,
  readVisualPreferences,
  type VisualPreferences,
} from "@/app/lib/visual-preferences";

type MoodKey = "joy" | "calm" | "focus" | "sad";

type PlanetTheme = {
  base: string;
  emissive: string;
  shadow: string;
};

const installThreeWarnFilter = () => {
  if (process.env.NODE_ENV === "production") return;

  const globalScope = globalThis as typeof globalThis & { __mv_three_warn_filter_installed__?: boolean };
  if (globalScope.__mv_three_warn_filter_installed__) return;

  const originalWarn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    const first = typeof args[0] === "string" ? args[0] : "";
    const shouldIgnore =
      first.includes("THREE.WebGLRenderer: Context Lost.") ||
      first.includes("THREE.THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.");

    if (shouldIgnore) return;
    originalWarn(...args);
  };

  globalScope.__mv_three_warn_filter_installed__ = true;
};

const PLANET_THEMES: Record<MoodKey, PlanetTheme> = {
  joy: {
    base: "#d24eff",
    emissive: "#f29dff",
    shadow: "0 0 34px rgba(214, 86, 255, 0.42), 0 0 70px rgba(214, 86, 255, 0.2)",
  },
  calm: {
    base: "#22d3ee",
    emissive: "#7be0ff",
    shadow: "0 0 34px rgba(34, 211, 238, 0.38), 0 0 70px rgba(34, 211, 238, 0.18)",
  },
  focus: {
    base: "#9f67ff",
    emissive: "#d2b4ff",
    shadow: "0 0 34px rgba(159, 103, 255, 0.4), 0 0 70px rgba(159, 103, 255, 0.2)",
  },
  sad: {
    base: "#7392ff",
    emissive: "#c7d6ff",
    shadow: "0 0 34px rgba(115, 146, 255, 0.38), 0 0 70px rgba(115, 146, 255, 0.18)",
  },
};

function createSurfaceTexture(base: string, emissive: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return new CanvasTexture(canvas);
  }

  const baseColor = new Color(base);
  const emissiveColor = new Color(emissive);

  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, `#${baseColor.clone().offsetHSL(0.02, 0.04, 0.17).getHexString()}`);
  gradient.addColorStop(0.55, `#${baseColor.getHexString()}`);
  gradient.addColorStop(1, `#${baseColor.clone().offsetHSL(-0.01, 0.02, -0.18).getHexString()}`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  // Procedural noise pattern
  const TAU = Math.PI * 2;
  for (let y = 0; y < 256; y += 1) {
    for (let x = 0; x < 256; x += 1) {
      const u = x / 256;
      const v = y / 256;
      const noise =
        Math.sin(u * TAU * 3) * 0.35 +
        Math.cos(v * TAU * 2) * 0.35 +
        Math.sin((u + v) * TAU * 4) * 0.3;
      const alpha = Math.max(0, Math.min(1, (noise + 1) / 2)) * 0.22;
      const tint = baseColor.clone().lerp(emissiveColor, 0.5 + noise * 0.3);
      ctx.fillStyle = `rgba(${Math.round(tint.r * 255)}, ${Math.round(tint.g * 255)}, ${Math.round(tint.b * 255)}, ${alpha.toFixed(3)})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createBandCloudTexture(emissive: string, glow: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return new CanvasTexture(canvas);
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const e = new Color(emissive);

  // Banded clouds
  for (let y = 0; y < canvas.height; y += 1) {
    const band = (Math.sin(y * 0.08) + Math.sin(y * 0.022 + 1.7)) * 0.5;
    const alpha = Math.max(0, band) * 0.24;
    if (alpha < 0.02) continue;
    const line = e.clone().offsetHSL(0, -0.1, 0.24);
    ctx.fillStyle = `rgba(${Math.round(line.r * 255)}, ${Math.round(line.g * 255)}, ${Math.round(line.b * 255)}, ${alpha.toFixed(3)})`;
    ctx.fillRect(0, y, canvas.width, 1);
  }

  const glowFactor = 0.58 + (clampPercent(glow) / 100) * 0.95;

  // Spot storms
  for (let i = 0; i < 14; i += 1) {
    const x = ((i * 73) % 500) + 8;
    const y = ((i * 41) % 220) + 18;
    const r = 10 + (i % 6) * 2;
    const spot = ctx.createRadialGradient(x, y, 0, x, y, r);
    spot.addColorStop(0, `rgba(255,255,255,${(0.16 + 0.26 * glowFactor).toFixed(3)})`);
    spot.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = spot;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createHighlightTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return new CanvasTexture(canvas);
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const points = [
    { x: 144, y: 162, r: 60 },
    { x: 294, y: 214, r: 44 },
    { x: 362, y: 300, r: 34 },
    { x: 214, y: 328, r: 27 },
    { x: 334, y: 124, r: 26 },
  ];

  for (const point of points) {
    const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, point.r);
    gradient.addColorStop(0, "rgba(255,255,255,0.95)");
    gradient.addColorStop(0.24, "rgba(255,255,255,0.36)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function PlanetMesh({ theme, galaxyGlow, orbitSpeedFactor }: { theme: PlanetTheme; galaxyGlow: number; orbitSpeedFactor: number }) {
  const coreRef = useRef<Mesh>(null);
  const cloudRef = useRef<Mesh>(null);
  const atmosphereRef = useRef<Mesh>(null);
  const highlightsRef = useRef<Mesh>(null);
  const glowFactor = 0.58 + (clampPercent(galaxyGlow) / 100) * 0.95;
  const surfaceTexture = useMemo(() => createSurfaceTexture(theme.base, theme.emissive), [theme.base, theme.emissive]);
  const cloudTexture = useMemo(() => createBandCloudTexture(theme.emissive, galaxyGlow), [theme.emissive, galaxyGlow]);
  const highlightTexture = useMemo(() => createHighlightTexture(), []);

  useFrame((state, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.18 * orbitSpeedFactor;
      coreRef.current.rotation.x += delta * 0.03 * orbitSpeedFactor;
    }

    if (cloudRef.current) {
      cloudRef.current.rotation.y -= delta * 0.1 * orbitSpeedFactor;
      cloudRef.current.rotation.x += delta * 0.015 * orbitSpeedFactor;
    }

    if (atmosphereRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.012;
      atmosphereRef.current.scale.setScalar(scale);
    }

    if (highlightsRef.current) {
      highlightsRef.current.rotation.y += delta * 0.085 * orbitSpeedFactor;
      highlightsRef.current.rotation.x += delta * 0.012 * orbitSpeedFactor;
    }
  });

  return (
    <Float speed={1.35 * orbitSpeedFactor} rotationIntensity={0.25} floatIntensity={0.4}>
      <mesh ref={coreRef}>
        <sphereGeometry args={[1.02, 88, 88]} />
        <meshPhysicalMaterial
          color={theme.base}
          emissive={theme.emissive}
          emissiveIntensity={0.18}
          map={surfaceTexture}
          roughness={0.52}
          metalness={0.06}
          clearcoat={0.76}
          clearcoatRoughness={0.14}
        />
      </mesh>

      <mesh ref={highlightsRef}>
        <sphereGeometry args={[1.024, 72, 72]} />
        <meshBasicMaterial
          color="#ffffff"
          map={highlightTexture}
          alphaMap={highlightTexture}
          transparent
          opacity={0.06 + glowFactor * 0.34}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={cloudRef}>
        <sphereGeometry args={[1.05, 72, 72]} />
        <meshStandardMaterial
          color="#ffffff"
          map={cloudTexture}
          alphaMap={cloudTexture}
          transparent
          opacity={0.18}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[1.1, 64, 64]} />
        <meshBasicMaterial color={theme.emissive} transparent opacity={0.11} side={BackSide} />
      </mesh>
    </Float>
  );
}

function OrbitTrails({ theme, orbitSpeedFactor }: { theme: PlanetTheme; orbitSpeedFactor: number }) {
  const ringARef = useRef<Group>(null);
  const ringBRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (ringARef.current) {
      ringARef.current.rotation.z += delta * 0.28 * orbitSpeedFactor;
      ringARef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.35 * orbitSpeedFactor) * 0.14;
    }

    if (ringBRef.current) {
      ringBRef.current.rotation.z -= delta * 0.2 * orbitSpeedFactor;
      ringBRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.42 * orbitSpeedFactor) * 0.12;
    }
  });

  return (
    <>
      <group ref={ringARef} rotation={[0.94, 0.22, 0.2]}>
        <mesh>
          <torusGeometry args={[1.34, 0.012, 16, 220]} />
          <meshBasicMaterial color={theme.emissive} transparent opacity={0.28} blending={AdditiveBlending} />
        </mesh>
        <mesh position={[1.34, 0, 0]}>
          <sphereGeometry args={[0.038, 18, 18]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} blending={AdditiveBlending} />
        </mesh>
      </group>

      <group ref={ringBRef} rotation={[1.18, -0.42, -0.34]}>
        <mesh>
          <torusGeometry args={[1.48, 0.008, 16, 180]} />
          <meshBasicMaterial color={theme.base} transparent opacity={0.24} blending={AdditiveBlending} />
        </mesh>
        <mesh position={[-1.48, 0, 0]}>
          <sphereGeometry args={[0.028, 16, 16]} />
          <meshBasicMaterial color={theme.emissive} transparent opacity={0.78} blending={AdditiveBlending} />
        </mesh>
      </group>
    </>
  );
}

export function PlanetCore({ moodKey }: { moodKey: MoodKey }) {
  const theme = useMemo(() => PLANET_THEMES[moodKey], [moodKey]);
  const [contextLost, setContextLost] = useState(false);
  const [visualPrefs, setVisualPrefs] = useState<VisualPreferences>({
    galaxyGlow: DEFAULT_GALAXY_GLOW,
    nebulaSpeed: DEFAULT_NEBULA_SPEED,
  });

  const speedPercent = clampPercent(visualPrefs.nebulaSpeed);
  const orbitSpeedFactor = useMemo(() => 0.28 + (speedPercent / 100) * 1.92, [speedPercent]);
  const orbitDurationA = useMemo(() => `${(22 - speedPercent * 0.2).toFixed(2)}s`, [speedPercent]);
  const orbitDurationB = useMemo(() => `${(28 - speedPercent * 0.24).toFixed(2)}s`, [speedPercent]);

  useEffect(() => {
    installThreeWarnFilter();
  }, []);

  useEffect(() => {
    setVisualPrefs(readVisualPreferences());

    const handlePreferenceChange = (event: Event) => {
      const customEvent = event as CustomEvent<VisualPreferences>;
      if (customEvent.detail) {
        setVisualPrefs({
          galaxyGlow: clampPercent(customEvent.detail.galaxyGlow),
          nebulaSpeed: clampPercent(customEvent.detail.nebulaSpeed),
        });
        return;
      }

      setVisualPrefs(readVisualPreferences());
    };

    const handleStorage = () => {
      setVisualPrefs(readVisualPreferences());
    };

    const handleVisibilitySync = () => {
      if (document.visibilityState === "visible") {
        setVisualPrefs(readVisualPreferences());
      }
    };

    window.addEventListener(MV_VISUAL_PREF_EVENT, handlePreferenceChange as EventListener);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleStorage);
    window.addEventListener("pageshow", handleStorage);
    document.addEventListener("visibilitychange", handleVisibilitySync);

    return () => {
      window.removeEventListener(MV_VISUAL_PREF_EVENT, handlePreferenceChange as EventListener);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleStorage);
      window.removeEventListener("pageshow", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibilitySync);
    };
  }, []);

  if (contextLost) {
    return (
      <div className="mv-planet-orbit-shell" style={{ ["--planet-trail" as string]: theme.emissive }}>
        <span className="mv-planet-trail mv-planet-trail-a" style={{ animationDuration: orbitDurationA }} />
        <span className="mv-planet-trail mv-planet-trail-b" style={{ animationDuration: orbitDurationB }} />
        <div className="mv-capture-planet" style={{ boxShadow: theme.shadow }}>
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: `radial-gradient(circle at 35% 27%, ${theme.emissive}, ${theme.base} 56%, #0d1238 100%)`,
              boxShadow: `inset 0 0 28px ${theme.emissive}44`,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mv-planet-orbit-shell" style={{ ["--planet-trail" as string]: theme.emissive }}>
      <span className="mv-planet-trail mv-planet-trail-a" style={{ animationDuration: orbitDurationA }} />
      <span className="mv-planet-trail mv-planet-trail-b" style={{ animationDuration: orbitDurationB }} />
      <div className="mv-capture-planet" style={{ boxShadow: theme.shadow }}>
        <Canvas
          dpr={[1, 1.2]}
          camera={{ position: [0, 0, 2.95], fov: 36 }}
          gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            const canvas = gl.domElement;
            canvas.addEventListener(
              "webglcontextlost",
              (event) => {
                event.preventDefault();
                setContextLost(true);
              },
              { passive: false },
            );
            canvas.addEventListener("webglcontextrestored", () => {
              setContextLost(false);
            });
          }}
        >
          <ambientLight intensity={0.62} />
          <hemisphereLight intensity={1.05} groundColor="#1b1340" color={theme.emissive} />
          <directionalLight position={[2.2, 1.5, 2.8]} intensity={0.88} color="#ffffff" />
          <directionalLight position={[-2.4, -0.8, 2.2]} intensity={0.42} color={theme.emissive} />
          <pointLight position={[-2.1, -1.6, 1.4]} intensity={0.62} color={theme.base} />
          <PlanetMesh theme={theme} galaxyGlow={visualPrefs.galaxyGlow} orbitSpeedFactor={orbitSpeedFactor} />
          <OrbitTrails theme={theme} orbitSpeedFactor={orbitSpeedFactor} />
          <Sparkles
            count={14}
            scale={2.1}
            size={1.05}
            speed={0.18 + orbitSpeedFactor * 0.13}
            color={theme.emissive}
          />
        </Canvas>
      </div>
    </div>
  );
}
