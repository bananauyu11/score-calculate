import { NetTotals } from "@/lib/expenses/aggregate";

function yen(n: number): string {
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

export default function TransactionSummaryCard({
  title,
  totals,
}: {
  title: string;
  totals: NetTotals;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="mb-2 text-sm font-medium text-neutral-500">
        {title}
        <span className="ml-2 text-xs text-neutral-400">{totals.count}件</span>
      </h3>
      <div className="grid grid-cols-2 gap-y-1 text-sm">
        <div className="text-neutral-500">支出</div>
        <div className="text-right tabular-nums text-rose-600">{yen(totals.expense)}</div>
        <div className="text-neutral-500">収入</div>
        <div className="text-right tabular-nums text-emerald-600">{yen(totals.income)}</div>
        <div className="font-medium text-neutral-700 dark:text-neutral-300">収支</div>
        <div
          className={`text-right font-semibold tabular-nums ${
            totals.net >= 0 ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {totals.net >= 0 ? "+" : ""}
          {yen(totals.net)}
        </div>
      </div>
    </div>
  );
}
