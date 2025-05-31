import dotenv from 'dotenv';
dotenv.config();

import { SyncService, SumUpClient, EconomicClient } from '..';

function parseDateArgs(): [string, string] {
  const [, , start, end] = process.argv;
  if (!start || !end) {
    throw new Error('Usage: tsx src/scripts/syncPayouts.ts YYYY-MM-DD YYYY-MM-DD');
  }
  return [start, end];
}

(async () => {
  const [startStr, endStr] = parseDateArgs();

  const sumUpClient = new SumUpClient();
  const economicClient = new EconomicClient();
  const syncService = new SyncService(sumUpClient, economicClient);

  const startDate = new Date(startStr);
  const endDate = new Date(endStr);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error('Invalid start or end date');
  }
})();
