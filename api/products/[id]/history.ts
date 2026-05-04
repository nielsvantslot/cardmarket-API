import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../../../lib/db";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const rawId = req.query["id"];
  const id = parseInt(Array.isArray(rawId) ? rawId[0] : rawId ?? "", 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  try {
    const history = await prisma.priceHistory.findMany({
      where: { productId: id },
      orderBy: { recordedAt: "desc" },
      take: 100,
    });

    res.status(200).json(history);
  } catch (err) {
    console.error("History lookup error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
}
