import React, { useMemo } from 'react';
import { Category, Transaction } from '../../types';
import { useI18n } from '../../i18n/I18nContext';
import { useAppContext } from '../../store/AppContext';

interface CategoryFilterTableProps {
  transactions: Transaction[];
  categories: Category[];
  selectedCategoryIds: Set<string | null>;
  onSelectionChange: (selectedIds: Set<string | null>) => void;
}

const CategoryFilterTable: React.FC<CategoryFilterTableProps> = ({
  transactions,
  categories,
  selectedCategoryIds,
  onSelectionChange,
}) => {
  const { t } = useI18n();
  const { state } = useAppContext();

  // Calculate totals per category
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    transactions.forEach(t => {
      const catId = t.categoryId || 'uncategorized';
      totals[catId] = (totals[catId] || 0) + t.amount;
    });
    return totals;
  }, [transactions]);

  // Group categories into parent/child structure
  const { parentCategories, subcategoriesByParent } = useMemo(() => {
    const parents = categories.filter(c => !c.parentId);
    const subs: Record<string, Category[]> = {};
    
    parents.forEach(p => {
      subs[p.id] = categories.filter(c => c.parentId === p.id);
    });
    
    return { parentCategories: parents, subcategoriesByParent: subs };
  }, [categories]);

  // Calculate parent totals (including subcategories)
  const parentTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    parentCategories.forEach(p => {
      let sum = categoryTotals[p.id] || 0;
      const subs = subcategoriesByParent[p.id] || [];
      subs.forEach(s => {
        sum += categoryTotals[s.id] || 0;
      });
      totals[p.id] = sum;
    });
    return totals;
  }, [parentCategories, subcategoriesByParent, categoryTotals]);

  // All possible selectable IDs (including 'uncategorized')
  const allSelectableIds = useMemo(() => {
    const ids = new Set<string | null>();
    ids.add(null); // uncategorized
    categories.forEach(c => ids.add(c.id));
    return ids;
  }, [categories]);

  const isAllSelected = selectedCategoryIds.size === allSelectableIds.size;

  const handleToggleAll = () => {
    if (isAllSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(allSelectableIds));
    }
  };

  const handleToggleCategory = (categoryId: string | null) => {
    const newSelection = new Set(selectedCategoryIds);
    
    if (newSelection.has(categoryId)) {
      newSelection.delete(categoryId);
      
      // If it's a parent, deselect all children
      if (categoryId !== null) {
        const subs = subcategoriesByParent[categoryId] || [];
        subs.forEach(s => newSelection.delete(s.id));
      }
      
      // If it's a child, we might want to uncheck the parent? 
      // Actually, if a child is unchecked, the parent is no longer "fully selected".
      // But we can just let the parent be unchecked if we want, or keep it simple:
      // If a child is toggled, we just toggle the child.
      // The user requested: "unchecking subcategory should not automatically uncheck parent category"
      // So we do nothing to the parent here.
    } else {
      newSelection.add(categoryId);
      
      // If it's a parent, select all children
      if (categoryId !== null) {
        const subs = subcategoriesByParent[categoryId] || [];
        subs.forEach(s => newSelection.add(s.id));
      }
      
      // If it's a child, check if all children are now selected, if so, select parent
      if (categoryId !== null) {
        const cat = categories.find(c => c.id === categoryId);
        if (cat?.parentId) {
          const subs = subcategoriesByParent[cat.parentId] || [];
          const allSubsSelected = subs.every(s => newSelection.has(s.id));
          if (allSubsSelected) {
            newSelection.add(cat.parentId);
          }
        }
      }
    }
    
    onSelectionChange(newSelection);
  };

  const formatCurrencyWithColor = (amount: number, isNotExpense: boolean = false) => {
    const formatted = new Intl.NumberFormat(navigator.language, {
      style: 'currency',
      currency: state.currency,
    }).format(Math.abs(amount));

    if (isNotExpense) {
      return <span className="text-slate-600">{formatted}</span>;
    }
    if (amount > 0) {
      return <span className="text-emerald-600">+{formatted}</span>;
    }
    if (amount < 0) {
      return <span className="text-rose-600">-{formatted}</span>;
    }
    return <span className="text-slate-400">{formatted}</span>;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">{t('expensesPerCategory')}</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-100">
            <tr>
              <th className="pl-4 pr-2 py-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleToggleAll}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th className="pl-2 pr-4 py-3">{t('category')}</th>
              <th className="px-4 py-3 text-right">{t('totalAmount')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Uncategorized Row */}
            <tr className="hover:bg-slate-50/50 transition-colors">
              <td className="pl-4 pr-2 py-3 text-center">
                <input
                  type="checkbox"
                  checked={selectedCategoryIds.has(null)}
                  onChange={() => handleToggleCategory(null)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </td>
              <td className="pl-2 pr-4 py-3 font-medium text-slate-700 flex items-center gap-2">
                <span className="w-6 text-center text-base shrink-0">
                  ❓
                </span>
                {t('uncategorized')}
              </td>
              <td className="px-4 py-3 text-right font-medium text-slate-900">
                {formatCurrencyWithColor(categoryTotals['uncategorized'] || 0)}
              </td>
            </tr>

            {/* Parent Categories and their Subcategories */}
            {parentCategories.map(parent => {
              const subs = subcategoriesByParent[parent.id] || [];
              const isParentSelected = selectedCategoryIds.has(parent.id);
              // Check if some but not all children are selected
              const someChildrenSelected = subs.some(s => selectedCategoryIds.has(s.id));
              const allChildrenSelected = subs.length > 0 && subs.every(s => selectedCategoryIds.has(s.id));
              const isIndeterminate = !isParentSelected && someChildrenSelected && !allChildrenSelected;

              return (
                <React.Fragment key={parent.id}>
                  <tr className="hover:bg-slate-50/50 transition-colors bg-slate-50/30">
                    <td className="pl-4 pr-2 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isParentSelected || allChildrenSelected}
                        ref={el => {
                          if (el) el.indeterminate = isIndeterminate;
                        }}
                        onChange={() => handleToggleCategory(parent.id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="pl-2 pr-4 py-3 font-medium text-slate-800 flex items-center gap-2">
                      <span className="w-6 text-center text-base shrink-0">
                        {parent.emoji || '📁'}
                      </span>
                      {parent.name}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {formatCurrencyWithColor(parentTotals[parent.id] || 0, parent.isNotExpense)}
                    </td>
                  </tr>
                  
                  {/* Subcategories */}
                  {subs.length > 0 && (
                    <tr>
                      <td colSpan={3} className="p-0">
                        <div className="relative">
                          <table className="w-full text-sm text-left">
                            <tbody className="divide-y divide-slate-100/50">
                              {subs.map((sub, index) => {
                                const isLast = index === subs.length - 1;
                                return (
                                  <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors relative">
                                    <td className="pl-4 pr-2 py-2 w-10 text-center relative z-10">
                                      <input
                                        type="checkbox"
                                        checked={selectedCategoryIds.has(sub.id)}
                                        onChange={() => handleToggleCategory(sub.id)}
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                      />
                                    </td>
                                    <td className="pl-2 pr-4 py-2 text-slate-600 pl-[36px] flex items-center relative">
                                      {/* Vertical line from parent */}
                                      {!isLast && <div className="absolute left-[20px] top-0 bottom-0 w-px bg-slate-200" />}
                                      {/* Vertical line for the last item (only goes down to the middle) */}
                                      {isLast && <div className="absolute left-[20px] top-0 h-1/2 w-px bg-slate-200" />}
                                      {/* Horizontal branch */}
                                      <div className="absolute left-[20px] top-1/2 w-4 h-px bg-slate-200" />
                                      
                                      {sub.name}
                                    </td>
                                    <td className="px-4 py-2 text-right text-slate-700">
                                      {formatCurrencyWithColor(categoryTotals[sub.id] || 0, parent.isNotExpense || sub.isNotExpense)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryFilterTable;
