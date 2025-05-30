import axios from 'axios';
import { logInfo, logError } from '../utils/logger';
import { ACCOUNTING } from '../config/accountingConfig';
import { ECONOMIC } from '../config/credentials';
import { EconomicVoucherResponseArray } from '../types/economic/voucherResponse';
import { VoucherRequest, FinanceVoucherEntry } from '../types/economic/voucherRequest';
import { RevenueType } from '../enums/revenueType.enum';

export class EconomicClient {
  private readonly baseURL = 'https://restapi.e-conomic.com';
  private readonly headers = {
    'X-AppSecretToken': ECONOMIC.APP_SECRET,
    'X-AgreementGrantToken': ECONOMIC.GRANT_TOKEN,
    'Content-Type': 'application/json'
  };

  private readonly revenueAccount: number;
  private readonly bankAccount: number;
  private readonly cashAccount: number;
  private readonly feesAccount: number;
  private readonly journalId: number;
  private readonly vatAccountOut: string;
  private readonly clearingAccount: number;

  constructor() {
    this.revenueAccount = ACCOUNTING.REVENUE;
    this.bankAccount = ACCOUNTING.BANK;
    this.cashAccount = ACCOUNTING.CASH;
    this.feesAccount = ACCOUNTING.FEES;
    this.journalId = ACCOUNTING.JOURNAL_ID;
    this.vatAccountOut = ACCOUNTING.VAT_OUT;
    this.clearingAccount = ACCOUNTING.CLEARING;
  }

  async postPayoutEntry(date: string, clearingAmount: number, netAmount: number, feeAmount: number) {

    const text = `Daily payout for ${date}`;

    const entries: FinanceVoucherEntry[] = [
      {
        date,
        amount: -clearingAmount,
        text: `${text} (clearing)`,
        account: this.buildAccountRef(this.clearingAccount),
        currency: this.buildCurrencyRef()
      },
      {
        date,
        amount: feeAmount,
        text: `${text} (fee)`,
        account: this.buildAccountRef(this.feesAccount),
        currency: this.buildCurrencyRef()
      },
      {
        date,
        amount: netAmount,
        text: `${text} (net)`,
        account: this.buildAccountRef(this.bankAccount),
        currency: this.buildCurrencyRef()
      }
    ];

    const payload = this.buildVoucherPayload(date, entries);
    return this.postVoucher(payload, `3-line journal voucher for ${date}`)
  }

  async postMonthlyCashRevenue(month: string, amount: number) {

    const date = `${month}-01`;
    const entries: FinanceVoucherEntry[] = [
      {
        date,
        amount: -amount,
        text: `Monthly cash sales for ${month}`,
        account: this.buildAccountRef(this.revenueAccount),
        contraAccount: this.buildAccountRef(this.cashAccount),
        vatAccount: this.buildVatAccountRef(this.vatAccountOut),
        currency: this.buildCurrencyRef()
      }
    ];

    const payload = this.buildVoucherPayload(date, entries);
    return this.postVoucher(payload, `cash revenue for ${month}: ${amount} DKK`)
  }

  async postDailyRevenueEntry(date: string, grossAmount: number, contraAccount: number, revenueType: RevenueType) {
    const text = `Daily ${revenueType}-revenue for ${date}`;

    const entries: FinanceVoucherEntry[] = [
      {
        date,
        amount: -grossAmount,
        text: text,
        account: this.buildAccountRef(this.revenueAccount),
        contraAccount: this.buildAccountRef(contraAccount),
        vatAccount: this.buildVatAccountRef(this.vatAccountOut),
        currency: this.buildCurrencyRef()
      }
    ];

    const payload = this.buildVoucherPayload(date, entries);
    return this.postVoucher(payload, `daily revenue for ${date}: ${grossAmount} DKK`);
  }

  async postDailyRefundEntry(date: string, refundAmount: number, contraAccount: number, revenueType: RevenueType) {

    const text = `Daily ${revenueType}-refunds for ${date}`;
    const entries: FinanceVoucherEntry[] = [

      {
        date,
        amount: refundAmount,
        text,
        account: this.buildAccountRef(this.revenueAccount),
        contraAccount: this.buildAccountRef(contraAccount),
        vatAccount: this.buildVatAccountRef(this.vatAccountOut),
        currency: this.buildCurrencyRef()
      }
    ];

    const payload = this.buildVoucherPayload(date, entries);
    return this.postVoucher(payload, `refund journal entry for ${date}`)
  }

  // Private Functions

  private async postVoucher(payload: VoucherRequest, label: string): Promise<EconomicVoucherResponseArray> {
    try {
      const res = await axios.post<EconomicVoucherResponseArray>(
        `${this.baseURL}/journals/${this.journalId}/vouchers`,
        payload,
        { headers: this.headers }
      );
      logInfo(`Posted ${label}`);
      return res.data;
    } catch (error) {
      logError(`Failed to post ${label}`, error);
      throw error;
    }
  }

  private buildVoucherPayload(date: string, entries: FinanceVoucherEntry[]): VoucherRequest {
    return {
      accountingYear: { year: date.slice(0, 4) },
      journal: {
        journalNumber: this.journalId,
        self: `${this.baseURL}/journals/${this.journalId}`
      },
      entries: {
        financeVouchers: entries
      }
    };
  }

  private buildAccountRef(accountNumber: number) {
    return { accountNumber, self: `${this.baseURL}/accounts/${accountNumber}` };
  }

  private buildVatAccountRef(vatCode: string) {
    return { vatCode, self: `${this.baseURL}/vat-accounts/${vatCode}` };
  }

  private buildCurrencyRef() {
    return { code: 'DKK', self: `${this.baseURL}/currencies/DKK` };
  }
}
