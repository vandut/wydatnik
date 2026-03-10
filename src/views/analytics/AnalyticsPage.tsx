import React, { useState, useMemo, useEffect } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { useAppContext } from '../../store/AppContext';
import { processTransactionsForAnalytics } from './analyticsUtils';
import { SYSTEM_CATEGORY_INCOME, SYSTEM_CATEGORY_INVESTMENT } from '../../store/initialState';
import MonthRangePicker from './MonthRangePicker';
import CategoryFilterTable from './CategoryFilterTable';

const AnalyticsPage: React.FC = () => {
  const { t } = useI18n();
  const { state } = useAppContext();

  // Default to last 12 months
  const defaultEnd = new Date();
  const defaultStart = new Date();
  defaultStart.setFullYear(defaultStart.getFullYear() - 1);

  const formatMonth = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const [startMonth, setStartMonth] = useState(formatMonth(defaultStart));
  const [endMonth, setEndMonth] = useState(formatMonth(defaultEnd));

  const monthData = useMemo(() => {
    return processTransactionsForAnalytics(
      state.transactions,
      startMonth,
      endMonth,
      SYSTEM_CATEGORY_INCOME,
      SYSTEM_CATEGORY_INVESTMENT
    );
  }, [state.transactions, startMonth, endMonth]);

  const allTransactionsInRange = useMemo(() => {
    return monthData.flatMap(m => m.transactions);
  }, [monthData]);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string | null>>(new Set());

  // Initialize selected categories on first load or when categories change
  useEffect(() => {
    const ids = new Set<string | null>();
    ids.add(null);
    state.categories.forEach(c => ids.add(c.id));
    setSelectedCategoryIds(ids);
  }, [state.categories]);

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto">
      <div className="p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900">{t('analytics')}</h1>
          
          <MonthRangePicker
            startMonth={startMonth}
            endMonth={endMonth}
            onStartMonthChange={setStartMonth}
            onEndMonthChange={setEndMonth}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Phase 2: Data Processing Validation</h2>
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              Selected Range: <span className="font-medium text-slate-900">{startMonth}</span> to <span className="font-medium text-slate-900">{endMonth}</span>
            </p>
            <p className="text-sm text-slate-600">
              Total Months in Timeline: <span className="font-medium text-slate-900">{monthData.length}</span>
            </p>
            <div className="mt-4 border border-slate-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium">
                  <tr>
                    <th className="px-4 py-2 border-b border-slate-100">Month</th>
                    <th className="px-4 py-2 border-b border-slate-100 text-right">Transactions Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthData.map(data => (
                    <tr key={data.month} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2 font-medium text-slate-800">{data.month}</td>
                      <td className="px-4 py-2 text-right text-slate-600">{data.transactions.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <CategoryFilterTable
          transactions={allTransactionsInRange}
          categories={state.categories}
          selectedCategoryIds={selectedCategoryIds}
          onSelectionChange={setSelectedCategoryIds}
        />
      </div>
    </div>
  );
};

export default AnalyticsPage;
