-- CreateTable
CREATE TABLE "products" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER,
    "categoryName" TEXT,
    "expansionId" INTEGER,
    "expansionName" TEXT,
    "number" TEXT,
    "rarity" TEXT,
    "isFoil" BOOLEAN,
    "isAltered" BOOLEAN,
    "isSigned" BOOLEAN,
    "isFirstEd" BOOLEAN,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prices" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "avg" DOUBLE PRECISION,
    "low" DOUBLE PRECISION,
    "trend" DOUBLE PRECISION,
    "avg1" DOUBLE PRECISION,
    "avg7" DOUBLE PRECISION,
    "avg30" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_history" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "avg" DOUBLE PRECISION,
    "low" DOUBLE PRECISION,
    "trend" DOUBLE PRECISION,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prices_productId_key" ON "prices"("productId");

-- CreateIndex
CREATE INDEX "prices_productId_idx" ON "prices"("productId");

-- CreateIndex
CREATE INDEX "price_history_productId_idx" ON "price_history"("productId");

-- AddForeignKey
ALTER TABLE "prices" ADD CONSTRAINT "prices_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
