'use client';
import { useState, useRef, useEffect } from 'react';

interface Country {
  code: string;
  dial: string;
  name: string;
  flag: string;
  mask: string;   // e.g. "XX-XXX-XX-XX"
  digits: number; // total local digits
}

const COUNTRIES: Country[] = [
  { code: 'UZ', dial: '998', name: 'Uzbekiston',   flag: '🇺🇿', mask: 'XX-XXX-XX-XX',  digits: 9  },
  { code: 'RU', dial: '7',   name: 'Rossiya',      flag: '🇷🇺', mask: 'XXX-XXX-XX-XX', digits: 10 },
  { code: 'KZ', dial: '7',   name: 'Qozogiston',   flag: '🇰🇿', mask: 'XXX-XXX-XX-XX', digits: 10 },
  { code: 'KG', dial: '996', name: "Qirg'iziston", flag: '🇰🇬', mask: 'XXX-XXX-XXX',   digits: 9  },
  { code: 'TJ', dial: '992', name: 'Tojikiston',   flag: '🇹🇯', mask: 'XX-XXX-XXXX',   digits: 9  },
  { code: 'TM', dial: '993', name: 'Turkmaniston', flag: '🇹🇲', mask: 'XX-XXXXXX',     digits: 8  },
  { code: 'TR', dial: '90',  name: 'Turkiya',      flag: '🇹🇷', mask: 'XXX-XXX-XXXX',  digits: 10 },
  { code: 'AZ', dial: '994', name: 'Ozarbayjon',   flag: '🇦🇿', mask: 'XX-XXX-XXXX',   digits: 9  },
];

function applyMask(digits: string, mask: string): string {
  const parts = mask.split('-');
  let result = '';
  let pos = 0;
  for (let i = 0; i < parts.length; i++) {
    const len = parts[i].length;
    const chunk = digits.slice(pos, pos + len);
    if (!chunk) break;
    if (i > 0 && result) result += '-';
    result += chunk;
    pos += len;
  }
  return result;
}

interface Props {
  onChange: (fullPhone: string, isValid: boolean) => void;
  className?: string;
  required?: boolean;
}

export default function PhoneInput({ onChange, className, required }: Props) {
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [digits, setDigits] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOut(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOut);
    return () => document.removeEventListener('mousedown', onClickOut);
  }, []);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, country.digits);
    setDigits(raw);
    const formatted = applyMask(raw, country.mask);
    const fullPhone = `+${country.dial}-${formatted}`;
    const isValid = raw.length === country.digits;
    onChange(isValid ? fullPhone : `+${country.dial}-${formatted}`, isValid);
  }

  function selectCountry(c: Country) {
    setCountry(c);
    setDigits('');
    setOpen(false);
    onChange(`+${c.dial}-`, false);
  }

  const displayValue = applyMask(digits, country.mask);
  const placeholder = country.mask.replace(/X/g, '0');
  const isComplete = digits.length === country.digits;

  return (
    <div className="flex" ref={wrapRef}>
      {/* Country selector */}
      <div className="relative flex-shrink-0">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="h-full flex items-center gap-1 px-2.5 border border-gray-300 dark:border-gray-600 border-r-0 rounded-l-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm"
        >
          <span>{country.flag}</span>
          <span className="text-gray-700 dark:text-gray-300 font-medium text-xs whitespace-nowrap">+{country.dial}</span>
          <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute z-50 top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden">
            <ul className="overflow-y-auto max-h-60">
              {COUNTRIES.map(c => (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => selectCountry(c)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors ${
                      country.code === c.code ? 'bg-teal-50 dark:bg-teal-900/20' : ''
                    }`}
                  >
                    <span className="text-base w-6 text-center">{c.flag}</span>
                    <span className="flex-1 text-gray-800 dark:text-gray-200 truncate">{c.name}</span>
                    <span className="text-gray-400 dark:text-gray-500 text-xs">+{c.dial}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Local number input */}
      <div className="flex-1 relative flex items-center">
        <input
          type="tel"
          required={required}
          value={displayValue}
          onChange={handleInput}
          placeholder={placeholder}
          className={`w-full border border-gray-300 dark:border-gray-600 rounded-r-lg px-3 py-2.5 pr-14 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:z-10 ${className || ''}`}
        />
        {/* Digit counter / checkmark */}
        <span className="absolute right-3 text-xs font-medium pointer-events-none select-none">
          {isComplete ? (
            <span className="text-teal-600 dark:text-teal-400">✓</span>
          ) : (
            <span className="text-gray-400">{digits.length}/{country.digits}</span>
          )}
        </span>
      </div>
    </div>
  );
}
