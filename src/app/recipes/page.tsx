'use client';

import { useState } from 'react';
import { useIngredients } from '@/hooks/useIngredients';
import { getDday } from '@/lib/mock-data';
import { AIRecipe } from '@/lib/types';
import { Search, Sparkles, Loader2, Clock, ChefHat, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Tab = 'recommend' | 'urgent';

export default function RecipesPage() {
  const [tab, setTab] = useState<Tab>('recommend');
  const { ingredients } = useIngredients();
  const [recipes, setRecipes] = useState<AIRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedRecipe, setExpandedRecipe] = useState<number | null>(null);
  const [meta, setMeta] = useState<{ matchedPublicRecipes: number; totalPublicRecipes: number } | null>(null);
  const [publicRecipes, setPublicRecipes] = useState<Record<string, { name: string; image?: string; ingredients: string }>>({});

  const urgentIngredients = ingredients.filter((i) => getDday(i.expiryDate) <= 3);

  const fetchRecipes = async (mode: 'recommend' | 'urgent') => {
    setLoading(true);
    setError('');
    setRecipes([]);

    const items = (mode === 'urgent' ? urgentIngredients : ingredients).map((i) => ({
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
      dday: getDday(i.expiryDate),
    }));

    if (items.length === 0) {
      setError(mode === 'urgent' ? '유통기한 임박 재료가 없습니다.' : '냉장고에 재료를 먼저 추가해주세요.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/recipes/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: items, mode }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setRecipes(data.recipes);
        if (data.matchedPublicRecipes !== undefined) {
          setMeta({ matchedPublicRecipes: data.matchedPublicRecipes, totalPublicRecipes: data.totalPublicRecipes });
        }
        if (data.publicRecipes) {
          setPublicRecipes(data.publicRecipes);
        }
      }
    } catch {
      setError('레시피 추천 중 오류가 발생했습니다.');
    }

    setLoading(false);
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'recommend', label: '전체 추천', icon: <Sparkles className="h-3.5 w-3.5" /> },
    { key: 'urgent', label: '임박 소진', icon: <Clock className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="pt-2">
        <h1 className="text-xl font-bold text-gray-900">🍳 AI 레시피 추천</h1>
        <p className="mt-1 text-sm text-gray-500">
          냉장고 재료 {ingredients.length}개 기반
          {urgentIngredients.length > 0 && (
            <span className="text-red-500"> · 임박 {urgentIngredients.length}개</span>
          )}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors',
              tab === t.key ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Generate Button */}
      <Button
        onClick={() => fetchRecipes(tab)}
        disabled={loading}
        className="gap-2 bg-orange-500 hover:bg-orange-600"
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> AI가 레시피를 만들고 있어요...</>
        ) : (
          <><Sparkles className="h-4 w-4" /> 레시피 추천받기</>
        )}
      </Button>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {/* Meta info */}
      {meta && recipes.length > 0 && (
        <div className="rounded-xl bg-blue-50 p-3 text-xs text-blue-600">
          📚 공공 레시피 DB {meta.totalPublicRecipes}개 중 {meta.matchedPublicRecipes}개 매칭 → AI가 최적화
        </div>
      )}

      {/* Recipe Results */}
      <div className="flex flex-col gap-3">
        {recipes.map((recipe, idx) => (
          <Card key={idx} className="overflow-hidden">
            {/* 공공DB 레시피 이미지 */}
            {recipe.source === 'public_db' && recipe.sourceId && publicRecipes[recipe.sourceId]?.image && (
              <div className="relative h-40 w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={publicRecipes[recipe.sourceId].image}
                  alt={recipe.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-2 left-2">
                  <Badge className="bg-blue-600 text-[10px]">📚 식약처 레시피</Badge>
                </div>
              </div>
            )}
            <CardHeader
              className="cursor-pointer pb-2"
              onClick={() => setExpandedRecipe(expandedRecipe === idx ? null : idx)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{recipe.title}</CardTitle>
                  {recipe.source === 'ai_generated' && (
                    <Badge variant="outline" className="text-[10px] border-purple-300 text-purple-500">AI 생성</Badge>
                  )}
                </div>
                {expandedRecipe === idx ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div className="flex gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {recipe.time}
                </span>
                <span className="flex items-center gap-1">
                  <ChefHat className="h-3.5 w-3.5" /> {recipe.difficulty}
                </span>
              </div>
            </CardHeader>

            <CardContent>
              {/* Ingredients always visible */}
              <div className="mb-3 flex flex-wrap gap-1.5">
                {recipe.ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className={cn(
                      'rounded-full px-2.5 py-1 text-xs',
                      ing.have
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-600'
                    )}
                  >
                    {ing.have ? '✅' : '❌'} {ing.name} {ing.quantity}
                  </span>
                ))}
              </div>

              {/* Missing ingredients shortcut */}
              {recipe.ingredients.some((i) => !i.have) && (
                <div className="mb-3 flex items-center gap-2 rounded-lg bg-yellow-50 p-2 text-xs text-yellow-700">
                  <ShoppingCart className="h-3.5 w-3.5" />
                  부족: {recipe.ingredients.filter((i) => !i.have).map((i) => i.name).join(', ')}
                </div>
              )}

              {/* Expanded: Steps */}
              {expandedRecipe === idx && (
                <div className="mt-3 border-t pt-3">
                  <p className="mb-2 text-sm font-semibold text-gray-700">조리 순서</p>
                  <ol className="flex flex-col gap-2">
                    {recipe.steps.map((step, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-600">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                  {recipe.tip && (
                    <p className="mt-3 rounded-lg bg-blue-50 p-2 text-xs text-blue-600">
                      💡 {recipe.tip}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
