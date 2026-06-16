import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import BlogCard from '@/components/blog/BlogCard';
import type { BlogPost } from '@/lib/supabase/types';

const SAMPLE_POSTS: BlogPost[] = [
  { id: '1', slug: 'motivatsiya-xati', title_uz: 'Grant uchun motivatsiya xati qanday yoziladi?', excerpt_uz: "Motivatsiya xati yozishda e'tiborga olinishi kerak bo'lgan asosiy jihatlar.", body_uz: '', tags: [], published: true, published_at: '2024-11-15T00:00:00Z', created_at: '2024-11-15T00:00:00Z', updated_at: '2024-11-15T00:00:00Z' },
];

export default async function BlogPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);

  let posts: BlogPost[] = SAMPLE_POSTS;
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('blog_posts').select('*').eq('published', true).order('published_at', { ascending: false });
    if (!error && data && data.length > 0) posts = data as BlogPost[];
  } catch {}

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-gray-950 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Blog va Maslahatlar</h1>
        <div className="grid gap-6 sm:grid-cols-2">
          {posts.map((p) => <BlogCard key={p.id} post={p} />)}
        </div>
      </div>
    </div>
  );
}
