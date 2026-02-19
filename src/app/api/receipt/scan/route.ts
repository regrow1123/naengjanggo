import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: '이미지를 업로드해주세요.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API 키가 설정되지 않았습니다.' }, { status: 500 });
    }

    // 이미지를 base64로 변환
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `이 마트/편의점 영수증 이미지에서 식재료 항목만 추출해주세요.
가공식품, 생활용품 등은 제외하고 냉장고에 넣을 수 있는 식재료만 골라주세요.

JSON 배열로만 응답해주세요:
[
  {
    "name": "재료명 (간결하게, 예: 삼겹살, 우유, 양파)",
    "category": "카테고리 (육류/해산물/채소/과일/유제품/냉동식품/음료/양념/곡류/기타 중 하나)",
    "quantity": 수량(숫자),
    "unit": "단위 (g/kg/ml/L/개/팩/병/봉 중 하나)",
    "price": 가격(숫자, 없으면 0)
  }
]

영수증에서 식재료를 찾을 수 없으면 빈 배열 []을 반환하세요.
제품명이 길면 핵심 재료명만 간결하게 정리해주세요. (예: "풀무원 국산콩두부 300g" → "두부")`;

    let result;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        result = await model.generateContent([
          prompt,
          { inlineData: { mimeType: file.type || 'image/jpeg', data: base64 } },
        ]);
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

    if (!result) {
      return NextResponse.json({ error: 'API 호출 실패' }, { status: 500 });
    }

    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: '영수증에서 식재료를 인식하지 못했습니다.' }, { status: 500 });
    }

    const items = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Receipt scan error:', error);
    return NextResponse.json({ error: '영수증 분석 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
