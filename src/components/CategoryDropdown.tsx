import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../i18n/I18nContext';
import { Category } from '../types';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface CategoryDropdownProps {
  categoryId: string | null;
  categories: Category[];
  onChange: (categoryId: string | null) => void;
  getCategoryEmoji: (id: string | null) => string;
  onOpenChange?: (isOpen: boolean) => void;
  isMixed?: boolean;
  compact?: boolean;
  hideLabelBreakpoint?: 'lg' | 'xl';
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  categoryId,
  categories,
  onChange,
  getCategoryEmoji,
  onOpenChange,
  isMixed,
  compact,
  hideLabelBreakpoint,
}) => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom');
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({ position: 'fixed', opacity: 0, pointerEvents: 'none' });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  const selectedCategory = categories.find(c => c.id === categoryId);
  const parentCategory = selectedCategory?.parentId 
    ? categories.find(c => c.id === selectedCategory.parentId) 
    : null;

  let mainLabel = '';
  let subLabel = '';
  let emoji = '';

  if (!isMixed) {
    mainLabel = parentCategory ? parentCategory.name : (selectedCategory ? selectedCategory.name : t('uncategorized'));
    subLabel = parentCategory ? selectedCategory.name : '—';
    emoji = getCategoryEmoji(categoryId);
  } else {
    mainLabel = '';
    emoji = '';
  }

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
        zIndex: 60,
        opacity: 1,
        pointerEvents: 'auto',
      });
    } else if (!isOpen) {
      // Reset style to prevent flashing on next open
      setDropdownStyle({ position: 'fixed', opacity: 0, pointerEvents: 'none' });
    }
    
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

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
      // Also close on scroll to prevent detached dropdown
      document.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', () => setIsOpen(false));
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', () => setIsOpen(false));
    };
  }, [isOpen]);

  const handleSelect = (id: string | null) => {
    onChange(id);
    setIsOpen(false);
  };

  let dropdownContent = null;
  if (isOpen) {
    const mainCategories = categories.filter(c => !c.parentId);
    dropdownContent = (
      <div className="p-1">
        <button
          onClick={() => handleSelect(null)}
          className={cn(
            "w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors flex items-center gap-2 cursor-pointer",
            categoryId === null ? "text-indigo-700 font-medium" : "text-slate-700 hover:bg-slate-50"
          )}
        >
          <span className="w-6 text-center text-base">❓</span>
          <span>{t('uncategorized')}</span>
        </button>
        
        {mainCategories.map(main => {
          const subCategories = categories.filter(c => c.parentId === main.id);
          return (
            <div key={main.id} className="mt-2">
              <button
                onClick={() => handleSelect(main.id)}
                className={cn(
                  "w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors flex items-center gap-2 cursor-pointer",
                  categoryId === main.id ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-700 hover:bg-slate-50 font-medium"
                )}
              >
                <span className="w-6 text-center text-base">{main.emoji}</span>
                <span>{main.name}</span>
              </button>
              
              <div className="relative mt-0.5">
                {subCategories.length > 0 && (
                  <div 
                    className="absolute left-[20px] top-0 w-px bg-slate-200" 
                    style={{ bottom: '14px' }}
                  />
                )}
                
                {subCategories.map(sub => (
                  <div key={sub.id} className="relative flex items-center pl-[38px] pr-2">
                    <div className="absolute left-[20px] top-1/2 w-4 h-px bg-slate-200" />
                    
                    <button
                      onClick={() => handleSelect(sub.id)}
                      className={cn(
                        "w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors cursor-pointer",
                        categoryId === sub.id ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {sub.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-white border flex items-center gap-2 text-left focus:outline-none cursor-pointer",
          hideLabelBreakpoint === 'lg' && "justify-center lg:justify-start",
          hideLabelBreakpoint === 'xl' && "justify-center xl:justify-start",
          compact ? cn("py-1.5 rounded-lg h-[34px]", 
            hideLabelBreakpoint === 'lg' ? "px-2 lg:px-3" : 
            hideLabelBreakpoint === 'xl' ? "px-2 xl:px-3" : "px-3"
          ) : "py-1.5 px-2 rounded-xl",
          isOpen ? "xl:border-indigo-500" : "border-slate-200 hover:border-slate-300",
          // Only remove border radius on desktop (xl) when dropdown is open
          isOpen && position === 'bottom' && (compact ? "xl:rounded-t-lg xl:rounded-b-none xl:border-b-transparent" : "xl:rounded-t-xl xl:rounded-b-none xl:border-b-transparent"),
          isOpen && position === 'top' && (compact ? "xl:rounded-b-lg xl:rounded-t-none xl:border-t-transparent" : "xl:rounded-b-xl xl:rounded-t-none xl:border-t-transparent"),
          // Keep normal border on mobile/tablet when open
          isOpen && "border-slate-200 xl:border-indigo-500"
        )}
      >
        <div className={cn("flex items-center justify-center shrink-0", compact ? "w-5 text-base" : "w-6 text-lg", isMixed && "opacity-0")}>
          {emoji || '❓'}
        </div>
        <div className={cn("flex-1 min-w-0", 
          hideLabelBreakpoint === 'lg' && "hidden lg:block",
          hideLabelBreakpoint === 'xl' && "hidden xl:block"
        )}>
          {mainLabel && (
            <div className={cn("font-medium text-slate-900 truncate leading-tight", compact ? "text-sm" : "text-xs")}>
              {mainLabel}
            </div>
          )}
          {!compact && subLabel && (
            <div className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
              {subLabel}
            </div>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className={cn("w-4 h-4 text-slate-400 shrink-0", 
            hideLabelBreakpoint === 'lg' ? "mr-0 lg:mr-1" : 
            hideLabelBreakpoint === 'xl' ? "mr-0 xl:mr-1" : "mr-1"
          )} />
        ) : (
          <ChevronDown className={cn("w-4 h-4 text-slate-400 shrink-0", 
            hideLabelBreakpoint === 'lg' ? "mr-0 lg:mr-1" : 
            hideLabelBreakpoint === 'xl' ? "mr-0 xl:mr-1" : "mr-1"
          )} />
        )}
      </button>

      {/* Desktop Dropdown via Portal */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className={cn(
            "hidden xl:block bg-white border border-indigo-500 shadow-lg overflow-y-auto",
            position === 'bottom' ? "rounded-b-xl rounded-t-none border-t-0" : "rounded-t-xl rounded-b-none border-b-0"
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
          <div ref={mobileDropdownRef} className="bg-white rounded-t-2xl md:rounded-b-none flex flex-col max-h-[80vh] w-full md:max-w-md animate-in slide-in-from-bottom-8 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
              <h2 className="text-lg font-semibold text-slate-800">{t('selectCategory')}</h2>
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

export default CategoryDropdown;
