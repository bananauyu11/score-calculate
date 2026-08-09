import { Goal } from "./types";

const GOALS_KEY = "asset-goals-v1";

export function loadGoals(): Goal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GOALS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Goal[]) : [];
  } catch {
    return [];
  }
}

export function saveGoals(goals: Goal[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}
