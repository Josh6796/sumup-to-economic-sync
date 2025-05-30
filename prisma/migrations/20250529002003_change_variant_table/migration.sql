/*
  Warnings:

  - You are about to drop the `Variant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Variant";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "variantId" TEXT,
    "name" TEXT NOT NULL,
    "price" REAL,
    "productId" INTEGER NOT NULL,
    CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_variantId_key" ON "ProductVariant"("variantId");
