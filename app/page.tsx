import { AppShell } from "@/app/components/app-shell";
import { DashboardSections } from "@/app/components/dashboard-sections";

export default function DashboardPage() {
  return (
    <AppShell
      title="欢迎回来，观星者。"
      subtitle="记录今天的状态，让你的情绪星图逐步成形。"
      primaryAction={{ label: "记录心情", href: "/mood/new" }}
      showFab
    >
      <DashboardSections />
    </AppShell>
  );
}
