"use client";

import { ReactNode, useRef, useState } from "react";
import { parseCsv, toCsv } from "@/lib/csv";
import { BetRecord } from "@/lib/types";
import { ExportIcon, ImportIcon, SampleIcon, TrashIcon } from "./icons";

interface Props {
  records: BetRecord[];
  onImport: (records: BetRecord[]) => { added: number; skipped: number };
  onClear: () => void;
}

function PillButton({
  icon,
  badgeClass,
  label,
  onClick,
  disabled,
  danger,
}: {
  icon: ReactNode;
  badgeClass: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium disabled:opacity-40 ${
        danger
          ? "border-red-200 text-red-600 dark:border-red-900/60 dark:text-red-400"
          : "border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
      }`}
    >
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${badgeClass}`}>
        {icon}
      </span>
      {label}
    </button>
  );
}

export default function ImportBar({ records, onImport, onClear }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    const text = await file.text();
    const { records: parsed, errors } = parseCsv(text);

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

  const handleSample = async () => {
    try {
      const res = await fetch("/sample.csv");
      const text = await res.text();
      const { records: parsed, errors } = parseCsv(text);

      if (parsed.length > 0) {
        const { added, skipped } = onImport(parsed);
        setMessage(
          `サンプルデータを取り込みました。${added}件追加、${skipped}件は重複のためスキップしました。`
        );
      } else {
        setMessage(
          errors.length > 0
            ? `サンプルの取り込みに失敗しました: ${errors[0]}`
            : "サンプルデータが見つかりませんでした。"
        );
      }
    } catch {
      setMessage("サンプルデータの取得に失敗しました。通信環境を確認してください。");
    }
  };

  const handleExport = () => {
    const csv = toCsv(records);
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `keiba-shushi-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (window.confirm("保存されている全ての収支データを削除します。よろしいですか？")) {
      onClear();
      setMessage("全データを削除しました。");
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-sm text-neutral-400">登録件数: {records.length}件</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <PillButton
          icon={<ImportIcon className="text-emerald-600 dark:text-emerald-400" />}
          badgeClass="bg-emerald-100 dark:bg-emerald-900/40"
          label="インポート"
          onClick={() => inputRef.current?.click()}
        />
        <PillButton
          icon={<ExportIcon className="text-sky-600 dark:text-sky-400" />}
          badgeClass="bg-sky-100 dark:bg-sky-900/40"
          label="エクスポート"
          onClick={handleExport}
          disabled={records.length === 0}
        />
        <PillButton
          icon={<SampleIcon className="text-amber-600 dark:text-amber-400" />}
          badgeClass="bg-amber-100 dark:bg-amber-900/40"
          label="サンプルデータを試す"
          onClick={handleSample}
        />
      </div>

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

      <div className="mt-3">
        <PillButton
          icon={<TrashIcon className="text-red-600 dark:text-red-400" />}
          badgeClass="bg-red-100 dark:bg-red-900/40"
          label="初期化"
          onClick={handleClear}
          disabled={records.length === 0}
          danger
        />
      </div>

      {message && <p className="mt-3 text-sm text-neutral-500">{message}</p>}
    </div>
  );
}
