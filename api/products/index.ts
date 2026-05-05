import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../../lib/db";

function parseBoundedInt(value: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

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

  const rawLimit = req.query["limit"];
  const rawOffset = req.query["offset"];
  const limit = parseBoundedInt(Array.isArray(rawLimit) ? rawLimit[0] : rawLimit, 20, 1, 100);
  const offset = parseBoundedInt(Array.isArray(rawOffset) ? rawOffset[0] : rawOffset, 0, 0, 1000000);

  try {
    const products = await prisma.product.findMany({
      where: q
        ? {
            name: {
              contains: q,
              mode: "insensitive",
            },
          }
        : undefined,
      include: { price: true },
      take: limit,
      skip: offset,
      orderBy: { id: "asc" },
    });

    res.status(200).json({
      data: products,
      meta: {
        limit,
        offset,
        count: products.length,
        q,
      },
    });
  } catch (err) {
    console.error("Products list error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
}
