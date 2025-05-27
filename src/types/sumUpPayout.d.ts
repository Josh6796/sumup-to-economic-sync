// src/types/sumUpPayout.d.ts

export interface SumUpPayout {
    id: number;
    amount: number;
    fee: number;
    currency: string;
    date: string; // ISO 8601 format, e.g. "2025-01-31"
    reference: string;
    status: string;
    transaction_code: string;
    type: string; // "PAYOUT", "REFUND_DEDUCTION", etc.
}
