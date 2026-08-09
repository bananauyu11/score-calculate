export type FixedCostKind = "investment" | "living";

export interface FixedCostItem {
  id: string;
  name: string;
  amount: number;
  kind: FixedCostKind;
}
