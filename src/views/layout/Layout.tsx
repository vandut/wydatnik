import React, { useState, useRef } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { useAppContext } from '../../store/AppContext';
import { cn } from '../../lib/utils';
import ErrorModal from './ErrorModal';
import { 
  Wallet, 
  ListOrdered, 
  Tags, 
  Download, 
  Upload, 
  Menu
} from 'lucide-react';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
}

const DesktopSidebar: React.FC<{
  navItems: NavItem[];
  handleSave: () => void;
  handleLoad: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  t: (key: string) => string;
}> = ({ navItems, handleSave, handleLoad, fileInputRef, t }) => (
  <aside className="hidden xl:flex flex-col w-64 bg-white border-r border-slate-200">
    <div className="p-6 flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
        W
      </div>
      <h1 className="text-xl font-bold tracking-tight">Wydatnik</h1>
    </div>
    
    <nav className="flex-1 px-4 space-y-1">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl transition-colors font-medium text-sm",
              isActive 
                ? "bg-indigo-50 text-indigo-700" 
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )
          }
        >
          <item.icon className="w-5 h-5" />
          {item.label}
        </NavLink>
      ))}
    </nav>

    <div className="p-4 border-t border-slate-200 space-y-2">
      <div className="flex gap-2">
        <button 
          onClick={handleSave}
          className="flex-1 flex justify-center items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          {t('save')}
        </button>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex justify-center items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          {t('load')}
        </button>
        <input 
          type="file" 
          accept=".json" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleLoad} 
        />
      </div>
    </div>
  </aside>
);

const MobileHeader: React.FC<{
  handleSave: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  t: (key: string) => string;
  location: { pathname: string };
}> = ({ handleSave, fileInputRef, t, location }) => (
  <header className="xl:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 z-10 shrink-0">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
        W
      </div>
      <h1 className="text-lg font-bold">Wydatnik</h1>
    </div>
    <div className="flex items-center gap-2">
      <button 
        onClick={handleSave}
        className="p-2 md:px-3 md:py-2 flex items-center gap-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium"
        title={t('save')}
      >
        <Download className="w-5 h-5 md:w-4 md:h-4" />
        <span className="hidden md:inline">{t('save')}</span>
      </button>
      <button 
        onClick={() => fileInputRef.current?.click()}
        className="p-2 md:px-3 md:py-2 flex items-center gap-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium"
        title={t('load')}
      >
        <Upload className="w-5 h-5 md:w-4 md:h-4" />
        <span className="hidden md:inline">{t('load')}</span>
      </button>
      {location.pathname === '/transactions' && (
        <>
          <div className="w-px h-6 bg-slate-200 mx-1 md:hidden"></div>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('toggleMobileCategories'))}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors md:hidden"
            title={t('categories')}
          >
            <Menu className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  </header>
);

const MobileBottomNav: React.FC<{ navItems: NavItem[] }> = ({ navItems }) => (
  <nav className="xl:hidden bg-white border-t border-slate-200 pb-safe flex justify-around p-2 z-10">
    {navItems.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) =>
          cn(
            "flex flex-col items-center gap-1 p-2 rounded-lg min-w-[64px]",
            isActive ? "text-indigo-600" : "text-slate-500"
          )
        }
      >
        <item.icon className="w-5 h-5" />
        <span className="text-[10px] font-medium">{item.label}</span>
      </NavLink>
    ))}
  </nav>
);

const Layout: React.FC = () => {
  const { t } = useI18n();
  const { state, dispatch } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const navItems: NavItem[] = [
    { to: '/transactions', icon: ListOrdered, label: t('transactions') },
    { to: '/accounts', icon: Wallet, label: t('accounts') },
    { to: '/categories', icon: Tags, label: t('categories') },
  ];

  const handleSave = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "wydatnik_backup.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedState = JSON.parse(content);
        if (parsedState && parsedState.transactions && parsedState.categories && parsedState.currency) {
          dispatch({ type: 'SET_STATE', payload: parsedState });
        } else {
          setAlertMessage(t('invalidFileFormat'));
        }
      } catch (error) {
        setAlertMessage(t('errorParsingFile'));
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <DesktopSidebar 
        navItems={navItems} 
        handleSave={handleSave} 
        handleLoad={handleLoad} 
        fileInputRef={fileInputRef} 
        t={t} 
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <MobileHeader 
          handleSave={handleSave} 
          fileInputRef={fileInputRef} 
          t={t} 
          location={location} 
        />

        <div className="flex-1 overflow-auto bg-slate-50/50">
          <Outlet />
        </div>

        <MobileBottomNav navItems={navItems} />
      </main>

      <ErrorModal 
        message={alertMessage} 
        onClose={() => setAlertMessage(null)} 
      />
    </div>
  );
};

export default Layout;
