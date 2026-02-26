import Papa from 'papaparse';
import { Parser, Transaction } from '../types';

export class MBankCSVParser implements Parser {
  async parse(fileContent: string, options?: { expectedCurrency?: string }): Promise<Omit<Transaction, 'id' | 'categoryId'>[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(fileContent, {
        delimiter: ';',
        skipEmptyLines: true,
        complete: (results) => {
          const transactions: Omit<Transaction, 'id' | 'categoryId'>[] = [];
          const rows = results.data as string[][];
          
          let isTableStarted = false;
          let currencyFoundInFile: string | null = null;
          let headerFound = false;

          // First pass to find currency and header
          for (const row of rows) {
            const rowStr = row.join(';');
            
            // Look for currency info
            if (rowStr.includes('#Waluta;')) {
              const nextRowIndex = rows.indexOf(row) + 1;
              if (nextRowIndex < rows.length) {
                currencyFoundInFile = rows[nextRowIndex][0]?.trim() || null;
              }
            }

            if (rowStr.includes('#Data operacji;#Opis operacji;#Rachunek;#Kategoria;#Kwota;')) {
              headerFound = true;
            }
          }

          if (!headerFound) {
            return reject(new Error('Invalid file format: Missing required header.'));
          }

          if (options?.expectedCurrency && currencyFoundInFile && currencyFoundInFile !== options.expectedCurrency) {
            return reject(new Error(`Currency mismatch: File has ${currencyFoundInFile}, but app is set to ${options.expectedCurrency}.`));
          }

          for (const row of rows) {
            if (row.length < 5) continue;
            
            // Detect header
            if (row[0].includes('#Data operacji')) {
              isTableStarted = true;
              continue;
            }
            
            if (!isTableStarted) continue;
            
            const dateStr = row[0].trim();
            // mBank date format: YYYY-MM-DD
            if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) continue;
            
            let description = (row[1] || '').trim();
            
            // Cleaning description
            description = description
              .replace(/ZAKUP PRZY UŻYCIU KARTY W KRAJU/g, '')
              .replace(/ZAKUP PRZY UŻYCIU KARTY - INTERNET/g, '')
              .replace(/transakcja nierozliczona/g, '')
              .replace(/\s+/g, ' ')
              .trim();
            
            // Amount is in column 4, e.g., "-9,69 PLN"
            let amountStr = row[4] || '';
            
            // Extract currency from amount if not found before
            if (!currencyFoundInFile) {
              const match = amountStr.match(/[A-Z]{3}/);
              if (match) currencyFoundInFile = match[0];
            }

            // Check currency mismatch again if we just found it
            if (options?.expectedCurrency && currencyFoundInFile && currencyFoundInFile !== options.expectedCurrency) {
              return reject(new Error(`Currency mismatch: File has ${currencyFoundInFile}, but app is set to ${options.expectedCurrency}.`));
            }

            amountStr = amountStr.replace(/[^\d,-]/g, '').replace(',', '.');
            const amount = parseFloat(amountStr);
            
            if (!isNaN(amount)) {
              transactions.push({
                date: dateStr,
                description,
                amount,
              });
            }
          }
          
          if (transactions.length === 0) {
            return reject(new Error('No transactions found in the file.'));
          }

          resolve(transactions);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }
}

export class ParserFactory {
  static getParser(format: string): Parser {
    switch (format) {
      case 'mbank':
        return new MBankCSVParser();
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }
}
