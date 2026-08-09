import { CardPayment } from "./types";

const ITEMS_KEY = "card-payments-v1";
const CASH_KEY = "card-cash-on-hand-v1";

export function loadCardPayments(): CardPayment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ITEMS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CardPayment[]) : [];
  } catch {
    return [];
  }
}

export function saveCardPayments(items: CardPayment[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

export function loadCashOnHand(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(CASH_KEY);
  const n = raw ? Number(raw) : 0;
  return Number.isNaN(n) ? 0 : n;
}

export function saveCashOnHand(amount: number): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CASH_KEY, String(amount));
}
