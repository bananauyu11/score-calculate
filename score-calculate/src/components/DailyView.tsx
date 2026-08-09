"use client";

import { useEffect, useMemo, useState } from "react";
import { BetRecord } from "@/lib/types";
import { datesWithRecords, recordsOfDate, totalsOf } from "@/lib/aggregate";
import SummaryCard from "./SummaryCard";

function yen(n: number): string {
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

export default function DailyView({ records }: { records: BetRecord[] }) {
  const dates = useMemo(() => datesWithRecords(records), [records]);
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    if (dates.length > 0 && !dates.includes(date)) {
      setDate(dates[0]);
    }
  }, [dates, date]);

  const dayRecords = useMemo(() => recordsOfDate(records, date), [records, date]);
  const totals = useMemo(() => totalsOf(dayRecords), [dayRecords]);

  if (dates.length === 0) {
    return <p className="text-sm text-neutral-500">データがありません。CSVを取り込んでください。</p>;
  }

  return (
    <div className="flex flex-col gap-4">
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

      <SummaryCard title={`${date} の収支`} totals={totals} />

      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-900">
            <tr>
              <th className="p-2 text-left">開催R</th>
              <th className="p-2 text-left">買い目</th>
              <th className="p-2 text-right">購入額</th>
              <th className="p-2 text-right">払戻額</th>
              <th className="p-2 text-right">収支</th>
            </tr>
          </thead>
          <tbody>
            {dayRecords.map((r) => {
              const stake = r.unitAmount * r.points;
              const profit = r.payout - stake;
              return (
                <tr key={r.id} className="border-t border-neutral-100 dark:border-neutral-800">
                  <td className="p-2 align-top">
                    {r.track}
                    {r.raceNo}R
                    <div className="text-xs text-neutral-400">{r.raceName}</div>
                  </td>
                  <td className="p-2 align-top">
                    {r.betType} {r.method}
                    {r.selection ? ` ${r.selection}` : ""}
                    <div className="text-xs text-neutral-400">
                      {yen(r.unitAmount)} × {r.points}件
                      {r.odds ? `　オッズ×${r.odds}` : ""}
                    </div>
                  </td>
                  <td className="p-2 text-right align-top tabular-nums">{yen(stake)}</td>
                  <td className="p-2 text-right align-top tabular-nums">{yen(r.payout)}</td>
                  <td
                    className={`p-2 text-right align-top tabular-nums ${
                      profit >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {profit >= 0 ? "+" : ""}
                    {yen(profit)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
