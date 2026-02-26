import React, { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { useAppContext } from '../../store/AppContext';
import { format, parseISO } from 'date-fns';
import { cn } from '../../lib/utils';
import { Category } from '../../types';
import { Transaction } from '../../store/AppContext';
import CategoryDropdown from './CategoryDropdown';
import { Trash2, Merge } from 'lucide-react';
import Modal from '../../components/Modal';
import { v4 as uuidv4 } from 'uuid';

// --- INNER COMPONENTS ---

const HeaderCheckbox: React.FC<{
  isChecked: boolean;
  isDisabled: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ isChecked, isDisabled, onChange }) => (
  <div className="flex items-center h-full mt-0.5">
    <input
      type="checkbox"
      checked={isChecked}
      onChange={onChange}
      disabled={isDisabled}
      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
    />
  </div>
);

const DesktopTableHeader: React.FC<{
  isChecked: boolean;
  isDisabled: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedCount: number;
  onMerge: () => void;
  onDelete: () => void;
}> = ({ isChecked, isDisabled, onChange, selectedCount, onMerge, onDelete }) => {
  const { t } = useI18n();
  
  if (selectedCount > 0) {
    return (
      <tr className="hidden sm:table-row bg-indigo-50/50">
        <th className="p-4 w-12 align-middle">
          <HeaderCheckbox isChecked={isChecked} isDisabled={isDisabled} onChange={onChange} />
        </th>
        <th colSpan={4} className="p-2 font-normal">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-indigo-800">
              {selectedCount} {t('selected')}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onMerge}
                disabled={selectedCount < 2}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-indigo-700 text-sm font-medium rounded-lg border border-indigo-200 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Merge className="w-4 h-4" />
                {t('merge')}
              </button>
              <button
                onClick={onDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-rose-600 text-sm font-medium rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {t('delete')}
              </button>
            </div>
          </div>
        </th>
      </tr>
    );
  }

  return (
    <tr className="hidden sm:table-row">
      <th className="p-4 w-12 align-middle">
        <HeaderCheckbox isChecked={isChecked} isDisabled={isDisabled} onChange={onChange} />
      </th>
      <th className="p-4 w-32">{t('date')}</th>
      <th className="p-4 w-[40%]">{t('title')}</th>
      <th className="p-4 w-64">{t('category')}</th>
      <th className="p-4 text-right">{t('amount')}</th>
    </tr>
  );
};

const MobileTableHeader: React.FC<{
  isChecked: boolean;
  isDisabled: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedCount: number;
  onMerge: () => void;
  onDelete: () => void;
}> = ({ isChecked, isDisabled, onChange, selectedCount, onMerge, onDelete }) => {
  const { t } = useI18n();
  
  if (selectedCount > 0) {
    return (
      <tr className="sm:hidden border-b border-slate-200 bg-indigo-50/50">
        <th className="p-3 w-10 align-middle">
          <HeaderCheckbox isChecked={isChecked} isDisabled={isDisabled} onChange={onChange} />
        </th>
        <th className="p-2 font-normal">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-indigo-800">
              {selectedCount} {t('selected')}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onMerge}
                disabled={selectedCount < 2}
                className="p-1.5 bg-white text-indigo-700 rounded-lg border border-indigo-200 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Merge className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 bg-white text-rose-600 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </th>
      </tr>
    );
  }

  return (
    <tr className="sm:hidden border-b border-slate-200">
      <th className="p-3 w-10 align-middle">
        <HeaderCheckbox isChecked={isChecked} isDisabled={isDisabled} onChange={onChange} />
      </th>
      <th className="p-3 text-xs font-medium text-slate-500">
        <div className="flex items-center justify-between">
          <span>{t('date')}</span>
          <span>{t('title')}</span>
          <span>{t('category')}</span>
          <span>{t('amount')}</span>
        </div>
      </th>
    </tr>
  );
};

const NoTransactionsRow: React.FC = () => {
  const { t } = useI18n();
  return (
    <tbody>
      <tr>
        <td colSpan={5} className="p-8 text-center text-slate-500">
          {t('noTransactions')}
        </td>
      </tr>
    </tbody>
  );
};

const TransactionRowFull: React.FC<{
  transaction: Transaction;
  isSelected: boolean;
  onSelect: () => void;
  categories: Category[];
  onUpdateCategory: (transactionId: string, categoryId: string | null) => void;
  formatCurrency: (amount: number) => string;
  getCategoryEmoji: (id: string | null) => string;
  isTabletMinimized: boolean;
}> = ({
  transaction,
  isSelected,
  onSelect,
  categories,
  onUpdateCategory,
  formatCurrency,
  getCategoryEmoji,
  isTabletMinimized,
}) => {
  return (
    <tr className={cn("hidden", isTabletMinimized ? "lg:table-row" : "xl:table-row")}>
      <td className="p-4 align-middle">
        <div className="flex items-center h-full mt-0.5">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
        </div>
      </td>
      <td className="p-4 text-slate-500">
        {format(parseISO(transaction.date), 'dd.MM.yyyy')}
      </td>
      <td className="p-4 font-medium text-slate-800 truncate max-w-[200px] xl:max-w-md" title={transaction.description}>
        {transaction.description}
      </td>
      <td className="p-4">
        <CategoryDropdown
          categoryId={transaction.categoryId}
          categories={categories}
          onChange={(categoryId) => onUpdateCategory(transaction.id, categoryId)}
          getCategoryEmoji={getCategoryEmoji}
        />
      </td>
      <td className={cn("p-4 text-right font-medium whitespace-nowrap", transaction.amount > 0 ? "text-emerald-600" : "text-slate-800")}>
        {formatCurrency(transaction.amount)}
      </td>
    </tr>
  );
};

