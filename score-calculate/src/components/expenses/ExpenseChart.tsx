"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ExpenseRecord, TransactionType } from "@/lib/expenses/types";
import {
  byCategoryTotals,
  monthlySeries,
  recordsOfCategory,
  recordsOfType,
  recordsOfYear,
  uniqueYears,
} from "@/lib/expenses/aggregate";
import TransactionFilters from "./TransactionFilters";

function yen(n: number): string {
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

type Mode = "monthly" | "category";

interface Props {
  records: ExpenseRecord[];
  expenseCategories: string[];
  incomeCategories: string[];
}

export default function ExpenseChart({ records, expenseCategories, incomeCategories }: Props) {
  const [mode, setMode] = useState<Mode>("monthly");
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

  const monthlyData = useMemo(
    () => monthlySeries(filtered, year).map((d) => ({ ...d, label: `${d.month}月` })),
    [filtered, year]
  );
  const categoryData = useMemo(
    () =>
      byCategoryTotals(recordsOfYear(filtered, year)).map((c) => ({
        category: c.category,
        amount: c.totals.amount,
      })),
    [filtered, year]
  );

  if (records.length === 0) {
    return <p className="text-sm text-neutral-500">データがありません。明細CSVを取り込むか、記録を追加してください。</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-900">
          {(
            [
              { key: "monthly", label: "月次推移" },
              { key: "category", label: "カテゴリ別" },
            ] as { key: Mode; label: string }[]
          ).map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                mode === m.key ? "bg-white shadow-sm dark:bg-neutral-800" : "text-neutral-500"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
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
        <TransactionFilters
          type={type}
          onTypeChange={setType}
          category={category}
          onCategoryChange={setCategory}
          expenseCategories={expenseCategories}
          incomeCategories={incomeCategories}
        />
      </div>

      <div className="h-72 rounded-xl border border-neutral-200 bg-white p-2 dark:border-neutral-800 dark:bg-neutral-900">
        <ResponsiveContainer width="100%" height="100%">
          {mode === "monthly" ? (
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              <Bar dataKey="expense" name="支出" radius={[4, 4, 0, 0]} fill="#e11d48" />
              <Bar dataKey="income" name="収入" radius={[4, 4, 0, 0]} fill="#059669" />
            </BarChart>
          ) : (
            <BarChart data={categoryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-neutral-200 dark:text-neutral-800"
              />
              <XAxis
                dataKey="category"
                fontSize={11}
                stroke="currentColor"
                className="text-neutral-500"
                interval={0}
                angle={-30}
                textAnchor="end"
                height={50}
              />
              <YAxis
                fontSize={12}
                stroke="currentColor"
                className="text-neutral-500"
                tickFormatter={(v) => `${(v / 1000).toLocaleString()}k`}
              />
              <Tooltip formatter={(value: number) => yen(value)} />
              <Bar dataKey="amount" name="金額" radius={[4, 4, 0, 0]} fill="#0284c7" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-neutral-400">
        {mode === "monthly" && "月ごとの支出（赤）と収入（緑）を表示しています。"}
        {mode === "category" && `${year}年のカテゴリ別金額を表示しています。`}
      </p>
    </div>
  );
}
