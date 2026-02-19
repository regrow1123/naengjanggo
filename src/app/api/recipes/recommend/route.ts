import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { fetchAllRecipes, filterByIngredients } from '@/lib/recipe-api';

// 레시피 캐시 (서버 메모리)
let cachedRecipes: Awaited<ReturnType<typeof fetchAllRecipes>> | null = null;
let cacheTime = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24시간

async function getRecipes() {
  if (cachedRecipes && Date.now() - cacheTime < CACHE_TTL) {
    return cachedRecipes;
  }
  cachedRecipes = await fetchAllRecipes(1, 1000);
  cacheTime = Date.now();
  return cachedRecipes;
}

export async function POST(request: NextRequest) {
  try {
    const { ingredients, mode, mustUse } = await request.json();

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json({ error: '재료를 입력해주세요.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API 키가 설정되지 않았습니다.' }, { status: 500 });
    }

    // 1. 공공 레시피 DB에서 재료 매칭 검색
    const ingredientNames = ingredients.map((i: { name: string }) => i.name);
    const allRecipes = await getRecipes();
    const matched = filterByIngredients(allRecipes, ingredientNames).slice(0, 5);

    // 2. 재료 목록 텍스트 생성
    const ingredientList = ingredients
      .map((i: { name: string; quantity?: number; unit?: string; dday?: number }) => {
        let text = i.name;
        if (i.quantity && i.unit) text += ` (${i.quantity}${i.unit})`;
        if (i.dday !== undefined && i.dday <= 3) text += ` ⚠️유통기한 ${i.dday <= 0 ? '만료' : `D-${i.dday}`}`;
        return text;
      })
      .join(', ');

    // 3. 공공 레시피 데이터를 AI 컨텍스트로 전달
    let recipeContext = '';
    if (matched.length > 0) {
      recipeContext = `\n\n참고할 수 있는 실제 레시피 데이터:\n` + matched.map((r, i) =>
        `${i + 1}. [ID:${r.id}] ${r.name} (${r.category}, ${r.method})\n   재료: ${r.ingredients}\n   조리법: ${r.steps.map(s => s.text).join(' → ')}`
      ).join('\n');
    }

    // 4. AI 프롬프트 생성
    let prompt: string;
    if (mode === 'urgent') {
      prompt = `다음은 냉장고에 있는 재료 목록입니다. ⚠️ 표시된 재료는 유통기한이 임박합니다.

재료: ${ingredientList}
${recipeContext}

위 참고 레시피를 기반으로 유통기한 임박 재료를 우선 활용하는 레시피 3개를 추천해주세요.
참고 레시피가 있으면 그것을 기반으로 하되, 내 재료에 맞게 조정해주세요.
참고 레시피가 부족하면 새로운 레시피를 만들어도 됩니다.`;
    } else {
      prompt = `다음은 냉장고에 있는 재료 목록입니다.

재료: ${ingredientList}
${recipeContext}

위 참고 레시피를 기반으로 이 재료들을 활용할 수 있는 레시피 3개를 추천해주세요.
참고 레시피가 있으면 그것을 기반으로 하되, 내 재료에 맞게 조정해주세요.
참고 레시피가 부족하면 새로운 레시피를 만들어도 됩니다.`;
    }

    if (mustUse && Array.isArray(mustUse) && mustUse.length > 0) {
      prompt += `\n\n⚠️ 중요: 다음 재료는 모든 레시피에 반드시 포함해야 합니다: ${mustUse.join(', ')}`;
    }

    prompt += `

각 레시피는 다음 JSON 형식으로 응답해주세요. JSON 배열만 출력하고 다른 텍스트는 포함하지 마세요:
[
  {
    "title": "요리 이름",
    "time": "조리 시간 (예: 20분)",
    "difficulty": "쉬움/보통/어려움",
    "ingredients": [{"name": "재료명", "quantity": "양", "have": true/false}],
    "steps": ["조리 단계 1", "조리 단계 2", ...],
    "tip": "요리 팁 (한 줄)",
    "source": "public_db 또는 ai_generated",
    "sourceId": "참고한 레시피 ID (source가 public_db일 때만)"
  }
]

have는 위 재료 목록에 있으면 true, 추가로 필요하면 false로 표시해주세요.
한국 가정에서 흔히 있는 기본 양념(소금, 설탕, 식용유, 참기름, 간장 등)은 있다고 가정해도 됩니다.
source는 참고 레시피를 기반으로 했으면 "public_db", 새로 만든 거면 "ai_generated"로 표시해주세요.
source가 "public_db"인 경우, 참고한 레시피의 [ID:xxx]를 sourceId에 넣어주세요.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // 429 재시도 (최대 2회, 간격 늘려가며)
    let result;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        result = await model.generateContent(prompt);
        break;
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        if (errMsg.includes('429') && attempt < 2) {
          await new Promise((r) => setTimeout(r, (attempt + 1) * 5000));
          continue;
        }
        if (errMsg.includes('429')) {
          return NextResponse.json({
            error: 'API 호출 한도에 도달했습니다. 1분 후 다시 시도해주세요.',
          }, { status: 429 });
        }
        throw err;
      }
    }

    if (!result) {
      return NextResponse.json({ error: 'API 호출에 실패했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 });
    }

    const text = result.response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: '레시피 생성에 실패했습니다.' }, { status: 500 });
    }

    const recipes = JSON.parse(jsonMatch[0]);

    // 공공 레시피 원본 데이터를 ID로 매핑
    const publicRecipeMap: Record<string, { name: string; image?: string; ingredients: string }> = {};
    for (const r of matched) {
      publicRecipeMap[r.id] = { name: r.name, image: r.image, ingredients: r.ingredients };
    }

    return NextResponse.json({
      recipes,
      publicRecipes: publicRecipeMap,
      matchedPublicRecipes: matched.length,
      totalPublicRecipes: allRecipes.length,
    });
  } catch (error) {
    console.error('Recipe recommendation error:', error);
    return NextResponse.json({ error: '레시피 추천 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
