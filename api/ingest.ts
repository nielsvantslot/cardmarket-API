import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchAllData } from "../lib/fetch";
import { upsertProducts, upsertPricesAndHistory } from "../lib/ingest";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== "GET" && req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    console.log("Ingest started");
    const start = Date.now();

    const { products, prices } = await fetchAllData();
    console.log(`Fetched ${products.length} products, ${prices.size} price entries`);

    await upsertProducts(products);
    await upsertPricesAndHistory(prices);

    const elapsed = Date.now() - start;
    console.log(`Ingest completed in ${elapsed}ms`);

    res.status(200).json({
      ok: true,
      products: products.length,
      prices: prices.size,
      elapsedMs: elapsed,
    });
  } catch (err) {
    console.error("Ingest error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
}
