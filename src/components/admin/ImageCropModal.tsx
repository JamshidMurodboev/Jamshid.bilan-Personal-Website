'use client'
import { useState, useRef, useCallback, useEffect } from 'react'

interface Props {
  src: string
  aspectRatio: number // width/height e.g. 4/3, 1/1, 16/9
  onConfirm: (blob: Blob) => void
  onCancel: () => void
}

export default function ImageCropModal({ src, aspectRatio, onConfirm, onCancel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // crop box in display coords
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 })
  const [imgDisplay, setImgDisplay] = useState({ x: 0, y: 0, w: 0, h: 0 })
  const dragging = useRef<{ startX: number; startY: number; origCrop: typeof crop } | null>(null)

  const initCrop = useCallback((img: HTMLImageElement, container: HTMLDivElement) => {
    const cw = container.clientWidth
    const ch = container.clientHeight
    const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight)
    const dw = img.naturalWidth * scale
    const dh = img.naturalHeight * scale
    const dx = (cw - dw) / 2
    const dy = (ch - dh) / 2
    setImgDisplay({ x: dx, y: dy, w: dw, h: dh })

    // Initial crop: max box fitting aspect ratio
    let cropW = dw
    let cropH = cropW / aspectRatio
    if (cropH > dh) {
      cropH = dh
      cropW = cropH * aspectRatio
    }
    setCrop({ x: dx + (dw - cropW) / 2, y: dy + (dh - cropH) / 2, w: cropW, h: cropH })
  }, [aspectRatio])

  useEffect(() => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imgRef.current = img
      if (containerRef.current) initCrop(img, containerRef.current)
    }
    img.src = src
  }, [src, initCrop])

  function onMouseDown(e: React.MouseEvent) {
    dragging.current = { startX: e.clientX, startY: e.clientY, origCrop: { ...crop } }
    e.preventDefault()
  }

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging.current) return
      const { startX, startY, origCrop } = dragging.current
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      setCrop(c => ({
        ...c,
        x: Math.max(imgDisplay.x, Math.min(imgDisplay.x + imgDisplay.w - origCrop.w, origCrop.x + dx)),
        y: Math.max(imgDisplay.y, Math.min(imgDisplay.y + imgDisplay.h - origCrop.h, origCrop.y + dy)),
      }))
    }
    function onMouseUp() { dragging.current = null }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp) }
  }, [imgDisplay])

  function handleConfirm() {
    const img = imgRef.current
    if (!img) return
    const scale = img.naturalWidth / imgDisplay.w
    const sx = (crop.x - imgDisplay.x) * scale
    const sy = (crop.y - imgDisplay.y) * scale
    const sw = crop.w * scale
    const sh = crop.h * scale
    const canvas = canvasRef.current!
    canvas.width = Math.round(sw)
    canvas.height = Math.round(sh)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh)
    canvas.toBlob(blob => { if (blob) onConfirm(blob) }, 'image/jpeg', 0.92)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Rasmni kesish ({aspectRatio === 1 ? '1:1' : aspectRatio === 4/3 ? '4:3' : '16:9'})</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none">✕</button>
        </div>
        <div ref={containerRef} className="relative bg-gray-100 dark:bg-gray-800" style={{ height: 360, userSelect: 'none' }}>
          {imgRef.current && (
            <>
              <img
                src={src}
                alt=""
                style={{ position: 'absolute', left: imgDisplay.x, top: imgDisplay.y, width: imgDisplay.w, height: imgDisplay.h, opacity: 0.4 }}
                draggable={false}
              />
              {/* dark overlay */}
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
                  <defs>
                    <mask id="crop-mask">
                      <rect width="100%" height="100%" fill="white" />
                      <rect x={crop.x} y={crop.y} width={crop.w} height={crop.h} fill="black" />
                    </mask>
                  </defs>
                  <rect width="100%" height="100%" fill="rgba(0,0,0,0.5)" mask="url(#crop-mask)" />
                </svg>
              </div>
              {/* crop box */}
              <div
                onMouseDown={onMouseDown}
                style={{
                  position: 'absolute', left: crop.x, top: crop.y, width: crop.w, height: crop.h,
                  cursor: 'move', boxSizing: 'border-box',
                  border: '2px solid #14b8a6',
                  backgroundImage: `url(${src})`,
                  backgroundSize: `${imgDisplay.w}px ${imgDisplay.h}px`,
                  backgroundPosition: `-${crop.x - imgDisplay.x}px -${crop.y - imgDisplay.y}px`,
                }}
              >
                {/* rule-of-thirds grid */}
                {[1,2].map(i => (
                  <div key={`v${i}`} style={{ position: 'absolute', left: `${i*33.33}%`, top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.3)' }} />
                ))}
                {[1,2].map(i => (
                  <div key={`h${i}`} style={{ position: 'absolute', top: `${i*33.33}%`, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.3)' }} />
                ))}
                {/* corner handles */}
                {[[0,0],[1,0],[0,1],[1,1]].map(([hx,hy]) => (
                  <div key={`${hx}${hy}`} style={{
                    position: 'absolute', width: 10, height: 10,
                    left: hx === 0 ? -1 : undefined, right: hx === 1 ? -1 : undefined,
                    top: hy === 0 ? -1 : undefined, bottom: hy === 1 ? -1 : undefined,
                    background: '#14b8a6', borderRadius: 2,
                  }} />
                ))}
              </div>
            </>
          )}
          {!imgRef.current && (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">Yuklanmoqda...</div>
          )}
        </div>
        <div className="px-5 py-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">Bekor qilish</button>
          <button type="button" onClick={handleConfirm} className="px-4 py-2 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition font-medium">Tasdiqlash</button>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}
