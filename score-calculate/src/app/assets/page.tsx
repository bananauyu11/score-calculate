"use client";

import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import { AssetAccount, AssetEntry } from "@/lib/assets/types";
import { loadAccounts, loadEntries, saveAccounts, saveEntries } from "@/lib/assets/storage";
import { genId } from "@/lib/id";
import AssetSummaryCard from "@/components/assets/AssetSummaryCard";
import AccountForm from "@/components/assets/AccountForm";
import AccountsPanel from "@/components/assets/AccountsPanel";
import AssetChart from "@/components/assets/AssetChart";

import { ExpenseRecord, TransactionType } from "@/lib/expenses/types";
import { loadExpenses, mergeExpenses, saveExpenses } from "@/lib/expenses/storage";
import { addCategory, loadCategories } from "@/lib/expenses/categories";
import ExpenseImportBar from "@/components/expenses/ExpenseImportBar";
import TransactionForm from "@/components/expenses/TransactionForm";
import ExpenseDailyView from "@/components/expenses/ExpenseDailyView";
import ExpenseMonthlyView from "@/components/expenses/ExpenseMonthlyView";
import ExpenseYearlyView from "@/components/expenses/ExpenseYearlyView";
import ExpenseChart from "@/components/expenses/ExpenseChart";

type Section = "assets" | "expenses";
type AssetTab = "list" | "chart";
type ExpenseTab = "daily" | "monthly" | "yearly" | "chart";

