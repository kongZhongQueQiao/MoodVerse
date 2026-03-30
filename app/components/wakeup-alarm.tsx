"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

const WAKEUP_KEY = "mv_wakeup_at";

const readWakeupAt = () => {
  if (typeof window === "undefined") return null;
  const value = Number(window.localStorage.getItem(WAKEUP_KEY) ?? "0");
  return Number.isFinite(value) && value > 0 ? value : null;
};

export function WakeupAlarm() {
  const [wakeupAt, setWakeupAt] = useState<number | null>(null);
  const [showWakeup, setShowWakeup] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    const initTimer = window.setTimeout(() => {
      setWakeupAt(readWakeupAt());
    }, 0);

    const onStorage = (event: StorageEvent) => {
      if (event.key !== WAKEUP_KEY) return;
      const next = Number(event.newValue ?? "0");
      setWakeupAt(Number.isFinite(next) && next > 0 ? next : null);
    };

    const onScheduled = () => {
      setWakeupAt(readWakeupAt());
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("mv-wakeup-scheduled", onScheduled);

    return () => {
      window.clearTimeout(initTimer);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("mv-wakeup-scheduled", onScheduled);
    };
  }, []);

  useEffect(() => {
    if (!wakeupAt) return;

    const updateRemaining = () => {
      const remainMs = Math.max(0, wakeupAt - Date.now());
      setRemainingSeconds(Math.ceil(remainMs / 1000));

      if (remainMs <= 0) {
        window.localStorage.removeItem(WAKEUP_KEY);
        setWakeupAt(null);
        setShowWakeup(true);
      }
    };

    updateRemaining();
    const timer = window.setInterval(updateRemaining, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [wakeupAt]);

  const countdown = useMemo(() => {
    if (!wakeupAt) return "";
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }, [wakeupAt, remainingSeconds]);

  if (typeof document === "undefined") return null;

  return (
    <>
      {wakeupAt ? <p className="mv-wakeup-chip">唤醒倒计时 {countdown}</p> : null}
      {showWakeup
        ? createPortal(
            <div className="mv-wakeup-overlay" role="dialog" aria-modal="true" aria-label="定时唤醒">
              <div className="mv-wakeup-card">
                <h4>唤醒时间到</h4>
                <p>已完成 3 分钟专注休整，继续探索你的情绪宇宙吧。</p>
                <button type="button" className="mv-wakeup-btn" onClick={() => setShowWakeup(false)}>
                  我知道了
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
