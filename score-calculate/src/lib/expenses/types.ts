export interface ExpenseRecord {
  id: string;
  date: string; // YYYY-MM-DD
  store: string; // 利用店名・商品名
  amount: number; // 利用金額（円）。マイナスは返金など
  method?: string; // 決済方法
}

export type NewExpenseRecord = Omit<ExpenseRecord, "id">;

export function makeExpenseId(r: NewExpenseRecord): string {
  return [r.date, r.store, r.amount, r.method ?? ""].join("|");
}
