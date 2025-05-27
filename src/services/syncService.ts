import { getPayouts } from '../clients/sumupClient';
import { postJournalEntry, postRefundEntry } from '../clients/economicClient';
import { logInfo, logError } from '../utils/logger';
import { SumUpPayout } from '../types/sumupPayout';
import { transformPayoutsToSummaries } from '../utils/transform';

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
