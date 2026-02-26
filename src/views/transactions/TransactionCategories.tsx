import React from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { useAppContext } from '../../store/AppContext';
import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TransactionCategoriesProps {
  selectedCategory: string;
  setSelectedCategory: (id: string) => void;
  categorySummary: Record<string, number>;
  formatCurrency: (amount: number) => string;
  hideHeader?: boolean;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  showMinimizeButton?: boolean;
}

const TransactionCategories: React.FC<TransactionCategoriesProps> = ({
  selectedCategory,
  setSelectedCategory,
  categorySummary,
  formatCurrency,
  hideHeader = false,
  isMinimized = false,
  onToggleMinimize,
  showMinimizeButton = false,
}) => {
  const { t } = useI18n();
  const { state } = useAppContext();

  // Build category tree for dropdown
  const mainCategories = state.categories.filter(c => !c.parentId);
  const totalAmount = Object.values(categorySummary).reduce((sum: number, val: number) => sum + val, 0) as number;

  return (
    <div className="flex flex-col h-full">
      {!hideHeader && (
        <div className={cn("p-4 border-b border-slate-200 shrink-0 flex items-center h-[65px]", isMinimized ? "justify-center xl:justify-between" : "justify-between")}>
          <h2 className={cn("font-semibold text-slate-800", isMinimized ? "hidden xl:block" : "")}>{t('categories')}</h2>
          {showMinimizeButton && (
            <button
              onClick={onToggleMinimize}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors xl:hidden"
            >
              {isMinimized ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          )}
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <button
          onClick={() => setSelectedCategory('all')}
          className={cn(
            "w-full flex items-center px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer",
            isMinimized ? "justify-center xl:justify-between" : "justify-between",
            selectedCategory === 'all' ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-50"
          )}
          title={isMinimized ? t('all') : undefined}
        >
          <div className="flex items-center gap-2">
            <span>⚪</span>
            <span className={cn(isMinimized ? "hidden xl:inline" : "")}>{t('all')}</span>
          </div>
          <span className={cn("text-xs", isMinimized ? "hidden xl:inline" : "", 
            totalAmount > 0 ? "text-emerald-600" : 
            totalAmount < 0 ? "text-rose-600" : "text-slate-400"
          )}>
            {formatCurrency(totalAmount)}
          </span>
        </button>
        
        {mainCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "w-full flex items-center px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer",
              isMinimized ? "justify-center xl:justify-between" : "justify-between",
              selectedCategory === cat.id ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-50"
            )}
            title={isMinimized ? cat.name : undefined}
          >
            <div className="flex items-center gap-2 truncate">
              <span>{cat.emoji}</span>
              <span className={cn("truncate", isMinimized ? "hidden xl:inline" : "")}>{cat.name}</span>
            </div>
            <span className={cn("text-xs", isMinimized ? "hidden xl:inline" : "", 
              (categorySummary[cat.id] || 0) > 0 ? "text-emerald-600" : 
              (categorySummary[cat.id] || 0) < 0 ? "text-rose-600" : "text-slate-400"
            )}>
              {formatCurrency(categorySummary[cat.id] || 0)}
            </span>
          </button>
        ))}
        
        <button
          onClick={() => setSelectedCategory('uncategorized')}
          className={cn(
            "w-full flex items-center px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer",
            isMinimized ? "justify-center xl:justify-between" : "justify-between",
            selectedCategory === 'uncategorized' ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-50"
          )}
          title={isMinimized ? t('uncategorized') : undefined}
        >
          <div className="flex items-center gap-2">
            <span>❓</span>
            <span className={cn(isMinimized ? "hidden xl:inline" : "")}>{t('uncategorized')}</span>
          </div>
          <span className={cn("text-xs", isMinimized ? "hidden xl:inline" : "", 
            (categorySummary['uncategorized'] || 0) > 0 ? "text-emerald-600" : 
            (categorySummary['uncategorized'] || 0) < 0 ? "text-rose-600" : "text-slate-400"
          )}>
            {formatCurrency(categorySummary['uncategorized'] || 0)}
          </span>
        </button>
      </div>
    </div>
  );
};

export default TransactionCategories;
