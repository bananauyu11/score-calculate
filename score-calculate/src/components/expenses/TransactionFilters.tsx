"use client";

import { TransactionType } from "@/lib/expenses/types";
import CategorySelect from "./CategorySelect";

interface Props {
  type: TransactionType | "all";
  onTypeChange: (t: TransactionType | "all") => void;
  category: string;
  onCategoryChange: (c: string) => void;
  expenseCategories: string[];
  incomeCategories: string[];
}

export default function TransactionFilters({
  type,
  onTypeChange,
  category,
  onCategoryChange,
  expenseCategories,
  incomeCategories,
}: Props) {
  const categories =
    type === "expense"
      ? expenseCategories
      : type === "income"
        ? incomeCategories
        : Array.from(new Set([...expenseCategories, ...incomeCategories]));

  return (
    <div className="flex flex-wrap gap-2">
      <select
        value={type}
        onChange={(e) => {
          onTypeChange(e.target.value as TransactionType | "all");
          onCategoryChange("all");
        }}
        className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      >
        <option value="all">すべての種別</option>
        <option value="expense">支出のみ</option>
        <option value="income">収入のみ</option>
      </select>
      <CategorySelect value={category} categories={categories} onChange={onCategoryChange} allowAll />
    </div>
  );
}
