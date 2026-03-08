import React from 'react';
import { useI18n } from '../../i18n/I18nContext';

interface MonthRangePickerProps {
  startMonth: string;
  endMonth: string;
  onStartMonthChange: (month: string) => void;
  onEndMonthChange: (month: string) => void;
}

const MonthRangePicker: React.FC<MonthRangePickerProps> = ({
  startMonth,
  endMonth,
  onStartMonthChange,
  onEndMonthChange,
}) => {
  const { t } = useI18n();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-200 w-full md:w-auto">
      <div className="flex flex-col w-full sm:w-auto">
        <label className="text-[10px] uppercase font-semibold text-slate-500 mb-1 px-1">{t('from')}</label>
        <input 
          type="month" 
          value={startMonth}
          onChange={(e) => onStartMonthChange(e.target.value)}
          className="w-full sm:w-auto px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-[34px]"
        />
      </div>
      <div className="hidden sm:flex items-center justify-center h-[34px]">
        <span className="text-slate-400 font-medium px-1">-</span>
      </div>
      <div className="flex flex-col w-full sm:w-auto">
        <label className="text-[10px] uppercase font-semibold text-slate-500 mb-1 px-1">{t('to')}</label>
        <input 
          type="month" 
          value={endMonth}
          onChange={(e) => onEndMonthChange(e.target.value)}
          className="w-full sm:w-auto px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-[34px]"
        />
      </div>
    </div>
  );
};

export default MonthRangePicker;
