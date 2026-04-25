'use client'

export { toThumbUrl } from '@/lib/url-utils'

async function resizeWebP(file: File, maxPx: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1)
      const w = Math.round(img.width * ratio)
      const h = Math.round(img.height * ratio)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('canvas toBlob failed')), 'image/webp', quality)
    }
    img.onerror = reject
    img.src = url
  })
}

export async function uploadPhotoR2(file: File): Promise<string> {
  const [full, thumb] = await Promise.all([
    resizeWebP(file, 1200, 0.85),
    resizeWebP(file, 300, 0.80),
  ])

  const { uploadUrl, thumbUploadUrl, publicUrl } = await fetch('/api/upload/presign', {
    method: 'POST',
    body: JSON.stringify({ filename: file.name }),
    headers: { 'content-type': 'application/json' },
  }).then(r => r.json())

  await Promise.all([
    fetch(uploadUrl,      { method: 'PUT', body: full,  headers: { 'Content-Type': 'image/webp' } }),
    fetch(thumbUploadUrl, { method: 'PUT', body: thumb, headers: { 'Content-Type': 'image/webp' } }),
  ])

  return publicUrl
}

