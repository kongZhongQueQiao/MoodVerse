import { AppShell } from "@/app/components/app-shell";
import { MoodPlanet } from "@/app/components/mood-planet";

export default function MoodPage() {
  return (
    <AppShell
      title="愉悦行星"
      subtitle="本周你在这片情绪空间中度过了 42% 的时间，这里的轨迹充满能量光斑。"
      primaryAction={{ label: "记录心情", href: "/mood/new" }}
      secondaryAction={{ label: "查看星系图", href: "/timeline" }}
    >
      <MoodPlanet score={88} label="愉悦" size="lg" />

      <article className="mv-card mv-chart-card">
        <h3>趋势分析</h3>
        <p>过去 7 天情绪的振幅正在稳定收敛。</p>
        <div className="mv-bars">
          {Array.from({ length: 7 }).map((_, index) => (
            <span key={index} style={{ height: `${20 + ((index + 2) % 5) * 10}%` }} />
          ))}
        </div>
      </article>

      <article className="mv-card mv-inline-info">
        <h4>触发点</h4>
        <p>
          高亮事件 <strong>工作成就</strong> 为你的愉悦体验贡献超过 56%。
        </p>
      </article>

      <article className="mv-card mv-inline-info">
        <h4>呼吸影响</h4>
        <p>8% 以上的慢呼吸习惯可令神经恢复效率提升 24%。</p>
      </article>
    </AppShell>
  );
}
