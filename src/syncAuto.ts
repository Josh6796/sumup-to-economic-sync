import dotenv from 'dotenv';
dotenv.config();

import { subMonths, startOfMonth, endOfMonth, format, isSameDay } from 'date-fns';
import { syncSumUpPayoutsToEconomic } from './services/syncService';

(async () => {
  const today = new Date();
  const lastDay = endOfMonth(today);

  if (!isSameDay(today, lastDay)) {
    console.log('Not last day of month – skipping sync.');
    return;
  }

  const lastMonth = subMonths(today, 1);
  const start = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
  const end = format(endOfMonth(lastMonth), 'yyyy-MM-dd');

  await syncSumUpPayoutsToEconomic(start, end);
})();
