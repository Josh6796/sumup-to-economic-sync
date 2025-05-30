export interface SumUpTransactionDetails {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_type: string;
  timestamp: string;
  local_time: string;
  transaction_code: string;
  product_summary?: string;
  products?: {
    name: string;
    description?: string;
    quantity: number;
    price: number;
    price_with_vat: number;
    total_price: number;
    total_with_vat: number;
    vat_amount: number;
    vat_rate: number;
  }[];
  vat_amount?: number;
  vat_rates?: {
    gross: number;
    net: number;
    rate: number;
    vat: number;
  }[];
  events?: {
    amount: number;
    fee_amount: number;
    status: string;
    timestamp: string;
    payout_id?: number;
    payout_reference?: string;
  }[];
  transaction_events?: {
    amount: number;
    event_type: string;
    status: string;
    date: string;
    timestamp: string;
  }[];
}
