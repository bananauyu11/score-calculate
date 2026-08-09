"use client";

import { useState } from "react";
import { FixedCostItem, FixedCostKind } from "@/lib/budget/types";

function yen(n: number): string {
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

interface Props {
  items: FixedCostItem[];
  onAdd: (name: string, amount: number, kind: FixedCostKind) => void;
  onUpdate: (id: string, patch: Partial<Omit<FixedCostItem, "id">>) => void;
  onDelete: (id: string) => void;
}

const inputClass =
  "rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900";

export default function FixedCostsPanel({ items, onAdd, onUpdate, onDelete }: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [kind, setKind] = useState<FixedCostKind>("living");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!name.trim() || !amount || Number.isNaN(value) || value <= 0) return;
    onAdd(name.trim(), value, kind);
    setName("");
    setAmount("");
  };

  const total = items.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="flex flex-col gap-3">
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-end gap-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-500">項目名</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 家賃"
            className={`${inputClass} w-32`}
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
            placeholder="例: 100000"
            className={`${inputClass} w-32`}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-500">区分</label>
          <div className="flex overflow-hidden rounded-lg border border-neutral-300 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => setKind("living")}
              className={`px-3 py-2 text-sm font-medium transition ${
                kind === "living"
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-neutral-500 dark:bg-neutral-900"
              }`}
            >
              生活費
            </button>
            <button
              type="button"
              onClick={() => setKind("investment")}
              className={`px-3 py-2 text-sm font-medium transition ${
                kind === "investment"
                  ? "bg-sky-600 text-white"
                  : "bg-white text-neutral-500 dark:bg-neutral-900"
              }`}
            >
              投資
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white active:bg-emerald-700"
        >
          追加
        </button>
      </form>

      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">
          固定費が登録されていません。上のフォームから追加してください。
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
          <table className="w-full min-w-[420px] text-sm">
            <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-900">
              <tr>
                <th className="p-2 text-left">項目</th>
                <th className="p-2 text-left">区分</th>
                <th className="p-2 text-right">金額</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-neutral-100 dark:border-neutral-800">
                  <td className="p-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => onUpdate(item.id, { name: e.target.value })}
                      className={`${inputClass} w-28`}
                    />
                  </td>
                  <td className="p-2">
                    <select
                      value={item.kind}
                      onChange={(e) => onUpdate(item.id, { kind: e.target.value as FixedCostKind })}
                      className={inputClass}
                    >
                      <option value="living">生活費</option>
                      <option value="investment">投資</option>
                    </select>
                  </td>
                  <td className="p-2 text-right">
                    <input
                      type="number"
                      inputMode="decimal"
                      value={item.amount}
                      onChange={(e) => onUpdate(item.id, { amount: Number(e.target.value) || 0 })}
                      className={`${inputClass} w-28 text-right`}
                    />
                  </td>
                  <td className="p-2 text-right">
                    <button onClick={() => onDelete(item.id)} className="text-xs text-red-500">
                      削除
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="border-t border-neutral-200 font-semibold dark:border-neutral-700">
                <td className="p-2" colSpan={2}>
                  合計
                </td>
                <td className="p-2 text-right tabular-nums">{yen(total)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
