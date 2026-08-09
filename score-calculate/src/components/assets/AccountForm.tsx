"use client";

import { useState } from "react";
import { ASSET_CATEGORIES, AssetCategory } from "@/lib/assets/types";

interface Props {
  onAdd: (
    name: string,
    category: AssetCategory,
    initial?: { date: string; amount: number }
  ) => void;
}

const inputClass =
  "rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900";

export default function AccountForm({ onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<AssetCategory>("預金");
  const [initialAmount, setInitialAmount] = useState("");
  const [initialDate, setInitialDate] = useState(() => new Date().toISOString().slice(0, 10));

  const reset = () => {
    setName("");
    setInitialAmount("");
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const amount = initialAmount ? Number(initialAmount) : 0;
    onAdd(
      name.trim(),
      category,
      amount !== 0 && !Number.isNaN(amount) ? { date: initialDate, amount } : undefined
    );
    reset();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white active:bg-emerald-700"
      >
        + 資産口座を追加
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-500">口座名</label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 楽天証券"
            className={`${inputClass} w-48`}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-500">種別</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as AssetCategory)}
            className={inputClass}
          >
            {ASSET_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-500">現在の残高（任意）</label>
          <input
            type="number"
            inputMode="decimal"
            value={initialAmount}
            onChange={(e) => setInitialAmount(e.target.value)}
            placeholder="例: 500000"
            className={`${inputClass} w-40`}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-500">基準日</label>
          <input
            type="date"
            value={initialDate}
            onChange={(e) => setInitialDate(e.target.value)}
            className={inputClass}
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
            追加
          </button>
        </div>
      </div>
      <p className="text-xs text-neutral-400">
        「現在の残高」を入力すると、基準日時点の残高として最初の記録が作成されます。空欄でもOKです（後から記録を追加できます）。
      </p>
    </form>
  );
}
