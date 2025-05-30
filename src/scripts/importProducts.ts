import { PrismaClient } from '../generated/prisma';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';

const prisma = new PrismaClient();

const filePath = path.join(__dirname, '../../data/2025-05-28_23-42-21_items-export_MYR4VHK4.csv');

async function importProducts() {
    const parser = fs.createReadStream(filePath).pipe(parse({ columns: true, skip_empty_lines: true }));

    let lastProduct: { id: number } | null = null;

    for await (const record of parser) {
        const itemName = record['Item name']?.trim();
        const variationName = record['Variations']?.trim();
        const price = parseFloat(record['Price'] || '');
        const taxRate = parseFloat(record['Tax rate (%)'] || '');
        const category = record['Category']?.trim();
        const itemId = record['Item id (Do not change)']?.trim();
        const variantId = record['Variant id (Do not change)']?.trim();

        // New standalone product
        if (itemName && price) {
            const product = await prisma.product.create({
                data: {
                    name: itemName,
                    itemId,
                    price,
                    taxRate: isNaN(taxRate) ? null : taxRate,
                    category: category || null,
                },
            });
            lastProduct = product;
        }

        // New parent product (has variants)
        else if (itemName && !price) {
            const product = await prisma.product.create({
                data: {
                    name: itemName,
                    itemId,
                    price: null,
                    taxRate: isNaN(taxRate) ? null : taxRate,
                    category: category || null,
                },
            });
            lastProduct = product;
        }

        // Variant row
        else if (!itemName && price && lastProduct) {
            await prisma.productVariant.create({
                data: {
                    name: variationName || 'Unnamed',
                    price,
                    variantId: variantId || null,
                    productId: lastProduct.id,
                },
            });
        }
    }

    console.log('Import completed');
    await prisma.$disconnect();
}

importProducts().catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
});
