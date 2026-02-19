import { mockIngredients, getDday } from '@/lib/mock-data';
import ExpiryBadge from '@/components/ExpiryBadge';
import { AlertTriangle, Refrigerator, ChefHat, CalendarDays, ShoppingCart, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

async function getIngredients() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
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
    } catch { /* fallthrough */ }
  }
  return [];
}

export default async function HomePage() {
  const allIngredients = await getIngredients();

  const urgentItems = allIngredients
    .map((i) => ({ ...i, dday: getDday(i.expiryDate) }))
    .filter((i) => i.dday <= 3)
    .sort((a, b) => a.dday - b.dday);

  const isEmpty = allIngredients.length === 0;

  return (
    <div className="flex flex-col gap-4 p-5">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🧊 냉장고를 부탁해</h1>
          <p className="mt-0.5 text-sm text-gray-500">오늘의 냉장고 현황</p>
        </div>
      </div>

      {/* Empty State */}
      {isEmpty ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-10">
            <div className="rounded-full bg-green-100 p-4">
              <Refrigerator className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900">냉장고가 비어있어요!</p>
              <p className="mt-1 text-sm text-gray-500">재료를 추가해서 시작해보세요</p>
            </div>
            <div className="flex gap-2">
              <Link href="/fridge" className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                재료 추가하기
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="shadow-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-xl bg-blue-100 p-2.5">
                  <Refrigerator className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{allIngredients.length}</p>
                  <p className="text-xs text-gray-500">총 재료</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-xl bg-red-100 p-2.5">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${urgentItems.length > 0 ? 'text-red-600' : ''}`}>
                    {urgentItems.length}
                  </p>
                  <p className="text-xs text-gray-500">임박 재료</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Urgent Items */}
          {urgentItems.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  유통기한 임박
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1.5">
                {urgentItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                      <span className="ml-2 text-xs text-gray-500">{item.quantity}{item.unit}</span>
                    </div>
                    <ExpiryBadge dday={item.dday} />
                  </div>
                ))}
                {urgentItems.length > 5 && (
                  <Link href="/fridge" className="mt-1 text-center text-xs text-green-600 hover:underline">
                    +{urgentItems.length - 5}개 더 보기
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Quick Actions */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">빠른 메뉴</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          <Link href="/fridge" className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm font-medium text-green-700 transition-colors hover:bg-green-100">
            <Refrigerator className="h-4 w-4" /> 내 냉장고
          </Link>
          <Link href="/recipes" className="flex items-center gap-2 rounded-xl bg-orange-50 p-3 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-100">
            <ChefHat className="h-4 w-4" /> AI 레시피
          </Link>
          <Link href="/planner" className="flex items-center gap-2 rounded-xl bg-purple-50 p-3 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100">
            <CalendarDays className="h-4 w-4" /> 식단 플래너
          </Link>
          <Link href="/shopping" className="flex items-center gap-2 rounded-xl bg-blue-50 p-3 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100">
            <ShoppingCart className="h-4 w-4" /> 장보기
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
