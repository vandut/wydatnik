import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import { I18nProvider } from './i18n/I18nContext';
import Layout from './views/layout/Layout';
import TransactionsView from './views/transactions/TransactionsView';
import CategoriesView from './views/categories/CategoriesView';
import AccountsView from './views/accounts/AccountsView';

export default function App() {
  return (
    <I18nProvider>
      <AppProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/transactions" replace />} />
              <Route path="transactions" element={<TransactionsView />} />
              <Route path="categories" element={<CategoriesView />} />
              <Route path="accounts" element={<AccountsView />} />
            </Route>
          </Routes>
        </HashRouter>
      </AppProvider>
    </I18nProvider>
  );
}
