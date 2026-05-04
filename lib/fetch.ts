import type {
  RawPriceGuide,
  RawProductList,
  RawPriceGuideEntry,
  NormalizedProduct,
  NormalizedPrice,
} from "./types";

const PRICE_GUIDE_URL =
  "https://downloads.s3.cardmarket.com/productCatalog/priceGuide/price_guide_6.json";
const SINGLES_URL =
  "https://downloads.s3.cardmarket.com/productCatalog/productList/products_singles_6.json";
const NONSINGLES_URL =
  "https://downloads.s3.cardmarket.com/productCatalog/productList/products_nonsingles_6.json";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchAllData(): Promise<{
  products: NormalizedProduct[];
  prices: Map<number, NormalizedPrice>;
}> {
  const [priceGuideRaw, singlesRaw, nonsinglesRaw] = await Promise.all([
    fetchJson<RawPriceGuide>(PRICE_GUIDE_URL),
    fetchJson<RawProductList>(SINGLES_URL),
    fetchJson<RawProductList>(NONSINGLES_URL),
  ]);

  const priceMap = new Map<number, NormalizedPrice>();
  for (const entry of priceGuideRaw.priceGuides ?? []) {
    priceMap.set(entry.idProduct, normalizePrice(entry));
  }

  const merged = [
    ...(singlesRaw.products ?? []),
    ...(nonsinglesRaw.products ?? []),
  ];

  const seen = new Set<number>();
  const products: NormalizedProduct[] = [];
  for (const raw of merged) {
    if (!raw.idProduct || seen.has(raw.idProduct)) continue;
    seen.add(raw.idProduct);
    products.push({
      id: raw.idProduct,
      name: raw.name ?? "",
      categoryId: raw.idCategory ?? null,
      categoryName: raw.categoryName ?? null,
      expansionId: raw.idExpansion ?? null,
      expansionName: raw.expansionName ?? null,
      number: raw.number ?? null,
      rarity: raw.rarity ?? null,
      isFoil: raw.isFoil ?? null,
      isAltered: raw.isAltered ?? null,
      isSigned: raw.isSigned ?? null,
      isFirstEd: raw.isFirstEd ?? null,
      image: raw.image ?? null,
    });
  }

  return { products, prices: priceMap };
}

function normalizePrice(entry: RawPriceGuideEntry): NormalizedPrice {
  return {
    productId: entry.idProduct,
    avg: entry.avg ?? null,
    low: entry.low ?? null,
    trend: entry.trend ?? null,
    avg1: entry.avg1 ?? null,
    avg7: entry.avg7 ?? null,
    avg30: entry.avg30 ?? null,
  };
}
