import dotenv from 'dotenv';
dotenv.config();
import { SumUpClient, EconomicClient, SyncService } from '..';

(async () => {
  const today = new Date();

  const sumUpClient = new SumUpClient();
  const economicClient = new EconomicClient();
  const syncService = new SyncService(sumUpClient, economicClient);


  await syncService.syncDailyRevenueToEconomic(today, today);
  await syncService.syncDailyRefundsToEconomic(today, today);
  await syncService.syncDailyPayoutsToEconomic(today, today);
})();
