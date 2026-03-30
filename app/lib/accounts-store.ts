import crypto from "crypto";
import { readJsonFile, writeJsonFileAtomic } from "@/app/lib/persistence";

export type Account = {
  email: string;
  passwordHash: string;
  createdAt: string;
};

const ACCOUNTS_FILE = "accounts.json";

const hashPassword = (password: string) => crypto.createHash("sha256").update(password).digest("hex");

const defaultAccounts: Account[] = [
  {
    email: "example@gmail.com",
    passwordHash: hashPassword("123456"),
    createdAt: new Date().toISOString(),
  },
];

export async function readAccounts(): Promise<Account[]> {
  const records = await readJsonFile<Account[]>(ACCOUNTS_FILE, defaultAccounts);
  return Array.isArray(records) ? records : defaultAccounts;
}

export async function saveAccounts(accounts: Account[]) {
  await writeJsonFileAtomic(ACCOUNTS_FILE, accounts);
}

export function verifyPassword(password: string, passwordHash: string) {
  return hashPassword(password) === passwordHash;
}

export function createPasswordHash(password: string) {
  return hashPassword(password);
}
