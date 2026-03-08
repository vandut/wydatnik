import React, { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { Transaction, Category } from '../../types';
import Modal from '../../components/Modal';
import CategoryDropdown from '../../components/CategoryDropdown';

interface EditTransactionModalProps {
  transaction: Transaction;
  categories: Category[];
  onClose: () => void;
  onSave: (updatedTransaction: Transaction) => void;
  getCategoryEmoji: (id: string | null) => string;
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  transaction,
  categories,
  onClose,
  onSave,
  getCategoryEmoji,
}) => {
  const { t } = useI18n();
  const [date, setDate] = useState(transaction.date);
  const [description, setDescription] = useState(transaction.description);
  const [categoryId, setCategoryId] = useState<string | null>(transaction.categoryId);

  const handleSave = () => {
    onSave({
      ...transaction,
      date,
      description,
      categoryId,
    });
  };

  return (
    <Modal
      title={t('edit')}
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
            disabled={!description.trim() || !date}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {t('save')}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('date')}</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('title')}</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('category')}</label>
          <div className="border border-slate-300 rounded-xl">
            <CategoryDropdown
              categoryId={categoryId}
              categories={categories}
              onChange={setCategoryId}
              getCategoryEmoji={getCategoryEmoji}
              onOpenChange={() => {}}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditTransactionModal;
