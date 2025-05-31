import dotenv from 'dotenv';
dotenv.config();

import { SumUpClient, PrismaService } from '..';
import { PrismaClient } from '../generated/prisma';

(async () => {

    const prismaClient = new PrismaClient();
    const sumUpClient = new SumUpClient();
    const prismaService = new PrismaService(prismaClient, sumUpClient);


    await prismaService.importProducts();
})();
