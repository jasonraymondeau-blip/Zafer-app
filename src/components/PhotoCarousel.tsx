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
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const wasDragged = useRef(false)
  const hasPhotos = photos && photos.length > 0

  function goTo(i: number) {
    setIndex(Math.max(0, Math.min(photos.length - 1, i)))
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    setIsDragging(true)
    setDragX(0)
    wasDragged.current = false
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = e.touches[0].clientX - touchStartX.current
    if (Math.abs(delta) > 8) wasDragged.current = true
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

  function handleClick() {
    if (!wasDragged.current && hasPhotos) setLightboxOpen(true)
  }

  const emoji = categorie === 'vehicule' ? '🚗' : categorie === 'immobilier' ? '🏠' : '🛋️'

  const carousel = (
    <div
      className="relative overflow-hidden select-none"
      style={{ borderRadius: 0, background: '#1a1a1a', aspectRatio: '4/3' }}
      onClick={handleClick}
    >
      {hasPhotos ? (
        <>
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

          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goTo(index - 1) }}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 z-10"
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
                onClick={(e) => { e.stopPropagation(); goTo(index + 1) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 z-10"
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

          {photos.length > 1 && (
            <div className="absolute right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-10" style={{ bottom: 28 }}>
              {index + 1}/{photos.length}
            </div>
          )}

          {photos.length > 1 && (
            <div className="absolute left-1/2 -translate-x-1/2 flex gap-1.5 z-10" style={{ bottom: 28 }}>
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); goTo(i) }}
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

  return (
    <>
      {carousel}

      {/* Lightbox plein écran */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col">

          {/* Header : flèche retour + titre + compteur */}
          <div
            className="flex-shrink-0 flex items-center justify-between px-4"
            style={{
              paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)',
              paddingBottom: 14,
            }}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, marginLeft: -4, display: 'flex', alignItems: 'center' }}
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <span className="text-white font-semibold text-base truncate mx-3 flex-1 text-center">
              {titre}
            </span>
            <span className="text-white/70 text-sm flex-shrink-0">
              {photos.length > 1 ? `${index + 1} / ${photos.length}` : ''}
            </span>
          </div>

          {/* Zone photo swipeable */}
          <div
            className="flex-1 relative overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo}
                    alt=""
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    draggable={false}
                  />
                </div>
              )
            })}
          </div>

          {/* Espace bas safe area */}
          <div style={{ height: 'env(safe-area-inset-bottom, 0px)', flexShrink: 0 }} />
        </div>
      )}
    </>
  )
}
