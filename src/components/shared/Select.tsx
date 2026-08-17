'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options?: SelectOption[];
  groups?: SelectGroup[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  required?: boolean;
  id?: string;
  'aria-label'?: string;
}

export default function Select({
  value,
  onChange,
  options = [],
  groups,
  placeholder = '',
  className = '',
  disabled = false,
  error = false,
  required = false,
  id,
  'aria-label': ariaLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const flat: SelectOption[] = groups ? groups.flatMap(g => g.options) : options;
  const selected = flat.find(o => o.value === value);

  const close = useCallback(() => {
    setOpen(false);
    setHighlighted(-1);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [close]);

  useEffect(() => {
    if (open && highlighted >= 0 && listRef.current) {
      const el = listRef.current.querySelector<HTMLElement>(`[data-index="${highlighted}"]`);
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [open, highlighted]);

  function pick(v: string) {
    onChange(v);
    close();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setHighlighted(Math.max(0, flat.findIndex(o => o.value === value)));
      } else if (highlighted >= 0 && flat[highlighted]) {
        pick(flat[highlighted].value);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) { setOpen(true); setHighlighted(0); }
      else setHighlighted(h => Math.min(flat.length - 1, h + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(h => Math.max(0, h - 1));
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      close();
    }
  }

  let flatIndex = -1;
  const renderOption = (o: SelectOption) => {
    flatIndex += 1;
    const idx = flatIndex;
    const isSelected = o.value === value;
    const isHighlighted = idx === highlighted;
    return (
      <button
        key={`${o.value}-${idx}`}
        type="button"
        role="option"
        aria-selected={isSelected}
        data-index={idx}
        onMouseEnter={() => setHighlighted(idx)}
        onClick={() => pick(o.value)}
        className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between gap-3 ${
          isSelected
            ? 'text-accent font-bold'
            : isHighlighted
              ? 'bg-soft text-heading'
              : 'text-body'
        }`}
      >
        <span className="truncate">{o.label}</span>
        {isSelected && (
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
    );
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => { if (!open) setHighlighted(Math.max(0, flat.findIndex(o => o.value === value))); setOpen(!open); }}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className={`w-full px-4 py-3 rounded-xl border bg-card text-sm text-left flex items-center justify-between gap-2 transition-colors focus:outline-none focus:border-[var(--accent)] disabled:opacity-60 ${
          error ? 'border-red-400' : open ? 'border-[var(--accent)]' : 'border-line'
        } ${selected ? 'text-heading' : 'text-muted-e'}`}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <svg
          className={`w-4 h-4 shrink-0 text-muted-e transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Invisible native input so `required` participates in form validation */}
      {required && (
        <input
          tabIndex={-1}
          aria-hidden="true"
          required
          value={value}
          onChange={() => {}}
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
        />
      )}

      {open && (
        <div
          ref={listRef}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2 z-50 bg-card border border-card rounded-2xl shadow-xl shadow-black/15 py-2 max-h-64 overflow-y-auto no-scrollbar"
        >
          {groups
            ? groups.map((g, gi) => (
                <div key={`${g.label}-${gi}`}>
                  {g.label && g.label !== '—' && (
                    <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-e">{g.label}</p>
                  )}
                  {g.options.map(renderOption)}
                </div>
              ))
            : options.map(renderOption)}
        </div>
      )}
    </div>
  );
}
