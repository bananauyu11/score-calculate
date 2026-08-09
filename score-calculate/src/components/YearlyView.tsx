"use client";

import { useEffect, useMemo, useState } from "react";
import { BetRecord } from "@/lib/types";
import { byTrackTotals, recordsOfYear, totalsOf, uniqueYears } from "@/lib/aggregate";
import SummaryCard from "./SummaryCard";

export default function YearlyView({ records }: { records: BetRecord[] }) {
  const years = useMemo(() => uniqueYears(records), [records]);
  const [year, setYear] = useState<number>(0);

  useEffect(() => {
    if (years.length > 0 && !years.includes(year)) {
      setYear(years[0]);
    }
  }, [years, year]);

  const yearRecords = useMemo(() => recordsOfYear(records, year), [records, year]);
  const overall = useMemo(() => totalsOf(yearRecords), [yearRecords]);
  const perTrack = useMemo(() => byTrackTotals(yearRecords), [yearRecords]);

  if (years.length === 0) {
    return <p className="text-sm text-neutral-500">データがありません。CSVを取り込んでください。</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <select
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
        className="w-fit rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}年
          </option>
        ))}
      </select>

      <SummaryCard title={`${year}年 全体`} totals={overall} />

      {perTrack.length === 0 ? (
        <p className="text-sm text-neutral-500">この年のデータはありません。</p>
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
