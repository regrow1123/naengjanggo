'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { ShoppingItem } from '@/lib/types';
import { mockShoppingItems } from '@/lib/mock-data';

function toItem(row: Record<string, unknown>): ShoppingItem {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    quantity: Number(row.quantity),
    unit: row.unit as string,
    checked: row.checked as boolean,
    recipeId: (row.recipe_id as string) || undefined,
    createdAt: row.created_at as string,
  } as ShoppingItem;
}

export function useShopping() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setItems(mockShoppingItems);
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase
      .from('shopping_items')
      .select('*')
      .order('checked')
      .order('created_at', { ascending: false });
    if (data) setItems(data.map(toItem));
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const addItem = async (name: string, quantity = 1, unit = '개') => {
    if (!isSupabaseConfigured()) {
      setItems((prev) => [...prev, { id: `s${Date.now()}`, userId: 'u1', name, quantity, unit, checked: false, createdAt: '' } as ShoppingItem]);
      return;
    }
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('shopping_items').insert({ user_id: user.id, name, quantity, unit });
    await fetch();
  };

  const toggleItem = async (id: string, checked: boolean) => {
    if (!isSupabaseConfigured()) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked } : i)));
      return;
    }
    const supabase = createClient();
    await supabase.from('shopping_items').update({ checked }).eq('id', id);
    await fetch();
  };

  const deleteItem = async (id: string) => {
    if (!isSupabaseConfigured()) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    const supabase = createClient();
    await supabase.from('shopping_items').delete().eq('id', id);
    await fetch();
  };

  const clearChecked = async () => {
    if (!isSupabaseConfigured()) {
      setItems((prev) => prev.filter((i) => !i.checked));
      return;
    }
    const supabase = createClient();
    await supabase.from('shopping_items').delete().eq('checked', true);
    await fetch();
  };

  return { items, loading, addItem, toggleItem, deleteItem, clearChecked, refetch: fetch };
}
