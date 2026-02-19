'use client';

import { useState } from 'react';
import { useShopping } from '@/hooks/useShopping';
import { useFridges } from '@/hooks/useIngredients';
import { ShoppingItem } from '@/lib/types';
import ShoppingItemRow from '@/components/ShoppingItem';
import AddIngredientModal from '@/components/AddIngredientModal';
import { Plus, Trash2, Loader2, Refrigerator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIngredients } from '@/hooks/useIngredients';

export default function ShoppingPage() {
  const { items, loading, addItem, toggleItem, clearChecked } = useShopping();
  const { fridges } = useFridges();
  const defaultFridge = fridges.find((f) => f.type === 'refrigerator');
  const { addIngredient } = useIngredients(defaultFridge?.id);
  const [newItem, setNewItem] = useState('');
  const [addToFridgeItem, setAddToFridgeItem] = useState<ShoppingItem | null>(null);
  const [showAddToFridge, setShowAddToFridge] = useState<ShoppingItem | null>(null);

  const handleAdd = () => {
    if (!newItem.trim()) return;
    addItem(newItem.trim());
    setNewItem('');
  };

  const handleToggle = async (id: string, checked: boolean) => {
    await toggleItem(id, checked);
    // 체크 완료 시 → 냉장고 등록 제안
    if (checked) {
      const item = items.find((i) => i.id === id);
      if (item) setAddToFridgeItem(item);
    }
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
          <ShoppingItemRow key={item.id} item={item} onToggle={(id) => handleToggle(id, true)} />
        ))}
      </div>

      {checked.length > 0 && (
        <>
          <p className="text-sm font-medium text-gray-400">완료 ({checked.length})</p>
          <div className="flex flex-col gap-2">
            {checked.map((item) => (
              <ShoppingItemRow key={item.id} item={item} onToggle={(id) => handleToggle(id, false)} />
            ))}
          </div>
        </>
      )}

      {items.length === 0 && (
        <div className="py-12 text-center text-gray-400">장보기 리스트가 비어있습니다</div>
      )}

      {/* 냉장고 등록 제안 팝업 */}
      {addToFridgeItem && defaultFridge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5" onClick={() => setAddToFridgeItem(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center gap-2">
              <Refrigerator className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-bold">냉장고에 추가할까요?</h3>
            </div>
            <p className="mb-4 text-sm text-gray-600">
              <strong>{addToFridgeItem.name}</strong>을(를) 구매 완료했어요.<br />
              냉장고에 바로 등록할 수 있어요.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setAddToFridgeItem(null)}
              >
                나중에
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => {
                  // AddIngredientModal 열기 (이름 미리 채워서)
                  setAddToFridgeItem(null);
                  setShowAddToFridge(addToFridgeItem);
                }}
              >
                등록하기
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 냉장고 등록 모달 (이름 미리 채워짐) */}
      {showAddToFridge && defaultFridge && (
        <AddIngredientModal
          fridgeId={defaultFridge.id}
          onAdd={addIngredient}
          onClose={() => setShowAddToFridge(null)}
          initialName={showAddToFridge.name}
        />
      )}
    </div>
  );
}
