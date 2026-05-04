import { prisma } from "./db";
import type { NormalizedProduct, NormalizedPrice } from "./types";

const BATCH_SIZE = 500;

export async function upsertProducts(products: NormalizedProduct[]): Promise<void> {
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map((p) =>
        prisma.product.upsert({
          where: { id: p.id },
          create: p,
          update: {
            name: p.name,
            categoryId: p.categoryId,
            categoryName: p.categoryName,
            expansionId: p.expansionId,
            expansionName: p.expansionName,
            number: p.number,
            rarity: p.rarity,
            isFoil: p.isFoil,
            isAltered: p.isAltered,
            isSigned: p.isSigned,
            isFirstEd: p.isFirstEd,
            image: p.image,
          },
        })
      )
    );
    console.log(`Upserted products ${i + 1}–${Math.min(i + BATCH_SIZE, products.length)}`);
  }
}

export async function upsertPricesAndHistory(
  prices: Map<number, NormalizedPrice>
): Promise<void> {
  const entries = Array.from(prices.values());

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);

    const productIds = batch.map((p) => p.productId);
    const existing = await prisma.price.findMany({
      where: { productId: { in: productIds } },
      select: { productId: true, avg: true, low: true, trend: true },
    });

    const existingMap = new Map(existing.map((e) => [e.productId, e]));

    const historyInserts: {
      productId: number;
      avg: number | null;
      low: number | null;
      trend: number | null;
    }[] = [];

    await Promise.all(
      batch.map(async (price) => {
        const prev = existingMap.get(price.productId);
        const changed =
          !prev ||
          prev.avg !== price.avg ||
          prev.low !== price.low ||
          prev.trend !== price.trend;

        if (changed) {
          historyInserts.push({
            productId: price.productId,
            avg: price.avg,
            low: price.low,
            trend: price.trend,
          });
        }

        await prisma.price.upsert({
          where: { productId: price.productId },
          create: price,
          update: {
            avg: price.avg,
            low: price.low,
            trend: price.trend,
            avg1: price.avg1,
            avg7: price.avg7,
            avg30: price.avg30,
          },
        });
      })
    );

    if (historyInserts.length > 0) {
      await prisma.priceHistory.createMany({ data: historyInserts });
    }

    console.log(`Processed prices ${i + 1}–${Math.min(i + BATCH_SIZE, entries.length)}, history inserts: ${historyInserts.length}`);
  }
}
