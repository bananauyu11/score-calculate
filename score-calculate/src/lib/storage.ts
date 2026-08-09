import { BetRecord } from "./types";

const STORAGE_KEY = "keiba-shushi-records-v1";

export function loadRecords(): BetRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as BetRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveRecords(records: BetRecord[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export interface MergeResult {
  merged: BetRecord[];
  added: number;
  skipped: number;
}

export function mergeRecords(existing: BetRecord[], incoming: BetRecord[]): MergeResult {
  const byId = new Map(existing.map((r) => [r.id, r]));
  let added = 0;
  let skipped = 0;

  for (const r of incoming) {
    if (byId.has(r.id)) {
      skipped += 1;
      continue;
    }
    byId.set(r.id, r);
    added += 1;
  }

  const merged = Array.from(byId.values()).sort(
    (a, b) => a.date.localeCompare(b.date) || a.raceNo - b.raceNo
  );

  return { merged, added, skipped };
}
