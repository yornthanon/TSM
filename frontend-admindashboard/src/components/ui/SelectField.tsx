import React from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

type SelectOption = {
  value: string;
  label: string;
};

type MenuPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

export interface SelectFieldProps {
  id?: string;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

/** A dark, viewport-anchored select menu that avoids the full-screen native phone picker. */
export const SelectField: React.FC<SelectFieldProps> = ({
  id,
  value,
  options,
  onChange,
  disabled = false,
  ariaLabel,
  className = '',
}) => {
  const generatedId = React.useId();
  const triggerId = id ?? `select-${generatedId}`;
  const listboxId = `${triggerId}-listbox`;
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(selectedIndex);
  const [position, setPosition] = React.useState<MenuPosition | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const updatePosition = React.useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
    const gap = 6;
    const preferredHeight = Math.min(240, Math.max(88, options.length * 40 + 8));
    const spaceBelow = window.innerHeight - rect.bottom - gap - 8;
    const spaceAbove = rect.top - gap - 8;
    const openAbove = spaceBelow < Math.min(144, preferredHeight) && spaceAbove > spaceBelow;
    const maxHeight = Math.min(preferredHeight, Math.max(88, openAbove ? spaceAbove : spaceBelow));
    const top = Math.max(
      8,
      Math.min(openAbove ? rect.top - maxHeight - gap : rect.bottom + gap, window.innerHeight - maxHeight - 8)
    );
    const width = Math.min(rect.width, viewportWidth - 16);
    const left = Math.min(Math.max(8, rect.left), viewportWidth - width - 8);

    setPosition({ top, left, width, maxHeight });
  }, [options.length]);

  React.useLayoutEffect(() => {
    if (!open) return;

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, updatePosition]);

  React.useEffect(() => {
    if (!open) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    document.getElementById(`${listboxId}-option-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, listboxId, open]);

  const choose = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || options.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) {
        setActiveIndex(selectedIndex);
        setOpen(true);
      } else {
        setActiveIndex((index) => Math.min(index + 1, options.length - 1));
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        setActiveIndex(selectedIndex);
        setOpen(true);
      } else {
        setActiveIndex((index) => Math.max(index - 1, 0));
      }
    } else if (event.key === 'Home' && open) {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === 'End' && open) {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open) choose(activeIndex);
      else {
        setActiveIndex(selectedIndex);
        setOpen(true);
      }
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    } else if (event.key === 'Tab' && open) {
      setOpen(false);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open ? `${listboxId}-option-${activeIndex}` : undefined}
        disabled={disabled}
        onClick={() => {
          setActiveIndex(selectedIndex);
          setOpen((wasOpen) => !wasOpen);
        }}
        onKeyDown={handleKeyDown}
        className={`input flex items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      >
        <span className="min-w-0 truncate">{selectedOption?.label ?? 'Select an option'}</span>
        <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 text-[#9da0a8] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && position && createPortal(
        <div
          ref={menuRef}
          id={listboxId}
          role="listbox"
          aria-labelledby={ariaLabel ? undefined : triggerId}
          className="fixed z-[100] overflow-y-auto overscroll-contain rounded-lg border border-[#3c3f41] bg-[#1e1f22] p-1 shadow-[0_12px_30px_rgba(0,0,0,0.48)]"
          style={{ top: position.top, left: position.left, width: position.width, maxHeight: position.maxHeight }}
        >
          {options.map((option, index) => {
            const selected = option.value === value;
            const active = index === activeIndex;
            return (
              <div
                key={option.value}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={selected}
                onPointerDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(index)}
                className={`flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active ? 'bg-[#2b2d30]' : 'hover:bg-[#25262a]'
                } ${selected ? 'font-medium text-[#4ec9b0]' : 'text-[#c4c7ce]'}`}
              >
                <span className="min-w-0 truncate">{option.label}</span>
                {selected && <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-[#4ec9b0]" />}
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
};
