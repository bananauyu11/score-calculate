import { AssetCategory } from "@/lib/assets/types";

export const GOAL_CATEGORIES = ["資産", "不労所得", "その他"] as const;
export type GoalCategory = (typeof GOAL_CATEGORIES)[number];

export interface Goal {
  id: string;
  name: string;
  category: GoalCategory;
  // category が「資産」のとき、資産タブのどのカテゴリ合計と連動させるか
  linkedAssetCategory?: AssetCategory;
  targetAmount: number;
  currentAmount: number;
  deadlineYear?: number;
  note?: string;
}
