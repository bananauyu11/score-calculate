import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES, TransactionType } from "./types";

const KEYS: Record<TransactionType, string> = {
  expense: "expense-categories-v1",
  income: "income-categories-v1",
};

const DEFAULTS: Record<TransactionType, string[]> = {
  expense: DEFAULT_EXPENSE_CATEGORIES,
  income: DEFAULT_INCOME_CATEGORIES,
};

export function loadCategories(type: TransactionType): string[] {
  if (typeof window === "undefined") return DEFAULTS[type];
  try {
    const raw = window.localStorage.getItem(KEYS[type]);
    if (!raw) return DEFAULTS[type];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULTS[type];
  } catch {
    return DEFAULTS[type];
  }
}

export function saveCategories(type: TransactionType, categories: string[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEYS[type], JSON.stringify(categories));
}

export function addCategory(type: TransactionType, name: string): string[] {
  const trimmed = name.trim();
  const current = loadCategories(type);
  if (!trimmed || current.includes(trimmed)) return current;
  const next = [...current, trimmed];
  saveCategories(type, next);
  return next;
}

export function removeCategory(type: TransactionType, name: string): string[] {
  const next = loadCategories(type).filter((c) => c !== name);
  saveCategories(type, next);
  return next;
}
