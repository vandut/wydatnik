export type Transaction = {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  categoryId: string | null;
};

export type Category = {
  id: string;
  name: string;
  parentId: string | null;
  emoji?: string; // Only for parent categories
};

export type AppState = {
  currency: string;
  transactions: Transaction[];
  categories: Category[];
};

export interface Parser {
  parse(fileContent: string, options?: { expectedCurrency?: string }): Promise<Omit<Transaction, 'id' | 'categoryId'>[]>;
}
