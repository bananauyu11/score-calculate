"use client";

import { useState } from "react";
import { AssetAccount, AssetEntry } from "@/lib/assets/types";
import { currentBalances } from "@/lib/assets/aggregate";
import EntryForm from "./EntryForm";

function yen(n: number): string {
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

interface Props {
  accounts: AssetAccount[];
  entries: AssetEntry[];
  onAddEntry: (accountId: string, date: string, amount: number, memo?: string) => void;
  onDeleteEntry: (id: string) => void;
  onDeleteAccount: (id: string) => void;
}

export default function AccountsPanel({
  accounts,
  entries,
  onAddEntry,
  onDeleteEntry,
  onDeleteAccount,
}: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const balances = currentBalances(accounts, entries);

  if (accounts.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        まだ資産口座がありません。上のボタンから追加してください。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {balances.map(({ account, balance, lastEntryDate }) => {
        const accountEntries = entries
          .filter((e) => e.accountId === account.id)
          .sort((a, b) => b.date.localeCompare(a.date));
        const isOpen = expanded === account.id;

        return (
          <div
            key={account.id}
            className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
          >
            <button
              onClick={() => setExpanded(isOpen ? null : account.id)}
              className="flex w-full items-center justify-between gap-3 p-4 text-left"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{account.name}</span>
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500 dark:bg-neutral-800">
                    {account.category}
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-neutral-400">
                  {lastEntryDate ? `最終更新: ${lastEntryDate}` : "記録なし"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold tabular-nums">{yen(balance)}</span>
                <span className="text-neutral-400">{isOpen ? "▲" : "▼"}</span>
              </div>
            </button>

            {isOpen && (
              <div className="flex flex-col gap-3 border-t border-neutral-100 p-4 dark:border-neutral-800">
                <EntryForm
                  onAdd={(date, amount, memo) => onAddEntry(account.id, date, amount, memo)}
                />

                {accountEntries.length === 0 ? (
                  <p className="text-sm text-neutral-500">記録がありません。</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <table className="w-full min-w-[420px] text-sm">
                      <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-900">
                        <tr>
                          <th className="p-2 text-left">日付</th>
                          <th className="p-2 text-left">メモ</th>
                          <th className="p-2 text-right">増減</th>
                          <th className="p-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {accountEntries.map((e) => (
                          <tr key={e.id} className="border-t border-neutral-100 dark:border-neutral-800">
                            <td className="p-2 align-top">{e.date}</td>
                            <td className="p-2 align-top text-neutral-500">{e.memo ?? "-"}</td>
                            <td
                              className={`p-2 text-right align-top tabular-nums ${
                                e.amount >= 0 ? "text-emerald-600" : "text-red-600"
                              }`}
                            >
                              {e.amount >= 0 ? "+" : ""}
                              {yen(e.amount)}
                            </td>
                            <td className="p-2 text-right align-top">
                              <button
                                onClick={() => onDeleteEntry(e.id)}
                                className="text-xs text-red-500"
                              >
                                削除
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        `「${account.name}」を削除します。記録もすべて削除されます。よろしいですか？`
                      )
                    ) {
                      onDeleteAccount(account.id);
                    }
                  }}
                  className="self-start text-xs text-red-500"
                >
                  この口座を削除
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
