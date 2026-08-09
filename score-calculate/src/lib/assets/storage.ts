import { AssetAccount, AssetEntry } from "./types";

const ACCOUNTS_KEY = "asset-accounts-v1";
const ENTRIES_KEY = "asset-entries-v1";

function load<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function save<T>(key: string, value: T[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadAccounts(): AssetAccount[] {
  return load<AssetAccount>(ACCOUNTS_KEY);
}

export function saveAccounts(accounts: AssetAccount[]): void {
  save(ACCOUNTS_KEY, accounts);
}

export function loadEntries(): AssetEntry[] {
  return load<AssetEntry>(ENTRIES_KEY);
}

export function saveEntries(entries: AssetEntry[]): void {
  save(ENTRIES_KEY, entries);
}
