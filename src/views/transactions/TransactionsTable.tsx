import React, { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { format, parseISO } from 'date-fns';
import { cn } from '../../lib/utils';
import { Category, Transaction } from '../../types';
import CategoryDropdown from './CategoryDropdown';
import { Trash2, Merge, ChevronUp, ChevronDown, Pencil, Split } from 'lucide-react';
import Modal from '../../components/Modal';
import { v4 as uuidv4 } from 'uuid';
import EditTransactionModal from './EditTransactionModal';
import SplitTransactionModal from './SplitTransactionModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import MergeTransactionsModal from './MergeTransactionsModal';

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
      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    />
  </div>
);

const DesktopTableHeader: React.FC<{
  isChecked: boolean;
  isDisabled: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedCount: number;
  onMerge: () => void;
  onEdit: () => void;
  onSplit: () => void;
  onDelete: () => void;
  isTabletMinimized: boolean;
  sortColumn: 'date' | 'title' | 'category' | 'amount';
  sortDirection: 'asc' | 'desc';
  onSort: (column: 'date' | 'title' | 'category' | 'amount') => void;
  categories: Category[];
  getCategoryEmoji: (id: string | null) => string;
  commonCategoryId: string | null | undefined;
  onUpdateBulkCategory: (categoryId: string | null) => void;
}> = ({ isChecked, isDisabled, onChange, selectedCount, onMerge, onEdit, onSplit, onDelete, isTabletMinimized, sortColumn, sortDirection, onSort, categories, getCategoryEmoji, commonCategoryId, onUpdateBulkCategory }) => {
  const { t } = useI18n();
  
  const renderSortableHeader = (column: 'date' | 'title' | 'category' | 'amount', label: string, className: string) => {
    const isActive = sortColumn === column;
    return (
      <th 
        className={cn("p-4 align-middle cursor-pointer hover:bg-slate-100/50 transition-colors select-none", className)}
        onClick={() => onSort(column)}
      >
        <div className={cn("flex items-center gap-1", column === 'amount' ? "justify-end" : "")}>
          {label}
          <div className="flex flex-col">
            <ChevronUp className={cn("w-3 h-3 -mb-1", isActive && sortDirection === 'asc' ? "text-indigo-600" : "text-slate-300")} />
            <ChevronDown className={cn("w-3 h-3", isActive && sortDirection === 'desc' ? "text-indigo-600" : "text-slate-300")} />
          </div>
        </div>
      </th>
    );
  };

  return (
    <>
      <tr className={cn("hidden h-[66px]", isTabletMinimized ? "sm:table-row" : "lg:table-row", selectedCount > 0 ? "bg-indigo-50/50" : "")}>
        <th className="p-4 w-12 align-middle">
          <HeaderCheckbox isChecked={isChecked} isDisabled={isDisabled} onChange={onChange} />
        </th>
        {selectedCount > 0 ? (
          <th colSpan={4} className="p-4 font-normal align-middle">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-800">
                {selectedCount} {t('selected')}
              </span>
              <div className="flex items-center gap-2">
                <div className={cn(isTabletMinimized ? "w-[60px] lg:w-48 xl:w-48" : "w-[60px] xl:w-48")}>
                  <CategoryDropdown
                    categoryId={commonCategoryId === undefined ? null : commonCategoryId}
                    categories={categories}
                    onChange={onUpdateBulkCategory}
                    getCategoryEmoji={getCategoryEmoji}
                    onOpenChange={() => {}}
                    isMixed={commonCategoryId === undefined}
                    compact={true}
                    hideLabelBreakpoint={isTabletMinimized ? 'lg' : 'xl'}
                  />
                </div>
                <button
                  onClick={onEdit}
                  disabled={selectedCount !== 1}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-indigo-700 text-sm font-medium rounded-lg border border-indigo-200 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                  {t('edit')}
                </button>
                <button
                  onClick={onSplit}
                  disabled={selectedCount !== 1}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-indigo-700 text-sm font-medium rounded-lg border border-indigo-200 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <Split className="w-4 h-4" />
                  {t('split')}
                </button>
                <button
                  onClick={onMerge}
                  disabled={selectedCount < 2}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-indigo-700 text-sm font-medium rounded-lg border border-indigo-200 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <Merge className="w-4 h-4" />
                  {t('merge')}
                </button>
                <button
                  onClick={onDelete}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-rose-600 text-sm font-medium rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('delete')}
                </button>
              </div>
            </div>
          </th>
        ) : (
          <>
            {renderSortableHeader('date', t('date'), 'w-28 lg:w-32')}
            {renderSortableHeader('title', t('title'), '')}
            {renderSortableHeader('category', t('category'), 'w-48 lg:w-64')}
            {renderSortableHeader('amount', t('amount'), 'w-28 lg:w-32 text-right')}
          </>
        )}
      </tr>
      {/* Invisible row to preserve column widths when selection is active */}
      {selectedCount > 0 && (
        <tr className={cn("hidden invisible h-0", isTabletMinimized ? "sm:table-row" : "lg:table-row")}>
          <th className="p-0 w-12"></th>
          <th className="p-0 w-28 lg:w-32"></th>
          <th className="p-0"></th>
          <th className="p-0 w-48 lg:w-64"></th>
          <th className="p-0 w-28 lg:w-32"></th>
        </tr>
      )}
    </>
  );
};

