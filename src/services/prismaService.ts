import { PrismaClient } from '../generated/prisma';
import { SumUpClient } from '../clients/sumupClient';
import fs from 'fs';
import path from 'path';
import stringSimilarity from "string-similarity";
import { parse } from 'csv-parse';
import { logInfo, logError } from '../utils/logger';

export class PrismaService {

    private readonly filePath = path.join(__dirname, '../../data/2025-05-28_23-42-21_items-export_MYR4VHK4.csv');

    constructor(
        private readonly prismaClient: PrismaClient,
        private readonly sumUpClient: SumUpClient
    ) {
        if (!prismaClient) throw new Error('prismaClient is required');
        if (!sumUpClient) throw new Error('sumUpClient is required');
    }

    async importTransactions(startDate: Date, endDate: Date): Promise<void> {
        logInfo(`Starting importTransactions from ${startDate.toISOString()} to ${endDate.toISOString()}`);
        let count = 0;
        try {
            const transactions = await this.sumUpClient.getTransactions(startDate, endDate);
            logInfo(`Fetched ${transactions.length} transactions`);

            for (const tx of transactions) {
                try {
                    logInfo(`Processing transaction ${tx.id}`);
                    const td = await this.sumUpClient.getTransactionDetails(tx.id);

                    await this.prismaClient.transaction.upsert({
                        where: { id: tx.id },
                        update: {},
                        create: {
                            id: tx.id,
                            transactionCode: tx.transaction_code,
                            amount: tx.amount,
                            currency: tx.currency,
                            timestamp: tx.timestamp,
                            status: tx.status ?? undefined,
                            paymentType: tx.payment_type ?? undefined,
                            installmentsCount: tx.installments_count ?? undefined,
                            merchantCode: td.merchant_code ?? undefined,
                            vatAmount: td.vat_amount ?? undefined,
                            tipAmount: td.tip_amount ?? undefined,
                            entryMode: td.entry_mode ?? undefined,
                            authCode: td.auth_code ?? undefined,
                            internalId: td.internal_id ?? undefined,
                            productSummary: tx.product_summary ?? undefined,
                            payoutsTotal: tx.payouts_total ?? undefined,
                            payoutsReceived: tx.payouts_received ?? undefined,
                            payoutPlan: tx.payout_plan ?? undefined,
                            username: td.username ?? undefined,
                            lat: td.lat ?? undefined,
                            lon: td.lon ?? undefined,
                            horizontalAccuracy: td.horizontal_accuracy ?? undefined,
                            simplePaymentType: td.simple_payment_type ?? undefined,
                            verificationMethod: td.verification_method ?? undefined,
                            localTime: td.local_time ?? undefined,
                            payoutType: td.payout_type ?? undefined,
                            refundedAmount: tx.refunded_amount ?? undefined,
                            user: tx.user ?? undefined,
                            type: tx.type ?? undefined,
                            cardType: tx.card_type,
                            simpleStatus: td.simple_status ?? undefined,
                            taxEnabled: td.tax_enabled ?? undefined
                        },
                    });
                    logInfo(`Upserted transaction ${tx.id}`);

                    // TransactionProducts (immutable transaction line data)
                    if (td.products && Array.isArray(td.products)) {
                        for (const p of td.products) {
                            const productName = (p.name ?? '').trim();
                            const productVariant = (p.description ?? '').trim() || null;

                            // Try to match the product (optional, for enrichment)
                            let dbProduct = await this.prismaClient.product.findFirst({
                                where: {
                                    name: productName,
                                },
                            });

                            // Insert TransactionProduct row for statistics/historical reporting
                            await this.prismaClient.transactionProduct.create({
                                data: {
                                    transactionId: tx.id,
                                    productId: dbProduct?.id ?? null,
                                    productName: productName,
                                    productVariant: productVariant,
                                    quantity: typeof p.quantity === "number" ? p.quantity : 1,
                                    price: typeof p.price === "number" ? p.price : 0,
                                    priceWithVat: typeof p.price_with_vat === "number" ? p.price_with_vat : null,
                                    vatAmount: typeof p.vat_amount === "number" ? p.vat_amount : null,
                                    vatRate: typeof p.vat_rate === "number" ? p.vat_rate : null,
                                    totalPrice: typeof p.total_price === "number" ? p.total_price : null,
                                    totalWithVat: typeof p.total_with_vat === "number" ? p.total_with_vat : null,
                                }
                            });
                            logInfo(`Inserted TransactionProduct for transaction ${tx.id} product ${productName} (qty ${p.quantity})`);
                        }
                    }

                    // Products relation for enrichment (optional, legacy)
                    if (td.products && Array.isArray(td.products)) {

                        const allProducts = await this.prismaClient.product.findMany({ select: { id: true, name: true } });

                        for (const p of td.products) {
                            if (!p?.name) continue;
                            const candidateNames = allProducts.map(x => x.name);
                            const { bestMatch } = stringSimilarity.findBestMatch(p.name, candidateNames);
                            let dbProduct = null;
                            if (bestMatch.rating > 0.85) {
                                dbProduct = allProducts.find(x => x.name === bestMatch.target);
                            }
                            if (!dbProduct) {
                                logInfo(`Skipping Transaction.products relation: product ${p.name} not found in DB`);
                                continue;
                            }
                            await this.prismaClient.transaction.update({
                                where: { id: tx.id },
                                data: {
                                    products: { connect: { id: dbProduct.id } },
                                },
                            });
                            logInfo(`Linked product ${dbProduct.id} to transaction ${tx.id}`);
                        }
                    }

                    // VatRates
                    if (td.vat_rates && Array.isArray(td.vat_rates)) {
                        for (const vat of td.vat_rates) {
                            if (!vat) continue;
                            await this.prismaClient.vatRate.create({
                                data: {
                                    transactionId: tx.id,
                                    gross: vat.gross ?? undefined,
                                    net: vat.net ?? undefined,
                                    rate: vat.rate ?? undefined,
                                    vat: vat.vat ?? undefined,
                                },
                            });
                        }
                        logInfo(`Stored ${td.vat_rates.length} VAT rates for transaction ${tx.id}`);
                    }

                    // TransactionEvents
                    if (td.transaction_events && Array.isArray(td.transaction_events)) {
                        for (const event of td.transaction_events) {
                            await this.prismaClient.transactionEvent.create({
                                data: {
                                    transactionId: tx.id,
                                    sumupEventId: event.id ?? undefined,
                                    eventType: event.event_type ?? undefined,
                                    status: event.status ?? undefined,
                                    amount: event.amount ?? undefined,
                                    dueDate: event.due_date ?? undefined,
                                    date: event.date ?? undefined,
                                    installmentNumber: event.installment_number ?? undefined,
                                    timestamp: event.timestamp ?? undefined,
                                },
                            });
                        }
                        logInfo(`Stored ${td.transaction_events.length} transaction events for ${tx.id}`);
                    }

                    // Events
                    if (td.events && Array.isArray(td.events)) {
                        for (const event of td.events) {
                            await this.prismaClient.event.create({
                                data: {
                                    transactionId: tx.id,
                                    sumupEventId: event.id ?? undefined,
                                    transaction_id: event.transaction_id ?? undefined,
                                    type: event.type ?? undefined,
                                    status: event.status ?? undefined,
                                    amount: event.amount ?? undefined,
                                    timestamp: event.timestamp ?? undefined,
                                    feeAmount: event.fee_amount ?? undefined,
                                    installmentNumber: event.installment_number ?? undefined,
                                    deductedAmount: event.deducted_amount ?? undefined,
                                    deductedFeeAmount: event.deducted_fee_amount ?? undefined,
                                },
                            });
                        }
                        logInfo(`Stored ${td.events.length} events for ${tx.id}`);
                    }

                    count++;
                } catch (err) {
                    logError(`Failed to process transaction ${tx.id}`, err);
                }
            }
            logInfo(`importTransactions completed: ${count} transactions processed`);
        } catch (err) {
            logError('importTransactions encountered an error', err);
        }
    }

