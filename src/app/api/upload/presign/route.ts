import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { r2, R2_BUCKET, R2_PUBLIC_URL } from '@/lib/r2'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Non autorisé' }, { status: 401 })

  const { filename } = await req.json()
  const base = `listings/${user.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${filename.replace(/[^a-z0-9]/gi, '_')}`
  const keyFull  = `${base}.webp`
  const keyThumb = `${base}_t.webp`

  const [uploadUrl, thumbUploadUrl] = await Promise.all([
    getSignedUrl(r2, new PutObjectCommand({ Bucket: R2_BUCKET, Key: keyFull,  ContentType: 'image/webp' }), { expiresIn: 300 }),
    getSignedUrl(r2, new PutObjectCommand({ Bucket: R2_BUCKET, Key: keyThumb, ContentType: 'image/webp' }), { expiresIn: 300 }),
  ])

  return Response.json({
    uploadUrl,
    thumbUploadUrl,
    publicUrl:      `${R2_PUBLIC_URL}/${keyFull}`,
    thumbPublicUrl: `${R2_PUBLIC_URL}/${keyThumb}`,
  })
}
