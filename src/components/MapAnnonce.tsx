'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapAnnonceProps {
  lat: number
  lng: number
  titre: string
}

// Icône custom en DivIcon pour éviter le bug des icônes Leaflet dans Next.js
const markerIcon = L.divIcon({
  html: `<div style="
    width:18px;height:18px;
    background:#404040;
    border-radius:50%;
    border:3px solid white;
    box-shadow:0 2px 6px rgba(0,0,0,0.35);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  className: '',
})

// Recadre la carte sur les coordonnées données
function Recadrer({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], 13)
  }, [map, lat, lng])
  return null
}

// Active ou désactive l'interaction tactile selon l'état
function InteractionController({ enabled }: { enabled: boolean }) {
  const map = useMap()
  useEffect(() => {
    if (enabled) {
      map.dragging.enable()
      map.touchZoom.enable()
      map.scrollWheelZoom.enable()
    } else {
      map.dragging.disable()
      map.touchZoom.disable()
      map.scrollWheelZoom.disable()
    }
  }, [enabled, map])
  return null
}

export default function MapAnnonce({ lat, lng, titre }: MapAnnonceProps) {
  const [interactif, setInteractif] = useState(false)

  return (
    <div className="mt-4">
      <h2 className="font-semibold text-text-main text-sm mb-2">Localisation</h2>
      <div className="relative rounded-[12px] overflow-hidden" style={{ height: 200 }}>
        <MapContainer
          center={[lat, lng]}
          zoom={13}
          scrollWheelZoom={false}
          dragging={false}
          touchZoom={false}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[lat, lng]} icon={markerIcon} title={titre} />
          <Recadrer lat={lat} lng={lng} />
          <InteractionController enabled={interactif} />
        </MapContainer>

        {/* Overlay — disparaît au premier tap, active l'interaction */}
        {!interactif && (
          <div
            onClick={() => setInteractif(true)}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                background: 'rgba(0,0,0,0.55)',
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: 600,
                padding: '7px 16px',
                borderRadius: 20,
                pointerEvents: 'none',
              }}
            >
              Appuyer pour interagir
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
