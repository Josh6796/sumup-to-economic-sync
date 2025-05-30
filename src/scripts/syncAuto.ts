import dotenv from 'dotenv';
dotenv.config();

import { subMonths, startOfMonth, endOfMonth, format, isSameDay } from 'date-fns';
import { SumUpClient, EconomicClient, SyncService } from '..';

(async () => {
  const today = new Date();
  const lastDay = endOfMonth(today);

  if (!isSameDay(today, lastDay)) {
    console.log('Not last day of month – skipping sync.');
    return;
  }

  const lastMonth = subMonths(today, 1);
  const startStr = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
  const endStr = format(endOfMonth(lastMonth), 'yyyy-MM-dd');

  const sumUpClient = new SumUpClient();
  const economicClient = new EconomicClient();
  const syncService = new SyncService(sumUpClient, economicClient);

  const startDate = new Date(startStr);
  const endDate = new Date(endStr);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error('Invalid start or end date');
  }

  await syncService.syncPayoutsToEconomic(startDate, endDate);
})();
