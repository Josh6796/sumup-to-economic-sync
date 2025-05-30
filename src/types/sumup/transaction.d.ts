import { PaymentType } from "../../enums/paymentType.enum";
import { TransactionStatus } from "../../enums/transactionStatus.enum";
import { TransactionType } from "../../enums/transactionType.enum";

export interface Transaction {
  id: string;
  transaction_id?: string; // Alias for id sometimes
  transaction_code: string;
  amount: number;
  currency: string;
  timestamp: string; // ISO 8601 format
  status: TransactionStatus | string;
  payment_type: PaymentType | string;
  payout_date?: string;
  refunded_amount: number;
  product_summary?: string;
  user: string;

  card_type?: string;
  entry_mode?: string;
  type?: TransactionType | string;
}
