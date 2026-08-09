"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AssetAccount, AssetEntry } from "@/lib/assets/types";
import {
  historySeries,
  monthlyNetWorthSeries,
  uniqueYears,
  yearlyNetWorthSeries,
} from "@/lib/assets/aggregate";

function yen(n: number): string {
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

type Mode = "monthly" | "yearly" | "history";

const MODES: { key: Mode; label: string }[] = [
  { key: "monthly", label: "月次" },
  { key: "yearly", label: "年次" },
  { key: "history", label: "推移" },
];

export default function AssetChart({
  accounts,
  entries,
}: {
  accounts: AssetAccount[];
  entries: AssetEntry[];
}) {
  const [mode, setMode] = useState<Mode>("monthly");
  const years = useMemo(() => uniqueYears(entries), [entries]);
  const [year, setYear] = useState<number>(0);

  useEffect(() => {
    if (years.length > 0 && !years.includes(year)) {
      setYear(years[0]);
    }
  }, [years, year]);

  const monthlyData = useMemo(
    () =>
      monthlyNetWorthSeries(accounts, entries, year).map((d) => ({
        ...d,
        label: `${d.month}月`,
      })),
    [accounts, entries, year]
  );
  const yearlySeries = useMemo(() => yearlyNetWorthSeries(accounts, entries), [accounts, entries]);
  const yearlyData = useMemo(
    () => yearlySeries.map((d) => ({ ...d, label: `${d.year}年` })),
    [yearlySeries]
  );
  const yearlyTable = useMemo(
    () =>
      yearlySeries.map((d, i) => ({
        year: d.year,
        total: d.total,
        yoy: i === 0 ? null : d.total - yearlySeries[i - 1].total,
      })),
    [yearlySeries]
  );
  const historyData = useMemo(
    () => historySeries(accounts, entries),
    [accounts, entries]
  );

  if (entries.length === 0) {
    return (
      <p className="text-sm text-neutral-500">データがありません。口座を追加して記録を入力してください。</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-900">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                mode === m.key
                  ? "bg-white shadow-sm dark:bg-neutral-800"
                  : "text-neutral-500"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        {mode === "monthly" && years.length > 0 && (
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
        )}
      </div>

      <div className="h-72 rounded-xl border border-neutral-200 bg-white p-2 dark:border-neutral-800 dark:bg-neutral-900">
        <ResponsiveContainer width="100%" height="100%">
          {mode === "monthly" ? (
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-neutral-200 dark:text-neutral-800"
              />
              <XAxis dataKey="label" fontSize={12} stroke="currentColor" className="text-neutral-500" />
              <YAxis
                fontSize={12}
                stroke="currentColor"
                className="text-neutral-500"
                tickFormatter={(v) => `${(v / 10000).toLocaleString()}万`}
              />
              <Tooltip formatter={(value: number) => yen(value)} labelFormatter={(label) => `${year}年${label}`} />
              <Bar dataKey="total" radius={[4, 4, 0, 0]} fill="#059669" />
            </BarChart>
          ) : mode === "yearly" ? (
            <BarChart data={yearlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-neutral-200 dark:text-neutral-800"
              />
              <XAxis dataKey="label" fontSize={12} stroke="currentColor" className="text-neutral-500" />
              <YAxis
                fontSize={12}
                stroke="currentColor"
                className="text-neutral-500"
                tickFormatter={(v) => `${(v / 10000).toLocaleString()}万`}
              />
              <Tooltip formatter={(value: number) => yen(value)} />
              <Bar dataKey="total" radius={[4, 4, 0, 0]} fill="#059669" />
            </BarChart>
          ) : (
            <LineChart data={historyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-neutral-200 dark:text-neutral-800"
              />
              <XAxis dataKey="date" fontSize={11} stroke="currentColor" className="text-neutral-500" />
              <YAxis
                fontSize={12}
                stroke="currentColor"
                className="text-neutral-500"
                tickFormatter={(v) => `${(v / 10000).toLocaleString()}万`}
              />
              <Tooltip formatter={(value: number) => yen(value)} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#059669"
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-neutral-400">
        {mode === "monthly" && "選択した年の月末時点での資産合計です。"}
        {mode === "yearly" && "年末時点（今年は本日時点）での資産合計です。"}
        {mode === "history" && "記録した日ごとの資産合計の推移です。"}
      </p>

      {mode === "yearly" && (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
          <table className="w-full min-w-[280px] text-sm">
            <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-900">
              <tr>
                <th className="p-2 text-left">年</th>
                <th className="p-2 text-right">金額</th>
                <th className="p-2 text-right">前年比</th>
              </tr>
            </thead>
            <tbody>
              {yearlyTable.map((row) => (
                <tr key={row.year} className="border-t border-neutral-100 dark:border-neutral-800">
                  <td className="p-2">{row.year}</td>
                  <td className="p-2 text-right tabular-nums">{yen(row.total)}</td>
                  <td
                    className={`p-2 text-right tabular-nums ${
                      row.yoy === null ? "text-neutral-400" : row.yoy >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {row.yoy === null ? "-" : `${row.yoy >= 0 ? "+" : ""}${yen(row.yoy)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
