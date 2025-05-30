export const ACCOUNTING = {
    BANK: Number(process.env.ECONOMIC_ACCOUNT_BANK!),
    CASH: Number(process.env.ECONOMIC_ACCOUNT_CASH_REGISTER!),
    REVENUE: Number(process.env.ECONOMIC_ACCOUNT_REVENUE!),
    FEES: Number(process.env.ECONOMIC_ACCOUNT_SUMUP_FEES!),
    CLEARING: Number(process.env.ECONOMIC_ACCOUNT_SUMUP_CLEARING!),
    JOURNAL_ID: Number(process.env.ECONOMIC_JOURNAL_ID_DAILY_2025!),
    VAT_OUT: process.env.ECONOMIC_VAT_CODE_OUTGOING!
};
