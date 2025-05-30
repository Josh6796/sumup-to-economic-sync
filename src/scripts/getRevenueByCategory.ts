import dotenv from 'dotenv';
dotenv.config();

import { SumUpClient, SumUpService } from '..';
import { logInfo } from '../utils/logger';


function parseDateArgs(): [string, string, string] {
    const [, , start, end, category] = process.argv;
    if (!start || !end) {
        throw new Error('Usage: ts-node src/sync.ts YYYY-MM-DD YYYY-MM-DD category');
    }
    return [start, end, category];
}

(async () => {
    const sumUpClient = new SumUpClient();
    const sumUpService = new SumUpService(sumUpClient);

    const [startStr, endStr, category] = parseDateArgs();

    const startDate = new Date(startStr);
    const endDate = new Date(endStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid start or end date');
    }
    const revenue = await sumUpService.getRevenueByCategory(startDate, endDate, category)
    logInfo("Revenue: " + revenue + ' DKK')
})();
