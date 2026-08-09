"use client";

import { useEffect, useMemo, useState } from "react";
import { ExpenseRecord, TransactionType } from "@/lib/expenses/types";
import {
  monthlySeries,
  netTotalsOf,
  recordsOfCategory,
  recordsOfType,
  recordsOfYear,
  uniqueYears,
} from "@/lib/expenses/aggregate";
import TransactionSummaryCard from "./TransactionSummaryCard";
import TransactionFilters from "./TransactionFilters";

function yen(n: number): string {
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

interface Props {
  records: ExpenseRecord[];
  expenseCategories: string[];
  incomeCategories: string[];
}

export default function ExpenseYearlyView({ records, expenseCategories, incomeCategories }: Props) {
  const years = useMemo(() => uniqueYears(records), [records]);
  const [year, setYear] = useState<number>(0);
  const [type, setType] = useState<TransactionType | "all">("all");
  const [category, setCategory] = useState<string>("all");

  useEffect(() => {
    if (years.length > 0 && !years.includes(year)) {
      setYear(years[0]);
    }
  }, [years, year]);

  const filtered = useMemo(
    () => recordsOfCategory(recordsOfType(records, type), category),
    [records, type, category]
  );
  const yearRecords = useMemo(() => recordsOfYear(filtered, year), [filtered, year]);
  const totals = useMemo(() => netTotalsOf(yearRecords), [yearRecords]);
  const months = useMemo(() => monthlySeries(filtered, year), [filtered, year]);

  if (years.length === 0) {
    return <p className="text-sm text-neutral-500">データがありません。明細CSVを取り込むか、記録を追加してください。</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
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
        <TransactionFilters
          type={type}
          onTypeChange={setType}
          category={category}
          onCategoryChange={setCategory}
          expenseCategories={expenseCategories}
          incomeCategories={incomeCategories}
        />
      </div>

      <TransactionSummaryCard title={`${year}年 の収支`} totals={totals} />

      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
        <table className="w-full min-w-[360px] text-sm">
          <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-900">
            <tr>
              <th className="p-2 text-left">月</th>
              <th className="p-2 text-right">支出</th>
              <th className="p-2 text-right">収入</th>
              <th className="p-2 text-right">収支</th>
            </tr>
          </thead>
          <tbody>
            {months.map((m) => (
              <tr key={m.month} className="border-t border-neutral-100 dark:border-neutral-800">
                <td className="p-2">{m.month}月</td>
                <td className="p-2 text-right tabular-nums text-rose-600">{yen(m.expense)}</td>
                <td className="p-2 text-right tabular-nums text-emerald-600">{yen(m.income)}</td>
                <td
                  className={`p-2 text-right tabular-nums ${
                    m.net >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {m.net >= 0 ? "+" : ""}
                  {yen(m.net)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
