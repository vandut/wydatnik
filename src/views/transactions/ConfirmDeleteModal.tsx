import React from 'react';
import { useI18n } from '../../i18n/I18nContext';
import Modal from '../../components/Modal';

interface ConfirmDeleteModalProps {
  onClose: () => void;
  onConfirm: () => void;
  selectedCount: number;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ onClose, onConfirm, selectedCount }) => {
  const { t } = useI18n();
  return (
    <Modal 
      title={t('confirmDelete')} 
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            data-testid="cancel-delete-btn"
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            {t('cancel')}
          </button>
          <button
            onClick={onConfirm}
            data-testid="confirm-delete-btn"
            className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer"
          >
            {t('delete')}
          </button>
        </>
      }
    >
      <p className="text-slate-600">
        {t('confirmDeleteTransactions')}
        <br />
        <span className="font-medium mt-2 block text-rose-600">
          {selectedCount} {t('transactionsWillBeDeleted')}
        </span>
      </p>
    </Modal>
  );
};

export default ConfirmDeleteModal;
