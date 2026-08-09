"use client";

import { Goal } from "@/lib/goals/types";
import { statusOf } from "@/lib/goals/aggregate";
import { AssetAccount, AssetEntry } from "@/lib/assets/types";
import { categoryBreakdown } from "@/lib/assets/aggregate";

function yen(n: number): string {
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

interface Props {
  goals: Goal[];
  accounts: AssetAccount[];
  entries: AssetEntry[];
  onUpdateCurrent: (id: string, current: number) => void;
  onDelete: (id: string) => void;
}

export default function GoalsPanel({ goals, accounts, entries, onUpdateCurrent, onDelete }: Props) {
  if (goals.length === 0) {
    return (
      <p className="text-sm text-neutral-500">目標が登録されていません。上のボタンから追加してください。</p>
    );
  }

  const breakdown = categoryBreakdown(accounts, entries);

  return (
    <div className="flex flex-col gap-3">
      {goals.map((goal) => {
        const { diff, achieved, progress } = statusOf(goal);
        const linkedTotal = goal.linkedAssetCategory
          ? breakdown.find((b) => b.category === goal.linkedAssetCategory)?.total ?? 0
          : null;

        return (
          <div
            key={goal.id}
            className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{goal.name}</span>
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500 dark:bg-neutral-800">
                    {goal.category}
                    {goal.linkedAssetCategory ? `・${goal.linkedAssetCategory}` : ""}
                  </span>
                  {achieved ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                      達成
                    </span>
                  ) : (
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500 dark:bg-neutral-800">
                      未達
                    </span>
                  )}
                </div>
                {goal.deadlineYear && (
                  <div className="mt-0.5 text-xs text-neutral-400">期限: {goal.deadlineYear}年</div>
                )}
                {goal.note && <div className="mt-0.5 text-xs text-neutral-400">{goal.note}</div>}
              </div>
              <button onClick={() => onDelete(goal.id)} className="text-xs text-red-500">
                削除
              </button>
            </div>

            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div
                className={`h-full ${achieved ? "bg-emerald-600" : "bg-sky-500"}`}
                style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
              />
            </div>

            <div className="mt-2 grid grid-cols-2 gap-y-1 text-sm sm:grid-cols-4">
              <div className="text-neutral-500">目標</div>
              <div className="text-right tabular-nums sm:text-left">{yen(goal.targetAmount)}</div>
              <div className="text-neutral-500">差分</div>
              <div
                className={`text-right tabular-nums sm:text-left ${
                  diff <= 0 ? "text-emerald-600" : "text-neutral-700 dark:text-neutral-300"
                }`}
              >
                {diff <= 0 ? "達成" : yen(diff)}
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <label className="text-xs text-neutral-500">現状額</label>
              <input
                key={goal.currentAmount}
                type="number"
                inputMode="decimal"
                defaultValue={goal.currentAmount}
                onBlur={(e) => onUpdateCurrent(goal.id, Number(e.target.value) || 0)}
                className="w-36 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-right text-sm dark:border-neutral-700 dark:bg-neutral-900"
              />
              {goal.linkedAssetCategory && (
                <button
                  type="button"
                  onClick={() => onUpdateCurrent(goal.id, linkedTotal ?? 0)}
                  className="rounded-lg border border-neutral-300 px-2 py-1.5 text-xs dark:border-neutral-700"
                >
                  資産額を反映（{yen(linkedTotal ?? 0)}）
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
