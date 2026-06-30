import { createClient } from '@/lib/supabase/client'

export type UploadBucket = 'scholarships' | 'universities' | 'results' | 'news' | 'testimonials'

export async function uploadFile(bucket: UploadBucket, file: File): Promise<string | null> {
  const supabase = createClient()
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false })
  if (error) { console.error('Upload error:', error.message); return null }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function uploadFiles(bucket: UploadBucket, files: File[]): Promise<string[]> {
  const results = await Promise.all(files.map(f => uploadFile(bucket, f)))
  return results.filter((u): u is string => u !== null)
}

export async function deleteFile(bucket: UploadBucket, url: string): Promise<void> {
  const supabase = createClient()
  const path = url.split(`/${bucket}/`)[1]
  if (path) await supabase.storage.from(bucket).remove([path])
}
