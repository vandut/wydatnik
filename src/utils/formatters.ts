export const formatCurrency = (amount: number, currency: string, language: string, forceNoSign: boolean = false) => {
  return new Intl.NumberFormat(language, { 
    style: 'currency', 
    currency: currency,
    signDisplay: forceNoSign ? 'never' : 'auto'
  }).format(amount);
};
