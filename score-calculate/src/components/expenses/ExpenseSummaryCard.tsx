import { ExpenseTotals } from "@/lib/expenses/aggregate";

function yen(n: number): string {
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

export default function ExpenseSummaryCard({
  title,
  totals,
}: {
  title: string;
  totals: ExpenseTotals;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="mb-2 text-sm font-medium text-neutral-500">
        {title}
        <span className="ml-2 text-xs text-neutral-400">{totals.count}件</span>
      </h3>
      <div className="text-2xl font-bold tabular-nums text-rose-600">{yen(totals.amount)}</div>
    </div>
  );
}
