import { PayoutSummary } from '../types/payoutSummary';
import { SumUpPayout } from '../types/sumUpPayout';

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
