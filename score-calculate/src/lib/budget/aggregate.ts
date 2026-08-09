import { FixedCostItem } from "./types";

export function totalOf(items: FixedCostItem[]): number {
  return items.reduce((s, i) => s + i.amount, 0);
}

export function investmentTotal(items: FixedCostItem[]): number {
  return items.filter((i) => i.kind === "investment").reduce((s, i) => s + i.amount, 0);
}

export function livingTotal(items: FixedCostItem[]): number {
  return items.filter((i) => i.kind === "living").reduce((s, i) => s + i.amount, 0);
}

export function surplusOf(items: FixedCostItem[], takeHomePay: number): number {
  return takeHomePay - totalOf(items);
}
