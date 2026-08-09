import { FixedCostItem } from "./types";

const ITEMS_KEY = "fixed-cost-items-v1";
const TAKE_HOME_KEY = "take-home-pay-v1";

export function loadFixedCosts(): FixedCostItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ITEMS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FixedCostItem[]) : [];
  } catch {
    return [];
  }
}

export function saveFixedCosts(items: FixedCostItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

export function loadTakeHomePay(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(TAKE_HOME_KEY);
  const n = raw ? Number(raw) : 0;
  return Number.isNaN(n) ? 0 : n;
}

export function saveTakeHomePay(amount: number): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TAKE_HOME_KEY, String(amount));
}
