export interface VoucherResponse {
    voucherNumber: number;
    self: string;
    attachment?: string;
    accountingYear: {
        year: string;
        self: string;
    };
    journal: {
        journalNumber: number;
        self: string;
    };
    entries: {
        financeVouchers: FinanceVoucherResponseEntry[];
    };
}

export interface FinanceVoucherResponseEntry {
    date: string;
    amount: number;
    text: string;
    account: {
        accountNumber: number;
        self: string;
    };
    contraAccount?: {
        accountNumber: number;
        self: string;
    };
    vatAccount?: {
        vatCode: string;
        self: string;
    };
    journalEntryNumber: number;
    voucher: {
        voucherNumber: number;
        self: string;
        attachment?: string;
        accountingYear: {
            year: string;
            self: string;
        };
    };
    currency: {
        code: string;
        self: string;
    };
    self: string;
}

export type EconomicVoucherResponseArray = VoucherResponse[];
