'use client';

import { ShoppingItem as ShoppingItemType } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export default function ShoppingItemRow({
  item,
  onToggle,
}: {
  item: ShoppingItemType;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm">
      <Checkbox
        checked={item.checked}
        onCheckedChange={() => onToggle(item.id)}
        className="h-5 w-5"
      />
      <div className={cn('flex-1', item.checked && 'text-gray-400 line-through')}>
        <span className="font-medium">{item.name}</span>
        <span className="ml-2 text-sm text-gray-500">
          {item.quantity}{item.unit}
        </span>
      </div>
    </div>
  );
}
