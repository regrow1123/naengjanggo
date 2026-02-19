import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { date } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'API 키 없음' }, { status: 500 });

    // 보유 재료 가져오기
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    let ingredientList = '';

    if (user) {
      const { data: fridges } = await supabase.from('fridges').select('id').eq('user_id', user.id);
      const ids = fridges?.map((f: { id: string }) => f.id) || [];
      if (ids.length > 0) {
        const { data: ingredients } = await supabase.from('ingredients').select('name, quantity, unit').in('fridge_id', ids);
        if (ingredients && ingredients.length > 0) {
          ingredientList = ingredients.map((i: { name: string; quantity: number; unit: string }) => `${i.name}(${i.quantity}${i.unit})`).join(', ');
        }
      }
    }

    const prompt = `${date} 날짜의 하루 식단을 추천해주세요.
${ingredientList ? `\n현재 냉장고 재료: ${ingredientList}\n가능하면 이 재료를 활용해주세요.` : ''}

아침, 점심, 저녁 3끼를 추천해주세요.
JSON 배열만 출력하세요:
[
  {"mealType": "breakfast", "title": "메뉴이름", "ingredients": [{"name": "재료", "quantity": "양"}]},
  {"mealType": "lunch", "title": "메뉴이름", "ingredients": [{"name": "재료", "quantity": "양"}]},
  {"mealType": "dinner", "title": "메뉴이름", "ingredients": [{"name": "재료", "quantity": "양"}]}
]
한국 가정식 위주로, 간단하고 현실적인 메뉴로 추천해주세요.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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
          return NextResponse.json({ error: '1분 후 다시 시도해주세요.' }, { status: 429 });
        }
        throw err;
      }
    }

    if (!result) return NextResponse.json({ error: 'API 호출 실패' }, { status: 500 });

    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return NextResponse.json({ error: '추천 생성 실패' }, { status: 500 });

    const suggestions = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Planner suggest error:', error);
    return NextResponse.json({ error: '오류 발생' }, { status: 500 });
  }
}
