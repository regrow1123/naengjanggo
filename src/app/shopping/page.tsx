'use client';

import { useState } from 'react';
import { mockShoppingItems } from '@/lib/mock-data';
import { ShoppingItem } from '@/lib/types';
import ShoppingItemRow from '@/components/ShoppingItem';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ShoppingPage() {
  const [items, setItems] = useState<ShoppingItem[]>(mockShoppingItems);
  const [newItem, setNewItem] = useState('');

  const toggle = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
    );
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    const item: ShoppingItem = {
      id: `s${Date.now()}`,
      userId: 'u1',
      name: newItem.trim(),
      quantity: 1,
      unit: '개',
      checked: false,
      createdAt: new Date().toISOString(),
    };
    setItems((prev) => [...prev, item]);
    setNewItem('');
  };

  const clearChecked = () => {
    setItems((prev) => prev.filter((i) => !i.checked));
  };

  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-bold text-gray-900">🛒 장보기 리스트</h1>
        {checked.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600"
            onClick={clearChecked}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            완료 삭제
          </Button>
        )}
      </div>

      {/* Add Item */}
      <div className="flex gap-2">
        <Input
          placeholder="재료 추가..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          className="flex-1"
        />
        <Button onClick={addItem} size="icon" className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Unchecked */}
      <div className="flex flex-col gap-2">
        {unchecked.map((item) => (
          <ShoppingItemRow key={item.id} item={item} onToggle={toggle} />
        ))}
      </div>

      {/* Checked */}
      {checked.length > 0 && (
        <>
          <p className="text-sm font-medium text-gray-400">
            완료 ({checked.length})
          </p>
          <div className="flex flex-col gap-2">
            {checked.map((item) => (
              <ShoppingItemRow key={item.id} item={item} onToggle={toggle} />
            ))}
          </div>
        </>
      )}

      {items.length === 0 && (
        <div className="py-12 text-center text-gray-400">
          장보기 리스트가 비어있습니다
        </div>
      )}
    </div>
  );
}
