import React, { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { Transaction } from '../../types';
import Modal from '../../components/Modal';
import { v4 as uuidv4 } from 'uuid';
import { format, parseISO, addMonths, differenceInMonths, setDate, lastDayOfMonth, isAfter } from 'date-fns';

interface SplitTransactionModalProps {
  transaction: Transaction;
  onClose: () => void;
  onSave: (newTransactions: Transaction[]) => void;
}

const SplitTransactionModal: React.FC<SplitTransactionModalProps> = ({
  transaction,
  onClose,
  onSave,
}) => {
  const { t } = useI18n();
  const [description, setDescription] = useState(transaction.description);
  
  const originalDate = parseISO(transaction.date);
  const currentYear = originalDate.getFullYear();
  const currentMonth = originalDate.getMonth();

  const [fromYear, setFromYear] = useState(currentYear);
  const [fromMonth, setFromMonth] = useState(currentMonth);
  const [toYear, setToYear] = useState(currentYear);
  const [toMonth, setToMonth] = useState(currentMonth);

  const years = Array.from({ length: 111 }, (_, i) => currentYear - 100 + i); // 100 past, 10 future
  const months = Array.from({ length: 12 }, (_, i) => i);

  const handleSave = () => {
    const startDate = new Date(fromYear, fromMonth, 1);
    const endDate = new Date(toYear, toMonth, 1);
    
    if (isAfter(startDate, endDate)) {
      return; // Invalid range
    }

    const monthsDiff = differenceInMonths(endDate, startDate) + 1;
    if (monthsDiff <= 0) return;

    const splitAmount = transaction.amount / monthsDiff;
    const newTransactions: Transaction[] = [];

    const originalDay = originalDate.getDate();

    for (let i = 0; i < monthsDiff; i++) {
      const targetMonthDate = addMonths(startDate, i);
      const lastDay = lastDayOfMonth(targetMonthDate).getDate();
      const targetDay = Math.min(originalDay, lastDay);
      
      const newDate = setDate(targetMonthDate, targetDay);

      newTransactions.push({
        ...transaction,
        id: uuidv4(),
        date: format(newDate, 'yyyy-MM-dd'),
        description,
        amount: splitAmount,
      });
    }

    onSave(newTransactions);
  };

  return (
    <Modal
      title={t('split')}
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            data-testid="cancel-split-btn"
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={!description.trim() || isAfter(new Date(fromYear, fromMonth, 1), new Date(toYear, toMonth, 1))}
            data-testid="save-split-btn"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {t('save')}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('title')}</label>
          <input
            type="text"
            value={description}
            data-testid="split-title-input"
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('from')}</label>
            <div className="flex gap-2">
              <select
                value={fromMonth}
                data-testid="split-from-month"
                onChange={(e) => setFromMonth(parseInt(e.target.value))}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                {months.map(m => (
                  <option key={m} value={m}>{m + 1}</option>
                ))}
              </select>
              <select
                value={fromYear}
                data-testid="split-from-year"
                onChange={(e) => setFromYear(parseInt(e.target.value))}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('to')}</label>
            <div className="flex gap-2">
              <select
                value={toMonth}
                data-testid="split-to-month"
                onChange={(e) => setToMonth(parseInt(e.target.value))}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                {months.map(m => (
                  <option key={m} value={m}>{m + 1}</option>
                ))}
              </select>
              <select
                value={toYear}
                data-testid="split-to-year"
                onChange={(e) => setToYear(parseInt(e.target.value))}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {isAfter(new Date(fromYear, fromMonth, 1), new Date(toYear, toMonth, 1)) && (
          <p className="text-sm text-rose-600">{t('invalidDateRange')}</p>
        )}
      </div>
    </Modal>
  );
};

export default SplitTransactionModal;
