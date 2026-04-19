'use client'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <p className="text-4xl mb-4">⚠️</p>
      <p className="font-semibold text-text-main">Une erreur est survenue</p>
      {/* Message d'erreur visible en développement pour faciliter le débogage */}
      {process.env.NODE_ENV === 'development' && (
        <p className="mt-2 text-xs text-red-500 max-w-sm break-all bg-red-50 p-2 rounded-[8px]">
          {error?.message || 'Erreur inconnue'}
        </p>
      )}
      <button
        onClick={reset}
        className="mt-4 bg-primary text-white px-6 py-2 rounded-[12px] text-sm"
      >
        Réessayer
      </button>
    </div>
  )
}
