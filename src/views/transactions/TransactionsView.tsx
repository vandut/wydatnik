import React, { useState, useMemo } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { useAppContext } from '../../store/AppContext';
import { format, addMonths, subMonths } from 'date-fns';
import { pl, enUS } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight, UploadCloud } from 'lucide-react';
import ImportModal from './ImportModal';
import Drawer from '../../components/Drawer';
import TransactionCategories from './TransactionCategories';
import TransactionsTable from './TransactionsTable';

// --- INNER COMPONENTS ---

const BalancesSummary: React.FC<{
  balances: { income: number; expenses: number; total: number };
  formatCurrency: (amount: number) => string;
}> = ({ balances, formatCurrency }) => {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      <span className="text-emerald-600 font-medium whitespace-nowrap">↗ {formatCurrency(balances.income)}</span>
      <span className="text-rose-600 font-medium whitespace-nowrap">↘ {formatCurrency(balances.expenses)}</span>
      <span className="text-slate-500 md:ml-2 whitespace-nowrap">{t('total')}: {formatCurrency(balances.total)}</span>
    </div>
  );
};

const DateNavigation: React.FC<{
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
}> = ({ currentDate, setCurrentDate }) => {
  const { t, language } = useI18n();
  const dateLocale = language === 'pl' ? pl : enUS;

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => setCurrentDate(new Date())} className="mr-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-200/50 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer">
        {t('today')}
      </button>
      <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer">
        <ChevronRight className="w-5 h-5" />
      </button>
      <span className="text-lg font-medium text-slate-800 capitalize min-w-[140px] text-center">
        {format(currentDate, 'LLLL yyyy', { locale: dateLocale })}
      </span>
    </div>
  );
};

const TransactionsHeader: React.FC<{
  balances: { income: number; expenses: number; total: number };
  formatCurrency: (amount: number) => string;
  onImportClick: () => void;
  isTabletMinimized: boolean;
}> = ({ balances, formatCurrency, onImportClick, isTabletMinimized }) => {
  const { t } = useI18n();

  return (
    <div className="flex flex-wrap items-center justify-between gap-y-4 gap-x-6">
      <h1 className="text-2xl font-bold text-slate-900 order-1">{t('transactions')}</h1>
      
      <div className={cn(
        "order-3 w-full flex",
        isTabletMinimized ? "md:order-2 md:w-auto" : "lg:order-2 lg:w-auto"
      )}>
        <BalancesSummary balances={balances} formatCurrency={formatCurrency} />
      </div>

      <button
        onClick={onImportClick}
        className={cn(
          "order-2 flex items-center gap-2 px-3 md:px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer",
          isTabletMinimized ? "md:order-3" : "lg:order-3"
        )}
      >
        <UploadCloud className="w-4 h-4" />
        <span className="hidden xl:inline">{t('import')}</span>
        <span className="xl:hidden">{t('importShort')}</span>
      </button>
    </div>
  );
};

// --- MAIN COMPONENT ---

