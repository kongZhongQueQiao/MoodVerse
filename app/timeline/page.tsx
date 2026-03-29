import { AppShell } from "@/app/components/app-shell";

const logs = [
  {
    title: "镜湖之晨",
    desc: "今天会议沟通很顺畅，预期中的任务也提前完成，因而再次不断听到内心的平静。",
    tags: ["通勤", "社交"],
  },
  {
    title: "余辉星港",
    desc: "和 Sarah 的咖啡聊天缓解了连续加班带来的紧绷，睡前冥想让身体回到平稳。",
    tags: ["关系", "恢复"],
  },
];

export default function TimelinePage() {
  return (
    <AppShell title="你的内在宇宙" subtitle="分析、生产力与稳定性在你的时间轴中持续共振。" showFab>
      <article className="mv-card mv-hero-card">
        <strong>84%</strong>
        <span>整体和谐度</span>
      </article>

      <article className="mv-card mv-dual-metric">
        <div>
          <p>光感洞察</p>
          <strong>+12.4%</strong>
        </div>
        <div>
          <p>深度睡眠</p>
          <strong>7.2h</strong>
        </div>
      </article>

      <article className="mv-card mv-line-chart">
        <h3>强度映射</h3>
        <div className="mv-line" />
      </article>

      <article className="mv-card mv-donut">
        <h3>主导地位</h3>
        <div className="mv-donut-core">喜悦</div>
      </article>

      <article className="mv-card">
        <h3>恒星日志</h3>
        <p>写下让你在宇宙中发光的事件。</p>
        <div className="mv-log-list">
          {logs.map((log) => (
            <article key={log.title} className="mv-log-item">
              <h4>{log.title}</h4>
              <p>{log.desc}</p>
              <div className="mv-chip-row">
                {log.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </article>
    </AppShell>
  );
}
