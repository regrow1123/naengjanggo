'use client';

import { Ingredient } from '@/lib/types';
import { getDday } from '@/lib/mock-data';
import ExpiryBadge from './ExpiryBadge';
import { Trash2 } from 'lucide-react';

export default function IngredientCard({
  ingredient,
  onDelete,
}: {
  ingredient: Ingredient;
  onDelete?: (id: string) => void;
}) {
  const dday = getDday(ingredient.expiryDate);

  return (
    <div className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-gray-900">{ingredient.name}</span>
        <span className="text-sm text-gray-500">
          {ingredient.quantity}{ingredient.unit} · {ingredient.category}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <ExpiryBadge dday={dday} />
        {onDelete && (
          <button
            onClick={() => onDelete(ingredient.id)}
            className="rounded-full p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
