export interface SumUpTransaction {
  id: string;
  transaction_id?: string; // Alias for id sometimes
  transaction_code: string;
  amount: number;
  currency: string;
  timestamp: string; // ISO 8601 format
  status: 'SUCCESSFUL' | 'FAILED' | string;
  payment_type: 'POS' | 'CASH' | 'ECOM' | string;
  payout_date?: string;
  refunded_amount: number;
  product_summary?: string;
  user: string;

  card_type?: string;
  entry_mode?: string;
  type?: string;
}
