-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "itemId" TEXT NOT NULL,
    "variantId" TEXT,
    "name" TEXT NOT NULL,
    "price" REAL,
    "taxRate" REAL,
    "unit" TEXT,
    "sku" TEXT,
    "barcode" TEXT,
    "quantity" INTEGER,
    "lowStockThreshold" INTEGER,
    "description" TEXT,
    "category" TEXT,
    "displayColor" TEXT,
    "image1" TEXT,
    "image2" TEXT,
    "image3" TEXT,
    "image4" TEXT,
    "image5" TEXT,
    "image6" TEXT,
    "image7" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "onSale" BOOLEAN NOT NULL DEFAULT false,
    "regularPrice" REAL,
    "displayOnline" BOOLEAN NOT NULL DEFAULT true,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "shippingWeightKg" REAL
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_itemId_key" ON "Product"("itemId");
