// sync.ts or sync-auto.ts
import dotenv from 'dotenv';
dotenv.config();

import { format } from 'date-fns';
import { syncSumUpPayoutsToEconomic } from './services/syncService';

(async () => {
  const today = format(new Date(), 'yyyy-MM-dd');

  await syncSumUpPayoutsToEconomic(today, today);
})();
