'use client';

import { useState } from 'react';
import { useShopping } from '@/hooks/useShopping';
import ShoppingItemRow from '@/components/ShoppingItem';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ShoppingPage() {
  const { items, loading, addItem, toggleItem, clearChecked } = useShopping();
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    if (!newItem.trim()) return;
    addItem(newItem.trim());
    setNewItem('');
  };

  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-bold text-gray-900">🛒 장보기 리스트</h1>
        {checked.length > 0 && (
          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={clearChecked}>
            <Trash2 className="mr-1 h-4 w-4" /> 완료 삭제
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="재료 추가..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="flex-1"
        />
        <Button onClick={handleAdd} size="icon" className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {unchecked.map((item) => (
          <ShoppingItemRow key={item.id} item={item} onToggle={(id) => toggleItem(id, true)} />
        ))}
      </div>

      {checked.length > 0 && (
        <>
          <p className="text-sm font-medium text-gray-400">완료 ({checked.length})</p>
          <div className="flex flex-col gap-2">
            {checked.map((item) => (
              <ShoppingItemRow key={item.id} item={item} onToggle={(id) => toggleItem(id, false)} />
            ))}
          </div>
        </>
      )}

      {items.length === 0 && (
        <div className="py-12 text-center text-gray-400">장보기 리스트가 비어있습니다</div>
      )}
    </div>
  );
}
