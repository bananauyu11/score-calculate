import { Totals } from "@/lib/aggregate";

function yen(n: number): string {
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

export default function SummaryCard({ title, totals }: { title: string; totals: Totals }) {
  const positive = totals.profit >= 0;
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="mb-2 text-sm font-medium text-neutral-500">
        {title}
        <span className="ml-2 text-xs text-neutral-400">{totals.count}件</span>
      </h3>
      <div className="grid grid-cols-2 gap-y-1 text-sm">
        <div className="text-neutral-500">購入額</div>
        <div className="text-right tabular-nums">{yen(totals.stake)}</div>
        <div className="text-neutral-500">払戻額</div>
        <div className="text-right tabular-nums">{yen(totals.payout)}</div>
        <div className="text-neutral-500">回収率</div>
        <div className="text-right tabular-nums">
          {totals.recoveryRate === null ? "-" : `${totals.recoveryRate.toFixed(1)}%`}
        </div>
        <div className="font-medium text-neutral-700 dark:text-neutral-300">収支</div>
        <div
          className={`text-right font-semibold tabular-nums ${
            positive ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {positive ? "+" : ""}
          {yen(totals.profit)}
        </div>
      </div>
    </div>
  );
}
