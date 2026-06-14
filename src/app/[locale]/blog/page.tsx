import { setRequestLocale } from 'next-intl/server';
import BlogCard from '@/components/blog/BlogCard';
import type { BlogPost } from '@/types';

const SAMPLE_POSTS: BlogPost[] = [
  { id: '1', title: 'Grant uchun motivatsiya xati qanday yoziladi?', slug: 'motivatsiya-xati', category: 'scholarship_tips', content: '', reading_time_minutes: 7, status: 'published', published_at: '2024-11-15T00:00:00Z', created_by: 'jamshid', created_at: '2024-11-15T00:00:00Z' },
];

export default function BlogPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-gray-950 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Blog va Maslahatlar</h1>
        <div className="grid gap-6 sm:grid-cols-2">
          {SAMPLE_POSTS.map((p) => <BlogCard key={p.id} post={p} />)}
        </div>
      </div>
    </div>
  );
}
