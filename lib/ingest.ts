import { prisma } from "./db";
import type { NormalizedProduct, NormalizedPrice } from "./types";

const BATCH_SIZE = 2000;

export async function upsertProducts(products: NormalizedProduct[]): Promise<void> {
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);

    const values = batch.map((p) => [
      p.id, p.name, p.categoryId, p.categoryName, p.expansionId,
      p.expansionName, p.number, p.rarity, p.isFoil, p.isAltered,
      p.isSigned, p.isFirstEd, p.image,
    ]);

    await prisma.$executeRawUnsafe(`
      INSERT INTO products (id, name, "categoryId", "categoryName", "expansionId",
        "expansionName", number, rarity, "isFoil", "isAltered", "isSigned", "isFirstEd",
        image, "createdAt", "updatedAt")
      VALUES ${values.map((_, i) => {
        const o = i * 13;
        return `($${o+1},$${o+2},$${o+3},$${o+4},$${o+5},$${o+6},$${o+7},$${o+8},$${o+9},$${o+10},$${o+11},$${o+12},$${o+13},NOW(),NOW())`;
      }).join(",")}
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        "categoryId" = EXCLUDED."categoryId",
        "categoryName" = EXCLUDED."categoryName",
        "expansionId" = EXCLUDED."expansionId",
        "expansionName" = EXCLUDED."expansionName",
        number = EXCLUDED.number,
        rarity = EXCLUDED.rarity,
        "isFoil" = EXCLUDED."isFoil",
        "isAltered" = EXCLUDED."isAltered",
        "isSigned" = EXCLUDED."isSigned",
        "isFirstEd" = EXCLUDED."isFirstEd",
        image = EXCLUDED.image,
        "updatedAt" = NOW()
    `, ...values.flat());

    console.log(`Upserted products ${i + 1}–${Math.min(i + BATCH_SIZE, products.length)}`);
  }
}

export async function upsertPricesAndHistory(
  prices: Map<number, NormalizedPrice>
): Promise<void> {
  const entries = Array.from(prices.values());

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);

    // Bulk upsert prices
    const priceValues = batch.map((p) => [
      p.productId, p.avg, p.low, p.trend, p.avg1, p.avg7, p.avg30,
    ]);

    // Insert history BEFORE upserting prices so IS DISTINCT FROM compares old values
    await prisma.$executeRawUnsafe(`
      INSERT INTO price_history ("productId", avg, low, trend, "recordedAt")
      SELECT n."productId", n.avg, n.low, n.trend, NOW()
      FROM (VALUES ${priceValues.map((_, i) => {
        const o = i * 7;
        return `($${o+1}::int,$${o+2}::float,$${o+3}::float,$${o+4}::float,$${o+5}::float,$${o+6}::float,$${o+7}::float)`;
      }).join(",")}) AS n("productId", avg, low, trend, avg1, avg7, avg30)
      LEFT JOIN prices p ON p."productId" = n."productId"
      WHERE NOT EXISTS (
        SELECT 1
        FROM price_history ph
        WHERE ph."productId" = n."productId"
          )
         OR p."productId" IS NULL
         OR p.avg IS DISTINCT FROM n.avg
         OR p.low IS DISTINCT FROM n.low
         OR p.trend IS DISTINCT FROM n.trend
    `, ...priceValues.flat());

    await prisma.$executeRawUnsafe(`
      INSERT INTO prices ("productId", avg, low, trend, avg1, avg7, avg30, "updatedAt")
      VALUES ${priceValues.map((_, i) => {
        const o = i * 7;
        return `($${o+1},$${o+2},$${o+3},$${o+4},$${o+5},$${o+6},$${o+7},NOW())`;
      }).join(",")}
      ON CONFLICT ("productId") DO UPDATE SET
        avg = EXCLUDED.avg,
        low = EXCLUDED.low,
        trend = EXCLUDED.trend,
        avg1 = EXCLUDED.avg1,
        avg7 = EXCLUDED.avg7,
        avg30 = EXCLUDED.avg30,
        "updatedAt" = NOW()
    `, ...priceValues.flat());

    console.log(`Processed prices ${i + 1}–${Math.min(i + BATCH_SIZE, entries.length)}`);
  }
}