"use client";

import { useState } from "react";
import { TransactionType } from "@/lib/expenses/types";
import CategorySelect from "./CategorySelect";

interface Props {
  expenseCategories: string[];
  incomeCategories: string[];
  onAdd: (data: {
    date: string;
    type: TransactionType;
    category: string;
    store: string;
    amount: number;
    method?: string;
  }) => void;
  onAddCategory: (type: TransactionType, name: string) => void;
}

const inputClass =
  "rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900";

export default function TransactionForm({
  expenseCategories,
  incomeCategories,
  onAdd,
  onAddCategory,
}: Props) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<TransactionType>("expense");
  const [category, setCategory] = useState(expenseCategories[0] ?? "");
  const [store, setStore] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");

  const categories = type === "expense" ? expenseCategories : incomeCategories;

  const switchType = (t: TransactionType) => {
    setType(t);
    const cats = t === "expense" ? expenseCategories : incomeCategories;
    setCategory(cats[0] ?? "");
  };

  const reset = () => {
    setStore("");
    setAmount("");
    setMethod("");
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!store.trim() || !amount || Number.isNaN(value) || value <= 0 || !category) return;
    onAdd({
      date,
      type,
      category,
      store: store.trim(),
      amount: value,
      method: method.trim() || undefined,
    });
    reset();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white active:bg-emerald-700"
      >
        + 支出・収入を記録
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-500">種別</label>
          <div className="flex overflow-hidden rounded-lg border border-neutral-300 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => switchType("expense")}
              className={`px-3 py-2 text-sm font-medium transition ${
                type === "expense"
                  ? "bg-rose-600 text-white"
                  : "bg-white text-neutral-500 dark:bg-neutral-900"
              }`}
            >
              支出
            </button>
            <button
              type="button"
              onClick={() => switchType("income")}
              className={`px-3 py-2 text-sm font-medium transition ${
                type === "income"
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-neutral-500 dark:bg-neutral-900"
              }`}
            >
              収入
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-500">日付</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-500">カテゴリ</label>
          <CategorySelect
            value={category}
            categories={categories}
            onChange={setCategory}
            onAddCategory={(name) => onAddCategory(type, name)}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-[140px] flex-1 flex-col gap-1">
          <label className="text-xs text-neutral-500">内容</label>
          <input
            type="text"
            value={store}
            onChange={(e) => setStore(e.target.value)}
            placeholder="例: スーパーで食料品"
            className={`${inputClass} w-full`}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-500">金額</label>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="例: 3000"
            className={`${inputClass} w-32`}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-500">支払方法（任意）</label>
          <input
            type="text"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            placeholder="例: 現金"
            className={`${inputClass} w-32`}
          />
        </div>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium dark:border-neutral-700"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white active:bg-emerald-700"
          >
            記録
          </button>
        </div>
      </div>
    </form>
  );
}
