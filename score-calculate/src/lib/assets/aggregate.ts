import { AssetAccount, AssetEntry } from "./types";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function endOfMonthStr(year: number, month: number): string {
  const last = new Date(year, month, 0).getDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
}

function endOfYearStr(year: number): string {
  return `${year}-12-31`;
}

export function entriesUpTo(entries: AssetEntry[], asOfDate: string): AssetEntry[] {
  return entries.filter((e) => e.date <= asOfDate);
}

export function balanceOfAccount(
  entries: AssetEntry[],
  accountId: string,
  asOfDate: string = todayStr()
): number {
  return entries
    .filter((e) => e.accountId === accountId && e.date <= asOfDate)
    .reduce((sum, e) => sum + e.amount, 0);
}

export interface AccountBalance {
  account: AssetAccount;
  balance: number;
  lastEntryDate: string | null;
}

export function currentBalances(
  accounts: AssetAccount[],
  entries: AssetEntry[],
  asOfDate: string = todayStr()
): AccountBalance[] {
  return accounts.map((account) => {
    const accountEntries = entries
      .filter((e) => e.accountId === account.id && e.date <= asOfDate)
      .sort((a, b) => a.date.localeCompare(b.date));
    const balance = accountEntries.reduce((sum, e) => sum + e.amount, 0);
    const lastEntryDate =
      accountEntries.length > 0 ? accountEntries[accountEntries.length - 1].date : null;
    return { account, balance, lastEntryDate };
  });
}

export function totalNetWorth(
  accounts: AssetAccount[],
  entries: AssetEntry[],
  asOfDate: string = todayStr()
): number {
  return currentBalances(accounts, entries, asOfDate).reduce((sum, b) => sum + b.balance, 0);
}

export function categoryBreakdown(
  accounts: AssetAccount[],
  entries: AssetEntry[],
  asOfDate: string = todayStr()
): { category: string; total: number }[] {
  const balances = currentBalances(accounts, entries, asOfDate);
  const byCategory = new Map<string, number>();
  for (const { account, balance } of balances) {
    byCategory.set(account.category, (byCategory.get(account.category) ?? 0) + balance);
  }
  return Array.from(byCategory.entries()).map(([category, total]) => ({ category, total }));
}

export function uniqueYears(entries: AssetEntry[]): number[] {
  const years = new Set(entries.map((e) => Number(e.date.slice(0, 4))));
  years.add(new Date().getFullYear());
  return Array.from(years).sort((a, b) => b - a);
}

export interface MonthlyNetWorthPoint {
  month: number;
  total: number;
}

export function monthlyNetWorthSeries(
  accounts: AssetAccount[],
  entries: AssetEntry[],
  year: number
): MonthlyNetWorthPoint[] {
  const today = todayStr();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const points: MonthlyNetWorthPoint[] = [];
  for (let m = 1; m <= 12; m++) {
    const isFuture = year > currentYear || (year === currentYear && m > currentMonth);
    if (isFuture) {
      points.push({ month: m, total: NaN });
      continue;
    }
    const cutoff = endOfMonthStr(year, m);
    const asOf = cutoff > today ? today : cutoff;
    points.push({ month: m, total: totalNetWorth(accounts, entries, asOf) });
  }
  return points;
}

export interface YearlyNetWorthPoint {
  year: number;
  total: number;
}

export function yearlyNetWorthSeries(
  accounts: AssetAccount[],
  entries: AssetEntry[]
): YearlyNetWorthPoint[] {
  const today = todayStr();
  const years = uniqueYears(entries).slice().sort((a, b) => a - b);
  return years.map((year) => {
    const cutoff = endOfYearStr(year);
    const asOf = cutoff > today ? today : cutoff;
    return { year, total: totalNetWorth(accounts, entries, asOf) };
  });
}

export interface HistoryPoint {
  date: string;
  total: number;
}

export function historySeries(accounts: AssetAccount[], entries: AssetEntry[]): HistoryPoint[] {
  const dates = Array.from(new Set(entries.map((e) => e.date))).sort((a, b) =>
    a.localeCompare(b)
  );
  return dates.map((date) => ({ date, total: totalNetWorth(accounts, entries, date) }));
}
