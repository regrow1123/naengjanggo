'use client';

import { useState, useMemo } from 'react';
import { useMealPlans } from '@/hooks/useMealPlans';
import { MealType, MEAL_LABELS, MealPlan } from '@/lib/types';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, X, Loader2, Sparkles, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_EMOJI: Record<MealType, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍪' };

export default function PlannerPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const today = new Date();
  const weekStart = startOfWeek(addDays(today, weekOffset * 7), { weekStartsOn: 1 }); // 월요일 시작
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const startDate = format(weekDays[0], 'yyyy-MM-dd');
  const endDate = format(weekDays[6], 'yyyy-MM-dd');
  const { plans, loading, addPlan, deletePlan } = useMealPlans(startDate, endDate);

  const [selectedDay, setSelectedDay] = useState<Date>(today);
  const [showAdd, setShowAdd] = useState<MealType | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const dayPlans = useMemo(() => {
    const dateStr = format(selectedDay, 'yyyy-MM-dd');
    return plans.filter((p) => p.date === dateStr);
  }, [plans, selectedDay]);

  const handleAdd = async () => {
    if (!newTitle.trim() || !showAdd) return;
    await addPlan({
      date: format(selectedDay, 'yyyy-MM-dd'),
      mealType: showAdd,
      title: newTitle.trim(),
    });
    setNewTitle('');
    setShowAdd(null);
  };

  const handleAiSuggest = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/planner/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: format(selectedDay, 'yyyy-MM-dd') }),
      });
      const data = await res.json();
      if (data.suggestions) {
        for (const s of data.suggestions) {
          await addPlan({
            date: format(selectedDay, 'yyyy-MM-dd'),
            mealType: s.mealType,
            title: s.title,
            ingredients: s.ingredients,
          });
        }
      }
    } catch { /* ignore */ }
    setAiLoading(false);
  };

  const handleAddToShopping = async () => {
    const allIngredients = dayPlans.flatMap((p) => p.ingredients || []);
    if (allIngredients.length === 0) return;
    try {
      await fetch('/api/shopping/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: allIngredients }),
      });
      alert('장보기 리스트에 추가했어요!');
    } catch { /* ignore */ }
  };

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="pt-2">
        <h1 className="text-xl font-bold text-gray-900">🗓️ 식단 플래너</h1>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => setWeekOffset((w) => w - 1)} className="rounded-full p-2 hover:bg-gray-100">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium text-gray-700">
          {format(weekDays[0], 'M/d', { locale: ko })} - {format(weekDays[6], 'M/d', { locale: ko })}
        </span>
        <button onClick={() => setWeekOffset((w) => w + 1)} className="rounded-full p-2 hover:bg-gray-100">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Day Selector */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => {
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDay);
          const hasPlan = plans.some((p) => p.date === format(day, 'yyyy-MM-dd'));
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDay(day)}
              className={cn(
                'flex flex-col items-center rounded-xl py-2 text-xs transition-colors',
                isSelected ? 'bg-green-600 text-white' : 'hover:bg-gray-100',
                isToday && !isSelected && 'ring-2 ring-green-300'
              )}
            >
              <span className="font-medium">{format(day, 'EEE', { locale: ko })}</span>
              <span className={cn('text-lg font-bold', !isSelected && 'text-gray-900')}>{format(day, 'd')}</span>
              {hasPlan && !isSelected && <div className="mt-0.5 h-1 w-1 rounded-full bg-green-500" />}
            </button>
          );
        })}
      </div>

      {/* Selected Day Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">
          {format(selectedDay, 'M월 d일 (EEEE)', { locale: ko })}
        </h2>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            className="gap-1 text-xs"
            onClick={handleAiSuggest}
            disabled={aiLoading}
          >
            {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            AI 추천
          </Button>
          {dayPlans.some((p) => p.ingredients.length > 0) && (
            <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={handleAddToShopping}>
              <ShoppingCart className="h-3 w-3" /> 장보기
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
        </div>
      ) : (
        /* Meal Slots */
        <div className="flex flex-col gap-3">
          {MEAL_TYPES.map((type) => {
            const plan = dayPlans.find((p) => p.mealType === type);
            return (
              <Card key={type} className="p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    {MEAL_EMOJI[type]} {MEAL_LABELS[type]}
                  </span>
                  {plan && (
                    <button onClick={() => deletePlan(plan.id)} className="rounded-full p-1 text-gray-300 hover:text-red-500">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                {plan ? (
                  <div className="mt-1">
                    <p className="font-semibold text-gray-900">{plan.title}</p>
                    {plan.ingredients.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {plan.ingredients.map((ing, i) => (
                          <span key={i} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                            {ing.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  showAdd === type ? (
                    <div className="mt-2 flex gap-2">
                      <Input
                        placeholder="메뉴 입력..."
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        className="h-8 text-sm"
                        autoFocus
                      />
                      <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700" onClick={handleAdd}>
                        추가
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8" onClick={() => setShowAdd(null)}>
                        취소
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAdd(type)}
                      className="mt-1 flex items-center gap-1 text-sm text-gray-400 hover:text-green-600"
                    >
                      <Plus className="h-3.5 w-3.5" /> 메뉴 추가
                    </button>
                  )
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
