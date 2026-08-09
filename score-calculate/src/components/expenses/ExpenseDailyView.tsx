"use client";

import { useEffect, useMemo, useState } from "react";
import { ExpenseRecord, TransactionType } from "@/lib/expenses/types";
import {
  datesWithRecords,
  netTotalsOf,
  recordsOfCategory,
  recordsOfDate,
  recordsOfType,
} from "@/lib/expenses/aggregate";
import TransactionSummaryCard from "./TransactionSummaryCard";
import TransactionFilters from "./TransactionFilters";
import CategorySelect from "./CategorySelect";

function yen(n: number): string {
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

interface Props {
  records: ExpenseRecord[];
  expenseCategories: string[];
  incomeCategories: string[];
  onUpdateCategory: (id: string, category: string) => void;
  onAddCategory: (type: TransactionType, name: string) => void;
}

export default function ExpenseDailyView({
  records,
  expenseCategories,
  incomeCategories,
  onUpdateCategory,
  onAddCategory,
}: Props) {
  const [type, setType] = useState<TransactionType | "all">("all");
  const [category, setCategory] = useState<string>("all");
  const dates = useMemo(() => datesWithRecords(records), [records]);
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    if (dates.length > 0 && !dates.includes(date)) {
      setDate(dates[0]);
    }
  }, [dates, date]);

  const dayRecords = useMemo(
    () => recordsOfCategory(recordsOfType(recordsOfDate(records, date), type), category),
    [records, date, type, category]
  );
  const totals = useMemo(() => netTotalsOf(dayRecords), [dayRecords]);

  if (dates.length === 0) {
    return <p className="text-sm text-neutral-500">データがありません。明細CSVを取り込むか、記録を追加してください。</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
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
        <TransactionFilters
          type={type}
          onTypeChange={setType}
          category={category}
          onCategoryChange={setCategory}
          expenseCategories={expenseCategories}
          incomeCategories={incomeCategories}
        />
      </div>

      <TransactionSummaryCard title={`${date} の収支`} totals={totals} />

      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-900">
            <tr>
              <th className="p-2 text-left">内容</th>
              <th className="p-2 text-left">カテゴリ</th>
              <th className="p-2 text-right">金額</th>
            </tr>
          </thead>
          <tbody>
            {dayRecords.map((r) => (
              <tr key={r.id} className="border-t border-neutral-100 dark:border-neutral-800">
                <td className="p-2 align-top">
                  {r.store}
                  {r.method && <div className="text-xs text-neutral-400">{r.method}</div>}
                </td>
                <td className="p-2 align-top">
                  <CategorySelect
                    value={r.category}
                    categories={r.type === "expense" ? expenseCategories : incomeCategories}
                    onChange={(c) => onUpdateCategory(r.id, c)}
                    onAddCategory={(name) => {
                      onAddCategory(r.type, name);
                      onUpdateCategory(r.id, name);
                    }}
                    className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-900"
                  />
                </td>
                <td
                  className={`p-2 text-right align-top tabular-nums ${
                    r.type === "income" ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {r.type === "income" ? "+" : "-"}
                  {yen(r.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
