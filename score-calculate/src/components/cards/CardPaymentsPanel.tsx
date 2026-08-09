"use client";

import { useState } from "react";
import { CardPayment } from "@/lib/cards/types";

function yen(n: number): string {
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

interface Props {
  items: CardPayment[];
  cashOnHand: number;
  onAdd: (card: string, amount: number, debitDay: number) => void;
  onUpdate: (id: string, patch: Partial<Omit<CardPayment, "id">>) => void;
  onDelete: (id: string) => void;
  onChangeCashOnHand: (value: number) => void;
}

const inputClass =
  "rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900";

export default function CardPaymentsPanel({
  items,
  cashOnHand,
  onAdd,
  onUpdate,
  onDelete,
  onChangeCashOnHand,
}: Props) {
  const [card, setCard] = useState("");
  const [amount, setAmount] = useState("");
  const [debitDay, setDebitDay] = useState("");
  const [cashInput, setCashInput] = useState(String(cashOnHand || ""));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    const day = Number(debitDay);
    if (!card.trim() || !amount || Number.isNaN(amt) || !debitDay || Number.isNaN(day) || day < 1 || day > 31) {
      return;
    }
    onAdd(card.trim(), amt, day);
    setCard("");
    setAmount("");
    setDebitDay("");
  };

  const total = items.reduce((s, i) => s + i.amount, 0);
  const diff = cashOnHand - total;
  const sorted = [...items].sort((a, b) => a.debitDay - b.debitDay);

  return (
    <div className="flex flex-col gap-3">
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-end gap-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-500">カード名</label>
          <input
            type="text"
            value={card}
            onChange={(e) => setCard(e.target.value)}
            placeholder="例: 楽天カード"
            className={`${inputClass} w-36`}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-500">引落金額</label>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="例: 30000"
            className={`${inputClass} w-28`}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-500">引落日</label>
          <input
            type="number"
            min="1"
            max="31"
            value={debitDay}
            onChange={(e) => setDebitDay(e.target.value)}
            placeholder="例: 27"
            className={`${inputClass} w-20`}
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white active:bg-emerald-700"
        >
          追加
        </button>
      </form>

      {sorted.length === 0 ? (
        <p className="text-sm text-neutral-500">
          カードが登録されていません。上のフォームから追加してください。
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
          <table className="w-full min-w-[420px] text-sm">
            <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-900">
              <tr>
                <th className="p-2 text-left">カード</th>
                <th className="p-2 text-right">引落日</th>
                <th className="p-2 text-right">引落金額</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((item) => (
                <tr key={item.id} className="border-t border-neutral-100 dark:border-neutral-800">
                  <td className="p-2">
                    <input
                      type="text"
                      value={item.card}
                      onChange={(e) => onUpdate(item.id, { card: e.target.value })}
                      className={`${inputClass} w-32`}
                    />
                  </td>
                  <td className="p-2 text-right">
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={item.debitDay}
                      onChange={(e) => onUpdate(item.id, { debitDay: Number(e.target.value) || 1 })}
                      className={`${inputClass} w-16 text-right`}
                    />
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
                <td className="p-2">合計</td>
                <td></td>
                <td className="p-2 text-right tabular-nums">{yen(total)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between gap-2 text-sm">
          <label className="text-neutral-500">現金（引落用に用意している金額）</label>
          <input
            type="number"
            inputMode="decimal"
            value={cashInput}
            onChange={(e) => setCashInput(e.target.value)}
            onBlur={() => onChangeCashOnHand(Number(cashInput) || 0)}
            placeholder="例: 71034"
            className="w-32 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-right text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="font-medium text-neutral-700 dark:text-neutral-300">差額（現金－合計）</span>
          <span
            className={`text-lg font-semibold tabular-nums ${
              diff >= 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {diff >= 0 ? "+" : ""}
            {yen(diff)}
          </span>
        </div>
        {diff < 0 && <p className="mt-1 text-xs text-red-500">現金が引落合計に対して不足しています。</p>}
      </div>
    </div>
  );
}
