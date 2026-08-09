"use client";

import { useState } from "react";

const ADD_NEW = "__add_new__";

interface Props {
  value: string;
  categories: string[];
  onChange: (value: string) => void;
  onAddCategory?: (name: string) => void;
  allowAll?: boolean;
  className?: string;
}

const defaultClass =
  "rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900";

export default function CategorySelect({
  value,
  categories,
  onChange,
  onAddCategory,
  allowAll,
  className,
}: Props) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const confirmAdd = () => {
    const trimmed = newName.trim();
    if (trimmed) {
      onAddCategory?.(trimmed);
      onChange(trimmed);
    }
    setNewName("");
    setAdding(false);
  };

  const cancelAdd = () => {
    setNewName("");
    setAdding(false);
  };

  if (adding) {
    return (
      <div className="flex gap-1">
        <input
          autoFocus
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="新しいカテゴリ名"
          className={`${className ?? defaultClass} w-28`}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              confirmAdd();
            }
            if (e.key === "Escape") cancelAdd();
          }}
        />
        <button
          type="button"
          onClick={confirmAdd}
          className="rounded-lg bg-emerald-600 px-2 text-xs font-medium text-white"
        >
          追加
        </button>
        <button
          type="button"
          onClick={cancelAdd}
          className="rounded-lg border border-neutral-300 px-2 text-xs dark:border-neutral-700"
        >
          戻る
        </button>
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => {
        if (e.target.value === ADD_NEW) {
          setAdding(true);
          return;
        }
        onChange(e.target.value);
      }}
      className={className ?? defaultClass}
    >
      {allowAll && <option value="all">すべてのカテゴリ</option>}
      {categories.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
      {onAddCategory && <option value={ADD_NEW}>＋ 新しいカテゴリを追加...</option>}
    </select>
  );
}
