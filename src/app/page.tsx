import { mockIngredients, getDday } from '@/lib/mock-data';
import ExpiryBadge from '@/components/ExpiryBadge';
import { AlertTriangle, Refrigerator, ChefHat } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

// 서버 컴포넌트 — Supabase 연동 시 server.ts 사용
// 현재는 mock 데이터 (Supabase 키 설정 전)
async function getIngredients() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: fridges } = await supabase.from('fridges').select('id').eq('user_id', user.id);
      const fridgeIds = fridges?.map((f: { id: string }) => f.id) || [];
      if (fridgeIds.length > 0) {
        const { data } = await supabase.from('ingredients').select('*').in('fridge_id', fridgeIds).order('expiry_date');
        return (data || []).map((i: Record<string, unknown>) => ({
          id: i.id as string,
          expiryDate: i.expiry_date as string,
          name: i.name as string,
          quantity: i.quantity as number,
          unit: i.unit as string,
        }));
      }
    }
  }
  return mockIngredients;
}

export default async function HomePage() {
  const allIngredients = await getIngredients();

  const urgentItems = allIngredients
    .map((i) => ({ ...i, dday: getDday(i.expiryDate) }))
    .filter((i) => i.dday <= 3)
    .sort((a, b) => a.dday - b.dday);

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-gray-900">🧊 냉장고를 부탁해</h1>
        <p className="mt-1 text-sm text-gray-500">오늘의 냉장고 현황</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-blue-100 p-2">
              <Refrigerator className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{allIngredients.length}</p>
              <p className="text-xs text-gray-500">총 재료</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-red-100 p-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{urgentItems.length}</p>
              <p className="text-xs text-gray-500">임박 재료</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {urgentItems.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              유통기한 임박
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {urgentItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5">
                <div>
                  <span className="font-medium text-gray-900">{item.name}</span>
                  <span className="ml-2 text-sm text-gray-500">{item.quantity}{item.unit}</span>
                </div>
                <ExpiryBadge dday={item.dday} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">빠른 메뉴</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          <Link href="/fridge" className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700 hover:bg-green-100">
            <Refrigerator className="h-4 w-4" /> 재료 추가하기
          </Link>
          <Link href="/recipes" className="flex items-center gap-2 rounded-lg bg-orange-50 p-3 text-sm font-medium text-orange-700 hover:bg-orange-100">
            <ChefHat className="h-4 w-4" /> 레시피 추천
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
