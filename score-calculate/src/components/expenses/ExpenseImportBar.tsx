"use client";

import { useRef, useState } from "react";
import { parseExpenseCsv, toExpenseCsv } from "@/lib/expenses/csv";
import { ExpenseRecord } from "@/lib/expenses/types";

interface Props {
  records: ExpenseRecord[];
  onImport: (records: ExpenseRecord[]) => { added: number; skipped: number };
  onClear: () => void;
}

export default function ExpenseImportBar({ records, onImport, onClear }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    const text = await file.text();
    const { records: parsed, errors } = parseExpenseCsv(text);

    if (parsed.length > 0) {
      const { added, skipped } = onImport(parsed);
      setMessage(
        `${added}件追加、${skipped}件は重複のためスキップしました。` +
          (errors.length > 0 ? ` (${errors.length}件のエラー行は無視されました)` : "")
      );
    } else {
      setMessage(
        errors.length > 0
          ? `取り込みに失敗しました: ${errors[0]}`
          : "取り込めるデータが見つかりませんでした。"
      );
    }
  };

  const handleExport = () => {
    const csv = toExpenseCsv(records);
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shishutsu-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (window.confirm("保存されている全ての支出データを削除します。よろしいですか？")) {
      onClear();
      setMessage("全データを削除しました。");
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white active:bg-rose-700"
        >
          明細CSVを取り込む
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
        <button
          onClick={handleExport}
          disabled={records.length === 0}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium disabled:opacity-40 dark:border-neutral-700"
        >
          CSVを書き出す
        </button>
        <a
          href="/sample-expenses.csv"
          download
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium dark:border-neutral-700"
        >
          サンプルCSV
        </a>
        <button
          onClick={handleClear}
          disabled={records.length === 0}
          className="ml-auto rounded-lg px-4 py-2 text-sm font-medium text-red-600 disabled:opacity-40"
        >
          全データ削除
        </button>
      </div>
      {message && <p className="text-sm text-neutral-500">{message}</p>}
      <p className="text-xs text-neutral-400">
        クレジットカードの利用明細CSV（利用日・利用店名・利用金額を含むもの）をそのまま取り込めます。
      </p>
    </div>
  );
}
