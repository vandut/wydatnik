import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../../i18n/I18nContext';
import { Category } from '../../types';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CategoryDropdownProps {
  categoryId: string | null;
  categories: Category[];
  onChange: (categoryId: string | null) => void;
  getCategoryEmoji: (id: string | null) => string;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  categoryId,
  categories,
  onChange,
  getCategoryEmoji,
}) => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom');
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({ position: 'fixed', opacity: 0, pointerEvents: 'none' });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const mainCategories = categories.filter(c => !c.parentId);

  const selectedCategory = categories.find(c => c.id === categoryId);
  const parentCategory = selectedCategory?.parentId 
    ? categories.find(c => c.id === selectedCategory.parentId) 
    : null;

  const mainLabel = parentCategory ? parentCategory.name : (selectedCategory ? selectedCategory.name : t('uncategorized'));
  const subLabel = parentCategory ? selectedCategory.name : (selectedCategory ? t('mainCategory') : t('selectCategory'));
  const emoji = getCategoryEmoji(categoryId);

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
      // Reset style to prevent flashing on next open
      setDropdownStyle({ position: 'fixed', opacity: 0, pointerEvents: 'none' });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Also close on scroll to prevent detached dropdown
      document.addEventListener('scroll', () => setIsOpen(false), true);
      window.addEventListener('resize', () => setIsOpen(false));
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', () => setIsOpen(false), true);
      window.removeEventListener('resize', () => setIsOpen(false));
    };
  }, [isOpen]);

  const handleSelect = (id: string | null) => {
    onChange(id);
    setIsOpen(false);
  };

  const dropdownContent = (
    <div className="p-1">
      <button
        onClick={() => handleSelect(null)}
        className={cn(
          "w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors flex items-center gap-2",
          categoryId === null ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-700 hover:bg-slate-50"
        )}
      >
        <span className="w-5 text-center">❓</span>
        <span>{t('uncategorized')}</span>
      </button>
      
      {mainCategories.map(main => (
        <div key={main.id} className="mt-1">
          <button
            onClick={() => handleSelect(main.id)}
            className={cn(
              "w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors flex items-center gap-2",
              categoryId === main.id ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-700 hover:bg-slate-50 font-medium"
            )}
          >
            <span className="w-5 text-center">{main.emoji}</span>
            <span>{main.name}</span>
          </button>
          
          <div className="pl-6 mt-0.5 space-y-0.5">
            {categories.filter(c => c.parentId === main.id).map(sub => (
              <button
                key={sub.id}
                onClick={() => handleSelect(sub.id)}
                className={cn(
                  "w-full text-left px-2 py-1 rounded-md text-xs transition-colors flex items-center gap-2",
                  categoryId === sub.id ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <div className="w-1 h-1 rounded-full bg-slate-300" />
                <span>{sub.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-white border hover:border-slate-300 py-1.5 px-2 flex items-center gap-2 text-left focus:outline-none",
          isOpen ? "border-indigo-500" : "border-slate-200 rounded-xl",
          isOpen && position === 'bottom' && "rounded-t-xl rounded-b-none border-b-transparent",
          isOpen && position === 'top' && "rounded-b-xl rounded-t-none border-t-transparent"
        )}
      >
        <div className="w-6 flex items-center justify-center text-lg shrink-0">
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-slate-900 truncate leading-tight">
            {mainLabel}
          </div>
          <div className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
            {subLabel}
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
      </button>

      {/* Desktop Dropdown via Portal */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className={cn(
            "hidden md:block bg-white border border-indigo-500 shadow-lg overflow-y-auto",
            position === 'bottom' ? "rounded-b-xl rounded-t-none border-t-0" : "rounded-t-xl rounded-b-none border-b-0"
          )}
          style={dropdownStyle}
        >
          {dropdownContent}
        </div>,
        document.body
      )}

      {/* Mobile Modal */}
      {isOpen && createPortal(
        <div className="md:hidden fixed inset-0 z-[60] flex flex-col bg-black/50">
          <div className="flex-1" onClick={() => setIsOpen(false)} />
          <div className="bg-white rounded-t-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
              <h2 className="text-lg font-semibold text-slate-800">{t('selectCategory')}</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
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
