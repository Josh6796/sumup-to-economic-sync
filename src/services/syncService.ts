import { getPayouts, getSuccessfulCashTransactions, getTransactions } from '../clients/sumupClient';
import { postJournalEntry, postMonthlyCashRevenue, postRefundEntry } from '../clients/economicClient';
import { logInfo, logError } from '../utils/logger';
import { SumUpPayout } from '../types/sumUpPayout';
import { summarizeCashByMonth, transformPayoutsToSummaries } from '../utils/transform';
import { SumUpTransaction } from '../types/sumUpTransaction';

export async function syncSumUpPayoutsToEconomic(startDate: string, endDate: string): Promise<void> {
  try {
    logInfo('Starting sync from ' + startDate + ' to ' + endDate);

    const payouts: SumUpPayout[] = await getPayouts(startDate, endDate);
    logInfo(`Fetched ${payouts.length} payouts from SumUp`);

    const summaries = transformPayoutsToSummaries(payouts);

    for (const { date, gross, fee, refund } of Object.values(summaries)) {
      const net = +gross.toFixed(2);
      if (net > 0 || fee > 0) {
        await postJournalEntry(date, net, fee);
      }

      if (refund > 0) {
        await postRefundEntry(date, refund);
      }
    }

    logInfo('Sync completed successfully');
  } catch (error) {
    logError('Sync failed', error);
    throw error;
  }
}

export async function syncSumUpCashToEconomic(startDate: string, endDate: string): Promise<void> {
  try {
    logInfo('Starting sync from ' + startDate + ' to ' + endDate);

    const transactions: SumUpTransaction[] = await getTransactions(startDate, endDate);
    const cashTransactions: SumUpTransaction[] = await getSuccessfulCashTransactions(transactions);
    logInfo(`Fetched ${cashTransactions.length} cash transactions from SumUp`);

    const summaries = summarizeCashByMonth(cashTransactions);
    console.log(summarizeCashByMonth(cashTransactions));

    for (const [date, amount] of Object.entries(summaries)) {
      const net = +amount.toFixed(2);
      await postMonthlyCashRevenue(date, net);
    }

    logInfo('Sync completed successfully');
  } catch (error) {
    logError('Sync failed', error);
    throw error;
  }
}
