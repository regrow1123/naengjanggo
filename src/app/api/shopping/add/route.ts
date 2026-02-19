import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: '추가할 재료가 없습니다.' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const rows = items.map((item: { name: string; quantity?: string }) => ({
      user_id: user.id,
      name: item.name,
      quantity: 1,
      unit: item.quantity || '개',
      checked: false,
    }));

    const { error } = await supabase.from('shopping_items').insert(rows);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: rows.length });
  } catch {
    return NextResponse.json({ error: '오류가 발생했습니다.' }, { status: 500 });
  }
}
