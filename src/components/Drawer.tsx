import React from 'react';
import { Menu } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex xl:hidden">
      <div 
        className="fixed inset-0 bg-black/20" 
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 bottom-0 w-[80%] bg-white shadow-xl animate-in slide-in-from-right flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 shrink-0 h-[65px]">
          <h2 className="font-semibold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto bg-white">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Drawer;
