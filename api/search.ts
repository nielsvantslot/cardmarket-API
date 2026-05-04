import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../lib/db";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const rawQ = req.query["q"];
  const q = (Array.isArray(rawQ) ? rawQ[0] : rawQ ?? "").trim();

  if (!q) {
    res.status(400).json({ error: "Missing query parameter: q" });
    return;
  }

  try {
    const results = await prisma.product.findMany({
      where: {
        name: {
          contains: q,
          mode: "insensitive",
        },
      },
      include: { price: true },
      take: 20,
    });

    res.status(200).json(results);
  } catch (err) {
    console.error("Search error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
}
