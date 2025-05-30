// src/types/sumUpPayout.d.ts

import { PayoutType } from "../../enums/payoutType.enum";
import { TransactionStatus } from "../../enums/transactionStatus.enum";

export interface Payout {
    id: number;
    amount: number;
    fee: number;
    currency: string;
    date: string;
    reference: string;
    status: TransactionStatus;
    transaction_code: string;
    type: PayoutType;
}
