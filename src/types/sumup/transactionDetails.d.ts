import { CardType } from "../../enums/cardType.enum";
import { PaymentType } from "../../enums/paymentType.enum";
import { PayoutPlan } from "../../enums/payoutPlan.enum";
import { TransactionPayoutType } from "../../enums/transactionPayoutType.enum";
import { TransactionStatus } from "../../enums/transactionStatus.enum";

export interface TransactionDetails {
  id: string;
  transaction_code: string;
  amount: number;
  currency: string;
  timestamp: string;
  status: TransactionStatus | null;
  payment_type: PaymentType | null;
  installments_count: number | null;
  merchant_code: string;
  vat_amount: number | null;
  tip_amount: number | null;
  entry_mode: string | null;
  auth_code: string | null;
  internal_id: number | null;
  product_summary: string | null;
  payouts_total: number | null;
  payouts_received: number | null;
  payout_plan: PayoutPlan | null;
  username: string | null;
  lat: number | null;
  lon: number | null;
  horizontal_accuracy: number | null;
  simple_payment_type: string | null;
  verification_method: string | null;
  card?: Card | null;
  local_time: string | null;
  payout_type: TransactionPayoutType | null;
  products?: TransactionProduct[] | null;
  vat_rates?: VatRate[] | null;
  transaction_events?: TransactionEvent[] | null;
  simple_status: string | null;
  links?: Link[] | null;
  events?: Event[] | null;
  location?: Location | null;
  tax_enabled: boolean | null;
}

export interface TransactionProduct {
  name: string | null;
  description?: string | null;
  price: number | null;
  vat_rate: number | null;
  single_vat_amount: number | null;
  price_with_vat: number | null;
  vat_amount: number | null;
  quantity: number | null;
  total_price: number | null;
  total_with_vat: number | null;
}

export interface VatRate {
  gross?: number | null;
  net?: number | null;
  rate?: number | null;
  vat?: number | null;
}

export interface TransactionEvent {
  id: number | null;
  event_type: string | null;
  status: string | null;
  amount: number | null;
  due_date: string | null;
  date: string | null;
  installment_number: number | null;
  timestamp: string | null;
}

export interface Link {
  href?: string;
  rel?: string;
  type?: string;
  disclaimer?: string;
  max_amount?: number;
  min_amount?: number;
}

export interface Event {
  id: number | null;
  transaction_id: string | null;
  type: string | null;
  status: string | null;
  amount: number | null;
  timestamp: string | null;
  fee_amount: number | null;
  installment_number: number | null;
  deducted_amount: number | null;
  deducted_fee_amount: number | null;
}

export interface Location {
  lat: number | null;
  lon: number | null;
  horizontal_accuracy: number | null;
}

export interface Card {
  last_4_digits: string;
  type: CardType | null;
}
