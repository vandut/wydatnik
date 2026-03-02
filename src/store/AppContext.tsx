import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, Transaction, Category } from '../types';
import { getInitialState } from './initialState';

type Action =
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'SET_CURRENCY'; payload: string }
  | { type: 'ADD_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'UPDATE_TRANSACTION_CATEGORY'; payload: { id: string; categoryId: string | null } }
  | { type: 'DELETE_TRANSACTIONS'; payload: string[] }
  | { type: 'MERGE_TRANSACTIONS'; payload: { ids: string[]; mergedTransaction: Transaction } }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'SPLIT_TRANSACTION'; payload: { id: string; newTransactions: Transaction[] } }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string };

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;
    case 'SET_CURRENCY':
      return { ...state, currency: action.payload };
    case 'ADD_TRANSACTIONS':
      return { ...state, transactions: [...state.transactions, ...action.payload] };
    case 'UPDATE_TRANSACTION_CATEGORY':
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? { ...t, categoryId: action.payload.categoryId } : t
        ),
      };
    case 'DELETE_TRANSACTIONS':
      return {
        ...state,
        transactions: state.transactions.filter((t) => !action.payload.includes(t.id)),
      };
    case 'MERGE_TRANSACTIONS':
      return {
        ...state,
        transactions: [
          ...state.transactions.filter((t) => !action.payload.ids.includes(t.id)),
          action.payload.mergedTransaction,
        ],
      };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case 'SPLIT_TRANSACTION':
      return {
        ...state,
        transactions: [
          ...state.transactions.filter((t) => t.id !== action.payload.id),
          ...action.payload.newTransactions,
        ],
      };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map((c) => (c.id === action.payload.id ? action.payload : c)),
      };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload && c.parentId !== action.payload),
        transactions: state.transactions.map((t) =>
          t.categoryId === action.payload ? { ...t, categoryId: null } : t
        ),
      };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, getInitialState());

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
