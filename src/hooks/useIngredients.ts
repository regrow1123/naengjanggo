'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Ingredient, Fridge } from '@/lib/types';
import { mockFridges, mockIngredients } from '@/lib/mock-data';

function toIngredient(row: Record<string, unknown>): Ingredient {
  return {
    id: row.id as string,
    fridgeId: row.fridge_id as string,
    name: row.name as string,
    category: row.category as string,
    quantity: Number(row.quantity),
    unit: row.unit as string,
    purchaseDate: row.purchase_date as string,
    expiryDate: row.expiry_date as string,
    barcode: (row.barcode as string) || undefined,
    memo: (row.memo as string) || undefined,
    createdAt: row.created_at as string,
  } as Ingredient;
}

function toFridge(row: Record<string, unknown>): Fridge {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    type: row.type as Fridge['type'],
    createdAt: row.created_at as string,
  };
}

export function useFridges() {
  const [fridges, setFridges] = useState<Fridge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setFridges([]);
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase.from('fridges').select('*').order('created_at');
    if (data) setFridges(data.map(toFridge));
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { fridges, loading, refetch: fetch };
}

export function useIngredients(fridgeId?: string) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setIngredients([]);
      setLoading(false);
      return;
    }
    const supabase = createClient();
    let query = supabase.from('ingredients').select('*').order('expiry_date');
    if (fridgeId) query = query.eq('fridge_id', fridgeId);
    const { data } = await query;
    if (data) setIngredients(data.map(toIngredient));
    setLoading(false);
  }, [fridgeId]);

  useEffect(() => { fetch(); }, [fetch]);

  const addIngredient = async (ingredient: Omit<Ingredient, 'id' | 'createdAt'>) => {
    if (!isSupabaseConfigured()) return null;
    const supabase = createClient();
    const { error } = await supabase.from('ingredients').insert({
      fridge_id: ingredient.fridgeId,
      name: ingredient.name,
      category: ingredient.category,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      purchase_date: ingredient.purchaseDate,
      expiry_date: ingredient.expiryDate,
      barcode: ingredient.barcode,
      memo: ingredient.memo,
    });
    if (!error) await fetch();
    return error;
  };

  const deleteIngredient = async (id: string) => {
    if (!isSupabaseConfigured()) return null;
    const supabase = createClient();
    const { error } = await supabase.from('ingredients').delete().eq('id', id);
    if (!error) await fetch();
    return error;
  };

  const updateIngredient = async (id: string, updates: Partial<Ingredient>) => {
    if (!isSupabaseConfigured()) return null;
    const supabase = createClient();
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.category) dbUpdates.category = updates.category;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.unit) dbUpdates.unit = updates.unit;
    if (updates.expiryDate) dbUpdates.expiry_date = updates.expiryDate;
    if (updates.memo !== undefined) dbUpdates.memo = updates.memo;
    const { error } = await supabase.from('ingredients').update(dbUpdates).eq('id', id);
    if (!error) await fetch();
    return error;
  };

  return { ingredients, loading, addIngredient, deleteIngredient, updateIngredient, refetch: fetch };
}
