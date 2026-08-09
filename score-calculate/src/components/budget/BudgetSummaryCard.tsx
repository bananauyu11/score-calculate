"use client";

import { useState } from "react";
import { FixedCostItem } from "@/lib/budget/types";
import { investmentTotal, livingTotal, totalOf } from "@/lib/budget/aggregate";

function yen(n: number): string {
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

interface Props {
  items: FixedCostItem[];
  takeHomePay: number;
  onChangeTakeHomePay: (value: number) => void;
}

export default function BudgetSummaryCard({ items, takeHomePay, onChangeTakeHomePay }: Props) {
  const [input, setInput] = useState(String(takeHomePay || ""));

  const total = totalOf(items);
  const investment = investmentTotal(items);
  const living = livingTotal(items);
  const surplus = takeHomePay - total;

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="mb-2 text-sm font-medium text-neutral-500">内訳</h3>
        <div className="grid grid-cols-2 gap-y-1 text-sm">
          <div className="text-neutral-500">投資額</div>
          <div className="text-right tabular-nums">{yen(investment)}</div>
          <div className="text-neutral-500">生活費</div>
          <div className="text-right tabular-nums">{yen(living)}</div>
          <div className="font-medium text-neutral-700 dark:text-neutral-300">合計</div>
          <div className="text-right font-semibold tabular-nums">{yen(total)}</div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="mb-2 text-sm font-medium text-neutral-500">収支</h3>
        <div className="flex items-center justify-between gap-2 text-sm">
          <label className="text-neutral-500">手取り</label>
          <input
            type="number"
            inputMode="decimal"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onBlur={() => onChangeTakeHomePay(Number(input) || 0)}
            placeholder="例: 531000"
            className="w-32 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-right text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="font-medium text-neutral-700 dark:text-neutral-300">余裕額</span>
          <span
            className={`text-lg font-semibold tabular-nums ${
              surplus >= 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {surplus >= 0 ? "+" : ""}
            {yen(surplus)}
          </span>
        </div>
      </div>
    </div>
  );
}
