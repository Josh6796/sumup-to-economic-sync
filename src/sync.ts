// sync.ts or sync-auto.ts
import dotenv from 'dotenv';
dotenv.config();

import { syncSumUpPayoutsToEconomic } from "./services/syncService";

function parseDateArgs(): [string, string] {
  const [, , start, end] = process.argv;
  if (!start || !end) {
    throw new Error('Usage: ts-node src/sync.ts YYYY-MM-DD YYYY-MM-DD');
  }
  return [start, end];
}

(async () => {
  const [start, end] = parseDateArgs();
  await syncSumUpPayoutsToEconomic(start, end);
})();
