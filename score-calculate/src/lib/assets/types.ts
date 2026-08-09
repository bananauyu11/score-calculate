export const ASSET_CATEGORIES = ["現金", "預金", "証券", "不動産", "その他"] as const;
export type AssetCategory = (typeof ASSET_CATEGORIES)[number];

export interface AssetAccount {
  id: string;
  name: string;
  category: AssetCategory;
}

export type NewAssetAccount = Omit<AssetAccount, "id">;

export interface AssetEntry {
  id: string;
  accountId: string;
  date: string; // YYYY-MM-DD
  amount: number; // signed change (+ increase / - decrease)
  memo?: string;
}

export type NewAssetEntry = Omit<AssetEntry, "id">;
