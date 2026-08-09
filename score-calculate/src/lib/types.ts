export interface BetRecord {
  id: string;
  date: string; // YYYY-MM-DD
  track: string; // 競馬場
  raceNo: number; // R
  raceName: string; // レース名
  betType: string; // 式別 (馬連, 3連複, ワイド, 馬単 など)
  method: string; // 方式 (1軸流し, フォーメーション, ボックス, 通常 など)
  selection: string; // 買い目 (例: 6→2)
  unitAmount: number; // 購入金額 (1点あたり)
  points: number; // 点数
  odds: number | null; // オッズ
  payout: number; // 払戻金額
}

export type NewBetRecord = Omit<BetRecord, "id">;

export function stakeOf(r: BetRecord): number {
  return r.unitAmount * r.points;
}

export function profitOf(r: BetRecord): number {
  return r.payout - stakeOf(r);
}

export function makeId(r: NewBetRecord): string {
  return [
    r.date,
    r.track,
    r.raceNo,
    r.betType,
    r.method,
    r.selection,
    r.unitAmount,
    r.points,
  ].join("|");
}
