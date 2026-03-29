"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Orbit, Settings, Sparkles } from "lucide-react";

const tabs = [
  { href: "/", label: "仪表盘", Icon: LayoutGrid, match: ["/"] },
  { href: "/mood", label: "心情", Icon: Sparkles, match: ["/mood"] },
  { href: "/timeline", label: "事件轴", Icon: Orbit, match: ["/timeline"] },
  { href: "/settings", label: "设置", Icon: Settings, match: ["/settings"] },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="mv-bottom-nav" aria-label="主导航">
      {tabs.map(({ href, label, Icon, match }) => {
        const active = match.some((prefix) =>
          prefix === "/" ? pathname === "/" : pathname.startsWith(prefix),
        );

        return (
          <Link key={href} href={href} className={`mv-tab ${active ? "active" : ""}`}>
            <Icon size={16} strokeWidth={2.4} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
