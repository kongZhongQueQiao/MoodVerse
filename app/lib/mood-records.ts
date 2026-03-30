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

const MOOD_RECORDS_FILE = "mood-records.json";

export async function readMoodRecords(): Promise<MoodRecord[]> {
  const records = await readJsonFile<MoodRecord[]>(MOOD_RECORDS_FILE, []);
  return Array.isArray(records) ? records : [];
}

export async function createMoodRecord(input: MoodRecordInput) {
  const records = await readMoodRecords();

  const nextRecord: MoodRecord = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };

  records.unshift(nextRecord);
  await writeJsonFileAtomic(MOOD_RECORDS_FILE, records);

  return {
    record: nextRecord,
    count: records.length,
  };
}

export async function getMoodRecordSummary() {
  const records = await readMoodRecords();
  return {
    count: records.length,
    latest: records[0] ?? null,
  };
}
