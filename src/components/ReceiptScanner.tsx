'use client';

import { useState, useRef } from 'react';
import { Category, Unit, Ingredient } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Camera, Upload, Loader2, Check, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface ScannedItem {
  name: string;
  category: Category;
  quantity: number;
  unit: Unit;
  price: number;
  selected: boolean;
}

interface Props {
  fridgeId: string;
  onAdd: (ingredient: Omit<Ingredient, 'id' | 'createdAt'>) => Promise<unknown>;
  onClose: () => void;
}

export default function ReceiptScanner({ fridgeId, onAdd, onClose }: Props) {
  const [items, setItems] = useState<ScannedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [expiryDays, setExpiryDays] = useState('7');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImage = async (file: File) => {
    setLoading(true);
    setError('');
    setItems([]);

    // 미리보기
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/receipt/scan', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else if (data.items && data.items.length > 0) {
        setItems(data.items.map((i: Omit<ScannedItem, 'selected'>) => ({ ...i, selected: true })));
      } else {
        setError('영수증에서 식재료를 찾지 못했습니다.');
      }
    } catch {
      setError('영수증 분석 중 오류가 발생했습니다.');
    }

    setLoading(false);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImage(file);
  };

  const toggleItem = (idx: number) => {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, selected: !item.selected } : item));
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    const selected = items.filter((i) => i.selected);
    if (selected.length === 0) return;

    setSaving(true);
    const expiry = format(
      new Date(Date.now() + Number(expiryDays) * 24 * 60 * 60 * 1000),
      'yyyy-MM-dd'
    );

    for (const item of selected) {
      await onAdd({
        fridgeId,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        purchaseDate: format(new Date(), 'yyyy-MM-dd'),
        expiryDate: expiry,
      });
    }

    setSaving(false);
    onClose();
  };

  const selectedCount = items.filter((i) => i.selected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">📸 영수증 스캔</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 이미지 업로드 */}
        {items.length === 0 && !loading && (
          <div className="flex flex-col gap-3">
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />

            <Button
              className="h-32 w-full gap-2 border-2 border-dashed bg-white text-gray-500 hover:bg-gray-50 hover:text-green-600"
              variant="outline"
              onClick={() => fileRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-2">
                <Camera className="h-8 w-8" />
                <span>영수증 촬영하기</span>
              </div>
            </Button>

            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) handleImage(file);
                };
                input.click();
              }}
            >
              <Upload className="h-4 w-4" /> 갤러리에서 선택
            </Button>

            <p className="text-center text-xs text-gray-400">
              마트/편의점 영수증을 촬영하면<br />식재료를 자동으로 인식합니다
            </p>
          </div>
        )}

        {/* 로딩 */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-8">
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="영수증" className="h-32 rounded-lg object-cover opacity-50" />
            )}
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <p className="text-sm text-gray-500">AI가 영수증을 분석하고 있어요...</p>
          </div>
        )}

        {/* 에러 */}
        {error && (
          <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        {/* 인식 결과 */}
        {items.length > 0 && (
          <>
            <p className="mb-2 text-sm font-medium text-gray-700">
              인식된 재료 ({selectedCount}/{items.length}개 선택)
            </p>
            <div className="mb-3 flex flex-col gap-2">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 rounded-lg border p-3 transition-colors ${
                    item.selected ? 'border-green-300 bg-green-50' : 'border-gray-200 opacity-50'
                  }`}
                >
                  <button onClick={() => toggleItem(idx)} className="shrink-0">
                    <div className={`flex h-5 w-5 items-center justify-center rounded border ${
                      item.selected ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300'
                    }`}>
                      {item.selected && <Check className="h-3 w-3" />}
                    </div>
                  </button>
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">{item.name}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      {item.quantity}{item.unit} · {item.category}
                    </span>
                    {item.price > 0 && (
                      <span className="ml-1 text-xs text-gray-400">
                        ({item.price.toLocaleString()}원)
                      </span>
                    )}
                  </div>
                  <button onClick={() => removeItem(idx)} className="text-gray-300 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* 유통기한 일괄 설정 */}
            <div className="mb-3">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                유통기한 (오늘로부터)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                  className="w-20"
                />
                <span className="text-sm text-gray-500">일 후</span>
                <span className="text-xs text-gray-400">
                  ({format(new Date(Date.now() + Number(expiryDays) * 86400000), 'M/d')} 까지)
                </span>
              </div>
            </div>

            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handleSave}
              disabled={saving || selectedCount === 0}
            >
              {saving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 등록 중...</>
              ) : (
                `선택한 ${selectedCount}개 재료 냉장고에 추가`
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
