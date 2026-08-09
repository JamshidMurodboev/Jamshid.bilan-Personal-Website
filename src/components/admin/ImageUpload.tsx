'use client'
import { useRef, useState } from 'react'
import type { UploadBucket } from '@/lib/upload'
import { uploadFiles, deleteFile } from '@/lib/upload'
import ImageCropModal from './ImageCropModal'

interface Props {
  bucket: UploadBucket
  urls: string[]
  onChange: (urls: string[]) => void
  multiple?: boolean
  label?: string
  aspectRatio?: number // 4/3 for cards, 1 for square, 16/9 for wide
}

export default function ImageUpload({ bucket, urls, onChange, multiple = false, label = "Rasm yuklash", aspectRatio = 4/3 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const pendingFile = useRef<File | null>(null)

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    if (inputRef.current) inputRef.current.value = ''

    if (multiple) {
      // For multiple uploads, crop one at a time
      pendingFile.current = files[0]
      const url = URL.createObjectURL(files[0])
      setCropSrc(url)
    } else {
      pendingFile.current = files[0]
      const url = URL.createObjectURL(files[0])
      setCropSrc(url)
    }
  }

  async function handleCropConfirm(blob: Blob) {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    const file = new File([blob], pendingFile.current?.name ?? 'image.jpg', { type: 'image/jpeg' })
    const newUrls = await uploadFiles(bucket, [file])
    onChange(multiple ? [...urls, ...newUrls] : newUrls.slice(0, 1))
    pendingFile.current = null
  }

  function handleCropCancel() {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    pendingFile.current = null
  }

  async function remove(url: string) {
    await deleteFile(bucket, url)
    onChange(urls.filter(u => u !== url))
  }

  function moveUrl(index: number, dir: -1 | 1) {
    const swap = index + dir
    if (swap < 0 || swap >= urls.length) return
    const n = [...urls]
    ;[n[index], n[swap]] = [n[swap], n[index]]
    onChange(n)
  }

  return (
    <>
      {cropSrc && (
        <ImageCropModal
          src={cropSrc}
          aspectRatio={aspectRatio}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
      <div className="space-y-2">
        {urls.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {urls.map((url, index) => (
              <div key={url} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-between py-1">
                  <div className="flex gap-1">
                    <button type="button" onClick={() => moveUrl(index, -1)} disabled={index === 0} className="text-white disabled:opacity-30 text-xs leading-none px-1 hover:text-teal-300">▲</button>
                    <button type="button" onClick={() => moveUrl(index, 1)} disabled={index === urls.length - 1} className="text-white disabled:opacity-30 text-xs leading-none px-1 hover:text-teal-300">▼</button>
                  </div>
                  <button type="button" onClick={() => remove(url)} className="text-white text-xs flex items-center justify-center">
                    O&apos;chir
                  </button>
                </div>
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
          multiple={false}
          className="hidden"
          onChange={handleFiles}
        />
      </div>
    </>
  )
}
