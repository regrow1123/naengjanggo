'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SavedRecipe } from '@/lib/types';

function toRecipe(row: Record<string, unknown>): SavedRecipe {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    source: row.source as SavedRecipe['source'],
    sourceId: (row.source_id as string) || undefined,
    content: row.content as SavedRecipe['content'],
    createdAt: row.created_at as string,
  };
}

export function useRecipes() {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('saved_recipes')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setRecipes(data.map(toRecipe));
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetch(); }, [fetch]);

  const saveRecipe = async (recipe: Omit<SavedRecipe, 'id' | 'userId' | 'createdAt'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('saved_recipes').insert({
      user_id: user.id,
      title: recipe.title,
      source: recipe.source,
      source_id: recipe.sourceId,
      content: recipe.content,
    });
    if (!error) await fetch();
  };

  const deleteRecipe = async (id: string) => {
    const { error } = await supabase.from('saved_recipes').delete().eq('id', id);
    if (!error) await fetch();
  };

  return { recipes, loading, saveRecipe, deleteRecipe, refetch: fetch };
}
