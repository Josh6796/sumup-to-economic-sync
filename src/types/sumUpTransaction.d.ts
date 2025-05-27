// src/types/sumUpTransaction.d.ts

export interface SumUpTransaction {
  id: string;
  transaction_code: string;
  amount: number;
  currency: string;
  timestamp: string;
  status: string;
  payment_type: string;
  payout_date: string;
  refunded_amount: number;
  product_summary?: string;
  user: string;
}
