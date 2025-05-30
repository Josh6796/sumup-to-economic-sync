import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
