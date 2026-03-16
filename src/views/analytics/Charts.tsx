import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Category, Transaction } from '../../types';
import { useI18n } from '../../i18n/I18nContext';
import { formatCurrency } from '../../utils/formatters';
import { useAppContext } from '../../store/AppContext';
import { SYSTEM_CATEGORY_INCOME, SYSTEM_CATEGORY_INVESTMENT } from '../../store/initialState';
import { generateMonthTimeline } from './analyticsUtils';

interface ChartsProps {
  categories: Category[];
  transactions: Transaction[];
  selectedCategoryIds: Set<string>;
  startMonth: string;
  endMonth: string;
}

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#0ea5e9',
  '#3b82f6', '#a855f7', '#d946ef', '#f43f5e', '#f97316'
];

const Charts: React.FC<ChartsProps> = ({
  categories,
  transactions,
  selectedCategoryIds,
  startMonth,
  endMonth,
}) => {
  const { t } = useI18n();
  const { state } = useAppContext();
  const [includeInvestments, setIncludeInvestments] = useState(false);

  // Helper to check if a category is an investment (or non-expense)
  const isInvestment = (categoryId: string | null) => {
    if (!categoryId) return false;
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return false;
    if (cat.isNotExpense) return true;
    if (cat.parentId) {
      const parent = categories.find(p => p.id === cat.parentId);
      if (parent?.isNotExpense) return true;
    }
    return false;
  };

  // Helper to check if a category is income
  const isIncome = (categoryId: string | null) => {
    if (!categoryId) return false;
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return false;
    if (cat.id === SYSTEM_CATEGORY_INCOME) return true;
    if (cat.parentId === SYSTEM_CATEGORY_INCOME) return true;
    return false;
  };

  // Filter transactions based on selection and toggles
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const catId = t.categoryId || 'uncategorized';
      
      // Must be selected in the table
      if (!selectedCategoryIds.has(catId)) return false;

      // Exclude income from expense charts
      if (isIncome(t.categoryId)) return false;

      // Exclude investments if toggle is off
      if (!includeInvestments && isInvestment(t.categoryId)) return false;

      return true;
    });
  }, [transactions, selectedCategoryIds, includeInvestments, categories]);

  // --- Pie Chart Data ---
  const pieData = useMemo(() => {
    const totalsByParent: Record<string, number> = {};

    filteredTransactions.forEach(t => {
      let parentId = 'uncategorized';
      let parentName = t('uncategorized');

      if (t.categoryId) {
        const cat = categories.find(c => c.id === t.categoryId);
        if (cat) {
          if (cat.parentId) {
            parentId = cat.parentId;
            const parent = categories.find(p => p.id === cat.parentId);
            parentName = parent ? `${parent.emoji || ''} ${parent.name}`.trim() : cat.name;
          } else {
            parentId = cat.id;
            parentName = `${cat.emoji || ''} ${cat.name}`.trim();
          }
        }
      }

      if (!totalsByParent[parentName]) {
        totalsByParent[parentName] = 0;
      }
      // We use absolute value for pie chart
      totalsByParent[parentName] += Math.abs(t.amount);
    });

    return Object.entries(totalsByParent)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions, categories, t]);

  // --- Bar Chart Data ---
  const barData = useMemo(() => {
    const timeline = generateMonthTimeline(startMonth, endMonth);
    
    // Initialize data structure
    const dataByMonth: Record<string, any> = {};
    timeline.forEach(month => {
      dataByMonth[month] = {
        month,
        Income: 0,
        // We will dynamically add category totals here
      };
    });

    // Process all transactions in range
    transactions.forEach(t => {
      const month = t.date.substring(0, 7);
      if (!dataByMonth[month]) return;

      const catId = t.categoryId || 'uncategorized';

      // Handle Income
      if (isIncome(t.categoryId)) {
        // Only include income if it's selected in the filter table?
        // The requirements say: "Bar 1 (Income): Total Income for the month"
        // Let's include it if selected, or maybe always? 
        // Let's only include selected income to be consistent with the filter table.
        if (selectedCategoryIds.has(catId)) {
          dataByMonth[month].Income += Math.abs(t.amount);
        }
        return;
      }

      // Handle Expenses
      // Must be selected
      if (!selectedCategoryIds.has(catId)) return;
      // Check investment toggle
      if (!includeInvestments && isInvestment(t.categoryId)) return;

      // Group by parent category for stacked bars
      let parentName = t('uncategorized');
      if (t.categoryId) {
        const cat = categories.find(c => c.id === t.categoryId);
        if (cat) {
          if (cat.parentId) {
            const parent = categories.find(p => p.id === cat.parentId);
            parentName = parent ? `${parent.emoji || ''} ${parent.name}`.trim() : cat.name;
          } else {
            parentName = `${cat.emoji || ''} ${cat.name}`.trim();
          }
        }
      }

      if (!dataByMonth[month][parentName]) {
        dataByMonth[month][parentName] = 0;
      }
      dataByMonth[month][parentName] += Math.abs(t.amount);
    });

    return timeline.map(month => dataByMonth[month]);
  }, [transactions, startMonth, endMonth, selectedCategoryIds, includeInvestments, categories, t]);

  // Get unique expense categories for stacked bars
  const expenseCategories = useMemo(() => {
    const cats = new Set<string>();
    barData.forEach(monthData => {
      Object.keys(monthData).forEach(key => {
        if (key !== 'month' && key !== 'Income') {
          cats.add(key);
        }
      });
    });
    return Array.from(cats);
  }, [barData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-slate-200 text-sm">
          <p className="font-semibold text-slate-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 py-1">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-slate-600">{entry.name}</span>
              </div>
              <span className="font-medium text-slate-900">
                {formatCurrency(entry.value, state.settings.currency, 'en')}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeInvestments}
            onChange={(e) => setIncludeInvestments(e.target.checked)}
            data-testid="include-investments-checkbox"
            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-slate-700">
            {t('includeInvestments') || 'Include Investments'}
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6" data-testid="pie-chart-container">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">
            {t('expensesByCategory') || 'Expenses by Category'}
          </h3>
          <div className="h-80">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                {t('noData') || 'No data available'}
              </div>
            )}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6" data-testid="bar-chart-container">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">
            {t('monthlyOverview') || 'Monthly Overview'}
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value, state.settings.currency, 'en')}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                
                {/* Income Bar */}
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} name={t('income') || 'Income'} />
                
                {/* Stacked Expense Bars */}
                {expenseCategories.map((category, index) => (
                  <Bar 
                    key={category}
                    dataKey={category}
                    stackId="expenses"
                    fill={COLORS[index % COLORS.length]}
                    radius={index === expenseCategories.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;
