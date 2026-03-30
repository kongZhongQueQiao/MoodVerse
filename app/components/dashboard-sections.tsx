import Link from "next/link";
import Image from "next/image";

const metrics = [
  {
    key: "heart",
    icon: "/icons/Container (2).svg",
    iconAlt: "心率图标",
    iconSize: { width: 14, height: 13 },
    title: "平均心率",
    value: "72 BPM",
    toneClass: "heart",
  },
  {
    key: "sleep",
    icon: "/icons/Container (1).svg",
    iconAlt: "睡眠图标",
    iconSize: { width: 14, height: 14 },
    title: "睡眠周期",
    value: "7.2h 深度",
    toneClass: "sleep",
  },
  {
    key: "energy",
    icon: "/icons/Icon.svg",
    iconAlt: "能量图标",
    iconSize: { width: 12, height: 15 },
    title: "活跃能量",
    value: "2.4k kcal",
    toneClass: "energy",
  },
  {
    key: "stable",
    icon: "/icons/Icon (1).svg",
    iconAlt: "稳定图标",
    iconSize: { width: 14, height: 12 },
    title: "呼吸总制",
    value: "94% 稳定性",
    toneClass: "stable",
  },
];

export function DashboardSections() {
  return (
    <>
      <article className="mv-card mv-orbit-card">
        <div className="mv-orbit-core">愉悦</div>
        <span className="mv-orbit-mini calm">平静</span>
        <span className="mv-orbit-mini focus">专注</span>
        <strong>84%</strong>
      </article>

      <article className="mv-card mv-orbit-drift-card">
        <h3 className="mv-section-title">
          <Image src="/icons/Container.svg" alt="轨道图标" width={18} height={10} />
          轨道漂移
        </h3>
        <div className="mv-progress-row">
          <span>清醒脉冲</span>
          <strong>+12.4%</strong>
        </div>
        <div className="mv-progress">
          <i style={{ width: "78%" }} />
        </div>
        <div className="mv-progress-row">
          <span>时间稳定性</span>
          <strong>良性</strong>
        </div>
        <div className="mv-progress purple">
          <i style={{ width: "66%" }} />
        </div>
      </article>

      <article className="mv-card mv-inline-info">
        <h4>星盘分析</h4>
        <p>你在黄昏时段达到最高的创造力模式。</p>
        <Link href="/timeline">查看洞察 →</Link>
      </article>

      <div className="mv-metrics-grid">
        {metrics.map((metric) => (
          <article key={metric.key} className="mv-card mv-metric">
            <span className={`mv-metric-icon ${metric.toneClass}`}>
              <Image
                src={metric.icon}
                alt={metric.iconAlt}
                width={metric.iconSize.width}
                height={metric.iconSize.height}
              />
            </span>

            <div className="mv-metric-copy">
              <span className="mv-metric-title">{metric.title}</span>
              <strong className="mv-metric-value">{metric.value}</strong>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
