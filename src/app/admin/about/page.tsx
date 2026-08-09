'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { uploadFiles } from '@/lib/upload';
import { autoTranslate } from '@/lib/translate';
import LanguageTabs, { type LangTab } from '@/components/admin/LanguageTabs';

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
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [activeTab, setActiveTab] = useState<LangTab>('uz');
  const [translatingAll, setTranslatingAll] = useState(false);
  const [translateAllProgress, setTranslateAllProgress] = useState('');

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

  async function handleTranslateAll() {
    const fields: Array<{ uz: string; setRu: (v: string) => void; setEn: (v: string) => void }> = [
      { uz: form.body_uz, setRu: (v: string) => setForm((f: AboutContent) => ({ ...f, body_ru: v })), setEn: (v: string) => setForm((f: AboutContent) => ({ ...f, body_en: v })) },
      { uz: form.credentials_uz, setRu: (v: string) => setForm((f: AboutContent) => ({ ...f, credentials_ru: v })), setEn: (v: string) => setForm((f: AboutContent) => ({ ...f, credentials_en: v })) },
    ];
    const active = fields.filter(f => f.uz.trim());
    if (active.length === 0) return;
    setTranslatingAll(true);
    setTranslateAllProgress(`0/${active.length}`);
    try {
      for (let i = 0; i < active.length; i++) {
        setTranslateAllProgress(`${i + 1}/${active.length}`);
        const result = await autoTranslate(active[i].uz);
        active[i].setRu(result.ru);
        active[i].setEn(result.en);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Tarjima xatosi');
    } finally {
      setTranslatingAll(false);
      setTranslateAllProgress('');
    }
  }

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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rasm</label>
          {form.photo_url && (
            <div className="mb-2 relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
              <img src={form.photo_url} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => setForm(prev => ({ ...prev, photo_url: '' }))} className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
            </div>
          )}
          <label className="flex items-center gap-2 px-3 py-2 text-sm border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-teal-500 hover:text-teal-600 cursor-pointer transition-colors w-fit">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {uploadingPhoto ? 'Yuklanmoqda...' : 'Rasm yuklash'}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={uploadingPhoto}
              onChange={async e => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploadingPhoto(true);
                try {
                  const urls = await uploadFiles('uploads', [file]);
                  if (urls[0]) setForm(prev => ({ ...prev, photo_url: urls[0] }));
                } finally { setUploadingPhoto(false); }
              }}
            />
          </label>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <LanguageTabs activeTab={activeTab} onTabChange={setActiveTab} onTranslateAll={handleTranslateAll} translating={translatingAll} translateProgress={translateAllProgress} />
          <div className="space-y-4 mt-2">
            {activeTab === 'uz' && (
              <>
                {field("Matn (UZ)", 'body_uz', 4)}
                {field("Yutuqlar (UZ, har biri yangi qatordan)", 'credentials_uz', 3)}
              </>
            )}
            {activeTab === 'ru' && (
              <>
                {field("Matn (RU)", 'body_ru', 4)}
                {field("Достижения (RU)", 'credentials_ru', 3)}
              </>
            )}
            {activeTab === 'en' && (
              <>
                {field("Body (EN)", 'body_en', 4)}
                {field("Credentials (EN)", 'credentials_en', 3)}
              </>
            )}
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
