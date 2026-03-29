import { AppShell } from "@/app/components/app-shell";
import { ChevronRight } from "lucide-react";

const palette = ["#d893ff", "#00e5ff", "#ff6b9f", "#4f57c9", "#2b8867", "#111423"];

const settings = ["生物信号卡片可见性", "情绪通知频率", "隐私数据设置"];

export default function SettingsPage() {
  return (
    <AppShell title="系统配置" subtitle="个性化你的星系体验设置。">
      <article className="mv-card">
        <h3>视觉亮度</h3>
        <div className="mv-setting-row">
          <span>银河辉光强度</span>
          <strong>64%</strong>
        </div>
        <input type="range" defaultValue={64} className="mv-range" />
        <div className="mv-setting-row">
          <span>星云流动速度</span>
          <strong>42%</strong>
        </div>
        <input type="range" defaultValue={42} className="mv-range" />

        <div className="mv-toggle-row">
          <span>动态反馈</span>
          <button className="mv-toggle active" />
        </div>
        <div className="mv-toggle-row">
          <span>粒子追踪</span>
          <button className="mv-toggle" />
        </div>
      </article>

      <article className="mv-card">
        <h3>色彩资产</h3>
        <div className="mv-palette-grid">
          {palette.map((color) => (
            <button key={color} className="mv-swatch" style={{ background: color }} aria-label={color} />
          ))}
          <button className="mv-swatch mv-swatch-plus" aria-label="新增">+</button>
        </div>
      </article>

      <article className="mv-card">
        <h3>偏好专注</h3>
        <div className="mv-action-row">
          <button className="mv-btn mv-btn-primary">冥想模式</button>
          <button className="mv-btn mv-btn-ghost">定时唤醒</button>
        </div>
      </article>

      <article className="mv-card">
        <h3>神经安全</h3>
        <div className="mv-menu-list">
          {settings.map((item) => (
            <button key={item} className="mv-menu-item">
              <span>{item}</span>
              <ChevronRight size={16} />
            </button>
          ))}
        </div>
      </article>
    </AppShell>
  );
}
