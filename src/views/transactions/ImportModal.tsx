import React, { useState, useRef } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { ParserFactory } from '../../services/parsers';
import { v4 as uuidv4 } from 'uuid';
import { UploadCloud } from 'lucide-react';
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
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error', text: string, summary?: { count: number, start: string, end: string } } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    try {
      const text = await file.text();
      const parser = ParserFactory.getParser(format);
      const parsedTransactions = await parser.parse(text, { expectedCurrency: currency });
      
      if (parsedTransactions.length === 0) {
        throw new Error('No transactions found');
      }

      const transactionsWithIds = parsedTransactions.map(t => ({
        ...t,
        id: uuidv4(),
        categoryId: null,
      }));

      // Calculate range
      const dates = transactionsWithIds.map(t => t.date).sort();
      const summary = {
        count: transactionsWithIds.length,
        start: dates[0],
        end: dates[dates.length - 1]
      };

      onImport(transactionsWithIds);
      setAlertMessage({ 
        type: 'success', 
        text: t('importSuccess'),
        summary
      });
    } catch (error: any) {
      console.error(error);
      setAlertMessage({ type: 'error', text: error.message || t('importError') });
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  if (alertMessage) {
    return (
      <Modal 
        title={alertMessage.type === 'success' ? t('importSuccess') : t('importError')} 
        onClose={() => {
          setAlertMessage(null);
          if (alertMessage.type === 'success') onClose();
        }}
        footer={
          <button
            onClick={() => {
              setAlertMessage(null);
              if (alertMessage.type === 'success') onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
          >
            OK
          </button>
        }
      >
        <div className="space-y-3">
          <p className="text-slate-600">{alertMessage.text}</p>
          {alertMessage.summary && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t('importedCount')}:</span>
                <span className="font-semibold text-slate-800">{alertMessage.summary.count}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t('dateRange')}:</span>
                <span className="font-semibold text-slate-800">
                  {alertMessage.summary.start} - {alertMessage.summary.end}
                </span>
              </div>
            </div>
          )}
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={t('import')} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('importFormat')}</label>
          <select 
            value={format} 
            onChange={(e) => setFormat(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
          >
            <option value="mbank">{t('mBankCSV')}</option>
          </select>
        </div>

        <div 
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
            className="hidden" 
            accept=".csv" 
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ImportModal;
