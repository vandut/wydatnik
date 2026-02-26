import { AppState } from '../types';

export const defaultCategories = [
  { id: 'cat-1', name: 'Zakupy', parentId: null, emoji: '🛍️' },
  { id: 'cat-1-1', name: 'Spożywcze', parentId: 'cat-1' },
  { id: 'cat-2', name: 'Mieszkanie', parentId: null, emoji: '🏠' },
  { id: 'cat-2-1', name: 'Czynsz', parentId: 'cat-2' },
  { id: 'cat-3', name: 'Transport', parentId: null, emoji: '🚗' },
  { id: 'cat-3-1', name: 'Paliwo', parentId: 'cat-3' },
  { id: 'cat-4', name: 'Rozrywka', parentId: null, emoji: '🎉' },
  { id: 'cat-5', name: 'Zdrowie', parentId: null, emoji: '💊' },
  { id: 'cat-6', name: 'Przychód', parentId: null, emoji: '💰' },
  { id: 'cat-6-1', name: 'Wynagrodzenie', parentId: 'cat-6' },
];

export const getInitialState = (): AppState => {
  const isPolish = navigator.language.startsWith('pl');
  
  const today = new Date();
  const yyyyMM = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  return {
    currency: isPolish ? 'PLN' : 'USD',
    transactions: [
      {
        id: 'ex-1',
        date: `${yyyyMM}-05`,
        description: 'Supermarket Biedronka',
        amount: -150.50,
        categoryId: null,
      },
      {
        id: 'ex-2',
        date: `${yyyyMM}-10`,
        description: 'Netflix Subscription',
        amount: -49.00,
        categoryId: null,
      },
      {
        id: 'ex-3',
        date: `${yyyyMM}-15`,
        description: 'Salary Transfer',
        amount: 5000.00,
        categoryId: null,
      }
    ],
    categories: defaultCategories,
  };
};
