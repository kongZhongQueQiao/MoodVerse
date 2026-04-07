import crypto from "crypto";
import { readJsonFile, writeJsonFileAtomic } from "@/app/lib/persistence";

export type EngagementEventType = "weekly_review_view" | "import_completed";

export type EngagementEvent = {
  id: string;
  email: string;
  type: EngagementEventType;
  createdAt: string;
  metadata?: Record<string, string | number | boolean | null>;
};

const EVENTS_FILE = "engagement-events.json";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function toEventList(raw: unknown): EngagementEvent[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item): item is EngagementEvent => !!item && typeof item === "object")
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : crypto.randomUUID(),
      email: normalizeEmail(typeof item.email === "string" ? item.email : ""),
      type: (item.type === "import_completed" ? "import_completed" : "weekly_review_view") as EngagementEventType,
      createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
      metadata: item.metadata && typeof item.metadata === "object"
        ? (item.metadata as Record<string, string | number | boolean | null>)
        : undefined,
    }))
    .filter((item) => item.email.length > 0);
}

export async function readEngagementEvents() {
  const raw = await readJsonFile<unknown>(EVENTS_FILE, []);
  return toEventList(raw);
}

export async function appendEngagementEvent(
  email: string,
  type: EngagementEventType,
  metadata?: Record<string, string | number | boolean | null>,
) {
  const list = await readEngagementEvents();
  const nextEvent: EngagementEvent = {
    id: crypto.randomUUID(),
    email: normalizeEmail(email),
    type,
    createdAt: new Date().toISOString(),
    metadata,
  };

  list.push(nextEvent);
  await writeJsonFileAtomic(EVENTS_FILE, list);
  return nextEvent;
}
