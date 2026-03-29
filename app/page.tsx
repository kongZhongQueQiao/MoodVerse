import { AppShell } from "@/app/components/app-shell";
import { DashboardSections } from "@/app/components/dashboard-sections";

export default function DashboardPage() {
  return (
    <AppShell
      title="欢迎回来，观星者。"
      subtitle="你的情感星云正在扩张，本周你已记录了 12 种状态，并形成这 84% 的共振。"
      primaryAction={{ label: "记录心情", href: "/mood/new" }}
      showFab
    >
      <DashboardSections />
    </AppShell>
  );
}
