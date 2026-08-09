import { AssetAccount, AssetEntry } from "@/lib/assets/types";
import { categoryBreakdown, totalNetWorth } from "@/lib/assets/aggregate";

function yen(n: number): string {
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

export default function AssetSummaryCard({
  accounts,
  entries,
}: {
  accounts: AssetAccount[];
  entries: AssetEntry[];
}) {
  const total = totalNetWorth(accounts, entries);
  const breakdown = categoryBreakdown(accounts, entries).filter((b) => b.total !== 0);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="mb-1 text-sm font-medium text-neutral-500">現在の資産合計</h3>
      <div className="text-3xl font-bold tabular-nums">{yen(total)}</div>
      {breakdown.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-neutral-100 pt-3 text-sm dark:border-neutral-800">
          {breakdown.map((b) => (
            <div key={b.category} className="flex items-center gap-1.5">
              <span className="text-neutral-500">{b.category}</span>
              <span className="tabular-nums font-medium">{yen(b.total)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
