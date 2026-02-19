'use client';

import { useState } from 'react';
import { CATEGORIES, UNITS, Ingredient, Category, Unit } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Trash2 } from 'lucide-react';

interface Props {
  ingredient: Ingredient;
  onUpdate: (id: string, updates: Partial<Ingredient>) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
  onClose: () => void;
}

export default function EditIngredientModal({ ingredient, onUpdate, onDelete, onClose }: Props) {
  const [name, setName] = useState(ingredient.name);
  const [category, setCategory] = useState<Category>(ingredient.category);
  const [quantity, setQuantity] = useState(String(ingredient.quantity));
  const [unit, setUnit] = useState<Unit>(ingredient.unit);
  const [expiryDate, setExpiryDate] = useState(ingredient.expiryDate);
  const [memo, setMemo] = useState(ingredient.memo || '');
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await onUpdate(ingredient.id, {
      name: name.trim(),
      category,
      quantity: Number(quantity),
      unit,
      expiryDate,
      memo: memo || undefined,
    });
    setLoading(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setLoading(true);
    await onDelete(ingredient.id);
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
          <h2 className="text-lg font-bold">재료 수정</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input placeholder="재료 이름" value={name} onChange={(e) => setName(e.target.value)} required />

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

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">메모</label>
            <Input placeholder="메모 (선택)" value={memo} onChange={(e) => setMemo(e.target.value)} />
          </div>

          <Button type="submit" disabled={loading} className="mt-2 bg-green-600 hover:bg-green-700">
            {loading ? '저장 중...' : '저장하기'}
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={loading}
            className={confirmDelete ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100' : 'text-red-500 hover:bg-red-50'}
            onClick={handleDelete}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            {confirmDelete ? '정말 삭제할까요?' : '삭제'}
          </Button>
        </form>
      </div>
    </div>
  );
}
