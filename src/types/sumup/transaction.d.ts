import { CardType } from "../../enums/cardType.enum";
import { PaymentType } from "../../enums/paymentType.enum";
import { PayoutPlan } from "../../enums/payoutPlan.enum";
import { TransactionStatus } from "../../enums/transactionStatus.enum";
import { TransactionType } from "../../enums/transactionType.enum";

export interface Transaction {
  id: string;
  transaction_id: string | null;
  client_transaction_id?: string | null;
  transaction_code: string;
  amount: number;
  currency: string;
  timestamp: string;
  status?: TransactionStatus | null;
  payment_type?: PaymentType | null;
  installments_count?: number | null;
  product_summary?: string | null;
  payouts_total?: number | null;
  payouts_received?: number | null;
  refunded_amount?: number | null,
  payout_plan?: PayoutPlan | null;
  user?: string | null;
  type?: TransactionType | null;
  card_type?: CardType | null;
}
