'use client'
import { useRef } from 'react'
import type { UploadBucket } from '@/lib/upload'
import { uploadFiles, deleteFile } from '@/lib/upload'

interface Props {
  bucket: UploadBucket
  urls: string[]
  onChange: (urls: string[]) => void
  multiple?: boolean
  label?: string
}

export default function ImageUpload({ bucket, urls, onChange, multiple = false, label = "Rasm yuklash" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const newUrls = await uploadFiles(bucket, files)
    onChange(multiple ? [...urls, ...newUrls] : newUrls.slice(0, 1))
    if (inputRef.current) inputRef.current.value = ''
  }

  async function remove(url: string) {
    await deleteFile(bucket, url)
    onChange(urls.filter(u => u !== url))
  }

  return (
    <div className="space-y-2">
      {urls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {urls.map(url => (
            <div key={url} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(url)}
                className="absolute inset-0 bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                O'chir
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 px-3 py-2 text-sm border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        {label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        className="hidden"
        onChange={handleFiles}
      />
    </div>
  )
}
