'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface AboutContent {
  id?: string;
  body_uz: string;
  body_ru: string;
  body_en: string;
  credentials_uz: string;
  credentials_ru: string;
  credentials_en: string;
  photo_url: string;
}

const EMPTY: AboutContent = {
  body_uz: '', body_ru: '', body_en: '',
  credentials_uz: '', credentials_ru: '', credentials_en: '',
  photo_url: '',
};

export default function AdminAboutPage() {
  const [form, setForm] = useState<AboutContent>(EMPTY);
  const [rowId, setRowId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.from('about_content').select('*').single().then(({ data }) => {
      if (data) {
        setRowId(data.id);
        setForm({
          body_uz: data.body_uz || '',
          body_ru: data.body_ru || '',
          body_en: data.body_en || '',
          credentials_uz: (data.credentials_uz as string[] || []).join('\n'),
          credentials_ru: (data.credentials_ru as string[] || []).join('\n'),
          credentials_en: (data.credentials_en as string[] || []).join('\n'),
          photo_url: data.photo_url || '',
        });
      }
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    setError('');
    setSaved(false);
    const supabase = createClient();
    const payload = {
      body_uz: form.body_uz,
      body_ru: form.body_ru,
      body_en: form.body_en,
      credentials_uz: form.credentials_uz.split('\n').map(s => s.trim()).filter(Boolean),
      credentials_ru: form.credentials_ru.split('\n').map(s => s.trim()).filter(Boolean),
      credentials_en: form.credentials_en.split('\n').map(s => s.trim()).filter(Boolean),
      photo_url: form.photo_url,
      updated_at: new Date().toISOString(),
    };
    let err;
    if (rowId) {
      ({ error: err } = await supabase.from('about_content').update(payload).eq('id', rowId));
    } else {
      const { data, error: insertErr } = await supabase.from('about_content').insert(payload).select().single();
      err = insertErr;
      if (data) setRowId(data.id);
    }
    if (err) setError(err.message);
    else setSaved(true);
    setSaving(false);
  }

  const textareaCls = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100';
  const inputCls = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100';

  function field(label: string, key: keyof AboutContent, rows = 3) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <textarea
          rows={rows}
          value={form[key]}
          onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
          className={textareaCls}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Men haqimda — tahrirlash</h1>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rasm URL</label>
          <input value={form.photo_url} onChange={e => setForm(prev => ({ ...prev, photo_url: e.target.value }))} className={inputCls} placeholder="/jamshid.jpg or https://..." />
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Matn (body)</p>
          <div className="space-y-3">
            {field('O\'zbek', 'body_uz', 4)}
            {field('Русский', 'body_ru', 4)}
            {field('English', 'body_en', 4)}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Yutuqlar (har biri yangi qatordan)</p>
          <div className="space-y-3">
            {field("O'zbek", 'credentials_uz', 3)}
            {field('Русский', 'credentials_ru', 3)}
            {field('English', 'credentials_en', 3)}
          </div>
        </div>

        {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
        {saved && <p className="text-teal-600 dark:text-teal-400 text-sm font-medium">Saqlandi!</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition disabled:opacity-60"
        >
          {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      </div>
    </div>
  );
}
