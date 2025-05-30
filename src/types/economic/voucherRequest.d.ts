export interface VoucherRequest {
    accountingYear: {
        year: string;
        self?: string; // optional, not required in your payload
    };
    journal: {
        journalNumber: number;
        self: string;
    };
    entries: {
        financeVouchers: FinanceVoucherEntry[];
    };
}

export interface FinanceVoucherEntry {
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
    currency: {
        code: string;
        self: string;
    };
}
