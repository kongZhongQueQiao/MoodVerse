"use client";

import { AppShell } from "@/app/components/app-shell";
import { ChevronRight, Sparkles, Wind } from "lucide-react";
import { Range, getTrackBackground } from "react-range";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const palette = ["#d893ff", "#00e5ff", "#ff6b9f", "#4f57c9", "#2b8867"];

const settings = [
  { label: "清除个人数据", action: "clear-data" },
  { label: "退出登录", action: "logout" },
  { label: "注销账户", action: "deactivate" },
] as const;

export default function SettingsPage() {
  const router = useRouter();
  const [toast, setToast] = useState("");
  const [galaxyGlow, setGalaxyGlow] = useState(64);
  const [nebulaSpeed, setNebulaSpeed] = useState(42);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await fetch("/api/logout", { method: "POST" });
      setToast("登出成功");
      window.setTimeout(() => {
        router.replace("/login");
      }, 650);
    } catch {
      setToast("登出失败，请重试");
    } finally {
      window.setTimeout(() => {
        setToast("");
      }, 1800);
      setIsLoggingOut(false);
    }
  };

  const handleMenuClick = (action: (typeof settings)[number]["action"]) => {
    if (action === "clear-data") {
      setShowClearDataModal(true);
      return;
    }

    if (action === "logout") {
      void handleLogout();
      return;
    }

    if (action === "deactivate") {
      setShowDeactivateModal(true);
    }
  };

  const handleClearPersonalData = async () => {
    if (isClearingData) return;

    setIsClearingData(true);

    try {
      const response = await fetch("/api/mood", { method: "DELETE" });

      if (!response.ok) {
        setToast("清除失败，请稍后重试");
        return;
      }

      setToast("已清除个人心情数据");
      setShowClearDataModal(false);
    } catch {
      setToast("清除失败，请稍后重试");
    } finally {
      window.setTimeout(() => {
        setToast("");
      }, 1800);
      setIsClearingData(false);
    }
  };

  const handleDeactivate = async () => {
    if (isDeleting) return;

    setIsDeleting(true);

    try {
      const response = await fetch("/api/account", { method: "DELETE" });

      if (!response.ok) {
        setToast("注销失败，请稍后重试");
        return;
      }

      setToast("注销完成");
      setShowDeactivateModal(false);
      window.setTimeout(() => {
        router.replace("/login");
      }, 650);
    } catch {
      setToast("注销失败，请稍后重试");
    } finally {
      window.setTimeout(() => {
        setToast("");
      }, 1800);
      setIsDeleting(false);
    }
  };

  const handleMeditationMode = () => {
    setToast("已开启冥想模式");
    window.setTimeout(() => {
      setToast("");
    }, 1800);
  };

  const handleTimedWakeup = () => {
    const wakeupAt = Date.now() + 3 * 60 * 1000;
    window.localStorage.setItem("mv_wakeup_at", String(wakeupAt));
    window.dispatchEvent(new Event("mv-wakeup-scheduled"));
    setToast("3分钟后唤醒");
    window.setTimeout(() => {
      setToast("");
    }, 1800);
  };

  const handlePaletteClick = () => {
    setToast("功能开发中");
    window.setTimeout(() => {
      setToast("");
    }, 1800);
  };

  return (
    <AppShell title="系统配置" subtitle="个性化你的星系体验设置。">
      <article className="mv-card">
        <h3>视觉亮度</h3>
  <label className="mv-slider mv-capture-slider mv-setting-slider" style={{ ["--metric-color" as string]: "#d66eff" }}>
          <div className="mv-capture-slider-head">
            <span className="mv-capture-slider-label">
              <Sparkles size={13} />
              银河辉光强度
            </span>
            <strong className="mv-capture-slider-value">{galaxyGlow}%</strong>
          </div>
          <Range
            step={1}
            min={0}
            max={100}
            values={[galaxyGlow]}
            onChange={(values) => setGalaxyGlow(values[0] ?? 0)}
            renderTrack={({ props, children }) => (
              <div className="mv-capture-range-track-wrap" onMouseDown={props.onMouseDown} onTouchStart={props.onTouchStart}>
                <div
                  ref={props.ref}
                  className="mv-capture-range-track"
                  style={{
                    background: getTrackBackground({
                      values: [galaxyGlow],
                      colors: ["#d66effCC", "rgba(173, 181, 214, 0.34)"],
                      min: 0,
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
                    background: "#d66eff",
                    boxShadow: "0 0 6px rgba(214, 110, 255, 0.45)",
                  }}
                />
              );
            }}
          />
        </label>

  <label className="mv-slider mv-capture-slider mv-setting-slider" style={{ ["--metric-color" as string]: "#22d3ee" }}>
          <div className="mv-capture-slider-head">
            <span className="mv-capture-slider-label">
              <Wind size={13} />
              星云流动速度
            </span>
            <strong className="mv-capture-slider-value">{nebulaSpeed}%</strong>
          </div>
          <Range
            step={1}
            min={0}
            max={100}
            values={[nebulaSpeed]}
            onChange={(values) => setNebulaSpeed(values[0] ?? 0)}
            renderTrack={({ props, children }) => (
              <div className="mv-capture-range-track-wrap" onMouseDown={props.onMouseDown} onTouchStart={props.onTouchStart}>
                <div
                  ref={props.ref}
                  className="mv-capture-range-track"
                  style={{
                    background: getTrackBackground({
                      values: [nebulaSpeed],
                      colors: ["#22d3eeCC", "rgba(173, 181, 214, 0.34)"],
                      min: 0,
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
                    background: "#22d3ee",
                    boxShadow: "0 0 6px rgba(34, 211, 238, 0.45)",
                  }}
                />
              );
            }}
          />
        </label>

        <div className="mv-toggle-row">
          <span>动态反馈</span>
          <button className="mv-toggle active" onClick={handlePaletteClick} aria-label="动态反馈" />
        </div>
        <div className="mv-toggle-row">
          <span>粒子追踪</span>
          <button className="mv-toggle" onClick={handlePaletteClick} aria-label="粒子追踪" />
        </div>
      </article>

      <article className="mv-card">
        <h3>色彩资产</h3>
        <div className="mv-palette-grid">
          {palette.map((color) => (
            <button
              key={color}
              className="mv-swatch"
              style={{ background: color }}
              aria-label={color}
              onClick={handlePaletteClick}
            />
          ))}
          <button className="mv-swatch mv-swatch-plus" aria-label="新增" onClick={handlePaletteClick}>+</button>
        </div>
      </article>

      <article className="mv-card mv-focus-card">
        <h3>偏好专注</h3>
        <div className="mv-action-row">
          <button className="mv-btn mv-btn-primary" onClick={handleMeditationMode}>冥想模式</button>
          <button className="mv-btn mv-btn-ghost" onClick={handleTimedWakeup}>定时唤醒</button>
        </div>
      </article>

      <article className="mv-card">
        <h3>隐私安全</h3>
        <div className="mv-menu-list">
          {settings.map((item) => (
            <button
              key={item.label}
              className="mv-menu-item"
              disabled={
                (isClearingData && item.action === "clear-data") ||
                (isLoggingOut && item.action === "logout") ||
                (isDeleting && item.action === "deactivate")
              }
              onClick={() => handleMenuClick(item.action)}
            >
              <span>{item.label}</span>
              <ChevronRight size={16} />
            </button>
          ))}
        </div>
      </article>

      {mounted && showDeactivateModal
        ? createPortal(
            <div className="mv-modal-overlay" role="dialog" aria-modal="true" aria-label="注销账户确认">
              <div className="mv-modal-card">
                <h4>确认注销账户？</h4>
                <p>注销后将移除当前账户凭证与登录状态，且无法恢复。</p>
                <div className="mv-modal-actions">
                  <button
                    type="button"
                    className="mv-modal-btn mv-modal-btn-cancel"
                    onClick={() => setShowDeactivateModal(false)}
                    disabled={isDeleting}
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    className="mv-modal-btn mv-modal-btn-confirm"
                    onClick={() => void handleDeactivate()}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "注销中..." : "确认"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {mounted && showClearDataModal
        ? createPortal(
            <div className="mv-modal-overlay" role="dialog" aria-modal="true" aria-label="清除个人数据确认">
              <div className="mv-modal-card">
                <h4>确认清除个人数据？</h4>
                <p>将永久清空当前邮箱下的全部心情记录，且无法恢复。</p>
                <div className="mv-modal-actions">
                  <button
                    type="button"
                    className="mv-modal-btn mv-modal-btn-cancel"
                    onClick={() => setShowClearDataModal(false)}
                    disabled={isClearingData}
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    className="mv-modal-btn mv-modal-btn-confirm"
                    onClick={() => void handleClearPersonalData()}
                    disabled={isClearingData}
                  >
                    {isClearingData ? "清除中..." : "确认"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      <p className={`mv-auth-toast ${toast ? "show" : ""}`}>{toast}</p>
    </AppShell>
  );
}
