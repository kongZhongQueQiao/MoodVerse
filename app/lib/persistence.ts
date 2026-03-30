import { promises as fs } from "fs";
import os from "os";
import path from "path";

let cachedDataDir: string | null = null;

const DATA_DIR_CANDIDATES = [
  process.env.MV_DATA_DIR,
  path.join(process.cwd(), "data"),
  path.join(os.tmpdir(), "moodverse-data"),
].filter((item): item is string => typeof item === "string" && item.trim().length > 0);

async function isDirWritable(dirPath: string) {
  const probeFile = path.join(dirPath, `.mv-probe-${Date.now()}-${Math.random().toString(16).slice(2)}.tmp`);
  try {
    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(probeFile, "ok", "utf8");
    await fs.unlink(probeFile);
    return true;
  } catch {
    return false;
  }
}

export async function resolveDataDir() {
  if (cachedDataDir) return cachedDataDir;

  for (const candidate of DATA_DIR_CANDIDATES) {
    if (await isDirWritable(candidate)) {
      cachedDataDir = candidate;
      return candidate;
    }
  }

  throw new Error("No writable data directory found. Set MV_DATA_DIR to a writable persistent path.");
}

export async function getDataFilePath(fileName: string) {
  const dataDir = await resolveDataDir();
  return path.join(dataDir, fileName);
}

export async function ensureJsonFile<T>(fileName: string, initialValue: T) {
  const filePath = await getDataFilePath(fileName);

  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(initialValue, null, 2), "utf8");
  }

  return filePath;
}

export async function readJsonFile<T>(fileName: string, fallback: T): Promise<T> {
  const filePath = await ensureJsonFile(fileName, fallback);

  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    await writeJsonFileAtomic(fileName, fallback);
    return fallback;
  }
}

export async function writeJsonFileAtomic<T>(fileName: string, data: T) {
  const filePath = await getDataFilePath(fileName);
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;

  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tempPath, filePath);
}
