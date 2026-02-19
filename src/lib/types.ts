export interface User {
  id: string;
  email: string;
  nickname: string;
  createdAt: string;
}

export interface Fridge {
  id: string;
  userId: string;
  name: string;
  type: 'refrigerator' | 'freezer';
  createdAt: string;
}

export const CATEGORIES = [
  '육류', '해산물', '채소', '과일', '유제품',
  '냉동식품', '음료', '양념', '곡류', '기타',
] as const;

export type Category = typeof CATEGORIES[number];

export const UNITS = ['g', 'kg', 'ml', 'L', '개', '팩', '병', '봉'] as const;
export type Unit = typeof UNITS[number];

export interface Ingredient {
  id: string;
  fridgeId: string;
  name: string;
  category: Category;
  quantity: number;
  unit: Unit;
  purchaseDate: string;
  expiryDate: string;
  barcode?: string;
  memo?: string;
  createdAt: string;
}

export interface RecipeIngredient {
  name: string;
  quantity: string;
  have: boolean;
}

export interface AIRecipe {
  title: string;
  time: string;
  difficulty: string;
  ingredients: RecipeIngredient[];
  steps: string[];
  tip: string;
  source?: 'public_db' | 'ai_generated';
  sourceId?: string;
}

export interface SavedRecipe {
  id: string;
  userId: string;
  title: string;
  source: 'api' | 'ai' | 'manual';
  sourceId?: string;
  content: {
    ingredients: { name: string; quantity: string }[];
    steps: string[];
    time?: string;
    difficulty?: string;
    tip?: string;
    image?: string;
  };
  createdAt: string;
}

export interface ShoppingItem {
  id: string;
  userId: string;
  name: string;
  quantity: number;
  unit: Unit;
  checked: boolean;
  recipeId?: string;
  createdAt: string;
}
