"use client";

import { useEffect, useMemo, useState } from "react";
import { ExpenseRecord } from "@/lib/expenses/types";
import { monthlySeries, recordsOfYear, totalsOf, uniqueYears } from "@/lib/expenses/aggregate";
import ExpenseSummaryCard from "./ExpenseSummaryCard";

function yen(n: number): string {
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

export default function ExpenseYearlyView({ records }: { records: ExpenseRecord[] }) {
  const years = useMemo(() => uniqueYears(records), [records]);
  const [year, setYear] = useState<number>(0);

  useEffect(() => {
    if (years.length > 0 && !years.includes(year)) {
      setYear(years[0]);
    }
  }, [years, year]);

  const yearRecords = useMemo(() => recordsOfYear(records, year), [records, year]);
  const totals = useMemo(() => totalsOf(yearRecords), [yearRecords]);
  const months = useMemo(() => monthlySeries(records, year), [records, year]);

  if (years.length === 0) {
    return <p className="text-sm text-neutral-500">データがありません。明細CSVを取り込んでください。</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <select
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
        className="w-fit rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}年
          </option>
        ))}
      </select>

      <ExpenseSummaryCard title={`${year}年 の支出`} totals={totals} />

      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
        <table className="w-full min-w-[280px] text-sm">
          <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-900">
            <tr>
              <th className="p-2 text-left">月</th>
              <th className="p-2 text-right">金額</th>
            </tr>
          </thead>
          <tbody>
            {months.map((m) => (
              <tr key={m.month} className="border-t border-neutral-100 dark:border-neutral-800">
                <td className="p-2">{m.month}月</td>
                <td className="p-2 text-right tabular-nums">{yen(m.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
