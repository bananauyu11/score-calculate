"use client";

import { useEffect, useMemo, useState } from "react";
import { ExpenseRecord } from "@/lib/expenses/types";
import { byStoreTotals, recordsOfMonth, totalsOf, uniqueYears } from "@/lib/expenses/aggregate";
import ExpenseSummaryCard from "./ExpenseSummaryCard";

function yen(n: number): string {
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

export default function ExpenseMonthlyView({ records }: { records: ExpenseRecord[] }) {
  const years = useMemo(() => uniqueYears(records), [records]);
  const [year, setYear] = useState<number>(0);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);

  useEffect(() => {
    if (years.length > 0 && !years.includes(year)) {
      setYear(years[0]);
    }
  }, [years, year]);

  const monthRecords = useMemo(() => recordsOfMonth(records, year, month), [records, year, month]);
  const totals = useMemo(() => totalsOf(monthRecords), [monthRecords]);
  const topStores = useMemo(() => byStoreTotals(monthRecords), [monthRecords]);

  if (years.length === 0) {
    return <p className="text-sm text-neutral-500">データがありません。明細CSVを取り込んでください。</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}年
            </option>
          ))}
        </select>
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {m}月
            </option>
          ))}
        </select>
      </div>

      <ExpenseSummaryCard title={`${year}年${month}月 の支出`} totals={totals} />

      {topStores.length === 0 ? (
        <p className="text-sm text-neutral-500">この月のデータはありません。</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
          <table className="w-full min-w-[360px] text-sm">
            <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-900">
              <tr>
                <th className="p-2 text-left">利用店名・商品名</th>
                <th className="p-2 text-right">件数</th>
                <th className="p-2 text-right">金額</th>
              </tr>
            </thead>
            <tbody>
              {topStores.map(({ store, totals: t }) => (
                <tr key={store} className="border-t border-neutral-100 dark:border-neutral-800">
                  <td className="p-2">{store}</td>
                  <td className="p-2 text-right tabular-nums">{t.count}</td>
                  <td className="p-2 text-right tabular-nums">{yen(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
