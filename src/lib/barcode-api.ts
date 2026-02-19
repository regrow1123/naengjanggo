// Open Food Facts API로 바코드 제품 정보 조회

export interface ProductInfo {
  name: string;
  brand?: string;
  category?: string;
  image?: string;
  quantity?: string; // "1L", "500g" 등
  barcode: string;
}

export async function lookupBarcode(barcode: string): Promise<ProductInfo | null> {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
    const data = await res.json();

    if (data.status !== 1 || !data.product) {
      return null;
    }

    const p = data.product;
    return {
      name: p.product_name_ko || p.product_name || p.generic_name || '알 수 없는 제품',
      brand: p.brands || undefined,
      category: mapCategory(p.categories_tags || []),
      image: p.image_front_small_url || p.image_url || undefined,
      quantity: p.quantity || undefined,
      barcode,
    };
  } catch {
    return null;
  }
}

// Open Food Facts 카테고리 → 우리 앱 카테고리 매핑
function mapCategory(tags: string[]): string {
  const joined = tags.join(',').toLowerCase();
  if (joined.includes('meat') || joined.includes('pork') || joined.includes('beef') || joined.includes('chicken')) return '육류';
  if (joined.includes('seafood') || joined.includes('fish') || joined.includes('shrimp')) return '해산물';
  if (joined.includes('vegetable')) return '채소';
  if (joined.includes('fruit')) return '과일';
  if (joined.includes('dairy') || joined.includes('milk') || joined.includes('cheese') || joined.includes('yogurt')) return '유제품';
  if (joined.includes('frozen')) return '냉동식품';
  if (joined.includes('beverage') || joined.includes('drink') || joined.includes('juice') || joined.includes('water')) return '음료';
  if (joined.includes('sauce') || joined.includes('condiment') || joined.includes('spice')) return '양념';
  if (joined.includes('cereal') || joined.includes('rice') || joined.includes('grain') || joined.includes('noodle')) return '곡류';
  return '기타';
}
