'use client'

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="fr">
      <body className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-white">
        <p className="text-4xl mb-4">⚠️</p>
        <p className="font-semibold text-gray-900">Une erreur est survenue</p>
        <button
          onClick={reset}
          className="mt-4 bg-[#404040] text-white px-6 py-2 rounded-[12px] text-sm"
        >
          Réessayer
        </button>
      </body>
    </html>
  )
}
