'use client';

import { useState } from 'react';
import { CATEGORIES, UNITS, Ingredient, Category, Unit } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  fridgeId: string;
  onAdd: (ingredient: Omit<Ingredient, 'id' | 'createdAt'>) => Promise<unknown>;
  onClose: () => void;
}

export default function AddIngredientModal({ fridgeId, onAdd, onClose }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('기타');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState<Unit>('개');
  const [expiryDate, setExpiryDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await onAdd({
      fridgeId,
      name: name.trim(),
      category,
      quantity: Number(quantity),
      unit,
      purchaseDate: format(new Date(), 'yyyy-MM-dd'),
      expiryDate,
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">재료 추가</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input placeholder="재료 이름" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">카테고리</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    category === c ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">수량</label>
              <Input type="number" min="0" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">단위</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as Unit)}
                className="h-9 w-full rounded-md border bg-white px-3 text-sm"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">유통기한</label>
            <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} required />
          </div>

          <Button type="submit" disabled={loading} className="mt-2 bg-green-600 hover:bg-green-700">
            {loading ? '추가 중...' : '추가하기'}
          </Button>
        </form>
      </div>
    </div>
  );
}
