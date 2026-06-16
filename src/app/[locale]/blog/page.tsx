import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import BlogCard from '@/components/blog/BlogCard';
import type { BlogPost } from '@/types';

const SAMPLE_POSTS: BlogPost[] = [
  { id: '1', title: 'Grant uchun motivatsiya xati qanday yoziladi?', slug: 'motivatsiya-xati', category: 'scholarship_tips', content: '', reading_time_minutes: 7, status: 'published', published_at: '2024-11-15T00:00:00Z', created_by: 'jamshid', created_at: '2024-11-15T00:00:00Z' },
];

// Maps a DB row from `blog_posts` into the legacy BlogPost shape expected by BlogCard.
// Uses locale-specific title_${locale}/excerpt_${locale} columns, falling back to title_uz/excerpt_uz
// when the localized value is empty. DB has no category/reading_time_minutes/created_by columns,
// so those use placeholder defaults (BlogCard itself only renders title/reading_time_minutes/published_at).
function mapDbBlogPost(row: any, locale: string): BlogPost {
  const title = row[`title_${locale}`] || row.title_uz;
  const excerpt = row[`excerpt_${locale}`] || row.excerpt_uz || '';
  return {
    id: String(row.id),
    title,
    slug: row.slug,
    cover_image_url: row.cover_url ?? undefined,
    category: 'scholarship_tips',
    content: excerpt,
    reading_time_minutes: Math.max(1, Math.round((excerpt?.length ?? 0) / 800)) || 5,
    status: 'published',
    published_at: row.published_at ?? undefined,
    created_by: 'jamshid',
    created_at: row.created_at,
  };
}

export default async function BlogPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);

  let posts: BlogPost[] = SAMPLE_POSTS;
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false });
    if (!error && data && data.length > 0) {
      posts = data.map((row) => mapDbBlogPost(row, locale));
    }
  } catch {
    // keep sample fallback
  }

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
