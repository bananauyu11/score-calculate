import Papa from "papaparse";
import { ExpenseRecord, makeExpenseId, NewExpenseRecord } from "./types";

// クレジットカード明細やシンプルな家計簿形式など、複数のヘッダー表記を許容する
const DATE_HEADERS = ["利用日/キャンセル日", "利用日", "日付", "ご利用日"];
const STORE_HEADERS = ["利用店名・商品名", "利用店名", "店名", "内容", "摘要", "商品名"];
const AMOUNT_HEADERS = ["利用金額", "金額", "支払金額", "ご利用金額"];
const METHOD_HEADERS = ["決済方法", "支払方法", "支払区分"];

function pick(row: Record<string, string>, keys: string[]): string {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null) return String(row[key]).trim();
  }
  return "";
}

function normalizeDate(raw: string): string | null {
  const m = raw.match(/^(\d{4})[/\-](\d{1,2})[/\-](\d{1,2})$/);
  if (!m) return null;
  const [, y, mo, d] = m;
  return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

export interface ExpenseParseResult {
  records: ExpenseRecord[];
  errors: string[];
}

export function parseExpenseCsv(text: string): ExpenseParseResult {
  const withoutBom = text.replace(/^﻿/, "");
  const result = Papa.parse<Record<string, string>>(withoutBom, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const errors: string[] = [...result.errors.map((e) => `${(e.row ?? 0) + 2}行目: ${e.message}`)];
  const records: ExpenseRecord[] = [];

  result.data.forEach((row, i) => {
    const lineNo = i + 2;

    const dateRaw = pick(row, DATE_HEADERS);
    const store = pick(row, STORE_HEADERS);
    const amountRaw = pick(row, AMOUNT_HEADERS).replace(/,/g, "");
    const method = pick(row, METHOD_HEADERS) || undefined;

    // 手数料明細や遅延損害金などの注記行（日付・店名・金額が揃わない行）はスキップ
    if (!dateRaw || !store || !amountRaw) {
      return;
    }

    const date = normalizeDate(dateRaw);
    if (!date) {
      errors.push(`${lineNo}行目: 日付を解釈できません (${dateRaw})`);
      return;
    }

    const amount = Number(amountRaw);
    if (Number.isNaN(amount)) {
      errors.push(`${lineNo}行目: 金額が不正です (${amountRaw})`);
      return;
    }

    const base: NewExpenseRecord = { date, store, amount, method };
    records.push({ id: makeExpenseId(base), ...base });
  });

  return { records, errors };
}

export function toExpenseCsv(records: ExpenseRecord[]): string {
  const rows = records.map((r) => ({
    日付: r.date,
    "利用店名・商品名": r.store,
    利用金額: r.amount,
    決済方法: r.method ?? "",
  }));
  return Papa.unparse(rows, { columns: ["日付", "利用店名・商品名", "利用金額", "決済方法"] });
}
