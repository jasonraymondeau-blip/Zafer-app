import { Suspense } from 'react'
import AuthGate from './AuthGate'

export default function ComptePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthGate />
    </Suspense>
  )
}
