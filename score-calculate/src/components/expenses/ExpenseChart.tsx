"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ExpenseRecord } from "@/lib/expenses/types";
import { monthlySeries, uniqueYears } from "@/lib/expenses/aggregate";

function yen(n: number): string {
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

export default function ExpenseChart({ records }: { records: ExpenseRecord[] }) {
  const years = useMemo(() => uniqueYears(records), [records]);
  const [year, setYear] = useState<number>(0);

  useEffect(() => {
    if (years.length > 0 && !years.includes(year)) {
      setYear(years[0]);
    }
  }, [years, year]);

  const data = useMemo(
    () => monthlySeries(records, year).map((d) => ({ ...d, label: `${d.month}月` })),
    [records, year]
  );

  if (records.length === 0) {
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

      <div className="h-72 rounded-xl border border-neutral-200 bg-white p-2 dark:border-neutral-800 dark:bg-neutral-900">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-neutral-200 dark:text-neutral-800"
            />
            <XAxis dataKey="label" fontSize={12} stroke="currentColor" className="text-neutral-500" />
            <YAxis
              fontSize={12}
              stroke="currentColor"
              className="text-neutral-500"
              tickFormatter={(v) => `${(v / 1000).toLocaleString()}k`}
            />
            <Tooltip formatter={(value: number) => yen(value)} labelFormatter={(label) => `${year}年${label}`} />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.amount > 0 ? "#e11d48" : "#a3a3a3"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-neutral-400">月ごとの支出合計を表示しています。</p>
    </div>
  );
}
