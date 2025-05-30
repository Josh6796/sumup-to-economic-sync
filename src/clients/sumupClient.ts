import axios from 'axios';
import { Transaction } from '../types/sumup/transaction';
import { TransactionDetails } from '../types/sumup/transactionDetails';
import { Payout } from '../types/sumup/payout';
import { logInfo, logError } from '../utils/logger';
import { SUMUP } from '../config/credentials';
import { TransactionStatus } from '../enums/transactionStatus.enum';
import { PaymentType } from '../enums/paymentType.enum';
import { TransactionType } from '../enums/transactionType.enum';
import { TransactionHistoryLink, TransactionHistoryResponse } from '../types/sumup/transactionHistoryResponse';
import { MemoryCache } from '../utils/cache';

export class SumUpClient {

  private readonly baseUrl = 'https://api.sumup.com';
  private readonly apiKey: string;
  private readonly merchantCode: string;
  private readonly transactionPath: string;
  private readonly payoutPath: string;
  private readonly transactionsCache: MemoryCache<Transaction[]>;
  private readonly payoutsCache: MemoryCache<Payout[]>;

  constructor() {
    this.apiKey = SUMUP.API_KEY;
    this.merchantCode = SUMUP.MERCHANT_CODE;

    if (!this.apiKey || !this.merchantCode) {
      throw new Error('Missing SUMUP_API_KEY or SUMUP_MERCHANT_CODE');
    }

    this.transactionPath = `/v2.1/merchants/${this.merchantCode}/transactions`;
    this.payoutPath = `/v1.0/merchants/${this.merchantCode}/payouts`;

    this.transactionsCache = new MemoryCache<Transaction[]>();
    this.payoutsCache = new MemoryCache<Payout[]>();
  }

  async getTransactions(start: Date, end: Date): Promise<Transaction[]> {
    const allItems: Transaction[] = [];
    const key = `${start.toISOString()}_${end.toISOString()}`;

    if (this.transactionsCache.has(key)) {
      return this.transactionsCache.get(key)!;
    }

    let url = `${this.baseUrl}${this.transactionPath}/history?oldest_time=${start.toISODateString()}&newest_time=${end.toISODateString()}&limit=1000`;

    let page = 1;
    try {
      while (true) {
        logInfo(`Fetching page ${page} of transactions...`);

        const res = await axios.get<TransactionHistoryResponse>(url, {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        });

        const items = res.data.items || [];
        if (items.length === 0) break;

        allItems.push(...items);

        const nextLink = res.data.links?.find((l: TransactionHistoryLink) => l.rel === 'next');
        if (!nextLink?.href) break;

        url = nextLink.href.startsWith('http')
          ? nextLink.href
          : `${this.baseUrl}${this.transactionPath}/history?${nextLink.href}`;

        page++;
      }

      this.transactionsCache.set(key, allItems);
      return allItems;
    } catch (error) {
      logError('Failed to fetch transactions', error);
      throw error;
    }
  }

  async getTransactionDetails(id: string): Promise<TransactionDetails> {
    const url = `${this.baseUrl}${this.transactionPath}?id=${id}`;
    try {
      const res = await axios.get<TransactionDetails>(url, {
        headers: { Authorization: `Bearer ${this.apiKey}` }
      });
      return res.data;
    } catch (error) {
      logError(`Failed to fetch details for ID ${id}`, error);
      throw error;
    }
  }

  async getPayouts(start: Date, end: Date): Promise<Payout[]> {

    const key = `${start.toISOString()}_${end.toISOString()}`;

    if (this.payoutsCache.has(key)) {
      return this.payoutsCache.get(key)!;
    }

    try {
      const res = await axios.get<Payout[]>(`${this.baseUrl}${this.payoutPath}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
        params: { start_date: start.toISODateString(), end_date: end.toISODateString() }
      });

      this.payoutsCache.set(key, res.data);
      return res.data;
    } catch (error) {
      logError('Failed to fetch payouts', error);
      throw error;
    }
  }

  getSuccessfulCashTransactions(transactions: Transaction[]): Transaction[] {
    return transactions.filter(
      t =>
        t.status === TransactionStatus.Successful &&
        t.payment_type === PaymentType.Cash &&
        t.type === TransactionType.Payment
    );
  }
}
