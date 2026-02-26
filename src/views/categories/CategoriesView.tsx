import React, { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { useAppContext } from '../../store/AppContext';
import { Category } from '../../types';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import CategoryModal from './CategoryModal';
import Modal from '../../components/Modal';

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

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t('categories')}</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {t('addCategory')}
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {mainCategories.map(main => (
            <div key={main.id} className="group">
              <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{main.emoji}</span>
                  <span className="font-medium text-slate-800">{main.name}</span>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(main)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(main.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Subcategories */}
              <div className="bg-slate-50/50">
                {state.categories.filter(c => c.parentId === main.id).map(sub => (
                  <div key={sub.id} className="flex items-center justify-between p-3 pl-12 hover:bg-slate-100/50 transition-colors border-t border-slate-100/50 group/sub">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      <span className="text-sm text-slate-600">{sub.name}</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(sub)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(sub.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <CategoryModal
          category={editingCategory || undefined}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {categoryToDelete && (
        <Modal 
          title={t('confirmDelete')} 
          onClose={() => setCategoryToDelete(null)}
          footer={
            <>
              <button
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors"
              >
                {t('delete')}
              </button>
            </>
          }
        >
          <p className="text-slate-600">{t('confirmDeleteCategory')}</p>
        </Modal>
      )}
    </div>
  );
};

export default CategoriesView;
