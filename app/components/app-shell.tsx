import Link from "next/link";
import type { ReactNode } from "react";
import { Bell, Plus } from "lucide-react";
import { BottomNav } from "./bottom-nav";

type AppShellProps = {
  title: ReactNode;
  subtitle?: string;
  children: ReactNode;
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  showFab?: boolean;
  headerRight?: ReactNode;
};

export function AppShell({
  title,
  subtitle,
  children,
  primaryAction,
  secondaryAction,
  showFab,
  headerRight,
}: AppShellProps) {
  return (
    <div className="mv-root">
      <section className="mv-phone">
        <header className="mv-header">
          <div>
            <p className="mv-brand">MoodVerse</p>
          </div>
          {headerRight ?? (
            <button className="mv-icon-btn" aria-label="通知">
              <Bell size={14} />
            </button>
          )}
        </header>

        <main className="mv-content">
          <div className="mv-title-wrap">
            <h1 className="mv-title">{title}</h1>
            {subtitle ? <p className="mv-subtitle">{subtitle}</p> : null}
            {(primaryAction || secondaryAction) && (
              <div className="mv-action-row">
                {primaryAction && (
                  <Link href={primaryAction.href} className="mv-btn mv-btn-primary">
                    {primaryAction.label}
                  </Link>
                )}
                {secondaryAction && (
                  <Link href={secondaryAction.href} className="mv-btn mv-btn-ghost">
                    {secondaryAction.label}
                  </Link>
                )}
              </div>
            )}
          </div>

          {children}
        </main>

        <BottomNav />

        {showFab ? (
          <Link href="/mood/new" aria-label="新增心情" className="mv-fab">
            <Plus size={18} />
          </Link>
        ) : null}
      </section>
    </div>
  );
}
