'use client';
import { useEffect, useState } from 'react';

interface Props {
  value: string;
  onChange: (isoValue: string) => void;
  className?: string;
  max?: string;
  required?: boolean;
}

function parseIso(iso: string) {
  if (!iso) return { day: '', month: '', year: '' };
  const [year, month, day] = iso.split('-');
  return { day: day || '', month: month || '', year: year || '' };
}

export default function DateInput({ value, onChange, className = '', max, required }: Props) {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  useEffect(() => {
    const parsed = parseIso(value);
    setDay(parsed.day);
    setMonth(parsed.month);
    setYear(parsed.year);
  }, [value]);

  function emit(d: string, m: string, y: string) {
    if (d.length === 2 && m.length === 2 && y.length === 4) {
      const dn = Number(d), mn = Number(m), yn = Number(y);
      if (dn >= 1 && dn <= 31 && mn >= 1 && mn <= 12 && yn >= 1900) {
        const iso = `${y}-${m}-${d}`;
        if (max && iso > max) return;
        onChange(iso);
        return;
      }
    }
    onChange('');
  }

  function handleDay(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 2);
    setDay(d);
    emit(d, month, year);
  }
  function handleMonth(v: string) {
    const m = v.replace(/\D/g, '').slice(0, 2);
    setMonth(m);
    emit(day, m, year);
  }
  function handleYear(v: string) {
    const y = v.replace(/\D/g, '').slice(0, 4);
    setYear(y);
    emit(day, month, y);
  }

  const base = className || 'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500';

  return (
    <div className="flex gap-2">
      <input
        type="text"
        inputMode="numeric"
        placeholder="DD"
        maxLength={2}
        required={required}
        value={day}
        onChange={e => handleDay(e.target.value)}
        className={`${base} text-center w-16`}
      />
      <input
        type="text"
        inputMode="numeric"
        placeholder="MM"
        maxLength={2}
        required={required}
        value={month}
        onChange={e => handleMonth(e.target.value)}
        className={`${base} text-center w-16`}
      />
      <input
        type="text"
        inputMode="numeric"
        placeholder="YYYY"
        maxLength={4}
        required={required}
        value={year}
        onChange={e => handleYear(e.target.value)}
        className={`${base} text-center w-20`}
      />
    </div>
  );
}
