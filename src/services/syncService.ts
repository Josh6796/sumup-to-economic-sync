// src/services/SyncService.ts
import { transformPayoutsToSummaries, summarizeCashByMonth } from '../utils/transform';
import { logInfo, logError } from '../utils/logger';
import { groupBy } from 'lodash';
import { SumUpClient, EconomicClient } from '..';
import { Payout } from '../types/sumup/payout';
import { Transaction } from '../types/sumup/transaction';
import { ACCOUNTING } from '../config/accountingConfig';
import { TransactionStatus } from '../enums/transactionStatus.enum';
import { TransactionType } from '../enums/transactionType.enum';
import { PaymentType } from '../enums/paymentType.enum';
import { RevenueType } from '../enums/revenueType.enum';
import '../utils/dateExtensions';

export class SyncService {
  private readonly cashAccount: number;
  private readonly clearingAccount: number;

  constructor(
    private readonly sumUpClient: SumUpClient,
    private readonly economicClient: EconomicClient
  ) {
    if (!sumUpClient) throw new Error('sumUpClient is required');
    if (!economicClient) throw new Error('economicClient is required');

    this.cashAccount = ACCOUNTING.CASH;
    this.clearingAccount = ACCOUNTING.CLEARING;
  }

  async syncCashToEconomic(startDate: Date, endDate: Date): Promise<void> {
    try {
      logInfo(`Starting sync from ${startDate.toISODateString()} to ${endDate.toISODateString()}`);

      const transactions: Transaction[] = await this.sumUpClient.getTransactions(startDate, endDate);
      const cashTransactions = this.sumUpClient.getSuccessfulCashTransactions(transactions);
      logInfo(`Fetched ${cashTransactions.length} cash transactions from SumUp`);

      const summaries = summarizeCashByMonth(cashTransactions);

      for (const [date, amount] of Object.entries(summaries)) {
        const net = +amount.toFixed(2);
        await this.economicClient.postMonthlyCashRevenue(date, net);
      }

      logInfo('Sync completed successfully');
    } catch (error) {
      logError('Sync failed', error);
      throw error;
    }
  }

  async syncDailyPayoutsToEconomic(startDate: Date, endDate: Date): Promise<void> {

    try {
      logInfo(`Starting daily payout sync from ${startDate.toISODateString()} to ${endDate.toISODateString()}`);

      const payouts: Payout[] = await this.sumUpClient.getPayouts(startDate, endDate);
      logInfo(`Fetched ${payouts.length} payouts from SumUp`);

      const summaries = transformPayoutsToSummaries(payouts);

      for (const { date, gross, fee } of Object.values(summaries)) {
        const grossAmount = +gross.toFixed(2)
        const netAmount = +(grossAmount - fee).toFixed(2);

        if (gross > 0 || fee > 0) {
          await this.economicClient.postPayoutEntry(date, grossAmount, netAmount, fee);
        }
      }

      logInfo('Payout sync completed successfully');
    } catch (error) {
      logError('Payout sync failed', error);
      throw error;
    }
  }

  async syncDailyRevenueToEconomic(startDate: Date, endDate: Date): Promise<void> {
    try {
      logInfo(`Starting daily revenue sync from ${startDate.toISODateString()} to ${endDate.toISODateString()}`);

      const transactions: Transaction[] = await this.sumUpClient.getTransactions(startDate, endDate);
      const successful = transactions.filter(t => t.status === TransactionStatus.Successful && t.type === TransactionType.Payment);

      const grouped = groupBy(successful, t => t.timestamp.slice(0, 10));

      for (const [date, txs] of Object.entries(grouped)) {
        const cashTotal = txs
          .filter(t => t.payment_type === PaymentType.Cash)
          .reduce((acc, t) => acc + t.amount, 0);

        const sumUpTotal = txs
          .filter(t => t.payment_type !== PaymentType.Cash)
          .reduce((acc, t) => acc + t.amount, 0);

        if (cashTotal > 0) {
          await this.economicClient.postDailyRevenueEntry(date, +cashTotal.toFixed(2), this.cashAccount, RevenueType.Cash);
        }

        if (sumUpTotal > 0) {
          await this.economicClient.postDailyRevenueEntry(date, +sumUpTotal.toFixed(2), this.clearingAccount, RevenueType.SumUp);
        }
      }
      logInfo('Daily revenue sync completed');
    } catch (error) {
      logError('Daily revenue sync failed', error);
      throw error;
    }
  }

  async syncDailyRefundsToEconomic(startDate: Date, endDate: Date): Promise<void> {
    try {
      logInfo(`Starting daily refunds sync from ${startDate.toISODateString()} to ${endDate.toISODateString()}`);

      const transactions: Transaction[] = await this.sumUpClient.getTransactions(startDate, endDate);
      const successful = transactions.filter(t => t.type === TransactionType.Refund);

      const grouped = groupBy(successful, t => t.timestamp.slice(0, 10));

      for (const [date, txs] of Object.entries(grouped)) {

        const refundCashTotal = txs
          .filter(t => t.payment_type === PaymentType.Cash)
          .reduce((acc, t) => acc + t.amount, 0);

        const refundTotal = txs
          .filter(t => t.payment_type !== PaymentType.Cash)
          .reduce((acc, t) => acc + t.amount, 0);


        if (refundCashTotal > 0) {
          await this.economicClient.postDailyRefundEntry(date, +refundCashTotal.toFixed(2), this.cashAccount, RevenueType.Cash);
        }

        if (refundTotal > 0) {
          await this.economicClient.postDailyRefundEntry(date, +refundTotal.toFixed(2), this.clearingAccount, RevenueType.SumUp);
        }
      }
      logInfo('Daily refund sync completed');
    } catch (error) {
      logError('Daily refund sync failed', error);
      throw error;
    }
  }
}
