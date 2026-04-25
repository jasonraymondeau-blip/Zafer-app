export function toThumbUrl(url: string): string {
  if (!url) return url
  if (url.includes('r2.dev') || url.includes('zafer.mu')) {
    return url.replace('.webp', '_t.webp')
  }
  return url
}
