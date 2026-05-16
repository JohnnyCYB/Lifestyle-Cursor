export type OffProduct = {
  code: string;
  product_name?: string;
  brands?: string;
  nutriments?: {
    'energy-kcal_100g'?: number;
    'proteins_100g'?: number;
    'carbohydrates_100g'?: number;
    'fat_100g'?: number;
  };
  serving_size?: string;
};

export type OffResponse = {
  status: number;
  product?: OffProduct;
};

export async function fetchOpenFoodFactsProduct(barcode: string): Promise<OffResponse> {
  const clean = barcode.replace(/\s/g, '');
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(clean)}.json`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'LifeRPG/1.0 (personal wellness; contact: local)',
    },
  });
  if (!res.ok) {
    return { status: res.status };
  }
  return (await res.json()) as OffResponse;
}
