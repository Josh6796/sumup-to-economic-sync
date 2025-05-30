/*
  Warnings:

  - You are about to drop the column `displayColor` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `displayOnline` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `image1` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `image2` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `image3` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `image4` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `image5` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `image6` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `image7` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `isVisible` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `lowStockThreshold` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `onSale` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `seoDescription` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `seoTitle` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `shippingWeightKg` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `Product` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "itemId" TEXT NOT NULL,
    "variantId" TEXT,
    "name" TEXT NOT NULL,
    "price" REAL,
    "regularPrice" REAL,
    "taxRate" REAL,
    "sku" TEXT,
    "barcode" TEXT,
    "quantity" INTEGER,
    "category" TEXT,
    "description" TEXT
);
INSERT INTO "new_Product" ("barcode", "category", "description", "id", "itemId", "name", "price", "quantity", "regularPrice", "sku", "taxRate", "variantId") SELECT "barcode", "category", "description", "id", "itemId", "name", "price", "quantity", "regularPrice", "sku", "taxRate", "variantId" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_itemId_key" ON "Product"("itemId");
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
