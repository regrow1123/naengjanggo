import { Fridge, Ingredient, ShoppingItem, SavedRecipe } from './types';
import { addDays, subDays, format } from 'date-fns';

const today = new Date();
const fmt = (d: Date) => format(d, 'yyyy-MM-dd');

export const mockFridges: Fridge[] = [
  { id: 'f1', userId: 'u1', name: '냉장실', type: 'refrigerator', createdAt: '2025-01-01' },
  { id: 'f2', userId: 'u1', name: '냉동실', type: 'freezer', createdAt: '2025-01-01' },
];

export const mockIngredients: Ingredient[] = [
  // 임박
  { id: 'i1', fridgeId: 'f1', name: '우유', category: '유제품', quantity: 1, unit: 'L', purchaseDate: fmt(subDays(today, 5)), expiryDate: fmt(addDays(today, 1)), createdAt: '' },
  { id: 'i2', fridgeId: 'f1', name: '두부', category: '기타', quantity: 1, unit: '팩', purchaseDate: fmt(subDays(today, 3)), expiryDate: fmt(addDays(today, 0)), createdAt: '' },
  { id: 'i3', fridgeId: 'f1', name: '삼겹살', category: '육류', quantity: 500, unit: 'g', purchaseDate: fmt(subDays(today, 2)), expiryDate: fmt(addDays(today, 2)), createdAt: '' },
  // 여유
  { id: 'i4', fridgeId: 'f1', name: '계란', category: '기타', quantity: 10, unit: '개', purchaseDate: fmt(subDays(today, 3)), expiryDate: fmt(addDays(today, 14)), createdAt: '' },
  { id: 'i5', fridgeId: 'f1', name: '양파', category: '채소', quantity: 3, unit: '개', purchaseDate: fmt(subDays(today, 5)), expiryDate: fmt(addDays(today, 10)), createdAt: '' },
  { id: 'i6', fridgeId: 'f1', name: '대파', category: '채소', quantity: 2, unit: '개', purchaseDate: fmt(subDays(today, 2)), expiryDate: fmt(addDays(today, 5)), createdAt: '' },
  { id: 'i7', fridgeId: 'f1', name: '고추장', category: '양념', quantity: 1, unit: '병', purchaseDate: fmt(subDays(today, 30)), expiryDate: fmt(addDays(today, 180)), createdAt: '' },
  { id: 'i8', fridgeId: 'f1', name: '된장', category: '양념', quantity: 1, unit: '병', purchaseDate: fmt(subDays(today, 30)), expiryDate: fmt(addDays(today, 150)), createdAt: '' },
  { id: 'i9', fridgeId: 'f1', name: '사과', category: '과일', quantity: 4, unit: '개', purchaseDate: fmt(subDays(today, 1)), expiryDate: fmt(addDays(today, 7)), createdAt: '' },
  { id: 'i10', fridgeId: 'f1', name: '닭가슴살', category: '육류', quantity: 300, unit: 'g', purchaseDate: fmt(subDays(today, 1)), expiryDate: fmt(addDays(today, 3)), createdAt: '' },
  // 냉동
  { id: 'i11', fridgeId: 'f2', name: '만두', category: '냉동식품', quantity: 1, unit: '봉', purchaseDate: fmt(subDays(today, 14)), expiryDate: fmt(addDays(today, 90)), createdAt: '' },
  { id: 'i12', fridgeId: 'f2', name: '새우', category: '해산물', quantity: 500, unit: 'g', purchaseDate: fmt(subDays(today, 7)), expiryDate: fmt(addDays(today, 60)), createdAt: '' },
];

export const mockShoppingItems: ShoppingItem[] = [
  { id: 's1', userId: 'u1', name: '간장', quantity: 1, unit: '병', checked: false, createdAt: '' },
  { id: 's2', userId: 'u1', name: '버터', quantity: 1, unit: '개', checked: false, createdAt: '' },
  { id: 's3', userId: 'u1', name: '식빵', quantity: 1, unit: '봉', checked: true, createdAt: '' },
];

export const mockRecipes: SavedRecipe[] = [
  {
    id: 'r1', userId: 'u1', title: '된장찌개', source: 'api', createdAt: '',
    content: {
      ingredients: [
        { name: '두부', quantity: '1팩' },
        { name: '된장', quantity: '2큰술' },
        { name: '양파', quantity: '1/2개' },
        { name: '대파', quantity: '1대' },
        { name: '고추', quantity: '1개' },
      ],
      steps: [
        '냄비에 물을 넣고 된장을 풀어줍니다.',
        '양파, 두부를 넣고 끓입니다.',
        '끓어오르면 대파, 고추를 넣고 5분 더 끓입니다.',
      ],
      time: '20분',
      difficulty: '쉬움',
    },
  },
  {
    id: 'r2', userId: 'u1', title: '삼겹살 김치찌개', source: 'ai', createdAt: '',
    content: {
      ingredients: [
        { name: '삼겹살', quantity: '200g' },
        { name: '배추김치', quantity: '1컵' },
        { name: '두부', quantity: '1/2팩' },
        { name: '대파', quantity: '1대' },
        { name: '고추장', quantity: '1큰술' },
      ],
      steps: [
        '삼겹살을 한입 크기로 자릅니다.',
        '냄비에 삼겹살을 볶다가 김치를 넣습니다.',
        '물을 붓고 고추장을 풀어 끓입니다.',
        '두부와 대파를 넣고 5분 더 끓입니다.',
      ],
      time: '25분',
      difficulty: '쉬움',
    },
  },
  {
    id: 'r3', userId: 'u1', title: '계란볶음밥', source: 'api', createdAt: '',
    content: {
      ingredients: [
        { name: '계란', quantity: '2개' },
        { name: '양파', quantity: '1/2개' },
        { name: '대파', quantity: '1대' },
        { name: '밥', quantity: '1공기' },
        { name: '간장', quantity: '1큰술' },
      ],
      steps: [
        '양파, 대파를 잘게 다집니다.',
        '팬에 기름을 두르고 계란을 스크램블합니다.',
        '양파를 넣고 볶다가 밥을 넣습니다.',
        '간장으로 간을 하고 대파를 올립니다.',
      ],
      time: '15분',
      difficulty: '쉬움',
    },
  },
];

export function getDday(expiryDate: string): number {
  const expiry = new Date(expiryDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
