import { parseISO, format } from 'date-fns';
import { PayoutSummary } from '../types/payoutSummary';
import { SumUpPayout } from '../types/sumUpPayout';
import { SumUpTransaction } from '../types/sumUpTransaction';

/**
 * Transforms SumUp payouts into daily payout summaries.
 */
export function transformPayoutsToSummaries(
  payouts: SumUpPayout[]
): Record<string, PayoutSummary> {
  const summaries: Record<string, PayoutSummary> = {};

  for (const p of payouts) {
    if (p.status !== 'SUCCESSFUL') continue;

    const key = p.date;

    if (!summaries[key]) {
      summaries[key] = {
        date: p.date,
        gross: 0,
        fee: 0,
        refund: 0
      };
    }

    if (p.type === 'PAYOUT') {
      summaries[key].gross += +(p.amount + p.fee);
      summaries[key].fee += +p.fee;
    }

    if (p.type === 'REFUND_DEDUCTION') {
      summaries[key].refund += +p.amount;
    }
  }

  for (const summary of Object.values(summaries)) {
    summary.gross = +summary.gross.toFixed(2);
    summary.fee = +summary.fee.toFixed(2);
    summary.refund = +summary.refund.toFixed(2);
  }

  return summaries;
}

/**
 * Groups successful CASH transactions by month and returns a summary.
 */
export function summarizeCashByMonth(
  transactions: SumUpTransaction[]
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const tx of transactions) {
    if (tx.status !== 'SUCCESSFUL' || tx.payment_type !== 'CASH') continue;

    const date = parseISO(tx.timestamp);
    const monthKey = format(date, 'yyyy-MM');
    result[monthKey] = (result[monthKey] || 0) + tx.amount;
  }

  return result;
}
