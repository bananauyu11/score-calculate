"use client";

import { useEffect, useMemo, useState } from "react";
import { ExpenseRecord, TransactionType } from "@/lib/expenses/types";
import {
  byCategoryTotals,
  netTotalsOf,
  recordsOfCategory,
  recordsOfMonth,
  recordsOfType,
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

export default function ExpenseMonthlyView({ records, expenseCategories, incomeCategories }: Props) {
  const years = useMemo(() => uniqueYears(records), [records]);
  const [year, setYear] = useState<number>(0);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [type, setType] = useState<TransactionType | "all">("all");
  const [category, setCategory] = useState<string>("all");

  useEffect(() => {
    if (years.length > 0 && !years.includes(year)) {
      setYear(years[0]);
    }
  }, [years, year]);

  const monthRecords = useMemo(
    () => recordsOfCategory(recordsOfType(recordsOfMonth(records, year, month), type), category),
    [records, year, month, type, category]
  );
  const totals = useMemo(() => netTotalsOf(monthRecords), [monthRecords]);
  const categoryTotals = useMemo(() => byCategoryTotals(monthRecords), [monthRecords]);

  if (years.length === 0) {
    return <p className="text-sm text-neutral-500">データがありません。明細CSVを取り込むか、記録を追加してください。</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
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
        <TransactionFilters
          type={type}
          onTypeChange={setType}
          category={category}
          onCategoryChange={setCategory}
          expenseCategories={expenseCategories}
          incomeCategories={incomeCategories}
        />
      </div>

      <TransactionSummaryCard title={`${year}年${month}月 の収支`} totals={totals} />

      {categoryTotals.length === 0 ? (
        <p className="text-sm text-neutral-500">この月のデータはありません。</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
          <table className="w-full min-w-[320px] text-sm">
            <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-900">
              <tr>
                <th className="p-2 text-left">カテゴリ</th>
                <th className="p-2 text-right">件数</th>
                <th className="p-2 text-right">金額</th>
              </tr>
            </thead>
            <tbody>
              {categoryTotals.map(({ category: c, totals: t }) => (
                <tr key={c} className="border-t border-neutral-100 dark:border-neutral-800">
                  <td className="p-2">{c}</td>
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
