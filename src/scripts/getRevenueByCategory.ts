// sync.ts or sync-auto.ts
import dotenv from 'dotenv';
import { getRevenueByCategory } from '../services/sumUpService';
import { logInfo } from '../utils/logger';
dotenv.config();


function parseDateArgs(): [string, string, string] {
    const [, , start, end, category] = process.argv;
    if (!start || !end) {
        throw new Error('Usage: ts-node src/sync.ts YYYY-MM-DD YYYY-MM-DD category');
    }
    return [start, end, category];
}

(async () => {
    const [start, end, category] = parseDateArgs();
    const revenue = await getRevenueByCategory(start, end, category)
    logInfo("Revenue: " + revenue + ' DKK')
})();
