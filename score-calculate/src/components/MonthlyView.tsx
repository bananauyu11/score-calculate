"use client";

import { useEffect, useMemo, useState } from "react";
import { BetRecord } from "@/lib/types";
import { byTrackTotals, recordsOfMonth, totalsOf, uniqueYears } from "@/lib/aggregate";
import SummaryCard from "./SummaryCard";

export default function MonthlyView({ records }: { records: BetRecord[] }) {
  const years = useMemo(() => uniqueYears(records), [records]);
  const [year, setYear] = useState<number>(0);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);

  useEffect(() => {
    if (years.length > 0 && !years.includes(year)) {
      setYear(years[0]);
    }
  }, [years, year]);

  const monthRecords = useMemo(() => recordsOfMonth(records, year, month), [records, year, month]);
  const overall = useMemo(() => totalsOf(monthRecords), [monthRecords]);
  const perTrack = useMemo(() => byTrackTotals(monthRecords), [monthRecords]);

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
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {m}月
            </option>
          ))}
        </select>
      </div>

      <SummaryCard title={`${year}年${month}月 全体`} totals={overall} />

      {perTrack.length === 0 ? (
        <p className="text-sm text-neutral-500">この月のデータはありません。</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {perTrack.map(({ track, totals }) => (
            <SummaryCard key={track} title={track} totals={totals} />
          ))}
        </div>
      )}
    </div>
  );
}
