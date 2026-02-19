import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { ingredients, mode } = await request.json();

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json({ error: '재료를 입력해주세요.' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'API 키가 설정되지 않았습니다.' }, { status: 500 });
    }

    const ingredientList = ingredients
      .map((i: { name: string; quantity?: number; unit?: string; dday?: number }) => {
        let text = i.name;
        if (i.quantity && i.unit) text += ` (${i.quantity}${i.unit})`;
        if (i.dday !== undefined && i.dday <= 3) text += ` ⚠️ 유통기한 ${i.dday <= 0 ? '만료' : `D-${i.dday}`}`;
        return text;
      })
      .join(', ');

    let prompt: string;

    if (mode === 'urgent') {
      prompt = `다음은 냉장고에 있는 재료 목록입니다. ⚠️ 표시된 재료는 유통기한이 임박합니다.

재료: ${ingredientList}

유통기한이 임박한 재료를 우선적으로 활용하는 레시피 3개를 추천해주세요.`;
    } else {
      prompt = `다음은 냉장고에 있는 재료 목록입니다.

재료: ${ingredientList}

이 재료들을 활용해서 만들 수 있는 레시피 3개를 추천해주세요.`;
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
    "tip": "요리 팁 (한 줄)"
  }
]

have는 위 재료 목록에 있으면 true, 추가로 필요하면 false로 표시해주세요.
한국 가정에서 흔히 있는 기본 양념(소금, 설탕, 식용유, 참기름, 간장 등)은 있다고 가정해도 됩니다.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';

    // JSON 파싱
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: '레시피 생성에 실패했습니다.' }, { status: 500 });
    }

    const recipes = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ recipes });
  } catch (error) {
    console.error('Recipe recommendation error:', error);
    return NextResponse.json({ error: '레시피 추천 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
