'use client'

import { createContext, useContext, useState } from 'react'

interface AuthModalCtx {
  isOpen: boolean
  destination: string
  openAuthModal: (destination?: string) => void
  closeAuthModal: () => void
}

const AuthModalContext = createContext<AuthModalCtx>({
  isOpen: false,
  destination: '/',
  openAuthModal: () => {},
  closeAuthModal: () => {},
})

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [destination, setDestination] = useState('/')

  return (
    <AuthModalContext.Provider value={{
      isOpen,
      destination,
      openAuthModal: (dest = '/') => { setDestination(dest); setIsOpen(true) },
      closeAuthModal: () => setIsOpen(false),
    }}>
      {children}
    </AuthModalContext.Provider>
  )
}

export function useAuthModal() {
  return useContext(AuthModalContext)
}
