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
  if (Array.isArray(raw)) {
    return {};
  }

  if (!raw || typeof raw !== "object") {
    return {};
  }

  const entries = Object.entries(raw as Record<string, unknown>);
  const result: MoodRecordsByUser = {};

  for (const [email, value] of entries) {
    if (!Array.isArray(value)) continue;
    result[normalizeEmail(email)] = value as MoodRecord[];
  }

  return result;
}

async function readMoodRecordsStore() {
  const raw = await readJsonFile<unknown>(MOOD_RECORDS_FILE, {});
  return toUserMap(raw);
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

export async function getMoodRecordSummary(email: string) {
  const records = await readMoodRecords(email);
  return {
    count: records.length,
    latest: records[0] ?? null,
  };
}
