'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface SearchModalCtx {
  isOpen: boolean
  initialCategorie: string
  open: (categorie?: string) => void
  close: () => void
}

const SearchModalContext = createContext<SearchModalCtx>({
  isOpen: false,
  initialCategorie: '',
  open: () => {},
  close: () => {},
})

export function SearchModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [initialCategorie, setInitialCategorie] = useState('')

  function open(categorie = '') {
    setInitialCategorie(categorie)
    setIsOpen(true)
  }

  function close() {
    setIsOpen(false)
  }

  return (
    <SearchModalContext.Provider value={{ isOpen, initialCategorie, open, close }}>
      {children}
    </SearchModalContext.Provider>
  )
}

export function useSearchModal() {
  return useContext(SearchModalContext)
}
