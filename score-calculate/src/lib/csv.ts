import Papa from "papaparse";
import { BetRecord, makeId, NewBetRecord } from "./types";

export const CSV_HEADERS = [
  "日付",
  "競馬場",
  "R",
  "レース名",
  "式別",
  "方式",
  "買い目",
  "購入金額",
  "点数",
  "オッズ",
  "払戻金額",
] as const;

export interface ParseResult {
  records: BetRecord[];
  errors: string[];
}

export function parseCsv(text: string): ParseResult {
  const withoutBom = text.replace(/^﻿/, "");
  const result = Papa.parse<Record<string, string>>(withoutBom, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const errors: string[] = [...result.errors.map((e) => `${(e.row ?? 0) + 2}行目: ${e.message}`)];
  const records: BetRecord[] = [];

  result.data.forEach((row, i) => {
    const lineNo = i + 2;

    const date = (row["日付"] || "").trim();
    const track = (row["競馬場"] || "").trim();
    const raceNoStr = (row["R"] || "").trim();
    const raceName = (row["レース名"] || "").trim();
    const betType = (row["式別"] || "").trim();
    const method = (row["方式"] || "").trim();
    const selection = (row["買い目"] || "").trim();
    const unitAmountStr = (row["購入金額"] || "").trim();
    const pointsStr = (row["点数"] || "1").trim();
    const oddsStr = (row["オッズ"] || "").trim();
    const payoutStr = (row["払戻金額"] || "0").trim();

    if (!date || !track || !raceNoStr || !betType || !unitAmountStr) {
      errors.push(`${lineNo}行目: 必須項目(日付/競馬場/R/式別/購入金額)が不足しています`);
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      errors.push(`${lineNo}行目: 日付は YYYY-MM-DD 形式で入力してください (${date})`);
      return;
    }

    const raceNo = Number(raceNoStr);
    const unitAmount = Number(unitAmountStr);
    const points = pointsStr ? Number(pointsStr) : 1;
    const odds = oddsStr ? Number(oddsStr) : null;
    const payout = payoutStr ? Number(payoutStr) : 0;

    if (
      Number.isNaN(raceNo) ||
      Number.isNaN(unitAmount) ||
      Number.isNaN(points) ||
      Number.isNaN(payout) ||
      (odds !== null && Number.isNaN(odds))
    ) {
      errors.push(`${lineNo}行目: 数値項目が不正です`);
      return;
    }

    const base: NewBetRecord = {
      date,
      track,
      raceNo,
      raceName,
      betType,
      method,
      selection,
      unitAmount,
      points,
      odds,
      payout,
    };
    records.push({ id: makeId(base), ...base });
  });

  return { records, errors };
}

export function toCsv(records: BetRecord[]): string {
  const rows = records.map((r) => ({
    日付: r.date,
    競馬場: r.track,
    R: r.raceNo,
    レース名: r.raceName,
    式別: r.betType,
    方式: r.method,
    買い目: r.selection,
    購入金額: r.unitAmount,
    点数: r.points,
    オッズ: r.odds ?? "",
    払戻金額: r.payout,
  }));
  return Papa.unparse(rows, { columns: [...CSV_HEADERS] });
}
