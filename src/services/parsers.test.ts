import { describe, it, expect } from 'vitest';
import { MBankCSVParser, ParserFactory } from './parsers';

describe('MBankCSVParser', () => {
  const parser = new MBankCSVParser();

  const validCsvContent = `
#Waluta;
PLN;
#Data operacji;#Opis operacji;#Rachunek;#Kategoria;#Kwota;
2023-10-25;ZAKUP PRZY UŻYCIU KARTY W KRAJU Biedronka;1234567890;Zakupy;-45,50 PLN;
2023-10-26;Przelew przychodzący Wynagrodzenie;1234567890;Wynagrodzenie;5000,00 PLN;
2023-10-27;ZAKUP PRZY UŻYCIU KARTY - INTERNET Allegro;1234567890;Zakupy;-120,99 PLN;
2023-10-28;transakcja nierozliczona Żabka;1234567890;Zakupy;-15,20 PLN;
  `.trim();

  it('should parse valid mBank CSV correctly', async () => {
    const transactions = await parser.parse(validCsvContent);
    
    expect(transactions).toHaveLength(4);
    
    // Check first transaction (ZAKUP PRZY UŻYCIU KARTY W KRAJU)
    expect(transactions[0].date).toBe('2023-10-25');
    expect(transactions[0].description).toBe('Biedronka'); // "ZAKUP PRZY UŻYCIU KARTY W KRAJU " should be removed
    expect(transactions[0].amount).toBe(-45.5);

    // Check second transaction (Income)
    expect(transactions[1].date).toBe('2023-10-26');
    expect(transactions[1].description).toBe('Przelew przychodzący Wynagrodzenie');
    expect(transactions[1].amount).toBe(5000);

    // Check third transaction (ZAKUP PRZY UŻYCIU KARTY - INTERNET)
    expect(transactions[2].date).toBe('2023-10-27');
    expect(transactions[2].description).toBe('Allegro'); // "ZAKUP PRZY UŻYCIU KARTY - INTERNET " should be removed
    expect(transactions[2].amount).toBe(-120.99);

    // Check fourth transaction (transakcja nierozliczona)
    expect(transactions[3].date).toBe('2023-10-28');
    expect(transactions[3].description).toBe('Żabka'); // "transakcja nierozliczona " should be removed
    expect(transactions[3].amount).toBe(-15.2);
  });

  it('should reject if required header is missing', async () => {
    const invalidCsv = `
#Waluta;
PLN;
2023-10-25;Biedronka;1234567890;Zakupy;-45,50 PLN;
    `.trim();

    await expect(parser.parse(invalidCsv)).rejects.toThrow('Invalid file format: Missing required header.');
  });

  it('should reject if no transactions are found', async () => {
    const emptyTransactionsCsv = `
#Waluta;
PLN;
#Data operacji;#Opis operacji;#Rachunek;#Kategoria;#Kwota;
    `.trim();

    await expect(parser.parse(emptyTransactionsCsv)).rejects.toThrow('No transactions found in the file.');
  });

  it('should reject if currency mismatch occurs (from header)', async () => {
    await expect(parser.parse(validCsvContent, { expectedCurrency: 'EUR' })).rejects.toThrow('Currency mismatch: File has PLN, but app is set to EUR.');
  });

  it('should reject if currency mismatch occurs (from amount column)', async () => {
    const csvWithoutCurrencyHeader = `
#Data operacji;#Opis operacji;#Rachunek;#Kategoria;#Kwota;
2023-10-25;Biedronka;1234567890;Zakupy;-45,50 EUR;
    `.trim();

    await expect(parser.parse(csvWithoutCurrencyHeader, { expectedCurrency: 'PLN' })).rejects.toThrow('Currency mismatch: File has EUR, but app is set to PLN.');
  });

  it('should parse successfully if expected currency matches', async () => {
    const transactions = await parser.parse(validCsvContent, { expectedCurrency: 'PLN' });
    expect(transactions).toHaveLength(4);
  });
});

describe('ParserFactory', () => {
  it('should return MBankCSVParser for "mbank" format', () => {
    const parser = ParserFactory.getParser('mbank');
    expect(parser).toBeInstanceOf(MBankCSVParser);
  });

  it('should throw an error for unsupported formats', () => {
    expect(() => ParserFactory.getParser('unsupported')).toThrow('Unsupported format: unsupported');
  });
});
