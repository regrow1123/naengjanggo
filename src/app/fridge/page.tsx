'use client';

import { useState } from 'react';
import { useFridges, useIngredients } from '@/hooks/useIngredients';
import { getDday } from '@/lib/mock-data';
import { Ingredient } from '@/lib/types';
import IngredientCard from '@/components/IngredientCard';
import AddIngredientModal from '@/components/AddIngredientModal';
import EditIngredientModal from '@/components/EditIngredientModal';
import { Plus, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function FridgePage() {
  const { fridges, loading: fridgesLoading } = useFridges();
  const [activeFridge, setActiveFridge] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

  const selectedFridge = activeFridge || fridges[0]?.id;
  const { ingredients, loading, addIngredient, deleteIngredient, updateIngredient } = useIngredients(selectedFridge);

  const filtered = ingredients
    .filter((i) => !search || i.name.includes(search) || i.category.includes(search))
    .sort((a, b) => getDday(a.expiryDate) - getDday(b.expiryDate));

  if (fridgesLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-bold text-gray-900">🥬 내 냉장고</h1>
        <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" /> 추가
        </Button>
      </div>

      <div className="flex gap-2">
        {fridges.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFridge(f.id)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-colors',
              selectedFridge === f.id ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {f.name}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input placeholder="재료 검색..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            {search ? '검색 결과가 없습니다' : '재료를 추가해보세요!'}
          </div>
        ) : (
          filtered.map((ingredient) => (
            <IngredientCard
              key={ingredient.id}
              ingredient={ingredient}
              onClick={setEditingIngredient}
            />
          ))
        )}
      </div>

      <p className="text-center text-xs text-gray-400">총 {filtered.length}개 재료 · 유통기한순 정렬</p>

      {showAdd && selectedFridge && (
        <AddIngredientModal
          fridgeId={selectedFridge}
          onAdd={addIngredient}
          onClose={() => setShowAdd(false)}
        />
      )}

      {editingIngredient && (
        <EditIngredientModal
          ingredient={editingIngredient}
          onUpdate={updateIngredient}
          onDelete={deleteIngredient}
          onClose={() => setEditingIngredient(null)}
        />
      )}
    </div>
  );
}
