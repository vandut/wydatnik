import { AppState, Category } from '../types';

export const SYSTEM_CATEGORY_INCOME = 'system-income';
export const SYSTEM_CATEGORY_INVESTMENT = 'system-investment';

export const systemCategories: Category[] = [
  { id: SYSTEM_CATEGORY_INCOME, name: 'Przychód', parentId: null, emoji: '💰', isSystem: true },
  { id: SYSTEM_CATEGORY_INVESTMENT, name: 'Inwestycje', parentId: null, emoji: '📈', isSystem: true, isNotExpense: true },
];

export const defaultCategories: Category[] = [
  ...systemCategories,
  { id: 'cat-1', name: 'Zakupy', parentId: null, emoji: '🛍️' },
  { id: 'cat-1-1', name: 'Spożywcze', parentId: 'cat-1' },
  { id: 'cat-2', name: 'Mieszkanie', parentId: null, emoji: '🏠' },
  { id: 'cat-2-1', name: 'Czynsz', parentId: 'cat-2' },
  { id: 'cat-3', name: 'Transport', parentId: null, emoji: '🚗' },
  { id: 'cat-3-1', name: 'Paliwo', parentId: 'cat-3' },
  { id: 'cat-4', name: 'Rozrywka', parentId: null, emoji: '🎉' },
  { id: 'cat-5', name: 'Zdrowie', parentId: null, emoji: '💊' },
  { id: 'cat-6-1', name: 'Wynagrodzenie', parentId: SYSTEM_CATEGORY_INCOME },
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

export const migrateState = (parsedState: any): AppState => {
  const categories: Category[] = parsedState.categories || [];
  
  // Ensure system categories exist and are not tampered with
  const migratedCategories = [...categories];
  
  systemCategories.forEach(sysCat => {
    const existingIndex = migratedCategories.findIndex(c => c.id === sysCat.id);
    if (existingIndex >= 0) {
      // Force override properties to prevent tampering
      migratedCategories[existingIndex] = {
        ...migratedCategories[existingIndex],
        isSystem: sysCat.isSystem,
        isNotExpense: sysCat.isNotExpense,
        parentId: sysCat.parentId,
        name: sysCat.name,
        emoji: sysCat.emoji,
      };
    } else {
      // Inject missing system category
      migratedCategories.push(sysCat);
    }
  });

  return {
    ...parsedState,
    categories: migratedCategories,
  };
};
