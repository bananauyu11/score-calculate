"use client";

import { useEffect, useState } from "react";
import { BetRecord } from "@/lib/types";
import { loadRecords, mergeRecords, saveRecords } from "@/lib/storage";
import ImportBar from "@/components/ImportBar";
import DailyView from "@/components/DailyView";
import MonthlyView from "@/components/MonthlyView";
import YearlyView from "@/components/YearlyView";
import MonthlyChart from "@/components/MonthlyChart";
import AppNav from "@/components/AppNav";

type Tab = "daily" | "monthly" | "yearly" | "chart";

const TABS: { key: Tab; label: string }[] = [
  { key: "daily", label: "日別" },
  { key: "monthly", label: "月間" },
  { key: "yearly", label: "年間" },
  { key: "chart", label: "グラフ" },
];

export default function Home() {
  const [records, setRecords] = useState<BetRecord[]>([]);
  const [tab, setTab] = useState<Tab>("daily");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setRecords(loadRecords());
    setLoaded(true);
  }, []);

  const handleImport = (incoming: BetRecord[]) => {
    const { merged, added, skipped } = mergeRecords(records, incoming);
    setRecords(merged);
    saveRecords(merged);
    return { added, skipped };
  };

  const handleClear = () => {
    setRecords([]);
    saveRecords([]);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 p-4 pb-12">
      <header className="flex flex-col gap-3">
        <AppNav current="keiba" />
        <div>
          <h1 className="text-xl font-bold">競馬 収支管理</h1>
          <p className="text-sm text-neutral-500">
            CSVを取り込んで、日別・月間・年間の収支を確認できます。
          </p>
        </div>
      </header>

      <ImportBar records={records} onImport={handleImport} onClear={handleClear} />

      <nav className="flex gap-1 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-900">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              tab === t.key
                ? "bg-white shadow-sm dark:bg-neutral-800"
                : "text-neutral-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {!loaded ? (
        <p className="text-sm text-neutral-500">読み込み中...</p>
      ) : (
        <>
          {tab === "daily" && <DailyView records={records} />}
          {tab === "monthly" && <MonthlyView records={records} />}
          {tab === "yearly" && <YearlyView records={records} />}
          {tab === "chart" && <MonthlyChart records={records} />}
        </>
      )}
    </main>
  );
}
