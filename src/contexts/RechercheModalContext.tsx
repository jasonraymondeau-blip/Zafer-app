'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface RechercheModalCtx {
  isOpen: boolean
  open: () => void
  close: () => void
}

const RechercheModalContext = createContext<RechercheModalCtx>({
  isOpen: false,
  open: () => {},
  close: () => {},
})

export function RechercheModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <RechercheModalContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
    </RechercheModalContext.Provider>
  )
}

export function useRechercheModal() {
  return useContext(RechercheModalContext)
}
