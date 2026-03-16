import React, { useState, useLayoutEffect, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { pl, enUS } from 'date-fns/locale';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { cn } from '../../lib/utils';

interface MonthDropdownProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  availableMonths: string[];
}

const MonthDropdown: React.FC<MonthDropdownProps> = ({ currentDate, setCurrentDate, availableMonths }) => {
  const { t, language } = useI18n();
  const dateLocale = language === 'pl' ? pl : enUS;
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({ position: 'fixed', opacity: 0, pointerEvents: 'none' });

  useLayoutEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const requiredSpace = window.innerHeight * 0.4; // 40vh
      
      let newPosition: 'bottom' | 'top' = 'bottom';
      let top, bottom;
      if (spaceBelow < requiredSpace && spaceAbove > spaceBelow) {
        // Show above
        newPosition = 'top';
        bottom = window.innerHeight - rect.top;
      } else {
        // Show below
        newPosition = 'bottom';
        top = rect.bottom;
      }

      setPosition(newPosition);
      setDropdownStyle({
        position: 'fixed',
        top: top !== undefined ? Math.round(top) : undefined,
        bottom: bottom !== undefined ? Math.round(bottom) : undefined,
        left: Math.round(rect.left),
        width: Math.round(rect.width),
        maxHeight: '40vh',
        zIndex: 50,
        opacity: 1,
        pointerEvents: 'auto',
      });
    } else if (!isOpen) {
      setDropdownStyle({ position: 'fixed', opacity: 0, pointerEvents: 'none' });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        (dropdownRef.current && dropdownRef.current.contains(target)) ||
        (mobileDropdownRef.current && mobileDropdownRef.current.contains(target)) ||
        (triggerRef.current && triggerRef.current.contains(target))
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleScroll = (event: Event) => {
      const target = event.target as Node;
      if (
        (dropdownRef.current && dropdownRef.current.contains(target)) ||
        (mobileDropdownRef.current && mobileDropdownRef.current.contains(target))
      ) {
        return;
      }
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', () => setIsOpen(false));
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', () => setIsOpen(false));
    };
  }, [isOpen]);

  const handleSelect = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    setCurrentDate(new Date(parseInt(year), parseInt(month) - 1, 1));
    setIsOpen(false);
  };

  const currentMonthStr = format(currentDate, 'yyyy-MM');

  const dropdownContent = (
    <div className="p-1">
      {availableMonths.map(monthStr => {
        const [year, month] = monthStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        const isSelected = monthStr === currentMonthStr;
        return (
          <button
            key={monthStr}
            onClick={() => handleSelect(monthStr)}
            data-testid={`month-option-${monthStr}`}
            className={cn(
              "w-full text-left px-3 py-2 rounded-md text-sm transition-colors cursor-pointer capitalize",
              isSelected ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-700 hover:bg-slate-50"
            )}
          >
            {format(date, 'LLLL yyyy', { locale: dateLocale })}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        data-testid="month-dropdown-trigger"
        className={cn(
          "flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors cursor-pointer min-w-[160px] justify-center border",
          isOpen ? "border-indigo-500 bg-white" : "border-transparent hover:bg-slate-100",
          isOpen && position === 'bottom' && "xl:rounded-t-lg xl:rounded-b-none xl:border-b-transparent",
          isOpen && position === 'top' && "xl:rounded-b-lg xl:rounded-t-none xl:border-t-transparent"
        )}
      >
        <span className="text-lg font-medium text-slate-800 capitalize">
          {format(currentDate, 'LLLL yyyy', { locale: dateLocale })}
        </span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-slate-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-500" />
        )}
      </button>

      {/* Desktop Dropdown via Portal */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          data-testid="month-dropdown-desktop"
          className={cn(
            "hidden xl:block bg-white border border-indigo-500 shadow-lg overflow-y-auto",
            position === 'bottom' ? "rounded-b-lg rounded-t-none border-t-0" : "rounded-t-lg rounded-b-none border-b-0"
          )}
          style={dropdownStyle}
        >
          {position === 'bottom' && <div className="mx-auto w-[calc(100%-16px)] h-px bg-slate-200 mb-1" />}
          {dropdownContent}
          {position === 'top' && <div className="mx-auto w-[calc(100%-16px)] h-px bg-slate-200 mt-1" />}
        </div>,
        document.body
      )}

      {/* Mobile Modal */}
      {isOpen && createPortal(
        <div className="xl:hidden fixed inset-0 z-[60] flex flex-col bg-black/50 animate-in fade-in duration-200 items-center justify-end md:p-4 md:pb-0">
          <div className="flex-1 w-full" onClick={() => setIsOpen(false)} />
          <div ref={mobileDropdownRef} data-testid="month-dropdown-mobile" className="bg-white rounded-t-2xl md:rounded-b-none flex flex-col max-h-[80vh] w-full md:max-w-md animate-in slide-in-from-bottom-8 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
              <h2 className="text-lg font-semibold text-slate-800">{t('selectMonth')}</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-2 pb-safe">
              {dropdownContent}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MonthDropdown;
