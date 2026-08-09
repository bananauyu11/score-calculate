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

import { FixedCostItem, FixedCostKind } from "@/lib/budget/types";
import {
  loadFixedCosts,
  loadTakeHomePay,
  saveFixedCosts,
  saveTakeHomePay,
} from "@/lib/budget/storage";
import FixedCostsPanel from "@/components/budget/FixedCostsPanel";
import BudgetSummaryCard from "@/components/budget/BudgetSummaryCard";

import { CardPayment } from "@/lib/cards/types";
import {
  loadCardPayments,
  loadCashOnHand,
  saveCardPayments,
  saveCashOnHand,
} from "@/lib/cards/storage";
import CardPaymentsPanel from "@/components/cards/CardPaymentsPanel";

import { Goal, GoalCategory } from "@/lib/goals/types";
import { loadGoals, saveGoals } from "@/lib/goals/storage";
import { AssetCategory } from "@/lib/assets/types";
import GoalForm from "@/components/goals/GoalForm";
import GoalsPanel from "@/components/goals/GoalsPanel";

type Section = "assets" | "expenses" | "budget" | "cards";
type AssetTab = "list" | "goals" | "chart";
type ExpenseTab = "daily" | "monthly" | "yearly" | "chart";

export default function AssetsPage() {
  const [loaded, setLoaded] = useState(false);
  const [accounts, setAccounts] = useState<AssetAccount[]>([]);
  const [entries, setEntries] = useState<AssetEntry[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<string[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<string[]>([]);
  const [fixedCosts, setFixedCosts] = useState<FixedCostItem[]>([]);
  const [takeHomePay, setTakeHomePay] = useState(0);
  const [cardPayments, setCardPayments] = useState<CardPayment[]>([]);
  const [cashOnHand, setCashOnHand] = useState(0);
  const [goals, setGoals] = useState<Goal[]>([]);

  const [section, setSection] = useState<Section>("assets");
  const [assetTab, setAssetTab] = useState<AssetTab>("list");
  const [expenseTab, setExpenseTab] = useState<ExpenseTab>("monthly");

  useEffect(() => {
    setAccounts(loadAccounts());
    setEntries(loadEntries());
    setExpenses(loadExpenses());
    setExpenseCategories(loadCategories("expense"));
    setIncomeCategories(loadCategories("income"));
    setFixedCosts(loadFixedCosts());
    setTakeHomePay(loadTakeHomePay());
    setCardPayments(loadCardPayments());
    setCashOnHand(loadCashOnHand());
    setGoals(loadGoals());
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

  const handleAddFixedCost = (name: string, amount: number, kind: FixedCostKind) => {
    const item: FixedCostItem = { id: genId(), name, amount, kind };
    const next = [...fixedCosts, item];
    setFixedCosts(next);
    saveFixedCosts(next);
  };

  const handleUpdateFixedCost = (id: string, patch: Partial<Omit<FixedCostItem, "id">>) => {
    const next = fixedCosts.map((i) => (i.id === id ? { ...i, ...patch } : i));
    setFixedCosts(next);
    saveFixedCosts(next);
  };

  const handleDeleteFixedCost = (id: string) => {
    const next = fixedCosts.filter((i) => i.id !== id);
    setFixedCosts(next);
    saveFixedCosts(next);
  };

  const handleChangeTakeHomePay = (value: number) => {
    setTakeHomePay(value);
    saveTakeHomePay(value);
  };

  const handleAddCardPayment = (card: string, amount: number, debitDay: number) => {
    const item: CardPayment = { id: genId(), card, amount, debitDay };
    const next = [...cardPayments, item];
    setCardPayments(next);
    saveCardPayments(next);
  };

  const handleUpdateCardPayment = (id: string, patch: Partial<Omit<CardPayment, "id">>) => {
    const next = cardPayments.map((i) => (i.id === id ? { ...i, ...patch } : i));
    setCardPayments(next);
    saveCardPayments(next);
  };

  const handleDeleteCardPayment = (id: string) => {
    const next = cardPayments.filter((i) => i.id !== id);
    setCardPayments(next);
    saveCardPayments(next);
  };

  const handleChangeCashOnHand = (value: number) => {
    setCashOnHand(value);
    saveCashOnHand(value);
  };

  const handleAddGoal = (data: {
    name: string;
    category: GoalCategory;
    linkedAssetCategory?: AssetCategory;
    targetAmount: number;
    currentAmount: number;
    deadlineYear?: number;
    note?: string;
  }) => {
    const goal: Goal = { id: genId(), ...data };
    const next = [...goals, goal];
    setGoals(next);
    saveGoals(next);
  };

  const handleUpdateGoalCurrent = (id: string, current: number) => {
    const next = goals.map((g) => (g.id === id ? { ...g, currentAmount: current } : g));
    setGoals(next);
    saveGoals(next);
  };

  const handleDeleteGoal = (id: string) => {
    const next = goals.filter((g) => g.id !== id);
    setGoals(next);
    saveGoals(next);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 p-4 pb-12">
      <header className="flex flex-col gap-3">
        <AppNav current="assets" />
        <div>
          <h1 className="text-xl font-bold">資産管理</h1>
          <p className="text-sm text-neutral-500">
            現金・預金・証券などの資産の増減と、支出・収入の明細、固定費・目標・カード引落を記録・グラフで確認できます。
          </p>
        </div>
      </header>

      <nav className="flex gap-1 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-900">
        {(
          [
            { key: "assets", label: "資産" },
            { key: "expenses", label: "収支" },
            { key: "budget", label: "固定費" },
            { key: "cards", label: "カード" },
          ] as { key: Section; label: string }[]
        ).map((s) => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              section === s.key ? "bg-white shadow-sm dark:bg-neutral-800" : "text-neutral-500"
            }`}
          >
            {s.label}
          </button>
        ))}
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
              onClick={() => setAssetTab("goals")}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                assetTab === "goals" ? "bg-white shadow-sm dark:bg-neutral-800" : "text-neutral-500"
              }`}
            >
              目標
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

          {assetTab === "list" && (
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
          )}
          {assetTab === "goals" && (
            <div className="flex flex-col gap-3">
              <GoalForm accounts={accounts} entries={entries} onAdd={handleAddGoal} />
              <GoalsPanel
                goals={goals}
                accounts={accounts}
                entries={entries}
                onUpdateCurrent={handleUpdateGoalCurrent}
                onDelete={handleDeleteGoal}
              />
            </div>
          )}
          {assetTab === "chart" && <AssetChart accounts={accounts} entries={entries} />}
        </div>
      ) : section === "expenses" ? (
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
      ) : section === "budget" ? (
        <div className="flex flex-col gap-4">
          <BudgetSummaryCard
            items={fixedCosts}
            takeHomePay={takeHomePay}
            onChangeTakeHomePay={handleChangeTakeHomePay}
          />
          <FixedCostsPanel
            items={fixedCosts}
            onAdd={handleAddFixedCost}
            onUpdate={handleUpdateFixedCost}
            onDelete={handleDeleteFixedCost}
          />
        </div>
      ) : (
        <CardPaymentsPanel
          items={cardPayments}
          cashOnHand={cashOnHand}
          onAdd={handleAddCardPayment}
          onUpdate={handleUpdateCardPayment}
          onDelete={handleDeleteCardPayment}
          onChangeCashOnHand={handleChangeCashOnHand}
        />
      )}
    </main>
  );
}
