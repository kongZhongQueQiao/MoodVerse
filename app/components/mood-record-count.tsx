"use client";

import { useEffect, useState } from "react";

type MoodSummaryResponse = {
  success: boolean;
  count?: number;
};

export function MoodRecordCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    const loadCount = async () => {
      try {
        const response = await fetch("/api/mood", { cache: "no-store" });
        if (!response.ok) return;

        const data = (await response.json()) as MoodSummaryResponse;
        if (active && data.success) {
          setCount(typeof data.count === "number" ? data.count : 0);
        }
      } catch {
        if (active) setCount(0);
      }
    };

    void loadCount();

    return () => {
      active = false;
    };
  }, []);

  return <span className="mv-record-count">{count ?? "--"} 条记录</span>;
}
