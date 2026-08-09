"use client";

import { useEffect, useMemo, useState } from "react";
import { ExpenseRecord } from "@/lib/expenses/types";
import { datesWithRecords, recordsOfDate, totalsOf } from "@/lib/expenses/aggregate";
import ExpenseSummaryCard from "./ExpenseSummaryCard";

function yen(n: number): string {
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

export default function ExpenseDailyView({ records }: { records: ExpenseRecord[] }) {
  const dates = useMemo(() => datesWithRecords(records), [records]);
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    if (dates.length > 0 && !dates.includes(date)) {
      setDate(dates[0]);
    }
  }, [dates, date]);

  const dayRecords = useMemo(() => recordsOfDate(records, date), [records, date]);
  const totals = useMemo(() => totalsOf(dayRecords), [dayRecords]);

  if (dates.length === 0) {
    return <p className="text-sm text-neutral-500">データがありません。明細CSVを取り込んでください。</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <select
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-fit rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      >
        {dates.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <ExpenseSummaryCard title={`${date} の支出`} totals={totals} />

      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
        <table className="w-full min-w-[420px] text-sm">
          <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-900">
            <tr>
              <th className="p-2 text-left">利用店名・商品名</th>
              <th className="p-2 text-left">決済方法</th>
              <th className="p-2 text-right">金額</th>
            </tr>
          </thead>
          <tbody>
            {dayRecords.map((r) => (
              <tr key={r.id} className="border-t border-neutral-100 dark:border-neutral-800">
                <td className="p-2 align-top">{r.store}</td>
                <td className="p-2 align-top text-neutral-400">{r.method ?? "-"}</td>
                <td className="p-2 text-right align-top tabular-nums">{yen(r.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
