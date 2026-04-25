import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { r2, R2_BUCKET, R2_PUBLIC_URL } from '@/lib/r2'
import { supabase } from '@/lib/supabase'

export async function DELETE(req: Request) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Non autorisé' }, { status: 401 })

  const { urls } = await req.json()
  const keys = (urls as string[]).flatMap((url) => {
    const key = url.replace(R2_PUBLIC_URL + '/', '')
    return [key, key.replace('.webp', '_t.webp')]
  })

  await Promise.all(keys.map(Key => r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key }))))
  return Response.json({ ok: true })
}