const TransactionsView: React.FC = () => {
  const { t, language } = useI18n();
  const { state, dispatch } = useAppContext();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [isTabletMinimized, setIsTabletMinimized] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(orientation: portrait)').matches;
    }
    return false;
  });

  React.useEffect(() => {
    const handler = () => setIsMobileCategoriesOpen(prev => !prev);
    window.addEventListener('toggleMobileCategories', handler);
    return () => window.removeEventListener('toggleMobileCategories', handler);
  }, []);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(orientation: portrait)');
    const handleOrientationChange = (e: MediaQueryListEvent) => {
      setIsTabletMinimized(e.matches);
    };
    mediaQuery.addEventListener('change', handleOrientationChange);
    return () => mediaQuery.removeEventListener('change', handleOrientationChange);
  }, []);

  const dateLocale = language === 'pl' ? pl : enUS;
  const selectedMonth = format(currentDate, 'yyyy-MM');

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return state.transactions.filter(t => {
      const matchMonth = t.date.startsWith(selectedMonth);
      const matchCategory = selectedCategory === 'all' || 
                            (selectedCategory === 'uncategorized' && !t.categoryId) ||
                            t.categoryId === selectedCategory || 
                            state.categories.find(c => c.id === t.categoryId)?.parentId === selectedCategory;
      return matchMonth && matchCategory;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [state.transactions, selectedMonth, selectedCategory, state.categories]);

  // Calculate balances
  const balances = useMemo(() => {
    let income = 0;
    let expenses = 0;
    filteredTransactions.forEach(t => {
      const cat = state.categories.find(c => c.id === t.categoryId);
      const isNotExpense = cat?.isNotExpense || (cat?.parentId ? state.categories.find(c => c.id === cat.parentId)?.isNotExpense : false);

      if (!isNotExpense) {
        if (t.amount > 0) income += t.amount;
        else expenses += Math.abs(t.amount);
      }
    });
    return { income, expenses, total: income - expenses };
  }, [filteredTransactions, state.categories]);

  // Category summary for sidebar
  const categorySummary = useMemo(() => {
    const summary: Record<string, number> = {};
    const baseFiltered = state.transactions.filter(t => 
      t.date.startsWith(selectedMonth)
    );

    baseFiltered.forEach(t => {
      const cat = state.categories.find(c => c.id === t.categoryId);
      const mainCatId = cat?.parentId || cat?.id || 'uncategorized';
      const subCatId = cat?.parentId ? cat.id : null;
      
      const mainCat = mainCatId !== 'uncategorized' ? state.categories.find(c => c.id === mainCatId) : null;
      const isMainCatNotExpense = mainCat?.isNotExpense || false;
      const isSubCatNotExpense = cat?.isNotExpense || false;

      // Add to main category
      if (!isMainCatNotExpense && isSubCatNotExpense && subCatId) {
        // Do not add to main category summary if subcategory is not an expense but parent is
      } else {
        summary[mainCatId] = (summary[mainCatId] || 0) + t.amount;
      }
      
      // Add to subcategory if it exists
      if (subCatId) {
        summary[subCatId] = (summary[subCatId] || 0) + t.amount;
      }
    });
    return summary;
  }, [state.transactions, selectedMonth, state.categories]);

  const monthlyTotalBalance = useMemo(() => {
    let total = 0;
    const baseFiltered = state.transactions.filter(t => 
      t.date.startsWith(selectedMonth)
    );
    baseFiltered.forEach(t => {
      const cat = state.categories.find(c => c.id === t.categoryId);
      const isNotExpense = cat?.isNotExpense || (cat?.parentId ? state.categories.find(c => c.id === cat.parentId)?.isNotExpense : false);

      if (!isNotExpense) {
        total += t.amount;
      }
    });
    return total;
  }, [state.transactions, selectedMonth, state.categories]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTransactions(new Set(filteredTransactions.map(t => t.id)));
    } else {
      setSelectedTransactions(new Set());
    }
  };

  const handleSelect = (id: string) => {
    const newSet = new Set(selectedTransactions);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedTransactions(newSet);
  };

  const handleUpdateCategory = (transactionId: string, categoryId: string | null) => {
    dispatch({ type: 'UPDATE_TRANSACTION_CATEGORY', payload: { id: transactionId, categoryId } });
  };

  const formatCurrency = (amount: number, forceNoSign: boolean = false) => {
    return new Intl.NumberFormat(language, { 
      style: 'currency', 
      currency: state.currency,
      signDisplay: forceNoSign ? 'never' : 'auto'
    }).format(amount);
  };

  const getCategoryEmoji = (id: string | null) => {
    if (!id) return '❓';
    const cat = state.categories.find(c => c.id === id);
    if (!cat) return '❓';
    if (cat.parentId) {
      const parent = state.categories.find(c => c.id === cat.parentId);
      return parent?.emoji || '❓';
    }
    return cat.emoji || '❓';
  };

  return (
    <div className="flex flex-col md:flex-row h-full relative overflow-hidden">
      {/* Mobile Categories Drawer */}
      <Drawer
        isOpen={isMobileCategoriesOpen}
        onClose={() => setIsMobileCategoriesOpen(false)}
        title={t('categories')}
      >
        <TransactionCategories
          selectedCategory={selectedCategory}
          setSelectedCategory={(id) => {
            setSelectedCategory(id);
            setIsMobileCategoriesOpen(false);
          }}
          categorySummary={categorySummary}
          totalBalance={monthlyTotalBalance}
          formatCurrency={formatCurrency}
          hideHeader={true}
        />
      </Drawer>

      {/* Left Sidebar - Categories Filter (Desktop & Tablet) */}
      <div className={cn(
        "hidden md:flex bg-white border-r border-slate-200 flex-col flex-shrink-0 overflow-y-auto",
        isTabletMinimized ? "w-16 xl:w-72" : "w-72"
      )}>
        <TransactionCategories
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categorySummary={categorySummary}
          totalBalance={monthlyTotalBalance}
          formatCurrency={formatCurrency}
          isMinimized={isTabletMinimized}
          onToggleMinimize={() => setIsTabletMinimized(!isTabletMinimized)}
          showMinimizeButton={true}
        />
      </div>

      {/* Main Content - Transactions List */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 overflow-y-auto">
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 w-full">
          <DateNavigation
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
          />

          <TransactionsHeader
            balances={balances}
            formatCurrency={formatCurrency}
            onImportClick={() => setIsImportModalOpen(true)}
            isTabletMinimized={isTabletMinimized}
          />

          {/* Table */}
          <TransactionsTable
            filteredTransactions={filteredTransactions}
            categories={state.categories}
            selectedTransactions={selectedTransactions}
            setSelectedTransactions={setSelectedTransactions}
            handleSelectAll={handleSelectAll}
            handleSelect={handleSelect}
            onUpdateCategory={handleUpdateCategory}
            formatCurrency={formatCurrency}
            getCategoryEmoji={getCategoryEmoji}
            isTabletMinimized={isTabletMinimized}
            selectedCategory={selectedCategory}
          />
        </div>
      </div>
      {isImportModalOpen && <ImportModal onClose={() => setIsImportModalOpen(false)} />}
    </div>
  );
};

export default TransactionsView;
