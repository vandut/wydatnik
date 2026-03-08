import { Transaction } from '../../types';

export interface MonthData {
  month: string; // YYYY-MM
  transactions: Transaction[];
  incomeTotal: number;
  expenseTotal: number;
}

export function generateMonthTimeline(startMonth: string, endMonth: string): string[] {
  const timeline: string[] = [];
  let current = new Date(`${startMonth}-01T00:00:00Z`);
  const end = new Date(`${endMonth}-01T00:00:00Z`);

  while (current <= end) {
    const year = current.getUTCFullYear();
    const month = String(current.getUTCMonth() + 1).padStart(2, '0');
    timeline.push(`${year}-${month}`);
    current.setUTCMonth(current.getUTCMonth() + 1);
  }

  return timeline;
}

export function processTransactionsForAnalytics(
  transactions: Transaction[],
  startMonth: string,
  endMonth: string,
  incomeCategoryId: string,
  investmentCategoryId: string
): MonthData[] {
  const timeline = generateMonthTimeline(startMonth, endMonth);
  
  const dataByMonth: Record<string, MonthData> = {};
  
  timeline.forEach(month => {
    dataByMonth[month] = {
      month,
      transactions: [],
      incomeTotal: 0,
      expenseTotal: 0,
    };
  });

  transactions.forEach(t => {
    const month = t.date.substring(0, 7); // YYYY-MM
    if (dataByMonth[month]) {
      dataByMonth[month].transactions.push(t);
      
      // We will need to properly calculate income and expense later in Phase 4 based on categories
      // For now, we just group them.
    }
  });

  return timeline.map(month => dataByMonth[month]);
}
