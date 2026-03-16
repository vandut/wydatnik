import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImportModal from './ImportModal';
import { I18nProvider } from '../../i18n/I18nContext';
import fs from 'fs';
import path from 'path';

// Mock uuid to have predictable IDs
vi.mock('uuid', () => ({
  v4: () => 'mock-uuid-1234',
}));

describe('ImportModal', () => {
  const mockOnClose = vi.fn();
  const mockOnImport = vi.fn();
  const currency = 'PLN';

  const renderComponent = () => {
    return render(
      <I18nProvider>
        <ImportModal onClose={mockOnClose} onImport={mockOnImport} currency={currency} />
      </I18nProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly initially', () => {
    renderComponent();
    
    expect(screen.getByTestId('import-modal')).toBeInTheDocument();
    expect(screen.getByTestId('import-format-select')).toBeInTheDocument();
    expect(screen.getByTestId('import-dropzone')).toBeInTheDocument();
  });

  it('handles file selection, parses it and shows summary, then proceeds', async () => {
    renderComponent();
    
    // Read the example CSV file
    const csvContent = fs.readFileSync(path.resolve(__dirname, '../../services/mBank_example.csv'), 'utf-8');
    const file = new File([csvContent], 'mBank_example.csv', { type: 'text/csv' });
    
    const fileInput = screen.getByTestId('import-file-input') as HTMLInputElement;
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    
    fireEvent.change(fileInput);
    
    // Wait for parsing to finish and summary to appear
    await waitFor(() => {
      expect(screen.getByTestId('import-summary-view')).toBeInTheDocument();
    });
    
    // Click Proceed
    fireEvent.click(screen.getByTestId('import-proceed-btn'));
    
    // Check if onImport was called with correct data
    expect(mockOnImport).toHaveBeenCalledTimes(1);
    const importedTransactions = mockOnImport.mock.calls[0][0];
    expect(importedTransactions).toHaveLength(3);
    expect(importedTransactions[0]).toEqual({
      id: 'mock-uuid-1234',
      categoryId: null,
      date: '2026-02-25',
      description: 'Biedronka',
      amount: -9.69,
    });
    
    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('handles parsing error and shows error inline, then resets on "Load another file"', async () => {
    renderComponent();
    
    const invalidCsvContent = 'invalid,csv,content\n1,2,3';
    const file = new File([invalidCsvContent], 'invalid.csv', { type: 'text/csv' });
    
    const fileInput = screen.getByTestId('import-file-input') as HTMLInputElement;
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    
    fireEvent.change(fileInput);
    
    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByTestId('import-error-msg')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Invalid file format: Missing required header.')).toBeInTheDocument();
    
    // Click "Load another file"
    fireEvent.click(screen.getByTestId('import-reset-btn'));
    
    // Verify it went back to the initial state
    expect(screen.queryByTestId('import-error-msg')).not.toBeInTheDocument();
    expect(screen.getByTestId('import-dropzone')).toBeInTheDocument();
  });

  it('handles currency mismatch error', async () => {
    // Render with EUR currency, but file has PLN
    render(
      <I18nProvider>
        <ImportModal onClose={mockOnClose} onImport={mockOnImport} currency="EUR" />
      </I18nProvider>
    );
    
    const csvContent = fs.readFileSync(path.resolve(__dirname, '../../services/mBank_example.csv'), 'utf-8');
    const file = new File([csvContent], 'mBank_example.csv', { type: 'text/csv' });
    
    const fileInput = screen.getByTestId('import-file-input') as HTMLInputElement;
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    
    fireEvent.change(fileInput);
    
    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByTestId('import-error-msg')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Currency mismatch: File has PLN, but app is set to EUR.')).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked from summary view', async () => {
    renderComponent();
    
    const csvContent = fs.readFileSync(path.resolve(__dirname, '../../services/mBank_example.csv'), 'utf-8');
    const file = new File([csvContent], 'mBank_example.csv', { type: 'text/csv' });
    
    const fileInput = screen.getByTestId('import-file-input') as HTMLInputElement;
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      expect(screen.getByTestId('import-summary-view')).toBeInTheDocument();
    });
    
    // Click Cancel
    fireEvent.click(screen.getByTestId('import-cancel-btn'));
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnImport).not.toHaveBeenCalled();
  });
});
