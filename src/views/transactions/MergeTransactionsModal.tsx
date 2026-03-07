import React from 'react';
import { useI18n } from '../../i18n/I18nContext';
import Modal from '../../components/Modal';
import { cn } from '../../lib/utils';
import { Transaction } from '../../types';

interface MergeTransactionsModalProps {
  onClose: () => void;
  onConfirm: () => void;
  selectedCount: number;
  selectedTransactionsList: Transaction[];
  formatCurrency: (amount: number) => string;
}

const MergeTransactionsModal: React.FC<MergeTransactionsModalProps> = ({
  onClose,
  onConfirm,
  selectedCount,
  selectedTransactionsList,
  formatCurrency
}) => {
  const { t } = useI18n();
  const totalAmount = selectedTransactionsList.reduce((sum, t) => sum + t.amount, 0);

  return (
    <Modal 
      title={t('merge')} 
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
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
          >
            {t('merge')}
          </button>
        </>
      }
    >
      <p className="text-slate-600">
        {t('confirmMergeTransactions')}
        <br />
        <span className="font-medium mt-2 block">
          {selectedCount} {t('transactionsWillBeMerged')}
          <span className={cn("ml-1", totalAmount > 0 ? "text-emerald-600" : "text-rose-600")}>
            {formatCurrency(totalAmount)}
          </span>
        </span>
      </p>
    </Modal>
  );
};

export default MergeTransactionsModal;
