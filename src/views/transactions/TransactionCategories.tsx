import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { useAppContext } from '../../store/AppContext';
import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Build category tree for dropdown
  const mainCategories = state.categories.filter(c => !c.parentId);
  const totalAmount = Object.values(categorySummary).reduce((sum: number, val: number) => sum + val, 0) as number;

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
    onExpandToggle?: (e: React.MouseEvent) => void
  ) => {
    return (
      <button
        key={id}
        onClick={() => setSelectedCategory(id)}
        className={cn(
          "w-full flex items-center px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer",
          isMinimized ? "justify-center xl:justify-between" : "justify-between",
          isSelected ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-50"
        )}
        title={isMinimized ? name : undefined}
      >
        <div className="flex items-center gap-2 truncate">
          <span className="w-6 text-center text-base shrink-0">{emoji}</span>
          <span className={cn("truncate", isMinimized ? "hidden xl:inline" : "")}>{name}</span>
        </div>
        <div className={cn("flex items-center gap-1", isMinimized ? "hidden xl:flex" : "")}>
          <span className={cn("text-xs", 
            amount > 0 ? "text-emerald-600" : 
            amount < 0 ? "text-rose-600" : "text-slate-400"
          )}>
            {formatCurrency(amount)}
          </span>
          {hasChildren && onExpandToggle && (
            <div 
              onClick={onExpandToggle}
              className="p-1 rounded hover:bg-slate-200/50 transition-colors ml-1"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          )}
        </div>
      </button>
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
          totalAmount,
          selectedCategory === 'all'
        )}
        
        {/* Uncategorized (No category) */}
        {renderCategoryButton(
          'uncategorized',
          t('uncategorized'),
          '❓',
          categorySummary['uncategorized'] || 0,
          selectedCategory === 'uncategorized'
        )}
        
        {/* Main Categories */}
        {mainCategories.map(cat => {
          const subcategories = state.categories.filter(c => c.parentId === cat.id);
          const hasChildren = subcategories.length > 0;
          const isExpanded = expandedCategories.has(cat.id);
          const isSelected = selectedCategory === cat.id;
          
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
                hasChildren ? (e) => toggleExpand(e, cat.id) : undefined
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
                      
                      <button
                        onClick={() => setSelectedCategory(sub.id)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer",
                          selectedCategory === sub.id ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        <span className="truncate">{sub.name}</span>
                        <span className={cn(
                          (categorySummary[sub.id] || 0) > 0 ? "text-emerald-600" : 
                          (categorySummary[sub.id] || 0) < 0 ? "text-rose-600" : "text-slate-400"
                        )}>
                          {formatCurrency(categorySummary[sub.id] || 0)}
                        </span>
                      </button>
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
