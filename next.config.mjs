/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'qkbqicaxivuhqqkabvur.supabase.co' },
      { hostname: 'photos.zafer.mu' },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400,
  },
  compress: true,
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
      },
      {
        source: '/(icon.*|logo.*|splash.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },
}
export default nextConfig
