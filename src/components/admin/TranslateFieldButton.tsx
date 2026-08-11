'use client';
import { useState } from 'react';
import { autoTranslate } from '@/lib/translate';

interface Props {
  value: string;
  onResult: (ru: string, en: string) => void;
}

export default function TranslateFieldButton({ value, onResult }: Props) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function handleClick() {
    if (!value.trim() || loading) return;
    setLoading(true);
    setErr('');
    try {
      const result = await autoTranslate(value);
      onResult(result.ru, result.en);
    } catch (e: any) {
      setErr(e?.message || 'Xato');
    } finally {
      setLoading(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={!value.trim() || loading}
        title="Rus va ingliz tillariga tarjima qilish"
        className="text-xs text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
      >
        {loading ? '⏳' : '🌐 Tarjima'}
      </button>
      {err && <span className="text-xs text-red-500" title={err}>⚠️</span>}
    </span>
  );
}
