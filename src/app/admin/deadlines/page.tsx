'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Source { id: string; label: string; deadline?: string; url?: string; type: 'scholarship' | 'university'; }
interface Deadline { id: string; source_type: string; source_id: string; active: boolean; deadline_date: string | null; created_at: string; _label?: string; _url?: string; }

export default function DeadlinesAdminPage() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [sourceType, setSourceType] = useState<'scholarship' | 'university'>('scholarship');
  const [sourceId, setSourceId] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    const sb = createClient();
    const [{ data: dl }, { data: sc }, { data: un }] = await Promise.all([
      sb.from('scholarship_deadlines').select('*').order('created_at', { ascending: false }),
      sb.from('scholarships').select('id,title,close_date,application_url').order('title'),
      sb.from('universities').select('id,name,website_url').order('name'),
    ]);
    const allSources: Source[] = [
      ...(sc || []).map((s: any) => ({ id: s.id, label: s.title, deadline: s.close_date, url: s.application_url, type: 'scholarship' as const })),
      ...(un || []).map((u: any) => ({ id: u.id, label: u.name, url: u.website_url, type: 'university' as const })),
    ];
    setSources(allSources);
    const enriched = (dl || []).map((d: any) => {
      const src = allSources.find(s => s.id === d.source_id);
      return { ...d, _label: src?.label || d.source_id, _url: src?.url };
    });
    setDeadlines(enriched);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filteredSources = sources.filter(s => s.type === sourceType);
  const selectedSource = sources.find(s => s.id === sourceId);

  async function addDeadline() {
    if (!sourceId) return;
    setSaving(true);
    const sb = createClient();
    // For scholarships use close_date from source; for universities use customDate
    const deadline = sourceType === 'scholarship'
      ? (selectedSource?.deadline || customDate || null)
      : (customDate || null);
    const { error } = await sb.from('scholarship_deadlines').insert({
      source_type: sourceType,
      source_id: sourceId,
      active: true,
      deadline_date: deadline || null,
    });
    if (!error) { setSourceId(''); setCustomDate(''); await load(); }
    else alert(error.message);
    setSaving(false);
  }

  async function toggleActive(id: string, active: boolean) {
    const sb = createClient();
    await sb.from('scholarship_deadlines').update({ active: !active }).eq('id', id);
    setDeadlines(prev => prev.map(d => d.id === id ? { ...d, active: !active } : d));
  }

  async function remove(id: string) {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    const sb = createClient();
    await sb.from('scholarship_deadlines').delete().eq('id', id);
    setDeadlines(prev => prev.filter(d => d.id !== id));
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Muddatlar</h1>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-6">
        <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Yangi muddat qo'shish</h2>
        <div className="flex gap-3 flex-wrap">
          <select value={sourceType} onChange={e => { setSourceType(e.target.value as any); setSourceId(''); setCustomDate(''); }}
            className="border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            <option value="scholarship">Grant</option>
            <option value="university">Universitet</option>
          </select>
          <select value={sourceId} onChange={e => setSourceId(e.target.value)}
            className="flex-1 min-w-0 border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            <option value="">— tanlang —</option>
            {filteredSources.map(s => (
              <option key={s.id} value={s.id}>{s.label}{s.deadline ? ` (${s.deadline})` : ''}</option>
            ))}
          </select>
        </div>
        {/* Show date input for universities, or scholarships without close_date */}
        {sourceId && (sourceType === 'university' || !selectedSource?.deadline) && (
          <div className="mt-3">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Muddat sanasi *</label>
            <input
              type="date"
              value={customDate}
              onChange={e => setCustomDate(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
          </div>
        )}
        {sourceId && sourceType === 'scholarship' && selectedSource?.deadline && (
          <p className="text-xs text-gray-400 mt-2">Muddat sanasi: <strong>{selectedSource.deadline}</strong> (grantdan avtomatik)</p>
        )}
        <button onClick={addDeadline} disabled={!sourceId || saving || (sourceType === 'university' && !customDate)}
          className="mt-3 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50">
          {saving ? '...' : "Qo'shish"}
        </button>
      </div>

      {loading ? <p className="text-gray-400">Yuklanmoqda...</p> : deadlines.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">Hozircha muddatlar yo'q</p>
      ) : (
        <div className="space-y-3">
          {deadlines.map(d => (
            <div key={d.id} className={`bg-white dark:bg-gray-800 rounded-2xl border p-4 flex items-center justify-between gap-4 ${d.active ? 'border-gray-200 dark:border-gray-700' : 'border-gray-100 dark:border-gray-800 opacity-60'}`}>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{d._label}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {d.source_type === 'scholarship' ? 'Grant' : 'Universitet'}
                  {d.deadline_date ? ` · Muddat: ${d.deadline_date}` : ' · Muddat yo\'q'}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleActive(d.id, d.active)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition ${d.active ? 'border-teal-300 text-teal-700 hover:bg-teal-50 dark:border-teal-700 dark:text-teal-400' : 'border-gray-300 text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400'}`}>
                  {d.active ? 'Aktiv' : 'Yashirin'}
                </button>
                <button onClick={() => remove(d.id)} className="text-xs text-red-500 hover:text-red-700 border border-red-200 dark:border-red-800 px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                  O'chirish
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