export default function AssetsPage() {
  const [loaded, setLoaded] = useState(false);
  const [accounts, setAccounts] = useState<AssetAccount[]>([]);
  const [entries, setEntries] = useState<AssetEntry[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<string[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<string[]>([]);

  const [section, setSection] = useState<Section>("assets");
  const [assetTab, setAssetTab] = useState<AssetTab>("list");
  const [expenseTab, setExpenseTab] = useState<ExpenseTab>("monthly");

  useEffect(() => {
    setAccounts(loadAccounts());
    setEntries(loadEntries());
    setExpenses(loadExpenses());
    setExpenseCategories(loadCategories("expense"));
    setIncomeCategories(loadCategories("income"));
    setLoaded(true);
  }, []);

  const handleAddAccount: React.ComponentProps<typeof AccountForm>["onAdd"] = (
    name,
    category,
    initial
  ) => {
    const account: AssetAccount = { id: genId(), name, category };
    const nextAccounts = [...accounts, account];
    setAccounts(nextAccounts);
    saveAccounts(nextAccounts);

    if (initial) {
      const entry: AssetEntry = {
        id: genId(),
        accountId: account.id,
        date: initial.date,
        amount: initial.amount,
        memo: "初期残高",
      };
      const nextEntries = [...entries, entry];
      setEntries(nextEntries);
      saveEntries(nextEntries);
    }
  };

  const handleAddEntry = (accountId: string, date: string, amount: number, memo?: string) => {
    const entry: AssetEntry = { id: genId(), accountId, date, amount, memo };
    const nextEntries = [...entries, entry];
    setEntries(nextEntries);
    saveEntries(nextEntries);
  };

  const handleDeleteEntry = (id: string) => {
    const nextEntries = entries.filter((e) => e.id !== id);
    setEntries(nextEntries);
    saveEntries(nextEntries);
  };

  const handleDeleteAccount = (id: string) => {
    const nextAccounts = accounts.filter((a) => a.id !== id);
    const nextEntries = entries.filter((e) => e.accountId !== id);
    setAccounts(nextAccounts);
    setEntries(nextEntries);
    saveAccounts(nextAccounts);
    saveEntries(nextEntries);
  };

  const handleImportExpenses = (incoming: ExpenseRecord[]) => {
    const { merged, added, skipped } = mergeExpenses(expenses, incoming);
    setExpenses(merged);
    saveExpenses(merged);
    return { added, skipped };
  };

  const handleClearExpenses = () => {
    setExpenses([]);
    saveExpenses([]);
  };

  const handleAddTransaction = (data: {
    date: string;
    type: TransactionType;
    category: string;
    store: string;
    amount: number;
    method?: string;
  }) => {
    const record: ExpenseRecord = { id: genId(), ...data };
    const nextExpenses = [...expenses, record];
    setExpenses(nextExpenses);
    saveExpenses(nextExpenses);
  };

  const handleUpdateExpenseCategory = (id: string, category: string) => {
    const nextExpenses = expenses.map((r) => (r.id === id ? { ...r, category } : r));
    setExpenses(nextExpenses);
    saveExpenses(nextExpenses);
  };

  const handleAddCategory = (type: TransactionType, name: string) => {
    const next = addCategory(type, name);
    if (type === "expense") {
      setExpenseCategories(next);
    } else {
      setIncomeCategories(next);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 p-4 pb-12">
      <header className="flex flex-col gap-3">
        <AppNav current="assets" />
        <div>
          <h1 className="text-xl font-bold">資産管理</h1>
          <p className="text-sm text-neutral-500">
            現金・預金・証券などの資産の増減と、支出・収入の明細を記録・グラフで確認できます。
          </p>
        </div>
      </header>

      <nav className="flex gap-1 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-900">
        <button
          onClick={() => setSection("assets")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
            section === "assets" ? "bg-white shadow-sm dark:bg-neutral-800" : "text-neutral-500"
          }`}
        >
          資産
        </button>
        <button
          onClick={() => setSection("expenses")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
            section === "expenses" ? "bg-white shadow-sm dark:bg-neutral-800" : "text-neutral-500"
          }`}
        >
          収支
        </button>
      </nav>

      {!loaded ? (
        <p className="text-sm text-neutral-500">読み込み中...</p>
      ) : section === "assets" ? (
        <div className="flex flex-col gap-4">
          <AssetSummaryCard accounts={accounts} entries={entries} />

          <div className="flex gap-1 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-900">
            <button
              onClick={() => setAssetTab("list")}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                assetTab === "list" ? "bg-white shadow-sm dark:bg-neutral-800" : "text-neutral-500"
              }`}
            >
              口座一覧
            </button>
            <button
              onClick={() => setAssetTab("chart")}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                assetTab === "chart" ? "bg-white shadow-sm dark:bg-neutral-800" : "text-neutral-500"
              }`}
            >
              グラフ
            </button>
          </div>

          {assetTab === "list" ? (
            <div className="flex flex-col gap-3">
              <AccountForm onAdd={handleAddAccount} />
              <AccountsPanel
                accounts={accounts}
                entries={entries}
                onAddEntry={handleAddEntry}
                onDeleteEntry={handleDeleteEntry}
                onDeleteAccount={handleDeleteAccount}
              />
            </div>
          ) : (
            <AssetChart accounts={accounts} entries={entries} />
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <ExpenseImportBar
            records={expenses}
            onImport={handleImportExpenses}
            onClear={handleClearExpenses}
          />

          <TransactionForm
            expenseCategories={expenseCategories}
            incomeCategories={incomeCategories}
            onAdd={handleAddTransaction}
            onAddCategory={handleAddCategory}
          />

          <div className="flex gap-1 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-900">
            {(
              [
                { key: "daily", label: "日別" },
                { key: "monthly", label: "月間" },
                { key: "yearly", label: "年間" },
                { key: "chart", label: "グラフ" },
              ] as { key: ExpenseTab; label: string }[]
            ).map((t) => (
              <button
                key={t.key}
                onClick={() => setExpenseTab(t.key)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                  expenseTab === t.key
                    ? "bg-white shadow-sm dark:bg-neutral-800"
                    : "text-neutral-500"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {expenseTab === "daily" && (
            <ExpenseDailyView
              records={expenses}
              expenseCategories={expenseCategories}
              incomeCategories={incomeCategories}
              onUpdateCategory={handleUpdateExpenseCategory}
              onAddCategory={handleAddCategory}
            />
          )}
          {expenseTab === "monthly" && (
            <ExpenseMonthlyView
              records={expenses}
              expenseCategories={expenseCategories}
              incomeCategories={incomeCategories}
            />
          )}
          {expenseTab === "yearly" && (
            <ExpenseYearlyView
              records={expenses}
              expenseCategories={expenseCategories}
              incomeCategories={incomeCategories}
            />
          )}
          {expenseTab === "chart" && (
            <ExpenseChart
              records={expenses}
              expenseCategories={expenseCategories}
              incomeCategories={incomeCategories}
            />
          )}
        </div>
      )}
    </main>
  );
}