    async importProducts() {
        logInfo(`Starting importProducts from ${this.filePath}`);
        const parser = fs.createReadStream(this.filePath).pipe(parse({ columns: true, skip_empty_lines: true }));

        let lastProduct: { id: number } | null = null;
        let productCount = 0, variantCount = 0;

        try {
            for await (const record of parser) {
                const itemName = record['Item name']?.trim();
                const variationName = record['Variations']?.trim();
                const price = parseFloat(record['Price'] || '');
                const taxRate = parseFloat(record['Tax rate (%)'] || '');
                const category = record['Category']?.trim();
                const itemId = record['Item id (Do not change)']?.trim();
                const variantId = record['Variant id (Do not change)']?.trim();

                if (itemName && price) {
                    const product = await this.prismaClient.product.create({
                        data: {
                            name: itemName,
                            itemId,
                            price,
                            taxRate: isNaN(taxRate) ? null : taxRate,
                            category: category || null,
                        },
                    });
                    lastProduct = product;
                    productCount++;
                    logInfo(`Created product: ${itemName} (${product.id})`);
                } else if (itemName && !price) {
                    const product = await this.prismaClient.product.create({
                        data: {
                            name: itemName,
                            itemId,
                            price: null,
                            taxRate: isNaN(taxRate) ? null : taxRate,
                            category: category || null,
                        },
                    });
                    lastProduct = product;
                    productCount++;
                    logInfo(`Created parent product: ${itemName} (${product.id})`);
                } else if (!itemName && price && lastProduct) {
                    await this.prismaClient.productVariant.create({
                        data: {
                            name: variationName || 'Standard',
                            price,
                            variantId: variantId || null,
                            productId: lastProduct.id,
                        },
                    });
                    variantCount++;
                    logInfo(`Created variant: ${variationName || 'Unnamed'} (Product ${lastProduct.id})`);
                }
            }
            logInfo(`importProducts completed: ${productCount} products, ${variantCount} variants`);
            await this.prismaClient.$disconnect();
        } catch (err) {
            logError('importProducts encountered an error', err);
            await this.prismaClient.$disconnect();
        }
    }
}
