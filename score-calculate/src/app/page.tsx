"use client";

import { useEffect, useState } from "react";
import { BetRecord } from "@/lib/types";
import { loadRecords, mergeRecords, saveRecords } from "@/lib/storage";
import ImportBar from "@/components/ImportBar";
import DailyView from "@/components/DailyView";
import MonthlyView from "@/components/MonthlyView";
import YearlyView from "@/components/YearlyView";
import MonthlyChart from "@/components/MonthlyChart";
import { CloseIcon, ImportIcon } from "@/components/icons";

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
  const [csvPanelMounted, setCsvPanelMounted] = useState(false);
  const [csvPanelOpen, setCsvPanelOpen] = useState(false);

  useEffect(() => {
    setRecords(loadRecords());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!csvPanelMounted) return;
    const id = requestAnimationFrame(() => setCsvPanelOpen(true));
    return () => cancelAnimationFrame(id);
  }, [csvPanelMounted]);

  const openCsvPanel = () => setCsvPanelMounted(true);
  const closeCsvPanel = () => {
    setCsvPanelOpen(false);
    setTimeout(() => setCsvPanelMounted(false), 300);
  };

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
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">競馬 収支管理</h1>
        <button
          onClick={openCsvPanel}
          aria-label="CSV連携を開く"
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

      {csvPanelMounted && (
        <div className="fixed inset-0 z-40">
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
              csvPanelOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeCsvPanel}
          />
          <div
            className={`absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 shadow-2xl transition-transform duration-300 ease-out dark:bg-neutral-900 ${
              csvPanelOpen ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">CSV連携</h2>
              <button
                onClick={closeCsvPanel}
                aria-label="閉じる"
                className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 dark:text-neutral-500"
              >
                <CloseIcon />
              </button>
            </div>

            <ImportBar records={records} onImport={handleImport} onClear={handleClear} />
          </div>
        </div>
      )}
    </main>
  );
}
