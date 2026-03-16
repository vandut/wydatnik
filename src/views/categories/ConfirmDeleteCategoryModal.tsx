import React, { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import Modal from '../../components/Modal';
import CategoryDropdown from '../../components/CategoryDropdown';
import { Category } from '../../types';

interface ConfirmDeleteCategoryModalProps {
  categoryId: string;
  categories: Category[];
  onClose: () => void;
  onConfirm: (fallbackCategoryId: string | null) => void;
}

const ConfirmDeleteCategoryModal: React.FC<ConfirmDeleteCategoryModalProps> = ({ categoryId, categories, onClose, onConfirm }) => {
  const { t } = useI18n();
  const [fallbackCategoryId, setFallbackCategoryId] = useState<string | null>(null);

  // Filter out the category being deleted and its subcategories
  const availableCategories = categories.filter(c => c.id !== categoryId && c.parentId !== categoryId);

  const getCategoryEmoji = (id: string | null) => {
    if (!id) return '';
    const cat = categories.find(c => c.id === id);
    if (!cat) return '';
    if (cat.emoji) return cat.emoji;
    if (cat.parentId) {
      const parent = categories.find(p => p.id === cat.parentId);
      return parent?.emoji || '';
    }
    return '';
  };

  return (
    <Modal 
      title={t('confirmDelete')} 
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            data-testid="cancel-delete-category-btn"
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            {t('cancel')}
          </button>
          <button
            onClick={() => onConfirm(fallbackCategoryId)}
            data-testid="confirm-delete-category-btn"
            className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer"
          >
            {t('delete')}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-slate-600">{t('confirmDeleteCategory')}</p>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            {t('recategorizeTransactions', 'Recategorize transactions to:')}
          </label>
          <CategoryDropdown
            categoryId={fallbackCategoryId}
            categories={availableCategories}
            onChange={setFallbackCategoryId}
            getCategoryEmoji={getCategoryEmoji}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteCategoryModal;
