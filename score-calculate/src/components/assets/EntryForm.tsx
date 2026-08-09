"use client";

import { useState } from "react";

interface Props {
  onAdd: (date: string, amount: number, memo?: string) => void;
}

const inputClass =
  "rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900";

export default function EntryForm({ onAdd }: Props) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [sign, setSign] = useState<1 | -1>(1);
  const [magnitude, setMagnitude] = useState("");
  const [memo, setMemo] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(magnitude);
    if (!magnitude || Number.isNaN(value) || value <= 0) return;
    onAdd(date, value * sign, memo.trim() || undefined);
    setMagnitude("");
    setMemo("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
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
        <label className="text-xs text-neutral-500">増減</label>
        <div className="flex overflow-hidden rounded-lg border border-neutral-300 dark:border-neutral-700">
          <button
            type="button"
            onClick={() => setSign(1)}
            className={`px-3 py-2 text-sm font-medium transition ${
              sign === 1
                ? "bg-emerald-600 text-white"
                : "bg-white text-neutral-500 dark:bg-neutral-900"
            }`}
          >
            ＋増加
          </button>
          <button
            type="button"
            onClick={() => setSign(-1)}
            className={`px-3 py-2 text-sm font-medium transition ${
              sign === -1
                ? "bg-red-600 text-white"
                : "bg-white text-neutral-500 dark:bg-neutral-900"
            }`}
          >
            －減少
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-neutral-500">金額</label>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="1"
          value={magnitude}
          onChange={(e) => setMagnitude(e.target.value)}
          placeholder="例: 5000"
          className={`${inputClass} w-32`}
        />
      </div>
      <div className="flex min-w-[140px] flex-1 flex-col gap-1">
        <label className="text-xs text-neutral-500">メモ（任意）</label>
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="例: 給与振込・株価変動など"
          className={`${inputClass} w-full`}
        />
      </div>
      <button
        type="submit"
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white active:bg-emerald-700"
      >
        記録する
      </button>
    </form>
  );
}
