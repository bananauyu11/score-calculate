"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BetRecord } from "@/lib/types";
import { monthlySeries, uniqueTracks, uniqueYears } from "@/lib/aggregate";

function yen(n: number): string {
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

export default function MonthlyChart({ records }: { records: BetRecord[] }) {
  const years = useMemo(() => uniqueYears(records), [records]);
  const tracks = useMemo(() => uniqueTracks(records), [records]);
  const [year, setYear] = useState<number>(0);
  const [track, setTrack] = useState<string>("ALL");

  useEffect(() => {
    if (years.length > 0 && !years.includes(year)) {
      setYear(years[0]);
    }
  }, [years, year]);

  const data = useMemo(
    () => monthlySeries(records, year, track).map((d) => ({ ...d, label: `${d.month}月` })),
    [records, year, track]
  );

  if (years.length === 0) {
    return <p className="text-sm text-neutral-500">データがありません。CSVを取り込んでください。</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
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
        <select
          value={track}
          onChange={(e) => setTrack(e.target.value)}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="ALL">全体</option>
          {tracks.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="h-72 rounded-xl border border-neutral-200 bg-white p-2 dark:border-neutral-800 dark:bg-neutral-900">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-800" />
            <XAxis dataKey="label" fontSize={12} stroke="currentColor" className="text-neutral-500" />
            <YAxis
              fontSize={12}
              stroke="currentColor"
              className="text-neutral-500"
              tickFormatter={(v) => `${(v / 1000).toLocaleString()}k`}
            />
            <Tooltip
              formatter={(value: number) => yen(value)}
              labelFormatter={(label) => `${year}年${label}`}
            />
            <ReferenceLine y={0} stroke="#a3a3a3" />
            <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.profit >= 0 ? "#059669" : "#dc2626"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-neutral-400">
        月ごとの収支（払戻額−購入額）を表示しています。緑はプラス収支、赤はマイナス収支です。
      </p>
    </div>
  );
}
