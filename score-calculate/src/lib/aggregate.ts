import { BetRecord, profitOf, stakeOf } from "./types";

export interface Totals {
  stake: number;
  payout: number;
  profit: number;
  recoveryRate: number | null; // %
  count: number;
}

export function totalsOf(records: BetRecord[]): Totals {
  const stake = records.reduce((s, r) => s + stakeOf(r), 0);
  const payout = records.reduce((s, r) => s + r.payout, 0);
  const profit = payout - stake;
  const recoveryRate = stake > 0 ? (payout / stake) * 100 : null;
  return { stake, payout, profit, recoveryRate, count: records.length };
}

export function uniqueTracks(records: BetRecord[]): string[] {
  return Array.from(new Set(records.map((r) => r.track))).sort();
}

export function uniqueYears(records: BetRecord[]): number[] {
  return Array.from(new Set(records.map((r) => Number(r.date.slice(0, 4))))).sort(
    (a, b) => b - a
  );
}

export function datesWithRecords(records: BetRecord[]): string[] {
  return Array.from(new Set(records.map((r) => r.date))).sort((a, b) => b.localeCompare(a));
}

export function recordsOfDate(records: BetRecord[], date: string): BetRecord[] {
  return records.filter((r) => r.date === date);
}

export function recordsOfMonth(records: BetRecord[], year: number, month: number): BetRecord[] {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return records.filter((r) => r.date.startsWith(prefix));
}

export function recordsOfYear(records: BetRecord[], year: number): BetRecord[] {
  const prefix = `${year}-`;
  return records.filter((r) => r.date.startsWith(prefix));
}

export function byTrackTotals(records: BetRecord[]): { track: string; totals: Totals }[] {
  return uniqueTracks(records).map((track) => ({
    track,
    totals: totalsOf(records.filter((r) => r.track === track)),
  }));
}

export interface MonthlyPoint {
  month: number;
  stake: number;
  payout: number;
  profit: number;
}

export function monthlySeries(
  records: BetRecord[],
  year: number,
  track: string | "ALL"
): MonthlyPoint[] {
  const points: MonthlyPoint[] = [];
  for (let m = 1; m <= 12; m++) {
    const monthRecords = recordsOfMonth(records, year, m).filter(
      (r) => track === "ALL" || r.track === track
    );
    const t = totalsOf(monthRecords);
    points.push({ month: m, stake: t.stake, payout: t.payout, profit: t.profit });
  }
  return points;
}

export { profitOf, stakeOf };