const MobileTableHeader: React.FC<{
  isChecked: boolean;
  isDisabled: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedCount: number;
  onMerge: () => void;
  onEdit: () => void;
  onSplit: () => void;
  onDelete: () => void;
  isTabletMinimized: boolean;
  sortColumn: 'date' | 'title' | 'category' | 'amount';
  sortDirection: 'asc' | 'desc';
  onSort: (column: 'date' | 'title' | 'category' | 'amount') => void;
}> = ({ isChecked, isDisabled, onChange, selectedCount, onMerge, onEdit, onSplit, onDelete, isTabletMinimized, sortColumn, sortDirection, onSort }) => {
  const { t } = useI18n();
  
  if (selectedCount > 0) {
    return (
      <tr className={cn("border-b border-slate-200 bg-indigo-50/50 h-[54px]", isTabletMinimized ? "sm:hidden" : "lg:hidden")}>
        <th className="p-3 w-10 align-middle">
          <HeaderCheckbox isChecked={isChecked} isDisabled={isDisabled} onChange={onChange} />
        </th>
        <th className="p-3 font-normal align-middle">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-indigo-800">
              {selectedCount} {t('selected')}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                disabled={selectedCount !== 1}
                className="p-1.5 bg-white text-indigo-700 rounded-lg border border-indigo-200 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={onSplit}
                disabled={selectedCount !== 1}
                className="p-1.5 bg-white text-indigo-700 rounded-lg border border-indigo-200 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Split className="w-4 h-4" />
              </button>
              <button
                onClick={onMerge}
                disabled={selectedCount < 2}
                className="p-1.5 bg-white text-indigo-700 rounded-lg border border-indigo-200 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Merge className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 bg-white text-rose-600 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
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
    <tr className={cn("border-b border-slate-200 h-[54px]", isTabletMinimized ? "sm:hidden" : "lg:hidden")}>
      <th className="p-3 w-10 align-middle">
        <HeaderCheckbox isChecked={isChecked} isDisabled={isDisabled} onChange={onChange} />
      </th>
      <th className="p-3 text-xs font-medium text-slate-500 align-middle">
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 cursor-pointer select-none shrink-0" onClick={() => onSort('date')}>
            <span>{t('date')}</span>
            <div className="flex flex-col">
              <ChevronUp className={cn("w-3 h-3 -mb-1", sortColumn === 'date' && sortDirection === 'asc' ? "text-indigo-600" : "text-slate-300")} />
              <ChevronDown className={cn("w-3 h-3", sortColumn === 'date' && sortDirection === 'desc' ? "text-indigo-600" : "text-slate-300")} />
            </div>
          </div>
          <div className="flex items-center gap-1 cursor-pointer select-none shrink-0" onClick={() => onSort('title')}>
            <span>{t('title')}</span>
            <div className="flex flex-col">
              <ChevronUp className={cn("w-3 h-3 -mb-1", sortColumn === 'title' && sortDirection === 'asc' ? "text-indigo-600" : "text-slate-300")} />
              <ChevronDown className={cn("w-3 h-3", sortColumn === 'title' && sortDirection === 'desc' ? "text-indigo-600" : "text-slate-300")} />
            </div>
          </div>
          <div className="flex items-center gap-1 cursor-pointer select-none shrink-0" onClick={() => onSort('category')}>
            <span>{t('category')}</span>
            <div className="flex flex-col">
              <ChevronUp className={cn("w-3 h-3 -mb-1", sortColumn === 'category' && sortDirection === 'asc' ? "text-indigo-600" : "text-slate-300")} />
              <ChevronDown className={cn("w-3 h-3", sortColumn === 'category' && sortDirection === 'desc' ? "text-indigo-600" : "text-slate-300")} />
            </div>
          </div>
          <div className="flex items-center gap-1 cursor-pointer select-none shrink-0" onClick={() => onSort('amount')}>
            <span>{t('amount')}</span>
            <div className="flex flex-col">
              <ChevronUp className={cn("w-3 h-3 -mb-1", sortColumn === 'amount' && sortDirection === 'asc' ? "text-indigo-600" : "text-slate-300")} />
              <ChevronDown className={cn("w-3 h-3", sortColumn === 'amount' && sortDirection === 'desc' ? "text-indigo-600" : "text-slate-300")} />
            </div>
          </div>
        </div>
      </th>
    </tr>
  );
};

const NoTransactionsRow: React.FC<{
  selectedCategory: string;
  categories: Category[];
}> = ({ selectedCategory, categories }) => {
  const { t } = useI18n();
  
  let emptyMessage = t('noTransactions');

  if (selectedCategory === 'uncategorized') {
    emptyMessage = `${t('noTransactionsInCategory')} ❓ ${t('uncategorized')}`;
  } else if (selectedCategory !== 'all') {
    const cat = categories.find(c => c.id === selectedCategory);
    if (cat) {
      if (cat.parentId) {
        const parentCat = categories.find(c => c.id === cat.parentId);
        emptyMessage = `${t('noTransactionsInCategory')} ${parentCat?.emoji || '❓'} ${parentCat?.name} (${cat.name})`;
      } else {
        emptyMessage = `${t('noTransactionsInCategory')} ${cat.emoji || '❓'} ${cat.name}`;
      }
    }
  }

  return (
    <tbody>
      <tr>
        <td colSpan={5} className="p-12 text-center text-slate-500">
          <div className="flex flex-col items-center justify-center">
            <span>{emptyMessage}</span>
          </div>
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
  formatCurrency: (amount: number, forceNoSign?: boolean) => string;
  getCategoryEmoji: (id: string | null) => string;
  isTabletMinimized: boolean;
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
}> = ({
  transaction,
  isSelected,
  onSelect,
  categories,
  onUpdateCategory,
  formatCurrency,
  getCategoryEmoji,
  isTabletMinimized,
  openDropdownId,
  setOpenDropdownId,
}) => {
  const cat = categories.find(c => c.id === transaction.categoryId);
  const isNotExpense = cat?.isNotExpense || (cat?.parentId ? categories.find(c => c.id === cat.parentId)?.isNotExpense : false);

  return (
    <tr className={cn("hidden", isTabletMinimized ? "lg:table-row" : "xl:table-row")}>
      <td className="p-4 align-middle">
        <div className="flex items-center h-full mt-0.5">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
        </div>
      </td>
      <td className="p-4 text-slate-500">
        {format(parseISO(transaction.date), 'dd.MM.yyyy')}
      </td>
      <td className="p-4 font-medium text-slate-800 truncate" title={transaction.description}>
        {transaction.description}
      </td>
      <td className="p-4">
        <CategoryDropdown
          categoryId={transaction.categoryId}
          categories={categories}
          onChange={(categoryId) => onUpdateCategory(transaction.id, categoryId)}
          getCategoryEmoji={getCategoryEmoji}
          onOpenChange={(isOpen) => setOpenDropdownId(isOpen ? transaction.id : null)}
        />
      </td>
      <td className={cn("p-4 text-right font-medium whitespace-nowrap", isNotExpense ? "text-slate-800" : transaction.amount > 0 ? "text-emerald-600" : "text-slate-800")}>
        {isNotExpense ? formatCurrency(Math.abs(transaction.amount), true) : formatCurrency(transaction.amount)}
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
  formatCurrency: (amount: number, forceNoSign?: boolean) => string;
  getCategoryEmoji: (id: string | null) => string;
  isTabletMinimized: boolean;
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
}> = ({
  transaction,
  isSelected,
  onSelect,
  categories,
  onUpdateCategory,
  formatCurrency,
  getCategoryEmoji,
  isTabletMinimized,
  openDropdownId,
  setOpenDropdownId,
}) => {
  const cat = categories.find(c => c.id === transaction.categoryId);
  const isNotExpense = cat?.isNotExpense || (cat?.parentId ? categories.find(c => c.id === cat.parentId)?.isNotExpense : false);

  return (
    <>
      <tr className={cn("hidden", isTabletMinimized ? "sm:table-row lg:hidden" : "lg:table-row xl:hidden")}>
        <td rowSpan={2} className="p-4 w-12 align-top">
          <div className="flex items-center h-full mt-0.5">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>
        </td>
        <td className="px-4 pt-4 pb-2 text-slate-500 align-top">
          {format(parseISO(transaction.date), 'dd.MM.yyyy')}
        </td>
        <td colSpan={2} className="px-4 pt-4 pb-2 font-medium text-slate-800 truncate align-top" title={transaction.description}>
          {transaction.description}
        </td>
        <td className={cn("px-4 pt-4 pb-2 text-right font-medium whitespace-nowrap align-top", isNotExpense ? "text-slate-800" : transaction.amount > 0 ? "text-emerald-600" : "text-slate-800")}>
          {isNotExpense ? formatCurrency(Math.abs(transaction.amount), true) : formatCurrency(transaction.amount)}
        </td>
      </tr>
      <tr className={cn("hidden", isTabletMinimized ? "sm:table-row lg:hidden" : "lg:table-row xl:hidden")}>
        <td className="px-4 pb-4 pt-0"></td>
        <td className="px-4 pb-4 pt-0"></td>
        <td colSpan={2} className="px-4 pb-4 pt-0">
          <CategoryDropdown
            categoryId={transaction.categoryId}
            categories={categories}
            onChange={(categoryId) => onUpdateCategory(transaction.id, categoryId)}
            getCategoryEmoji={getCategoryEmoji}
            onOpenChange={(isOpen) => setOpenDropdownId(isOpen ? transaction.id : null)}
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
  formatCurrency: (amount: number, forceNoSign?: boolean) => string;
  getCategoryEmoji: (id: string | null) => string;
  isTabletMinimized: boolean;
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
}> = ({
  transaction,
  isSelected,
  onSelect,
  categories,
  onUpdateCategory,
  formatCurrency,
  getCategoryEmoji,
  isTabletMinimized,
  openDropdownId,
  setOpenDropdownId,
}) => {
  const cat = categories.find(c => c.id === transaction.categoryId);
  const isNotExpense = cat?.isNotExpense || (cat?.parentId ? categories.find(c => c.id === cat.parentId)?.isNotExpense : false);

  return (
    <>
      <tr className={cn(isTabletMinimized ? "sm:hidden" : "lg:hidden")}>
        <td rowSpan={3} className="p-3 w-10 align-top">
          <div className="flex items-start pt-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>
        </td>
        <td className="pt-3 px-3 pb-1 max-w-0">
          <div className="flex justify-between items-start gap-2">
            <span className="font-medium text-slate-800 truncate flex-1" title={transaction.description}>
              {transaction.description}
            </span>
            <span className={cn("font-medium whitespace-nowrap shrink-0", isNotExpense ? "text-slate-800" : transaction.amount > 0 ? "text-emerald-600" : "text-slate-800")}>
              {isNotExpense ? formatCurrency(Math.abs(transaction.amount), true) : formatCurrency(transaction.amount)}
            </span>
          </div>
        </td>
      </tr>
      <tr className={cn(isTabletMinimized ? "sm:hidden" : "lg:hidden")}>
        <td className="px-3 py-1 text-xs text-slate-500">
          {format(parseISO(transaction.date), 'dd.MM.yyyy')}
        </td>
      </tr>
      <tr className={cn(isTabletMinimized ? "sm:hidden" : "lg:hidden")}>
        <td className="px-3 pt-1 pb-3">
          <CategoryDropdown
            categoryId={transaction.categoryId}
            categories={categories}
            onChange={(categoryId) => onUpdateCategory(transaction.id, categoryId)}
            getCategoryEmoji={getCategoryEmoji}
            onOpenChange={(isOpen) => setOpenDropdownId(isOpen ? transaction.id : null)}
          />
        </td>
      </tr>
    </>
  );
};

// --- MAIN COMPONENT ---

interface TransactionsTableProps {
  filteredTransactions: Transaction[];
  allTransactions: Transaction[];
  categories: Category[];
  selectedTransactions: Set<string>;
  setSelectedTransactions: (set: Set<string>) => void;
  handleSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelect: (id: string) => void;
  onUpdateCategory: (transactionId: string, categoryId: string | null) => void;
  onDeleteTransactions: (ids: string[]) => void;
  onMergeTransactions: (ids: string[], mergedTransaction: Transaction | null) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  onSplitTransaction: (id: string, newTransactions: Transaction[]) => void;
  formatCurrency: (amount: number, forceNoSign?: boolean) => string;
  getCategoryEmoji: (id: string | null) => string;
  isTabletMinimized: boolean;
  selectedCategory: string;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({
  filteredTransactions,
  allTransactions,
  categories,
  selectedTransactions,
  setSelectedTransactions,
  handleSelectAll,
  handleSelect,
  onUpdateCategory,
  onDeleteTransactions,
  onMergeTransactions,
  onUpdateTransaction,
  onSplitTransaction,
  formatCurrency,
  getCategoryEmoji,
  isTabletMinimized,
  selectedCategory,
}) => {
  const { t } = useI18n();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isConfirmingMerge, setIsConfirmingMerge] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<'date' | 'title' | 'category' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedTransactions = React.useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      let comparison = 0;
      if (sortColumn === 'date') {
        comparison = a.date.localeCompare(b.date);
      } else if (sortColumn === 'title') {
        comparison = a.description.localeCompare(b.description);
      } else if (sortColumn === 'category') {
        const catA = categories.find(c => c.id === a.categoryId)?.name || '';
        const catB = categories.find(c => c.id === b.categoryId)?.name || '';
        comparison = catA.localeCompare(catB);
      } else if (sortColumn === 'amount') {
        comparison = a.amount - b.amount;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredTransactions, sortColumn, sortDirection, categories]);

  const handleSort = (column: 'date' | 'title' | 'category' | 'amount') => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection(column === 'date' ? 'desc' : 'asc');
    }
  };

  const currentCategorySelectedIds = Array.from(selectedTransactions).filter(id => 
    filteredTransactions.some(t => t.id === id)
  );
  const selectedCount = currentCategorySelectedIds.length;

  const isAllSelected = filteredTransactions.length > 0 && selectedCount === filteredTransactions.length;
  const isNoneAvailable = filteredTransactions.length === 0;

  const handleDeleteSelected = () => {
    onDeleteTransactions(currentCategorySelectedIds);
    const newSelected = new Set(selectedTransactions);
    currentCategorySelectedIds.forEach(id => newSelected.delete(id));
    setSelectedTransactions(newSelected);
    setIsConfirmingDelete(false);
  };

  const handleMergeSelected = () => {
    const ids = currentCategorySelectedIds;
    if (ids.length < 2) return;

    const toMerge = allTransactions.filter(t => ids.includes(t.id));
    toMerge.sort((a, b) => b.date.localeCompare(a.date));

    const newestDate = toMerge[0].date;
    const totalAmount = toMerge.reduce((sum, t) => sum + t.amount, 0);

    if (Math.abs(totalAmount) < 0.01) {
      onMergeTransactions(ids, null);
      const newSelected = new Set(selectedTransactions);
      ids.forEach(id => newSelected.delete(id));
      setSelectedTransactions(newSelected);
      return;
    }

    const combinedDesc = toMerge.map(t => t.description).join(' | ');
    
    const allSameCategory = toMerge.every(t => t.categoryId === toMerge[0].categoryId);
    const categoryId = allSameCategory ? toMerge[0].categoryId : null;

    onMergeTransactions(ids, {
      id: uuidv4(),
      date: newestDate,
      description: combinedDesc,
      amount: totalAmount,
      categoryId
    });
    const newSelected = new Set(selectedTransactions);
    ids.forEach(id => newSelected.delete(id));
    setSelectedTransactions(newSelected);
    setIsConfirmingMerge(false);
  };

  const handleEditSave = (updatedTransaction: Transaction) => {
    onUpdateTransaction(updatedTransaction);
    setIsEditModalOpen(false);
    const newSelected = new Set(selectedTransactions);
    currentCategorySelectedIds.forEach(id => newSelected.delete(id));
    setSelectedTransactions(newSelected);
  };

  const handleSplitSave = (newTransactions: Transaction[]) => {
    const selectedId = currentCategorySelectedIds[0];
    onSplitTransaction(selectedId, newTransactions);
    setIsSplitModalOpen(false);
    const newSelected = new Set(selectedTransactions);
    currentCategorySelectedIds.forEach(id => newSelected.delete(id));
    setSelectedTransactions(newSelected);
  };

  const handleUpdateBulkCategory = (categoryId: string | null) => {
    currentCategorySelectedIds.forEach(id => {
      onUpdateCategory(id, categoryId);
    });
  };

  const selectedTransaction = selectedCount === 1 
    ? allTransactions.find(t => t.id === currentCategorySelectedIds[0])
    : null;

  const selectedTransactionsList = allTransactions.filter(t => currentCategorySelectedIds.includes(t.id));
  const allSameCategory = selectedTransactionsList.length > 0 && selectedTransactionsList.every(t => t.categoryId === selectedTransactionsList[0].categoryId);
  const commonCategoryId = allSameCategory ? selectedTransactionsList[0].categoryId : undefined;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto md:overflow-visible">
        <table className="w-full text-left text-sm table-fixed">
          <thead className={cn("border-b border-slate-200 text-slate-500 font-medium", selectedCount > 0 ? "bg-indigo-50/50" : "bg-slate-50/80")}>
            <DesktopTableHeader
              isChecked={isAllSelected}
              isDisabled={isNoneAvailable}
              onChange={handleSelectAll}
              selectedCount={selectedCount}
              onMerge={() => setIsConfirmingMerge(true)}
              onEdit={() => setIsEditModalOpen(true)}
              onSplit={() => setIsSplitModalOpen(true)}
              onDelete={() => setIsConfirmingDelete(true)}
              isTabletMinimized={isTabletMinimized}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              categories={categories}
              getCategoryEmoji={getCategoryEmoji}
              commonCategoryId={commonCategoryId}
              onUpdateBulkCategory={handleUpdateBulkCategory}
            />
            <MobileTableHeader
              isChecked={isAllSelected}
              isDisabled={isNoneAvailable}
              onChange={handleSelectAll}
              selectedCount={selectedCount}
              onMerge={() => setIsConfirmingMerge(true)}
              onEdit={() => setIsEditModalOpen(true)}
              onSplit={() => setIsSplitModalOpen(true)}
              onDelete={() => setIsConfirmingDelete(true)}
              isTabletMinimized={isTabletMinimized}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          </thead>
          {isNoneAvailable ? (
            <NoTransactionsRow selectedCategory={selectedCategory} categories={categories} />
          ) : (
            sortedTransactions.map(transaction => (
              <tbody key={transaction.id} className={cn("transition-colors border-b xl:border-none border-slate-100", selectedTransactions.has(transaction.id) && "bg-indigo-50/30", openDropdownId === transaction.id ? "" : "hover:bg-slate-50/80")}>
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
                  openDropdownId={openDropdownId}
                  setOpenDropdownId={setOpenDropdownId}
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
                  openDropdownId={openDropdownId}
                  setOpenDropdownId={setOpenDropdownId}
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
                  isTabletMinimized={isTabletMinimized}
                  openDropdownId={openDropdownId}
                  setOpenDropdownId={setOpenDropdownId}
                />
              </tbody>
            ))
          )}
        </table>
      </div>

      {isConfirmingDelete && (
        <ConfirmDeleteModal
          onClose={() => setIsConfirmingDelete(false)}
          onConfirm={handleDeleteSelected}
          selectedCount={selectedCount}
        />
      )}

      {isConfirmingMerge && (
        <MergeTransactionsModal
          onClose={() => setIsConfirmingMerge(false)}
          onConfirm={handleMergeSelected}
          selectedCount={selectedCount}
          selectedTransactionsList={selectedTransactionsList}
          formatCurrency={formatCurrency}
        />
      )}

      {isEditModalOpen && selectedTransaction && (
        <EditTransactionModal
          transaction={selectedTransaction}
          categories={categories}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditSave}
          getCategoryEmoji={getCategoryEmoji}
        />
      )}

      {isSplitModalOpen && selectedTransaction && (
        <SplitTransactionModal
          transaction={selectedTransaction}
          onClose={() => setIsSplitModalOpen(false)}
          onSave={handleSplitSave}
        />
      )}
    </div>
  );
};

export default TransactionsTable;
