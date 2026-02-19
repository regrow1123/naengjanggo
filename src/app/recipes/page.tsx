'use client';

import { useState } from 'react';
import { useIngredients } from '@/hooks/useIngredients';
import { getDday } from '@/lib/mock-data';
import { AIRecipe } from '@/lib/types';
import { Sparkles, Loader2, Clock, ChefHat, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const THEMES = [
  { key: 'urgent', emoji: '⏰', label: '임박 소진' },
  { key: 'korean', emoji: '🇰🇷', label: '한식' },
  { key: 'chinese', emoji: '🇨🇳', label: '중식' },
  { key: 'japanese', emoji: '🇯🇵', label: '일식' },
  { key: 'western', emoji: '🍝', label: '양식' },
  { key: 'meat', emoji: '🥩', label: '고기러버' },
  { key: 'vegan', emoji: '🥗', label: '비건' },
  { key: 'quick', emoji: '⚡', label: '15분 요리' },
  { key: 'diet', emoji: '💪', label: '다이어트' },
  { key: 'comfort', emoji: '🍜', label: '야식' },
] as const;

export default function RecipesPage() {
  const [theme, setTheme] = useState<string>('korean');
  const { ingredients } = useIngredients();
  const [recipes, setRecipes] = useState<AIRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedRecipe, setExpandedRecipe] = useState<number | null>(null);
  const [addedToCart, setAddedToCart] = useState<Set<number>>(new Set());
  const [mustUse, setMustUse] = useState<Set<string>>(new Set());
  const [showIngredientPicker, setShowIngredientPicker] = useState(false);
  const [meta, setMeta] = useState<{ matchedPublicRecipes: number; totalPublicRecipes: number } | null>(null);
  const [publicRecipes, setPublicRecipes] = useState<Record<string, { name: string; image?: string; ingredients: string }>>({});

  const urgentIngredients = ingredients.filter((i) => getDday(i.expiryDate) <= 3);

  const fetchRecipes = async () => {
    const mode = theme;
    setLoading(true);
    setError('');
    setRecipes([]);

    const items = (theme === 'urgent' ? urgentIngredients : ingredients).map((i) => ({
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
      dday: getDday(i.expiryDate),
    }));

    if (items.length === 0) {
      setError(theme === 'urgent' ? '유통기한 임박 재료가 없습니다.' : '냉장고에 재료를 먼저 추가해주세요.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/recipes/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: items, mode, theme, mustUse: Array.from(mustUse) }),
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

      {/* Theme Selection */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {THEMES.map((t) => (
          <button
            key={t.key}
            onClick={() => setTheme(t.key)}
            className={cn(
              'flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition-colors',
              theme === t.key ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* Must-use ingredient picker */}
      {ingredients.length > 0 && (
        <div>
          <button
            onClick={() => setShowIngredientPicker(!showIngredientPicker)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600"
          >
            🎯 필수 재료 {mustUse.size > 0 && `(${mustUse.size}개 선택)`}
            <span className="text-xs">{showIngredientPicker ? '▲' : '▼'}</span>
          </button>
          {showIngredientPicker && (
            <div className="mt-2 flex flex-wrap gap-1.5 rounded-xl bg-gray-50 p-3">
              {ingredients.map((i) => (
                <button
                  key={i.id}
                  onClick={() => {
                    setMustUse((prev) => {
                      const next = new Set(prev);
                      next.has(i.name) ? next.delete(i.name) : next.add(i.name);
                      return next;
                    });
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    mustUse.has(i.name)
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-600 border hover:border-green-300'
                  }`}
                >
                  {i.name}
                </button>
              ))}
              {mustUse.size > 0 && (
                <button
                  onClick={() => setMustUse(new Set())}
                  className="rounded-full px-3 py-1.5 text-xs text-red-500 hover:bg-red-50"
                >
                  초기화
                </button>
              )}
            </div>
          )}
          {mustUse.size > 0 && !showIngredientPicker && (
            <div className="mt-1 flex flex-wrap gap-1">
              {Array.from(mustUse).map((name) => (
                <span key={name} className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Generate Button */}
      <Button
        onClick={() => fetchRecipes()}
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

              {/* Missing ingredients + add to cart */}
              {recipe.ingredients.some((i) => !i.have) && (
                <div className="mb-3 rounded-lg bg-yellow-50 p-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-yellow-700">
                      <ShoppingCart className="h-3.5 w-3.5" />
                      부족: {recipe.ingredients.filter((i) => !i.have).map((i) => i.name).join(', ')}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 w-full gap-1 border-yellow-300 text-xs text-yellow-700 hover:bg-yellow-100"
                    disabled={addedToCart.has(idx)}
                    onClick={async (e) => {
                      e.stopPropagation();
                      const missing = recipe.ingredients.filter((i) => !i.have);
                      try {
                        const res = await fetch('/api/shopping/add', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ items: missing }),
                        });
                        if (res.ok) {
                          setAddedToCart((prev) => new Set(prev).add(idx));
                        }
                      } catch { /* ignore */ }
                    }}
                  >
                    {addedToCart.has(idx) ? '✅ 장보기에 추가됨' : '🛒 장보기 리스트에 추가'}
                  </Button>
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
