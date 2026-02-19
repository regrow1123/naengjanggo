'use client';

import { useState } from 'react';
import { mockRecipes, mockIngredients } from '@/lib/mock-data';
import RecipeCard from '@/components/RecipeCard';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Tab = 'recommend' | 'search' | 'saved';

export default function RecipesPage() {
  const [tab, setTab] = useState<Tab>('recommend');
  const [search, setSearch] = useState('');

  const myIngredientNames = mockIngredients.map((i) => i.name);

  const filtered = mockRecipes.filter((r) => {
    if (search) return r.title.includes(search);
    return true;
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: 'recommend', label: '추천' },
    { key: 'search', label: '검색' },
    { key: 'saved', label: '저장됨' },
  ];

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="pt-2">
        <h1 className="text-xl font-bold text-gray-900">🍳 레시피</h1>
        <p className="mt-1 text-sm text-gray-500">
          내 재료로 만들 수 있는 요리를 찾아보세요
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-colors',
              tab === t.key
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      {tab === 'search' && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="레시피 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Recommendation info */}
      {tab === 'recommend' && (
        <div className="rounded-xl bg-orange-50 p-3 text-sm text-orange-700">
          💡 보유 재료 <strong>{myIngredientNames.length}개</strong> 기반으로 추천합니다.
          유통기한 임박 재료를 우선 활용해요.
        </div>
      )}

      {/* Recipe List */}
      <div className="flex flex-col gap-3">
        {filtered.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
