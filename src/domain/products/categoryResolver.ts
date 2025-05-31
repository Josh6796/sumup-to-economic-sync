import { PrismaClient } from "../../generated/prisma";
import { logInfo } from "../../utils/logger";

const db = new PrismaClient();

export async function resolveCategoryFromTransactionProductByCategory(input: {
    name: string;
    description?: string;
    price_with_vat: number;
    category: string;
}): Promise<string> {

    const variant = await db.productVariant.findFirst({
        where: {
            name: input.description?.trim(),
            price: input.price_with_vat,
            product: {
                name: input.name,
                category: input.category
            },
        },
        select: {
            product: {
                select: { category: true },
            },
        },
    });
    if (variant?.product?.category) return variant.product.category;

    const baseProduct = await db.product.findFirst({
        where: {
            name: input.name,
            price: input.price_with_vat,
            category: input.category
        },
        select: { category: true },
    });

    if (baseProduct?.category) return baseProduct.category;

    return 'unknown';
}

export async function resolveCategoryFromTransactionProduct(name: string, price_with_vat: number, description?: string): Promise<string> {

    const variant = await db.productVariant.findFirst({
        where: {
            name: description?.trim(),
            price: price_with_vat,
            product: {
                name: name,
            },
        },
        select: {
            product: {
                select: { category: true },
            },
        },
    });
    if (variant?.product?.category) return variant.product.category;

    const baseProduct = await db.product.findFirst({
        where: {
            name: name,
            price: price_with_vat
        },
        select: { category: true },
    });

    if (baseProduct?.category) return baseProduct.category;

    return 'unknown';
}
