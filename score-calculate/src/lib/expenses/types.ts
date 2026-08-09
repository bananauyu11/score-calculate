export type TransactionType = "expense" | "income";

export const UNCATEGORIZED = "未分類";

export const DEFAULT_EXPENSE_CATEGORIES = [
  "食費",
  "日用品",
  "交通",
  "娯楽",
  "住居",
  "水道光熱",
  "通信",
  "医療",
  "保険",
  "教育",
  "その他",
];

export const DEFAULT_INCOME_CATEGORIES = ["給与", "賞与", "副業", "配当・利息", "還付", "その他"];

export interface ExpenseRecord {
  id: string;
  date: string; // YYYY-MM-DD
  store: string; // 利用店名・商品名・内容
  amount: number; // 金額（円）。常に正の値
  method?: string; // 決済方法
  type: TransactionType; // 支出 or 収入
  category: string;
}

export type NewExpenseRecord = Omit<ExpenseRecord, "id">;

export function makeExpenseId(r: {
  date: string;
  store: string;
  amount: number;
  method?: string;
  type: TransactionType;
}): string {
  return [r.date, r.store, r.amount, r.method ?? "", r.type].join("|");
}
