import React, { useState, useRef } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { ParserFactory } from '../../services/parsers';
import { v4 as uuidv4 } from 'uuid';
import { UploadCloud, AlertCircle, CheckCircle2 } from 'lucide-react';
import Modal from '../../components/Modal';
import { Transaction } from '../../types';

interface ImportModalProps {
  onClose: () => void;
  onImport: (transactions: Transaction[]) => void;
  currency: string;
}

const ImportModal: React.FC<ImportModalProps> = ({ onClose, onImport, currency }) => {
  const { t } = useI18n();
  const [format, setFormat] = useState('mbank');
  const [isDragging, setIsDragging] = useState(false);
  const [parsedTransactions, setParsedTransactions] = useState<Transaction[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    try {
      setError(null);
      setParsedTransactions(null);
      const text = await file.text();
      const parser = ParserFactory.getParser(format);
      const parsed = await parser.parse(text, { expectedCurrency: currency });
      
      if (parsed.length === 0) {
        throw new Error('No transactions found');
      }

      const transactionsWithIds = parsed.map(t => ({
        ...t,
        id: uuidv4(),
        categoryId: null,
      }));

      setParsedTransactions(transactionsWithIds);
    } catch (err: any) {
      console.error(err);
      setError(err.message || t('importError'));
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleProceed = () => {
    if (parsedTransactions) {
      onImport(parsedTransactions);
      onClose();
    }
  };

  const handleReset = () => {
    setParsedTransactions(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderContent = () => {
    if (error) {
      return (
        <div className="space-y-4" data-testid="import-modal">
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-start gap-3" data-testid="import-error-msg">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">{t('importError')}</h4>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={onClose}
              data-testid="import-cancel-btn"
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleReset}
              data-testid="import-reset-btn"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
            >
              {t('loadAnotherFile') || 'Load another file'}
            </button>
          </div>
        </div>
      );
    }

    if (parsedTransactions) {
      const dates = parsedTransactions.map(t => t.date).sort();
      const summary = {
        count: parsedTransactions.length,
        start: dates[0],
        end: dates[dates.length - 1]
      };

      return (
        <div className="space-y-4" data-testid="import-modal">
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 space-y-3" data-testid="import-summary-view">
            <div className="flex items-center gap-2 text-emerald-700 font-medium pb-2 border-b border-emerald-200/50">
              <CheckCircle2 className="w-5 h-5" />
              {t('importSuccess') || 'File parsed successfully'}
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-emerald-600/80">{t('importedCount')}:</span>
              <span className="font-semibold text-emerald-800">{summary.count}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-emerald-600/80">{t('dateRange')}:</span>
              <span className="font-semibold text-emerald-800">
                {summary.start} - {summary.end}
              </span>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={handleReset}
              data-testid="import-reset-btn"
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
            >
              {t('loadAnotherFile') || 'Load another file'}
            </button>
            <button
              onClick={onClose}
              data-testid="import-cancel-btn"
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleProceed}
              data-testid="import-proceed-btn"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
            >
              {t('proceed') || 'Proceed'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4" data-testid="import-modal">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('importFormat')}</label>
          <select 
            value={format} 
            onChange={(e) => setFormat(e.target.value)}
            data-testid="import-format-select"
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
          >
            <option value="mbank">{t('mBankCSV')}</option>
          </select>
        </div>

        <div 
          data-testid="import-dropzone"
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
            isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <p className="text-sm text-slate-600 font-medium">{t('dropFileHere')}</p>
          <input 
            type="file" 
            data-testid="import-file-input"
            className="hidden" 
            accept=".csv" 
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      </div>
    );
  };

  return (
    <Modal title={t('import')} onClose={onClose}>
      {renderContent()}
    </Modal>
  );
};

export default ImportModal;
