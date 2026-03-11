import { describe, it, expect } from 'vitest';
import { formatCurrency } from './formatters';

describe('formatCurrency', () => {
  describe('supported languages and currencies', () => {
    it('should format USD in en-US correctly', () => {
      // Note: Node.js Intl.NumberFormat might use different spaces (e.g., non-breaking spaces),
      // so we should be careful with exact string matching or use a regex/replace for spaces.
      const result = formatCurrency(1234.56, 'USD', 'en-US');
      expect(result).toBe('$1,234.56');
    });

    it('should format EUR in de-DE correctly', () => {
      const result = formatCurrency(1234.56, 'EUR', 'de-DE');
      // In German, the format is usually "1.234,56 €" with a non-breaking space
      // We can replace non-breaking spaces with regular spaces for easier testing
      expect(result.replace(/\s/g, ' ')).toBe('1.234,56 €');
    });

    it('should format JPY in ja-JP correctly', () => {
      const result = formatCurrency(1234.56, 'JPY', 'ja-JP');
      // JPY doesn't have decimal places
      expect(result).toBe('￥1,235'); // Note: Intl.NumberFormat rounds 1234.56 to 1235
    });

    it('should format GBP in en-GB correctly', () => {
      const result = formatCurrency(1234.56, 'GBP', 'en-GB');
      expect(result).toBe('£1,234.56');
    });

    it('should format PLN in pl-PL correctly', () => {
      const result = formatCurrency(1234.56, 'PLN', 'pl-PL');
      // Depending on the Node.js/ICU version, it might be "1 234,56 zł" or "1234,56 zł"
      // We remove all spaces (including non-breaking) before the 'zł' to make the test robust
      expect(result.replace(/\s/g, '').replace('zł', ' zł')).toBe('1234,56 zł');
    });
  });

  describe('forceNoSign parameter', () => {
    it('should include the minus sign by default for negative numbers', () => {
      const result = formatCurrency(-1234.56, 'USD', 'en-US');
      expect(result).toBe('-$1,234.56');
    });

    it('should omit the minus sign when forceNoSign is true', () => {
      const result = formatCurrency(-1234.56, 'USD', 'en-US', true);
      expect(result).toBe('$1,234.56');
    });

    it('should format positive numbers correctly when forceNoSign is true', () => {
      const result = formatCurrency(1234.56, 'USD', 'en-US', true);
      expect(result).toBe('$1,234.56');
    });
  });
});
