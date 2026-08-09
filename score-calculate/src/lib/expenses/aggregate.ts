import { ExpenseRecord, TransactionType } from "./types";

export interface ExpenseTotals {
  amount: number;
  count: number;
}

export function totalsOf(records: ExpenseRecord[]): ExpenseTotals {
  const amount = records.reduce((s, r) => s + r.amount, 0);
  return { amount, count: records.length };
}

export interface NetTotals {
  expense: number;
  income: number;
  net: number;
  count: number;
}

export function netTotalsOf(records: ExpenseRecord[]): NetTotals {
  const expense = records
    .filter((r) => r.type === "expense")
    .reduce((s, r) => s + r.amount, 0);
  const income = records.filter((r) => r.type === "income").reduce((s, r) => s + r.amount, 0);
  return { expense, income, net: income - expense, count: records.length };
}

export function uniqueYears(records: ExpenseRecord[]): number[] {
  const years = new Set(records.map((r) => Number(r.date.slice(0, 4))));
  years.add(new Date().getFullYear());
  return Array.from(years).sort((a, b) => b - a);
}

export function datesWithRecords(records: ExpenseRecord[]): string[] {
  return Array.from(new Set(records.map((r) => r.date))).sort((a, b) => b.localeCompare(a));
}

export function recordsOfDate(records: ExpenseRecord[], date: string): ExpenseRecord[] {
  return records.filter((r) => r.date === date);
}

export function recordsOfMonth(
  records: ExpenseRecord[],
  year: number,
  month: number
): ExpenseRecord[] {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return records.filter((r) => r.date.startsWith(prefix));
}

export function recordsOfYear(records: ExpenseRecord[], year: number): ExpenseRecord[] {
  const prefix = `${year}-`;
  return records.filter((r) => r.date.startsWith(prefix));
}

export function recordsOfType(
  records: ExpenseRecord[],
  type: TransactionType | "all"
): ExpenseRecord[] {
  return type === "all" ? records : records.filter((r) => r.type === type);
}

export function recordsOfCategory(
  records: ExpenseRecord[],
  category: string | "all"
): ExpenseRecord[] {
  return category === "all" ? records : records.filter((r) => r.category === category);
}

export interface StoreTotal {
  store: string;
  totals: ExpenseTotals;
}

export function byStoreTotals(records: ExpenseRecord[], limit = 10): StoreTotal[] {
  const stores = Array.from(new Set(records.map((r) => r.store)));
  return stores
    .map((store) => ({ store, totals: totalsOf(records.filter((r) => r.store === store)) }))
    .sort((a, b) => b.totals.amount - a.totals.amount)
    .slice(0, limit);
}

export interface CategoryTotal {
  category: string;
  totals: ExpenseTotals;
}

export function byCategoryTotals(records: ExpenseRecord[]): CategoryTotal[] {
  const categories = Array.from(new Set(records.map((r) => r.category)));
  return categories
    .map((category) => ({
      category,
      totals: totalsOf(records.filter((r) => r.category === category)),
    }))
    .sort((a, b) => b.totals.amount - a.totals.amount);
}

export interface MonthlyExpensePoint {
  month: number;
  expense: number;
  income: number;
  net: number;
}

export function monthlySeries(records: ExpenseRecord[], year: number): MonthlyExpensePoint[] {
  const points: MonthlyExpensePoint[] = [];
  for (let m = 1; m <= 12; m++) {
    const t = netTotalsOf(recordsOfMonth(records, year, m));
    points.push({ month: m, expense: t.expense, income: t.income, net: t.net });
  }
  return points;
}
