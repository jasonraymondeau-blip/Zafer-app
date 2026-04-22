import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const { photos, categorie, sousCategorie, titre } = await req.json()

  if (!photos || photos.length === 0) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  try {
    const imageContent = (photos as string[]).slice(0, 2).map((url: string) => ({
      type: 'image',
      source: { type: 'url', url },
    }))

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 120,
        messages: [
          {
            role: 'user',
            content: [
              ...imageContent,
              {
                type: 'text',
                text: `Vérifie si ces images correspondent à une annonce de catégorie "${categorie}" (sous-catégorie: "${sousCategorie}") intitulée "${titre}" sur un site de petites annonces à l'île Maurice.
Réponds uniquement :
- "OK" si les images semblent appropriées et pertinentes pour cette catégorie
- "PROBLEME: [raison en une phrase courte]" si les images ne correspondent pas à la catégorie ou contiennent du contenu inapproprié`,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ ok: true, skipped: true })
    }

    const data = await response.json()
    const texte: string = data.content?.[0]?.text ?? ''

    if (texte.startsWith('PROBLEME:')) {
      return NextResponse.json({
        ok: false,
        message: texte.replace('PROBLEME:', '').trim(),
      })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true, skipped: true })
  }
}
