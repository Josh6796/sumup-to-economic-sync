import { getTransactions, getTransactionDetails } from "../clients/sumupClient";
import { resolveCategoryFromTransactionProduct } from "../domain/products/categoryResolver";
import { SumUpTransaction } from "../types/sumUpTransaction";
import { SumUpTransactionDetails } from './../types/sumUpTransactionDetails';
import { logInfo, logError } from "../utils/logger";
import cliProgress from 'cli-progress';

export async function getRevenueByCategory(startDate: string, endDate: string, category: string): Promise<string> {
    try {
        logInfo('Fetching revenue for ' + startDate + ' to ' + endDate + ' by category ' + category);

        const transactions: SumUpTransaction[] = (await getTransactions(startDate, endDate)).filter(t => t.status === 'SUCCESSFUL');
        let revenue = 0;

        const bar = new cliProgress.SingleBar({
            format: `Processing Transactions | {bar} | {percentage}% | {value}/{total} transactions`
        }, cliProgress.Presets.shades_classic);
        bar.start(transactions.length, 0);

        const uniqueTransactions = new Set<string>();

        for (const transaction of transactions) {
            const transactionDetails: SumUpTransactionDetails = await getTransactionDetails(transaction);
            if (transactionDetails.products) {
                for (const product of transactionDetails.products) {
                    const resolvedCategory = await resolveCategoryFromTransactionProduct({
                        name: product.name,
                        description: product.description,
                        price_with_vat: product.price_with_vat,
                        category: category
                    });

                    if (resolvedCategory === category) {
                        revenue += product.total_with_vat;
                        uniqueTransactions.add(transaction.id);
                    }
                }
            }
            bar.increment();
        }

        logInfo("Unique transactions: " + uniqueTransactions.size);

        bar.stop();
        return revenue.toFixed(2);
    } catch (error) {
        logError('failed', error);
        throw error;
    }
}
