export interface RawProduct {
  idProduct: number;
  name: string;
  idCategory?: number | null;
  categoryName?: string | null;
  idExpansion?: number | null;
  expansionName?: string | null;
  number?: string | null;
  rarity?: string | null;
  isFoil?: boolean | null;
  isAltered?: boolean | null;
  isSigned?: boolean | null;
  isFirstEd?: boolean | null;
  image?: string | null;
}

export interface RawPriceGuideEntry {
  idProduct: number;
  avg?: number | null;
  low?: number | null;
  trend?: number | null;
  avg1?: number | null;
  avg7?: number | null;
  avg30?: number | null;
}

export interface RawPriceGuide {
  priceGuide: RawPriceGuideEntry[];
}

export interface RawProductList {
  products: RawProduct[];
}

export interface NormalizedProduct {
  id: number;
  name: string;
  categoryId: number | null;
  categoryName: string | null;
  expansionId: number | null;
  expansionName: string | null;
  number: string | null;
  rarity: string | null;
  isFoil: boolean | null;
  isAltered: boolean | null;
  isSigned: boolean | null;
  isFirstEd: boolean | null;
  image: string | null;
}

export interface NormalizedPrice {
  productId: number;
  avg: number | null;
  low: number | null;
  trend: number | null;
  avg1: number | null;
  avg7: number | null;
  avg30: number | null;
}
