import React, { useState, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip as BarTooltip
} from 'recharts';
import { Category, Transaction } from '../../types';
import { MonthData } from './analyticsUtils';
import { SYSTEM_CATEGORY_INCOME } from '../../store/initialState';
import { useI18n } from '../../i18n/I18nContext';
import { useAppContext } from '../../store/AppContext';

interface AnalyticsChartsProps {
  monthData: MonthData[];
  categories: Category[];
  selectedCategoryIds: Set<string | null>;
}

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#0ea5e9',
  '#3b82f6', '#a855f7', '#d946ef', '#f43f5e', '#f97316'
];

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  monthData,
  categories,
  selectedCategoryIds,
}) => {
  const { t } = useI18n();
  const { state } = useAppContext();
  const [includeInvestments, setIncludeInvestments] = useState(false);
  const [colorCodeExpenses, setColorCodeExpenses] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(navigator.language, {
      style: 'currency',
      currency: state.currency,
    }).format(amount);
  };

  const getParentCategory = (categoryId: string | null) => {
    if (!categoryId) return null;
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return null;
    if (cat.parentId) {
      return categories.find(c => c.id === cat.parentId) || cat;
    }
    return cat;
  };

  const isIncomeCategory = (categoryId: string | null) => {
    const parent = getParentCategory(categoryId);
    return parent?.id === SYSTEM_CATEGORY_INCOME;
  };

  const isNotExpenseCategory = (categoryId: string | null) => {
    if (!categoryId) return false;
    const cat = categories.find(c => c.id === categoryId);
    const parent = getParentCategory(categoryId);
    return cat?.isNotExpense || parent?.isNotExpense || false;
  };

  // --- Process Data for Pie Chart ---
  const pieData = useMemo(() => {
    const categoryTotals: Record<string, { name: string; value: number; color: string }> = {};
    let colorIndex = 0;

    monthData.forEach(month => {
      month.transactions.forEach(transaction => {
        const catId = transaction.categoryId || null;
        
        // Exclude if not selected in filter
        if (!selectedCategoryIds.has(catId)) return;
        
        // Exclude Income entirely from expenses pie
        if (isIncomeCategory(catId)) return;

        // Exclude non-expenses if toggle is off
        if (!includeInvestments && isNotExpenseCategory(catId)) return;

        const parent = getParentCategory(catId);
        const parentId = parent ? parent.id : 'uncategorized';
        const parentName = parent ? `${parent.emoji || ''} ${parent.name}`.trim() : t('uncategorized');

        if (!categoryTotals[parentId]) {
          categoryTotals[parentId] = {
            name: parentName,
            value: 0,
            color: COLORS[colorIndex % COLORS.length]
          };
          colorIndex++;
        }

        // Add absolute value to total
        categoryTotals[parentId].value += Math.abs(transaction.amount);
      });
    });

    return Object.values(categoryTotals).filter(d => d.value > 0).sort((a, b) => b.value - a.value);
  }, [monthData, selectedCategoryIds, includeInvestments, categories, t]);

  // --- Process Data for Bar Chart ---
  const barData = useMemo(() => {
    return monthData.map(month => {
      const dataPoint: any = { month: month.month, Income: 0 };
      if (!colorCodeExpenses) {
        dataPoint.Expenses = 0;
      }
      
      month.transactions.forEach(transaction => {
        const catId = transaction.categoryId || null;
        
        // Income is always calculated based on the Income category, regardless of selection
        if (isIncomeCategory(catId)) {
          dataPoint.Income += Math.abs(transaction.amount);
          return;
        }

        // For expenses, respect the filter
        if (!selectedCategoryIds.has(catId)) return;
        if (!includeInvestments && isNotExpenseCategory(catId)) return;

        const amount = Math.abs(transaction.amount);
        
        if (colorCodeExpenses) {
          const parent = getParentCategory(catId);
          const parentName = parent ? `${parent.emoji || ''} ${parent.name}`.trim() : t('uncategorized');
          dataPoint[parentName] = (dataPoint[parentName] || 0) + amount;
        } else {
          dataPoint.Expenses += amount;
        }
      });

      return dataPoint;
    });
  }, [monthData, selectedCategoryIds, includeInvestments, colorCodeExpenses, categories, t]);

  // Get all unique category names for the stacked bar chart keys
  const expenseKeys = useMemo(() => {
    if (!colorCodeExpenses) return ['Expenses'];
    const keys = new Set<string>();
    barData.forEach(d => {
      Object.keys(d).forEach(k => {
        if (k !== 'month' && k !== 'Income') keys.add(k);
      });
    });
    return Array.from(keys);
  }, [barData, colorCodeExpenses]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-semibold text-slate-800">{t('chartSettings')}</h3>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input 
              type="checkbox" 
              checked={includeInvestments} 
              onChange={(e) => setIncludeInvestments(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            {t('includeInvestments')}
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input 
              type="checkbox" 
              checked={colorCodeExpenses} 
              onChange={(e) => setColorCodeExpenses(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            {t('colorCodeExpenses')}
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1 flex flex-col">
          <h3 className="font-semibold text-slate-800 mb-4">{t('expenseBreakdown')}</h3>
          <div className="flex-1 min-h-[300px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={0}
                    dataKey="value"
                    isAnimationActive={false}
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm text-center">
                {t('noExpenseData')}
              </div>
            )}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1 lg:col-span-2 flex flex-col">
          <h3 className="font-semibold text-slate-800 mb-4">{t('monthlyCashFlow')}</h3>
          <div className="flex-1 min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }} barGap={0}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b', angle: -45, textAnchor: 'end' }}
                  interval={0}
                  dy={0}
                  dx={0}
                  height={60}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(value) => {
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                    return value;
                  }}
                  dx={-10}
                />
                <BarTooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                
                {/* Income Bar */}
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} name={t('income')} isAnimationActive={false} />
                
                {/* Expense Bars */}
                {colorCodeExpenses ? (
                  expenseKeys.map((key, index) => {
                    const color = pieData.find(p => p.name === key)?.color || COLORS[index % COLORS.length];
                    return (
                      <Bar 
                        key={key} 
                        dataKey={key} 
                        stackId="expenses" 
                        fill={color} 
                        radius={index === expenseKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} 
                        isAnimationActive={false}
                      />
                    );
                  })
                ) : (
                  <Bar dataKey="Expenses" stackId="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} name={t('expenses')} isAnimationActive={false} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
