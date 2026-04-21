'use client'

import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PhotoCarouselProps {
  photos: string[]
  titre: string
  categorie: string
}

export default function PhotoCarousel({ photos, titre, categorie }: PhotoCarouselProps) {
  const [index, setIndex] = useState(0)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const hasPhotos = photos && photos.length > 0

  function goTo(i: number) {
    setIndex(Math.max(0, Math.min(photos.length - 1, i)))
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    setIsDragging(true)
    setDragX(0)
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = e.touches[0].clientX - touchStartX.current
    // Résistance aux bords — facteur 0.3 si on essaie de dépasser
    const resistance = (index === 0 && delta > 0) || (index === photos.length - 1 && delta < 0)
    setDragX(resistance ? delta * 0.3 : delta)
  }

  function handleTouchEnd() {
    if (touchStartX.current === null) return
    const delta = dragX
    setIsDragging(false)
    setDragX(0)
    touchStartX.current = null
    if (delta < -50) goTo(index + 1)
    else if (delta > 50) goTo(index - 1)
  }

  const emoji = categorie === 'vehicule' ? '🚗' : categorie === 'immobilier' ? '🏠' : '🛋️'

  return (
    <div className="relative aspect-[4/3] bg-card overflow-hidden select-none" style={{ borderRadius: '0 0 28px 28px' }}>
      {hasPhotos ? (
        <>
          {/* Piste de photos — chaque photo est positionnée en absolu */}
          {photos.map((photo, i) => {
            const offset = (i - index) * 100
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  inset: 0,
                  transform: isDragging
                    ? `translateX(calc(${offset}% + ${dragX}px))`
                    : `translateX(${offset}%)`,
                  transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  willChange: 'transform',
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo}
                  alt={i === 0 ? titre : ''}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
            )
          })}

          {/* Flèches — masquées si première/dernière photo */}
          {photos.length > 1 && (
            <>
              <button
                onClick={() => goTo(index - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 transition-all z-10"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  opacity: index === 0 ? 0 : 1,
                  pointerEvents: index === 0 ? 'none' : 'auto',
                  transition: 'opacity 0.2s',
                }}
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => goTo(index + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 transition-all z-10"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  opacity: index === photos.length - 1 ? 0 : 1,
                  pointerEvents: index === photos.length - 1 ? 'none' : 'auto',
                  transition: 'opacity 0.2s',
                }}
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </>
          )}

          {/* Compteur haut droite */}
          {photos.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-10">
              {index + 1}/{photos.length}
            </div>
          )}

          {/* Points indicateurs */}
          {photos.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: i === index ? '#fff' : 'rgba(255,255,255,0.5)',
                    transform: i === index ? 'scale(1.25)' : 'scale(1)',
                    transition: 'all 0.2s',
                  }}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-6xl">{emoji}</span>
        </div>
      )}
    </div>
  )
}
