import React from 'react';
import { useI18n } from '../../i18n/I18nContext';
import Modal from '../../components/Modal';

interface ConfirmDeleteCategoryModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteCategoryModal: React.FC<ConfirmDeleteCategoryModalProps> = ({ onClose, onConfirm }) => {
  const { t } = useI18n();
  return (
    <Modal 
      title={t('confirmDelete')} 
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
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer"
          >
            {t('delete')}
          </button>
        </>
      }
    >
      <p className="text-slate-600">{t('confirmDeleteCategory')}</p>
    </Modal>
  );
};

export default ConfirmDeleteCategoryModal;
