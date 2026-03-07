import React, { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { Category } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import Modal from '../../components/Modal';
import { cn } from '../../lib/utils';

interface CategoryModalProps {
  category?: Category;
  categories: Category[];
  onClose: () => void;
  onSave: (category: Category, isNew: boolean) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ category, categories, onClose, onSave }) => {
  const { t } = useI18n();
  
  const [name, setName] = useState(category?.name || '');
  const [parentId, setParentId] = useState<string | null>(category?.parentId || null);
  const [emoji, setEmoji] = useState(category?.emoji || '⚪');
  const [isNotExpense, setIsNotExpense] = useState(category?.isNotExpense || false);

  const mainCategories = categories.filter(c => !c.parentId && c.id !== category?.id);
  
  const parentCategory = parentId ? categories.find(c => c.id === parentId) : null;
  const isParentNotExpense = parentCategory?.isNotExpense || false;
  const effectiveIsNotExpense = isParentNotExpense || isNotExpense;

  const handleSave = () => {
    if (!name.trim()) return;

    if (category) {
      onSave({ ...category, name, parentId, emoji: parentId ? undefined : emoji, isNotExpense }, false);
    } else {
      onSave({ id: uuidv4(), name, parentId, emoji: parentId ? undefined : emoji, isNotExpense }, true);
    }
    onClose();
  };

  return (
    <Modal 
      title={category ? t('editCategory') : t('addCategory')} 
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            {t('saveChanges')}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('name')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('parentCategory')}</label>
          <select
            value={parentId || ''}
            onChange={(e) => setParentId(e.target.value || null)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
          >
            <option value="">{t('none')}</option>
            {mainCategories.map(c => (
              <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
            ))}
          </select>
        </div>

        {!parentId && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('emoji')}</label>
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              maxLength={2}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="isNotExpense"
            checked={effectiveIsNotExpense}
            onChange={(e) => setIsNotExpense(e.target.checked)}
            disabled={isParentNotExpense}
            className={cn(
              "w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500",
              isParentNotExpense ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            )}
          />
          <label 
            htmlFor="isNotExpense" 
            className={cn(
              "text-sm font-medium text-slate-700",
              isParentNotExpense ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            )}
          >
            {t('excludeFromExpenses')}
          </label>
        </div>
      </div>
    </Modal>
  );
};

export default CategoryModal;
