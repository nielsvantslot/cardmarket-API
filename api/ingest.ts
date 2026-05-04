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
    const start = Date.now();
    console.log("Ingest started");

    const { products, prices } = await fetchAllData();
    console.log(`Fetched ${products.length} products, ${prices.size} price entries`);

    // Respond immediately — writes continue in background
    res.status(200).json({
      ok: true,
      products: products.length,
      prices: prices.size,
      fetchMs: Date.now() - start,
    });

    // Run products + prices in parallel, don't block the response
    await Promise.all([
      upsertProducts(products),
      upsertPricesAndHistory(prices),
    ]);

    console.log(`Ingest complete in ${Date.now() - start}ms`);
  } catch (err) {
    console.error("Ingest error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    // Only reachable if fetchAllData throws (res not sent yet)
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
}