const TransactionRowMid: React.FC<{
  transaction: Transaction;
  isSelected: boolean;
  onSelect: () => void;
  categories: Category[];
  onUpdateCategory: (transactionId: string, categoryId: string | null) => void;
  formatCurrency: (amount: number) => string;
  getCategoryEmoji: (id: string | null) => string;
  isTabletMinimized: boolean;
}> = ({
  transaction,
  isSelected,
  onSelect,
  categories,
  onUpdateCategory,
  formatCurrency,
  getCategoryEmoji,
  isTabletMinimized,
}) => {
  return (
    <>
      <tr className={cn("hidden sm:table-row", isTabletMinimized ? "lg:hidden" : "xl:hidden")}>
        <td rowSpan={2} className="p-4 w-12 align-top">
          <div className="flex items-center h-full mt-0.5">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
          </div>
        </td>
        <td className="px-4 pt-4 pb-2 text-slate-500 align-top">
          {format(parseISO(transaction.date), 'dd.MM.yyyy')}
        </td>
        <td colSpan={2} className="px-4 pt-4 pb-2 font-medium text-slate-800 truncate max-w-[200px] align-top" title={transaction.description}>
          {transaction.description}
        </td>
        <td className={cn("px-4 pt-4 pb-2 text-right font-medium whitespace-nowrap align-top", transaction.amount > 0 ? "text-emerald-600" : "text-slate-800")}>
          {formatCurrency(transaction.amount)}
        </td>
      </tr>
      <tr className={cn("hidden sm:table-row", isTabletMinimized ? "lg:hidden" : "xl:hidden")}>
        <td className="px-4 pb-4 pt-0"></td>
        <td className="px-4 pb-4 pt-0"></td>
        <td colSpan={2} className="px-4 pb-4 pt-0">
          <CategoryDropdown
            categoryId={transaction.categoryId}
            categories={categories}
            onChange={(categoryId) => onUpdateCategory(transaction.id, categoryId)}
            getCategoryEmoji={getCategoryEmoji}
          />
        </td>
      </tr>
    </>
  );
};

const TransactionRowSmall: React.FC<{
  transaction: Transaction;
  isSelected: boolean;
  onSelect: () => void;
  categories: Category[];
  onUpdateCategory: (transactionId: string, categoryId: string | null) => void;
  formatCurrency: (amount: number) => string;
  getCategoryEmoji: (id: string | null) => string;
}> = ({
  transaction,
  isSelected,
  onSelect,
  categories,
  onUpdateCategory,
  formatCurrency,
  getCategoryEmoji,
}) => {
  return (
    <>
      <tr className="sm:hidden">
        <td rowSpan={3} className="p-3 w-10 align-top">
          <div className="flex items-start pt-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
          </div>
        </td>
        <td className="pt-3 px-3 pb-1">
          <div className="flex justify-between items-start gap-2">
            <span className="font-medium text-slate-800 truncate" title={transaction.description}>
              {transaction.description}
            </span>
            <span className={cn("font-medium whitespace-nowrap shrink-0", transaction.amount > 0 ? "text-emerald-600" : "text-slate-800")}>
              {formatCurrency(transaction.amount)}
            </span>
          </div>
        </td>
      </tr>
      <tr className="sm:hidden">
        <td className="px-3 py-1 text-xs text-slate-500">
          {format(parseISO(transaction.date), 'dd.MM.yyyy')}
        </td>
      </tr>
      <tr className="sm:hidden">
        <td className="px-3 pt-1 pb-3">
          <CategoryDropdown
            categoryId={transaction.categoryId}
            categories={categories}
            onChange={(categoryId) => onUpdateCategory(transaction.id, categoryId)}
            getCategoryEmoji={getCategoryEmoji}
          />
        </td>
      </tr>
    </>
  );
};

// --- MAIN COMPONENT ---

