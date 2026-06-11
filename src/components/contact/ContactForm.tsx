'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';

const schema = z.object({
  full_name: z.string().min(2, "Ism kamida 2 harf bo'lishi kerak"),
  email: z.string().email("To'g'ri email kiriting"),
  phone: z.string().optional(),
  subject: z.enum(['scholarship', 'university', 'general']),
  message: z.string().min(10, "Xabar kamida 10 harf bo'lishi kerak"),
});

type FormData = z.infer<typeof schema>;

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) setSent(true);
  }

  if (sent) {
    return (
      <div className="bg-green-50 text-green-800 rounded-xl p-6 text-center">
        <p className="font-semibold">Xabaringiz yuborildi! Tez orada bog'lanaman.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">To'liq ism</label>
        <input {...register('full_name')} className="w-full border rounded-lg p-3 text-sm" placeholder="Ismingiz" />
        {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input {...register('email')} type="email" className="w-full border rounded-lg p-3 text-sm" placeholder="email@example.com" />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Telefon (ixtiyoriy)</label>
        <input {...register('phone')} className="w-full border rounded-lg p-3 text-sm" placeholder="+998 90 123 45 67" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mavzu</label>
        <select {...register('subject')} className="w-full border rounded-lg p-3 text-sm">
          <option value="scholarship">Grant bo'yicha savol</option>
          <option value="university">Universitetga qabul</option>
          <option value="general">Umumiy savol</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Xabar</label>
        <textarea {...register('message')} rows={4} className="w-full border rounded-lg p-3 text-sm" placeholder="Savolingizni yozing..." />
        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting}
        className="w-full bg-teal-700 text-white py-3 rounded-xl font-semibold hover:bg-teal-800 transition disabled:opacity-50">
        {isSubmitting ? 'Yuborilmoqda...' : 'Yuborish'}
      </button>
    </form>
  );
}
