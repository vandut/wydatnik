import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { useAppContext } from '../../store/AppContext';
import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ChevronsUpDown, ChevronsDownUp } from 'lucide-react';

interface TransactionCategoriesProps {
  selectedCategory: string;
  setSelectedCategory: (id: string) => void;
  categorySummary: Record<string, number>;
  totalBalance: number;
  formatCurrency: (amount: number, forceNoSign?: boolean) => string;
  hideHeader?: boolean;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  showMinimizeButton?: boolean;
}

const TransactionCategories: React.FC<TransactionCategoriesProps> = ({
  selectedCategory,
  setSelectedCategory,
  categorySummary,
  totalBalance,
  formatCurrency,
  hideHeader = false,
  isMinimized = false,
  onToggleMinimize,
  showMinimizeButton = false,
}) => {
  const { t } = useI18n();
  const { state } = useAppContext();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Build category tree for dropdown
  const mainCategories = state.categories.filter(c => !c.parentId);

  const categoriesWithSubcategories = mainCategories.filter(cat => 
    state.categories.some(c => c.parentId === cat.id)
  );
  
  const areAllExpanded = categoriesWithSubcategories.length > 0 && 
    categoriesWithSubcategories.every(cat => expandedCategories.has(cat.id));

  const toggleAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (areAllExpanded) {
      setExpandedCategories(new Set());
    } else {
      setExpandedCategories(new Set(categoriesWithSubcategories.map(c => c.id)));
    }
  };

  // If minimized, switch to main category if a subcategory is selected
  useEffect(() => {
    if (isMinimized && selectedCategory !== 'all' && selectedCategory !== 'uncategorized') {
      const cat = state.categories.find(c => c.id === selectedCategory);
      if (cat && cat.parentId) {
        setSelectedCategory(cat.parentId);
      }
    }
  }, [isMinimized, selectedCategory, state.categories, setSelectedCategory]);

  const toggleExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategoryButton = (
    id: string,
    name: string,
    emoji: string,
    amount: number,
    isSelected: boolean,
    hasChildren: boolean = false,
    isExpanded: boolean = false,
    onExpandToggle?: (e: React.MouseEvent) => void,
    isSubcategory: boolean = false,
    customChevron?: React.ReactNode,
    hideChevron?: boolean,
    isNotExpense?: boolean
  ) => {
    return (
      <div key={id} className="flex items-center w-full gap-0.5">
        <button
          onClick={() => setSelectedCategory(id)}
          className={cn(
            "flex-1 flex items-center pl-3 pr-2 py-2 rounded-xl text-sm transition-colors cursor-pointer min-w-0",
            isMinimized ? "justify-center xl:justify-between" : "justify-between",
            isSelected ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-50",
            isSubcategory && "py-1.5 text-xs"
          )}
          title={isMinimized ? name : undefined}
        >
          <div className="flex items-center gap-2 truncate">
            {!isSubcategory && <span className="w-6 text-center text-base shrink-0">{emoji}</span>}
            <span className={cn("truncate", isMinimized && !isSubcategory ? "hidden xl:inline" : "")}>{name}</span>
          </div>
          <div className={cn("flex items-center gap-1 shrink-0", isMinimized && !isSubcategory ? "hidden xl:flex" : "")}>
            <span className={cn("text-xs", 
              isNotExpense ? "text-slate-600" :
              amount > 0 ? "text-emerald-600" : 
              amount < 0 ? "text-rose-600" : "text-slate-400"
            )}>
              {isNotExpense ? formatCurrency(Math.abs(amount), true) : formatCurrency(amount)}
            </span>
          </div>
        </button>
        
        {/* Chevron outside the button */}
        <div className={cn("flex items-center justify-center shrink-0 pr-1", isMinimized && !isSubcategory ? "hidden xl:flex" : "")}>
          {hideChevron ? (
            <div className="w-5 h-5" />
          ) : customChevron ? (
            customChevron
          ) : (
            <div 
              onClick={hasChildren && onExpandToggle ? onExpandToggle : undefined}
              className={cn(
                "p-0.5 transition-colors",
                hasChildren ? "cursor-pointer text-slate-500 hover:text-slate-800" : "opacity-30 cursor-default text-slate-400"
              )}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          )}
        </div>
      </div>
    );
  };

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
        {/* All Categories */}
        {renderCategoryButton(
          'all',
          t('all'),
          '⚪',
          totalBalance,
          selectedCategory === 'all',
          false,
          false,
          undefined,
          false,
          <div 
            onClick={toggleAll}
            className="p-0.5 transition-colors cursor-pointer text-slate-500 hover:text-slate-800"
            title={areAllExpanded ? "Collapse all" : "Expand all"}
          >
            {areAllExpanded ? <ChevronsDownUp className="w-4 h-4" /> : <ChevronsUpDown className="w-4 h-4" />}
          </div>
        )}
        
        {/* Uncategorized (No category) */}
        {renderCategoryButton(
          'uncategorized',
          t('uncategorized'),
          '❓',
          categorySummary['uncategorized'] || 0,
          selectedCategory === 'uncategorized',
          false,
          false,
          undefined,
          false,
          undefined,
          true
        )}
        
        {/* Main Categories */}
        {mainCategories.map(cat => {
          const subcategories = state.categories.filter(c => c.parentId === cat.id);
          const hasChildren = subcategories.length > 0;
          const isExpanded = expandedCategories.has(cat.id);
          const isSelected = selectedCategory === cat.id;
          const isCatNotExpense = cat.isNotExpense;
          
          return (
            <div key={cat.id} className="space-y-1">
              {renderCategoryButton(
                cat.id,
                cat.name,
                cat.emoji || '❓',
                categorySummary[cat.id] || 0,
                isSelected,
                hasChildren,
                isExpanded,
                hasChildren ? (e) => toggleExpand(e, cat.id) : undefined,
                false,
                undefined,
                false,
                isCatNotExpense
              )}
              
              {/* Subcategories Tree */}
              {!isMinimized && hasChildren && isExpanded && (
                <div className="relative mt-1">
                  <div 
                    className="absolute left-[24px] top-0 w-px bg-slate-200" 
                    style={{ bottom: '18px' }}
                  />
                  
                  {subcategories.map(sub => (
                    <div key={sub.id} className="relative flex items-center pl-[44px] pr-0 py-0.5">
                      <div className="absolute left-[24px] top-1/2 w-4 h-px bg-slate-200" />
                      
                      {renderCategoryButton(
                        sub.id,
                        sub.name,
                        '',
                        categorySummary[sub.id] || 0,
                        selectedCategory === sub.id,
                        false, // Subcategories don't have children in this structure
                        false,
                        undefined,
                        true, // isSubcategory
                        undefined,
                        false,
                        isCatNotExpense || sub.isNotExpense
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TransactionCategories;
