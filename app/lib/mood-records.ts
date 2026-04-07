import crypto from "crypto";
import { readJsonFile, writeJsonFileAtomic } from "@/app/lib/persistence";
import type { MoodKey } from "@/app/lib/mood-meta";

export type MoodRecord = {
  id: string;
  mood: MoodKey;
  heartRate: number;
  sleep: number;
  energy: number;
  stability: number;
  note: string;
  tags: string[];
  createdAt: string;
};

type MoodRecordInput = Omit<MoodRecord, "id" | "createdAt">;
type MoodRecordsByUser = Record<string, MoodRecord[]>;

const MOOD_RECORDS_FILE = "mood-records.json";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function toUserMap(raw: unknown): MoodRecordsByUser {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }

  const result: MoodRecordsByUser = {};
  for (const [email, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!Array.isArray(value)) continue;
    result[normalizeEmail(email)] = value as MoodRecord[];
  }

  return result;
}

async function readMoodRecordsStore() {
  const raw = await readJsonFile<unknown>(MOOD_RECORDS_FILE, {});
  return toUserMap(raw);
}

function normalizeRecordShape(raw: MoodRecord): MoodRecord {
  return {
    id: typeof raw.id === "string" && raw.id.trim().length > 0 ? raw.id : crypto.randomUUID(),
    mood: raw.mood,
    heartRate: raw.heartRate,
    sleep: raw.sleep,
    energy: raw.energy,
    stability: raw.stability,
    note: typeof raw.note === "string" ? raw.note : "",
    tags: Array.isArray(raw.tags) ? raw.tags.filter((item): item is string => typeof item === "string") : [],
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
  };
}

function dedupeAndSortRecords(records: MoodRecord[]) {
  const seen = new Set<string>();
  const normalized: MoodRecord[] = [];

  for (const record of records) {
    const item = normalizeRecordShape(record);
    const key = `${item.createdAt}|${item.mood}|${item.heartRate}|${item.sleep}|${item.energy}|${item.stability}|${item.note}`;
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(item);
  }

  normalized.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return normalized;
}

export async function readAllMoodRecordsByUser(): Promise<MoodRecordsByUser> {
  return readMoodRecordsStore();
}

export async function readMoodRecords(email: string): Promise<MoodRecord[]> {
  const recordsByUser = await readMoodRecordsStore();
  return recordsByUser[normalizeEmail(email)] ?? [];
}

export async function createMoodRecord(email: string, input: MoodRecordInput) {
  const recordsByUser = await readMoodRecordsStore();
  const userEmail = normalizeEmail(email);
  const userRecords = recordsByUser[userEmail] ?? [];

  const nextRecord: MoodRecord = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };

  userRecords.unshift(nextRecord);
  recordsByUser[userEmail] = userRecords;
  await writeJsonFileAtomic(MOOD_RECORDS_FILE, recordsByUser);

  return {
    record: nextRecord,
    count: userRecords.length,
  };
}

export type ImportedMoodRecordInput = MoodRecordInput & {
  createdAt?: string;
};

export async function importMoodRecords(email: string, records: ImportedMoodRecordInput[]) {
  const recordsByUser = await readMoodRecordsStore();
  const userEmail = normalizeEmail(email);
  const existing = recordsByUser[userEmail] ?? [];

  const imported: MoodRecord[] = records.map((record) => ({
    id: crypto.randomUUID(),
    mood: record.mood,
    heartRate: record.heartRate,
    sleep: record.sleep,
    energy: record.energy,
    stability: record.stability,
    note: record.note,
    tags: record.tags,
    createdAt: record.createdAt && Number.isFinite(Date.parse(record.createdAt))
      ? new Date(record.createdAt).toISOString()
      : new Date().toISOString(),
  }));

  const merged = dedupeAndSortRecords([...existing, ...imported]);
  recordsByUser[userEmail] = merged;
  await writeJsonFileAtomic(MOOD_RECORDS_FILE, recordsByUser);

  return {
    importedCount: Math.max(0, merged.length - existing.length),
    totalCount: merged.length,
  };
}

export async function getMoodRecordSummary(email: string) {
  const records = await readMoodRecords(email);
  return {
    count: records.length,
    latest: records[0] ?? null,
  };
}

export async function clearMoodRecords(email: string) {
  const recordsByUser = await readMoodRecordsStore();
  const userEmail = normalizeEmail(email);
  const removedCount = recordsByUser[userEmail]?.length ?? 0;

  delete recordsByUser[userEmail];
  await writeJsonFileAtomic(MOOD_RECORDS_FILE, recordsByUser);

  return { removedCount };
}
