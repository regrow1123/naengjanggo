'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { MealPlan, MealType } from '@/lib/types';

function toMealPlan(row: Record<string, unknown>): MealPlan {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    date: row.date as string,
    mealType: row.meal_type as MealType,
    title: row.title as string,
    ingredients: (row.ingredients as { name: string; quantity: string }[]) || [],
    memo: (row.memo as string) || undefined,
    createdAt: row.created_at as string,
  };
}

export function useMealPlans(startDate: string, endDate: string) {
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setPlans([]);
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase
      .from('meal_plans')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date')
      .order('meal_type');
    if (data) setPlans(data.map(toMealPlan));
    setLoading(false);
  }, [startDate, endDate]);

  useEffect(() => { fetch(); }, [fetch]);

  const addPlan = async (plan: { date: string; mealType: MealType; title: string; ingredients?: { name: string; quantity: string }[]; memo?: string }) => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('meal_plans').upsert({
      user_id: user.id,
      date: plan.date,
      meal_type: plan.mealType,
      title: plan.title,
      ingredients: plan.ingredients || [],
      memo: plan.memo,
    }, { onConflict: 'user_id,date,meal_type' });

    await fetch();
  };

  const deletePlan = async (id: string) => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    await supabase.from('meal_plans').delete().eq('id', id);
    await fetch();
  };

  return { plans, loading, addPlan, deletePlan, refetch: fetch };
}
