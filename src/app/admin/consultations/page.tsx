'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Consultation {
  id: string;
  name: string;
  phone: string;
  tg_username: string | null;
  topic: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  status: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  confirmed: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export default function ConsultationsPage() {
  const [rows, setRows] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const sb = createClient();
    const { data } = await sb.from('consultations').select('*').order('created_at', { ascending: false });
    if (data) setRows(data as Consultation[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    const sb = createClient();
    await sb.from('consultations').update({ status }).eq('id', id);
    setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  }

  async function deleteRow(id: string) {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    const sb = createClient();
    await sb.from('consultations').delete().eq('id', id);
    setRows(prev => prev.filter(r => r.id !== id));
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Konsultatsiya so'rovlari</h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">{rows.length} ta so'rov</span>
      </div>
      {loading ? (
        <p className="text-gray-400">Yuklanmoqda...</p>
      ) : rows.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">Hozircha so'rovlar yo'q</p>
      ) : (
        <div className="space-y-4">
          {rows.map(r => (
            <div key={r.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="font-semibold text-gray-900 dark:text-white">{r.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[r.status] || STATUS_COLORS.pending}`}>{r.status}</span>
                    <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleString('uz-UZ')}</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <span>📞 {r.phone}</span>
                    {r.tg_username && (
                      <a href={`https://t.me/${r.tg_username}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                        💬 @{r.tg_username}
                      </a>
                    )}
                    {r.preferred_date && <span>📆 {r.preferred_date}{r.preferred_time ? ` · ${r.preferred_time}` : ''}</span>}
                    {r.topic && <span className="sm:col-span-2 text-gray-500 dark:text-gray-400 italic">"{r.topic}"</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <select value={r.status} onChange={e => updateStatus(r.id, e.target.value)}
                    className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                    <option value="pending">pending</option>
                    <option value="confirmed">confirmed</option>
                    <option value="completed">completed</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                  <button onClick={() => deleteRow(r.id)}
                    className="text-xs text-red-500 hover:text-red-700 border border-red-200 dark:border-red-800 px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                    O'chirish
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
