import { Ingredient } from '@/lib/types';
import { getDday } from '@/lib/mock-data';
import ExpiryBadge from './ExpiryBadge';

export default function IngredientCard({ ingredient }: { ingredient: Ingredient }) {
  const dday = getDday(ingredient.expiryDate);

  return (
    <div className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-gray-900">{ingredient.name}</span>
        <span className="text-sm text-gray-500">
          {ingredient.quantity}{ingredient.unit} · {ingredient.category}
        </span>
      </div>
      <ExpiryBadge dday={dday} />
    </div>
  );
}
