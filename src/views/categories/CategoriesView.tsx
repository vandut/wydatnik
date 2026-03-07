import React, { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { useAppContext } from '../../store/AppContext';
import { Category } from '../../types';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import CategoryModal from './CategoryModal';
import ConfirmDeleteCategoryModal from './ConfirmDeleteCategoryModal';
import { cn } from '../../lib/utils';

// --- INNER COMPONENTS ---

const SubcategoryList: React.FC<{
  parentId: string;
  parentIsNotExpense: boolean;
  level?: number;
  categories: Category[];
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
}> = ({ parentId, parentIsNotExpense, level = 1, categories, onEdit, onDelete }) => {
  const { t } = useI18n();
  const subs = categories.filter(c => c.parentId === parentId);
  
  if (subs.length === 0) {
    if (level === 1) {
      return (
        <div className="p-4 text-sm text-slate-400 text-center italic bg-slate-50/50 flex-1 flex items-center justify-center">
          {t('noSubcategories')}
        </div>
      );
    }
    return null;
  }

  return (
    <div className={cn("flex flex-col", level === 1 ? "bg-slate-50/50 flex-1 p-2" : "ml-8")}>
      {subs.map((sub, index) => {
        const isNotExpense = sub.isNotExpense || parentIsNotExpense;
        const isLast = index === subs.length - 1;
        
        return (
          <div key={sub.id} className="relative flex flex-col">
            {/* Vertical line for the whole block if not last */}
            {!isLast && <div className="absolute border-l-2 border-slate-200 left-4 top-0 bottom-0" />}
            
            <div className="relative">
              {/* Vertical line for the last item (only goes down to the middle of the header) */}
              {isLast && <div className="absolute border-l-2 border-slate-200 left-4 top-0 h-[18px]" />}
              
              {/* Horizontal branch */}
              <div className="absolute top-[17px] w-4 border-t-2 border-slate-200 left-4" />

              <div className="flex items-start justify-between p-2 rounded-lg relative z-10 ml-8 gap-2">
                <div className="flex flex-col min-w-0 flex-1 gap-1">
                  <span className="text-sm text-slate-700 font-medium truncate leading-5">{sub.name}</span>
                  {isNotExpense && (
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-200/50 text-slate-500 rounded-full shrink-0 self-start">
                      {t('excludeFromExpenses')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => onEdit(sub)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 cursor-pointer">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => onDelete(sub.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            <SubcategoryList
              parentId={sub.id}
              parentIsNotExpense={isNotExpense}
              level={level + 1}
              categories={categories}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        );
      })}
    </div>
  );
};

const CategoryCard: React.FC<{
  main: Category;
  categories: Category[];
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
}> = ({ main, categories, onEdit, onDelete }) => {
  const { t } = useI18n();
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="flex items-start justify-between p-4 bg-white border-b border-slate-100/50 z-10 relative gap-2">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span className="text-xl shrink-0 mt-0.5">{main.emoji}</span>
          <div className="flex flex-col min-w-0 flex-1 gap-1.5">
            <span className="font-semibold text-slate-800 truncate leading-6">{main.name}</span>
            {main.isNotExpense && (
              <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-500 rounded-full shrink-0 self-start">
                {t('excludeFromExpenses')}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 mt-0.5">
          <button onClick={() => onEdit(main)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 cursor-pointer">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(main.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Subcategories */}
      <SubcategoryList
        parentId={main.id}
        parentIsNotExpense={main.isNotExpense || false}
        categories={categories}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};

// --- MAIN COMPONENT ---

const CategoriesView: React.FC = () => {
  const { t } = useI18n();
  const { state, dispatch } = useAppContext();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const mainCategories = state.categories.filter(c => !c.parentId);

  const handleDelete = (id: string) => {
    setCategoryToDelete(id);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      dispatch({ type: 'DELETE_CATEGORY', payload: categoryToDelete });
      setCategoryToDelete(null);
    }
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const openAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };



  const handleSaveCategory = (category: Category, isNew: boolean) => {
    if (isNew) {
      dispatch({ type: 'ADD_CATEGORY', payload: category });
    } else {
      dispatch({ type: 'UPDATE_CATEGORY', payload: category });
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t('categories')}</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {t('addCategory')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
        {mainCategories.map(main => (
          <CategoryCard
            key={main.id}
            main={main}
            categories={state.categories}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {isModalOpen && (
        <CategoryModal
          category={editingCategory || undefined}
          categories={state.categories}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCategory}
        />
      )}

      {categoryToDelete && (
        <ConfirmDeleteCategoryModal
          onClose={() => setCategoryToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
};

export default CategoriesView;
