/*
  Warnings:

  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `taxRate` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `variantId` on the `Product` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Variant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "variantId" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "price" REAL,
    "taxRate" REAL,
    CONSTRAINT "Variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "itemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT
);
INSERT INTO "new_Product" ("category", "id", "itemId", "name") SELECT "category", "id", "itemId", "name" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_itemId_key" ON "Product"("itemId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Variant_variantId_key" ON "Variant"("variantId");
