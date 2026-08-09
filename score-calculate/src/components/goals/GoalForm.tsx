"use client";

import { useState } from "react";
import { GOAL_CATEGORIES, GoalCategory } from "@/lib/goals/types";
import { ASSET_CATEGORIES, AssetAccount, AssetCategory, AssetEntry } from "@/lib/assets/types";
import { categoryBreakdown } from "@/lib/assets/aggregate";

interface Props {
  accounts: AssetAccount[];
  entries: AssetEntry[];
  onAdd: (data: {
    name: string;
    category: GoalCategory;
    linkedAssetCategory?: AssetCategory;
    targetAmount: number;
    currentAmount: number;
    deadlineYear?: number;
    note?: string;
  }) => void;
}

const inputClass =
  "rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900";

export default function GoalForm({ accounts, entries, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<GoalCategory>("資産");
  const [linkedAssetCategory, setLinkedAssetCategory] = useState<AssetCategory>("証券");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadlineYear, setDeadlineYear] = useState("");
  const [note, setNote] = useState("");

  const reset = () => {
    setName("");
    setTargetAmount("");
    setCurrentAmount("");
    setDeadlineYear("");
    setNote("");
    setOpen(false);
  };

  const applyCurrentAssetTotal = () => {
    const breakdown = categoryBreakdown(accounts, entries);
    const found = breakdown.find((b) => b.category === linkedAssetCategory);
    setCurrentAmount(String(found?.total ?? 0));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = Number(targetAmount);
    if (!name.trim() || !targetAmount || Number.isNaN(target)) return;
    const current = Number(currentAmount || 0);
    onAdd({
      name: name.trim(),
      category,
      linkedAssetCategory: category === "資産" ? linkedAssetCategory : undefined,
      targetAmount: target,
      currentAmount: Number.isNaN(current) ? 0 : current,
      deadlineYear: deadlineYear ? Number(deadlineYear) : undefined,
      note: note.trim() || undefined,
    });
    reset();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white active:bg-emerald-700"
      >
        + 目標を追加
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
          <label className="text-xs text-neutral-500">目標名</label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: セミリタイア"
            className={`${inputClass} w-40`}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-500">種類</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as GoalCategory)}
            className={inputClass}
          >
            {GOAL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        {category === "資産" && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-500">紐づける資産カテゴリ</label>
            <select
              value={linkedAssetCategory}
              onChange={(e) => setLinkedAssetCategory(e.target.value as AssetCategory)}
              className={inputClass}
            >
              {ASSET_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-500">目標額</label>
          <input
            type="number"
            inputMode="decimal"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="例: 15000000"
            className={`${inputClass} w-40`}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-500">現状額</label>
          <div className="flex gap-1">
            <input
              type="number"
              inputMode="decimal"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="例: 4011663"
              className={`${inputClass} w-36`}
            />
            {category === "資産" && (
              <button
                type="button"
                onClick={applyCurrentAssetTotal}
                className="rounded-lg border border-neutral-300 px-2 text-xs dark:border-neutral-700"
              >
                資産額を反映
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-500">期限（年・任意）</label>
          <input
            type="number"
            value={deadlineYear}
            onChange={(e) => setDeadlineYear(e.target.value)}
            placeholder="例: 2029"
            className={`${inputClass} w-24`}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-[160px] flex-1 flex-col gap-1">
          <label className="text-xs text-neutral-500">メモ（任意）</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="例: 40歳でセミリタイア"
            className={`${inputClass} w-full`}
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
    </form>
  );
}
