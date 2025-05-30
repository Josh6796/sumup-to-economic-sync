import { Transaction } from '../types/sumup/transaction';
import { TransactionDetails } from '../types/sumup/transactionDetails';
import { resolveCategoryFromTransactionProduct } from '../domain/products/categoryResolver';
import cliProgress from 'cli-progress';
import { logInfo, logError } from '../utils/logger';
import { SumUpClient } from '../index';
import { TransactionStatus } from '../enums/transactionStatus.enum';


export class SumUpService {
    constructor(private readonly sumUpClient: SumUpClient) {
        if (!sumUpClient) throw new Error('sumUpClient is required');
    }

    async getRevenueByCategory(startDate: Date, endDate: Date, category: string): Promise<string> {
        try {
            logInfo(`Fetching revenue for ${startDate.toISODateString()} to ${endDate.toISODateString()} by category ${category}`);

            const transactions: Transaction[] = (await this.sumUpClient.getTransactions(startDate, endDate))
                .filter(t => t.status === TransactionStatus.Successful);

            let revenue = 0;
            const uniqueTransactions = new Set<string>();

            const bar = new cliProgress.SingleBar({
                format: `Processing Transactions | {bar} | {percentage}% | {value}/{total} transactions`
            }, cliProgress.Presets.shades_classic);
            bar.start(transactions.length, 0);

            for (const transaction of transactions) {
                const transactionDetails: TransactionDetails =
                    await this.sumUpClient.getTransactionDetails(transaction.transaction_id ?? transaction.id);

                if (transactionDetails.products) {
                    for (const product of transactionDetails.products) {
                        const resolvedCategory = await resolveCategoryFromTransactionProduct({
                            name: product.name,
                            description: product.description,
                            price_with_vat: product.price_with_vat,
                            category
                        });

                        if (resolvedCategory === category) {
                            revenue += product.total_with_vat;
                            uniqueTransactions.add(transaction.id);
                        }
                    }
                }

                bar.increment();
            }

            bar.stop();
            logInfo(`Unique transactions: ${uniqueTransactions.size}`);
            return revenue.toFixed(2);
        } catch (error) {
            logError('Failed to calculate revenue by category', error);
            throw error;
        }
    }
}
