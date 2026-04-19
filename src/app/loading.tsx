// Affiché lors des transitions rapides entre pages (Next.js App Router)
export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-4">
      <img src="/logo-titre.svg" alt="Zafer" className="h-32 w-auto" />
      <div
        className="animate-spin rounded-full"
        style={{
          width: 24,
          height: 24,
          border: '3px solid rgba(73,105,119,0.2)',
          borderTopColor: '#496977',
        }}
      />
    </div>
  )
}
