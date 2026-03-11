import React from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { useAppContext } from '../../store/AppContext';
import { Wallet } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const AccountsView: React.FC = () => {
  const { t } = useI18n();
  const { state, dispatch } = useAppContext();

  useDocumentTitle(`${t('accounts')} - Wydatnik`);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t('accounts')}</h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Wallet className="w-6 h-6" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-lg font-medium text-slate-800">{t('accountSettings')}</h3>
              <p className="text-sm text-slate-500">{t('accountSettingsDesc')}</p>
            </div>
            
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('currency')}</label>
              <input
                type="text"
                value={state.currency}
                onChange={(e) => dispatch({ type: 'SET_CURRENCY', payload: e.target.value.toUpperCase() })}
                maxLength={3}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 uppercase"
                placeholder="PLN"
              />
              <p className="text-xs text-slate-500 mt-2">
                {t('currencyDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountsView;
