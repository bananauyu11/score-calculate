"use client";

import { useEffect, useState } from "react";
import { BetRecord } from "@/lib/types";
import { loadRecords, mergeRecords, saveRecords } from "@/lib/storage";
import ImportBar from "@/components/ImportBar";
import DailyView from "@/components/DailyView";
import MonthlyView from "@/components/MonthlyView";
import YearlyView from "@/components/YearlyView";
import MonthlyChart from "@/components/MonthlyChart";
import { BackIcon, ImportIcon } from "@/components/icons";

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
  const [showCsvPanel, setShowCsvPanel] = useState(false);

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

  if (showCsvPanel) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 p-4 pb-12">
        <header className="flex items-center gap-3">
          <button
            onClick={() => setShowCsvPanel(false)}
            aria-label="戻る"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
          >
            <BackIcon />
          </button>
          <h1 className="text-xl font-bold">CSV設定</h1>
        </header>

        <ImportBar records={records} onImport={handleImport} onClear={handleClear} />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 p-4 pb-12">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">競馬 収支管理</h1>
        <button
          onClick={() => setShowCsvPanel(true)}
          aria-label="CSV設定を開く"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
        >
          <ImportIcon />
        </button>
      </header>

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
