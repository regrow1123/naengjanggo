// 식품안전나라 조리식품 레시피 DB (COOKRCP01)
// https://www.foodsafetykorea.go.kr/api/openApiInfo.do?menu_grp=MENU_GRP31&menu_no=661&show_cnt=10&start_idx=1&svc_no=COOKRCP01

const API_KEY = process.env.FOODSAFETY_API_KEY || 'sample';
const BASE_URL = 'https://openapi.foodsafetykorea.go.kr/api';

export interface PublicRecipe {
  id: string;
  name: string;
  category: string;  // 반찬, 국, 밥, 후식 등
  method: string;     // 찌기, 볶기, 끓이기 등
  ingredients: string; // 원재료 텍스트
  steps: { text: string; image?: string }[];
  image?: string;
  tip?: string;
  calories?: string;
}

interface RawRecipeRow {
  RCP_SEQ: string;
  RCP_NM: string;
  RCP_PAT2: string;
  RCP_WAY2: string;
  RCP_PARTS_DTLS: string;
  ATT_FILE_NO_MAIN: string;
  RCP_NA_TIP: string;
  INFO_ENG: string;
  [key: string]: string;
}

function parseRecipe(row: RawRecipeRow): PublicRecipe {
  const steps: { text: string; image?: string }[] = [];
  for (let i = 1; i <= 20; i++) {
    const num = String(i).padStart(2, '0');
    const text = row[`MANUAL${num}`];
    const image = row[`MANUAL_IMG${num}`];
    if (text && text.trim()) {
      steps.push({
        text: text.replace(/^\d+\.\s*/, '').trim(),
        image: image || undefined,
      });
    }
  }

  return {
    id: row.RCP_SEQ,
    name: row.RCP_NM,
    category: row.RCP_PAT2,
    method: row.RCP_WAY2,
    ingredients: row.RCP_PARTS_DTLS,
    steps,
    image: row.ATT_FILE_NO_MAIN || undefined,
    tip: row.RCP_NA_TIP || undefined,
    calories: row.INFO_ENG || undefined,
  };
}

// 전체 레시피 가져오기 (검색은 클라이언트에서)
export async function fetchAllRecipes(start = 1, end = 1000): Promise<PublicRecipe[]> {
  const url = `${BASE_URL}/${API_KEY}/COOKRCP01/json/${start}/${end}`;
  const res = await fetch(url, { next: { revalidate: 86400 } }); // 24시간 캐시
  const data = await res.json();

  if (!data.COOKRCP01?.row) return [];
  return data.COOKRCP01.row.map(parseRecipe);
}

// 재료 이름으로 레시피 필터링
export function filterByIngredients(recipes: PublicRecipe[], ingredientNames: string[]): PublicRecipe[] {
  return recipes
    .map((recipe) => {
      const matchCount = ingredientNames.filter((name) =>
        recipe.ingredients.includes(name)
      ).length;
      return { recipe, matchCount };
    })
    .filter(({ matchCount }) => matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount)
    .map(({ recipe }) => recipe);
}
