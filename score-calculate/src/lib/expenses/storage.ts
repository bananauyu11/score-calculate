import { ExpenseRecord } from "./types";

const STORAGE_KEY = "expense-records-v1";

export function loadExpenses(): ExpenseRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ExpenseRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveExpenses(records: ExpenseRecord[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export interface ExpenseMergeResult {
  merged: ExpenseRecord[];
  added: number;
  skipped: number;
}

export function mergeExpenses(
  existing: ExpenseRecord[],
  incoming: ExpenseRecord[]
): ExpenseMergeResult {
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

  const merged = Array.from(byId.values()).sort((a, b) => a.date.localeCompare(b.date));

  return { merged, added, skipped };
}