interface TransactionsTableProps {
  filteredTransactions: Transaction[];
  categories: Category[];
  selectedTransactions: Set<string>;
  setSelectedTransactions: (set: Set<string>) => void;
  handleSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelect: (id: string) => void;
  onUpdateCategory: (transactionId: string, categoryId: string | null) => void;
  formatCurrency: (amount: number) => string;
  getCategoryEmoji: (id: string | null) => string;
  isTabletMinimized: boolean;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({
  filteredTransactions,
  categories,
  selectedTransactions,
  setSelectedTransactions,
  handleSelectAll,
  handleSelect,
  onUpdateCategory,
  formatCurrency,
  getCategoryEmoji,
  isTabletMinimized,
}) => {
  const { t } = useI18n();
  const { state, dispatch } = useAppContext();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const isAllSelected = filteredTransactions.length > 0 && selectedTransactions.size === filteredTransactions.length;
  const isNoneAvailable = filteredTransactions.length === 0;

  const handleDeleteSelected = () => {
    dispatch({ type: 'DELETE_TRANSACTIONS', payload: Array.from(selectedTransactions) });
    setSelectedTransactions(new Set());
    setIsConfirmingDelete(false);
  };

  const handleMergeSelected = () => {
    const ids = Array.from(selectedTransactions);
    if (ids.length < 2) return;

    const toMerge = state.transactions.filter(t => ids.includes(t.id));
    toMerge.sort((a, b) => b.date.localeCompare(a.date));

    const newestDate = toMerge[0].date;
    const totalAmount = toMerge.reduce((sum, t) => sum + t.amount, 0);

    if (Math.abs(totalAmount) < 0.01) {
      dispatch({ type: 'DELETE_TRANSACTIONS', payload: ids });
      setSelectedTransactions(new Set());
      return;
    }

    const combinedDesc = toMerge.map(t => t.description).join(' | ');
    
    const allSameCategory = toMerge.every(t => t.categoryId === toMerge[0].categoryId);
    const categoryId = allSameCategory ? toMerge[0].categoryId : null;

    dispatch({
      type: 'MERGE_TRANSACTIONS',
      payload: {
        ids,
        mergedTransaction: {
          id: uuidv4(),
          date: newestDate,
          description: combinedDesc,
          amount: totalAmount,
          categoryId
        }
      }
    });
    setSelectedTransactions(new Set());
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto md:overflow-visible">
        <table className="w-full text-left text-sm">
          <thead className={cn("border-b border-slate-200 text-slate-500 font-medium", selectedTransactions.size > 0 ? "bg-indigo-50/50" : "bg-slate-50/80")}>
            <DesktopTableHeader
              isChecked={isAllSelected}
              isDisabled={isNoneAvailable}
              onChange={handleSelectAll}
              selectedCount={selectedTransactions.size}
              onMerge={handleMergeSelected}
              onDelete={() => setIsConfirmingDelete(true)}
            />
            <MobileTableHeader
              isChecked={isAllSelected}
              isDisabled={isNoneAvailable}
              onChange={handleSelectAll}
              selectedCount={selectedTransactions.size}
              onMerge={handleMergeSelected}
              onDelete={() => setIsConfirmingDelete(true)}
            />
          </thead>
          {isNoneAvailable ? (
            <NoTransactionsRow />
          ) : (
            filteredTransactions.map(transaction => (
              <tbody key={transaction.id} className={cn("hover:bg-slate-50/80 transition-colors border-b xl:border-none border-slate-100", selectedTransactions.has(transaction.id) && "bg-indigo-50/30")}>
                {/* Desktop Row */}
                <TransactionRowFull
                  transaction={transaction}
                  isSelected={selectedTransactions.has(transaction.id)}
                  onSelect={() => handleSelect(transaction.id)}
                  categories={categories}
                  onUpdateCategory={onUpdateCategory}
                  formatCurrency={formatCurrency}
                  getCategoryEmoji={getCategoryEmoji}
                  isTabletMinimized={isTabletMinimized}
                />

                {/* Mid Row */}
                <TransactionRowMid
                  transaction={transaction}
                  isSelected={selectedTransactions.has(transaction.id)}
                  onSelect={() => handleSelect(transaction.id)}
                  categories={categories}
                  onUpdateCategory={onUpdateCategory}
                  formatCurrency={formatCurrency}
                  getCategoryEmoji={getCategoryEmoji}
                  isTabletMinimized={isTabletMinimized}
                />

                {/* Mobile Row */}
                <TransactionRowSmall
                  transaction={transaction}
                  isSelected={selectedTransactions.has(transaction.id)}
                  onSelect={() => handleSelect(transaction.id)}
                  categories={categories}
                  onUpdateCategory={onUpdateCategory}
                  formatCurrency={formatCurrency}
                  getCategoryEmoji={getCategoryEmoji}
                />
              </tbody>
            ))
          )}
        </table>
      </div>

      {isConfirmingDelete && (
        <Modal 
          title={t('confirmDelete')} 
          onClose={() => setIsConfirmingDelete(false)}
          footer={
            <>
              <button
                onClick={() => setIsConfirmingDelete(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors"
              >
                {t('delete')}
              </button>
            </>
          }
        >
          <p className="text-slate-600">{t('confirmDeleteTransactions')}</p>
        </Modal>
      )}
    </div>
  );
};

export default TransactionsTable;
