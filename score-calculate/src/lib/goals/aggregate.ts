import { Goal } from "./types";

export interface GoalStatus {
  diff: number; // targetAmount - currentAmount（残り必要額。0以下なら達成）
  achieved: boolean;
  progress: number; // currentAmount / targetAmount（0〜1、達成時は1超もあり得る）
}

export function statusOf(goal: Goal): GoalStatus {
  const diff = goal.targetAmount - goal.currentAmount;
  const achieved = goal.currentAmount >= goal.targetAmount;
  const progress = goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0;
  return { diff, achieved, progress };
}
