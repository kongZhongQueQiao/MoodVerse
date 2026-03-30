"use client";

import { AppShell } from "@/app/components/app-shell";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const palette = ["#d893ff", "#00e5ff", "#ff6b9f", "#4f57c9", "#2b8867"];

const settings = [
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
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
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
    if (action === "logout") {
      void handleLogout();
      return;
    }

    if (action === "deactivate") {
      setShowDeactivateModal(true);
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
        <div className="mv-setting-row">
          <span>银河辉光强度</span>
          <strong>{galaxyGlow}%</strong>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={galaxyGlow}
          onChange={(event) => setGalaxyGlow(Number(event.target.value))}
          className="mv-range"
        />
        <div className="mv-setting-row">
          <span>星云流动速度</span>
          <strong>{nebulaSpeed}%</strong>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={nebulaSpeed}
          onChange={(event) => setNebulaSpeed(Number(event.target.value))}
          className="mv-range"
        />

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
              disabled={(isLoggingOut && item.action === "logout") || (isDeleting && item.action === "deactivate")}
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

      <p className={`mv-auth-toast ${toast ? "show" : ""}`}>{toast}</p>
    </AppShell>
  );
}
