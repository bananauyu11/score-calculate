export interface CardPayment {
  id: string;
  card: string;
  amount: number;
  debitDay: number; // 1-31
}
