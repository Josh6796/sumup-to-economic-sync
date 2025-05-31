import dotenv from 'dotenv';
dotenv.config();

import { SyncService, SumUpClient, EconomicClient, PrismaService } from '..';
import { PrismaClient } from '../generated/prisma';

function parseDateArgs(): [string, string] {
    const [, , start, end] = process.argv;
    if (!start || !end) {
        throw new Error('Usage: tsx src/scripts/importTransactions.ts. YYYY-MM-DD YYYY-MM-DD');
    }
    return [start, end];
}

(async () => {
    const [startStr, endStr] = parseDateArgs();

    const prismaClient = new PrismaClient();
    const sumUpClient = new SumUpClient();
    const prismaService = new PrismaService(prismaClient, sumUpClient);

    const startDate = new Date(startStr);
    const endDate = new Date(endStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid start or end date');
    }

    //await prismaService.importProducts();
    await prismaService.importTransactions(startDate, endDate);
})();
