'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Brand tokens ────────────────────────────────────────────────────────────
// bg:      #0C0806   deep warm black
// surface: #17100A   dark warm brown
// line:    #2C1E14   border
// accent:  #B85C38   terracotta (logo color)
// warm:    #F5ECE2   cream text
// muted:   #7A6254   warm gray

const ease = [0.22, 1, 0.36, 1] as const

// ─── Fade-up variant ─────────────────────────────────────────────────────────
const fu = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease, delay },
})

// ─── Email form ──────────────────────────────────────────────────────────────
type Status = 'idle' | 'loading' | 'success' | 'error'

function EmailForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus('error'); return
    }
    setStatus('loading')
    await new Promise(r => setTimeout(r, 1100))
    setStatus('success')
  }

  if (status === 'success') return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-2xl px-5 py-4"
      style={{ background: 'rgba(184,92,56,0.12)', border: '1px solid rgba(184,92,56,0.25)' }}
    >
      <span className="text-xl">🎉</span>
      <div>
        <p style={{ color: '#D4835A', fontWeight: 600 }}>Tu es sur la liste !</p>
        <p style={{ color: '#7A6254', fontSize: 13, marginTop: 2 }}>On te prévient en premier au lancement. 🇲🇺</p>
      </div>
    </motion.div>
  )

  return (
    <form onSubmit={submit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="email" value={email} placeholder="ton@email.com"
          onChange={e => { setEmail(e.target.value); if (status === 'error') setStatus('idle') }}
          className="waitlist-input flex-1 rounded-xl px-4 py-3.5 text-sm outline-none transition-all duration-200"
          style={{
            background: 'rgba(245,236,226,0.06)',
            border: status === 'error' ? '1px solid rgba(220,80,60,0.5)' : '1px solid rgba(245,236,226,0.12)',
            color: '#F5ECE2',
          }}
          required
        />
        <motion.button
          type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          disabled={status === 'loading'}
          className="flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold whitespace-nowrap transition-all duration-200"
          style={{ background: '#B85C38', color: '#FDF6EF', cursor: 'pointer' }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {status === 'loading'
              ? <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Inscription…
                </motion.span>
              : <motion.span key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Rejoindre la liste →
                </motion.span>
            }
          </AnimatePresence>
        </motion.button>
      </div>
      {status === 'error' && (
        <p style={{ color: '#E05040', fontSize: 12, marginTop: 8, marginLeft: 4 }}>
          Adresse email invalide
        </p>
      )}
    </form>
  )
}

// ─── Phone frame with screenshot or placeholder ───────────────────────────
function Phone({ src, label, delay = 0 }: { src: string; label: string; delay?: number }) {
  const [err, setErr] = useState(false)
  return (
    <motion.div {...fu(delay)} className="relative shrink-0" style={{ width: 200, height: 432 }}>
      {/* Frame */}
      <div className="absolute inset-0 rounded-[36px] shadow-2xl overflow-hidden"
        style={{ background: '#1A1108', border: '1px solid rgba(245,236,226,0.08)', boxShadow: '0 32px 64px rgba(0,0,0,0.5)' }}>
        {/* Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-5 rounded-full z-20" style={{ background: '#0C0806' }} />
        {/* Screen area */}
        {!err ? (
          <img
            src={src} alt={label} onError={() => setErr(true)}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ borderRadius: 35 }}
          />
        ) : (
          /* Placeholder shown when image not found */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6" style={{ background: '#17100A' }}>
            <Image src="/logo.png" alt="Zafer" width={48} height={48} className="opacity-40" />
            <p className="text-center text-xs" style={{ color: '#4A3428', lineHeight: 1.4 }}>
              Ajoute<br/><code style={{ color: '#7A6254' }}>{src}</code><br/>dans /public
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Feature bento card ───────────────────────────────────────────────────
function FeatureCard({
  num, title, desc, icon, accent = false, wide = false, tall = false, delay = 0,
}: {
  num: string; title: string; desc: string; icon: React.ReactNode
  accent?: boolean; wide?: boolean; tall?: boolean; delay?: number
}) {
  return (
    <motion.div
      {...fu(delay)}
      className={`relative flex flex-col justify-between p-6 rounded-3xl overflow-hidden ${wide ? 'col-span-2' : ''} ${tall ? 'row-span-2' : ''}`}
      style={{
        background: accent ? 'rgba(184,92,56,0.12)' : 'rgba(245,236,226,0.04)',
        border: accent ? '1px solid rgba(184,92,56,0.25)' : '1px solid rgba(245,236,226,0.07)',
        minHeight: tall ? 320 : 200,
      }}
      whileHover={{ scale: 1.015 }}
      transition={{ duration: 0.2 }}
    >
      {/* Big number */}
      <span
        className="absolute top-4 right-5 font-bold select-none"
        style={{ fontFamily: "'Syne', sans-serif", fontSize: 64, color: accent ? 'rgba(184,92,56,0.15)' : 'rgba(245,236,226,0.05)', lineHeight: 1 }}
      >
        {num}
      </span>
      {/* Icon */}
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-auto"
        style={{ background: accent ? 'rgba(184,92,56,0.2)' : 'rgba(245,236,226,0.06)', border: accent ? '1px solid rgba(184,92,56,0.3)' : '1px solid rgba(245,236,226,0.08)' }}>
        <span style={{ color: accent ? '#C8774E' : '#8A7266', display: 'flex' }}>{icon}</span>
      </div>
      <div className="mt-8">
        <h3 className="font-semibold mb-2 leading-snug" style={{ color: '#F5ECE2', fontSize: 16 }}>{title}</h3>
        <p style={{ color: '#7A6254', fontSize: 13, lineHeight: 1.6 }}>{desc}</p>
      </div>
    </motion.div>
  )
}

// ─── Marquee strip ────────────────────────────────────────────────────────
const TICKER = ['Achète', 'Vends', 'Zafer', 'Île Maurice', 'Sans commission', 'Sécurisé', 'Local', 'Gratuit']

function Marquee() {
  const items = [...TICKER, ...TICKER]
  return (
    <div className="w-full overflow-hidden py-5" style={{ borderTop: '1px solid rgba(245,236,226,0.07)', borderBottom: '1px solid rgba(245,236,226,0.07)' }}>
      <div className="flex" style={{ animation: 'marquee 28s linear infinite', width: 'max-content' }}>
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-5 mx-5 text-sm font-medium whitespace-nowrap" style={{ color: '#4A3828', fontFamily: "'Syne', sans-serif", letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {t}
            <span style={{ color: '#B85C38', fontSize: 10 }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function WaitlistPage() {
  return (
    <div style={{ background: '#0C0806', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", overflowX: 'hidden' }}>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}
        className="flex items-center justify-between px-6 lg:px-12 py-5 max-w-7xl mx-auto"
      >
        <Image src="/logo-splash.png" alt="Zafer" width={100} height={50} style={{ objectFit: 'contain' }} />

        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs font-medium px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(184,92,56,0.12)', color: '#C8774E', border: '1px solid rgba(184,92,56,0.2)' }}>
            🇲🇺 Bientôt disponible
          </span>
          <a href="#form"
            className="text-xs font-semibold px-4 py-2 rounded-full transition-colors duration-200"
            style={{ background: '#B85C38', color: '#FDF6EF' }}>
            Rejoindre
          </a>
        </div>
      </motion.nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-12 pt-16 pb-24 max-w-7xl mx-auto">
        <div className="max-w-4xl">

          {/* Label */}
          <motion.div {...fu(0)} className="flex items-center gap-2 mb-8">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#B85C38' }} />
            <span className="text-xs tracking-widest uppercase" style={{ color: '#7A6254', fontFamily: "'Syne', sans-serif" }}>
              La marketplace de Maurice
            </span>
          </motion.div>

          {/* Headline — editorial */}
          <motion.h1
            {...fu(0.05)}
            style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, lineHeight: 1.02, color: '#F5ECE2', letterSpacing: '-0.02em' }}
            className="text-[clamp(3rem,8vw,7rem)] mb-8"
          >
            Achète.<br />
            Vends.<br />
            <span style={{ color: '#B85C38' }}>Zafer.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p {...fu(0.1)} className="text-lg mb-10 max-w-lg leading-relaxed" style={{ color: '#7A6254' }}>
            La façon la plus rapide d&apos;acheter et vendre entre particuliers à l&apos;île Maurice —
            sans arnaque, sans commission.
          </motion.p>

          {/* Form */}
          <motion.div {...fu(0.15)} id="form" className="max-w-lg mb-10">
            <EmailForm />
          </motion.div>

          {/* Social proof */}
          <motion.div {...fu(0.2)} className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {['#B85C38', '#7A9E7E', '#5B7FA6', '#9A6B9A', '#C8A24A'].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ background: c, borderColor: '#0C0806', zIndex: 5 - i }}>
                  {['MR', 'SA', 'JP', 'KD', 'NB'][i]}
                </div>
              ))}
            </div>
            <p style={{ color: '#7A6254', fontSize: 13 }}>
              <span style={{ color: '#F5ECE2', fontWeight: 600 }}>1 200+</span> personnes déjà en attente
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Marquee ─────────────────────────────────────────────────────── */}
      <Marquee />

      {/* ── Bento features ──────────────────────────────────────────────── */}
      <section className="px-6 lg:px-12 py-24 max-w-7xl mx-auto">
        <motion.div {...fu(0)} className="mb-14">
          <p className="text-xs tracking-widest uppercase mb-3" style={{ color: '#B85C38', fontFamily: "'Syne', sans-serif" }}>
            Pourquoi Zafer
          </p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: '#F5ECE2', fontSize: 'clamp(1.75rem, 3vw, 2.75rem)' }}>
            Tout ce dont tu as besoin
          </h2>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* 01 — Confiance (accent, tall on large) */}
          <FeatureCard
            num="01" accent tall delay={0}
            title="Vendeurs & acheteurs de confiance"
            desc="Chaque profil affiche un indice de confiance calculé selon les avis, la vérification d'identité et l'historique de transactions."
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            }
          />

          {/* 02 — WhatsApp */}
          <FeatureCard
            num="02" delay={0.08}
            title="Discussion directe sur WhatsApp"
            desc="Un tap suffit pour contacter le vendeur directement sur WhatsApp. Pas de messagerie interne, pas d'intermédiaire."
            icon={
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            }
          />

          {/* 03 — Local */}
          <FeatureCard
            num="03" delay={0.12}
            title="Vends & achète près de chez toi"
            desc="Les annonces autour de toi en priorité. Rencontre les vendeurs dans ta ville, dans ton quartier."
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            }
          />

          {/* 04 — 30 secondes (wide) */}
          <FeatureCard
            num="04" wide delay={0.16}
            title="Publie en 30 secondes"
            desc="Photo + prix + description. Ton annonce est en ligne immédiatement, visible par des milliers d'acheteurs à Maurice."
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            }
          />
        </div>
      </section>

      {/* ── App screenshots ──────────────────────────────────────────────── */}
      <section className="py-24 overflow-hidden" style={{ background: '#0F0A07' }}>
        <div className="px-6 lg:px-12 max-w-7xl mx-auto">

          <div className="flex flex-col lg:flex-row items-center gap-16">

            {/* Copy */}
            <div className="flex-1 max-w-lg">
              <motion.p {...fu(0)} className="text-xs tracking-widest uppercase mb-4" style={{ color: '#B85C38', fontFamily: "'Syne', sans-serif" }}>
                L&apos;application
              </motion.p>
              <motion.h2 {...fu(0.05)} style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: '#F5ECE2', fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', lineHeight: 1.1 }} className="mb-6">
                Une app faite pour<br />
                <span style={{ color: '#B85C38' }}>les Mauriciens</span>
              </motion.h2>
              <motion.p {...fu(0.1)} className="leading-relaxed mb-10" style={{ color: '#7A6254', fontSize: 15 }}>
                Interface en français et créole, annonces locales, et un système de confiance unique —
                Zafer est la première marketplace vraiment pensée pour l&apos;île Maurice.
              </motion.p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { val: '30s', label: 'pour publier une annonce' },
                  { val: '0%', label: 'de commission sur les ventes' },
                  { val: '100%', label: 'local, vendeurs mauriciens' },
                  { val: '1', label: 'tap pour contacter sur WhatsApp' },
                ].map(({ val, label }, i) => (
                  <motion.div key={i} {...fu(0.12 + i * 0.06)} className="rounded-2xl p-4"
                    style={{ background: 'rgba(245,236,226,0.04)', border: '1px solid rgba(245,236,226,0.07)' }}>
                    <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, color: '#B85C38', lineHeight: 1 }}>
                      {val}
                    </p>
                    <p style={{ color: '#7A6254', fontSize: 12, marginTop: 4 }}>{label}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Phones — load from /public/screens/ */}
            <div className="flex items-end gap-5 justify-center lg:justify-end">
              <Phone src="/screens/screen-1.png" label="Accueil Zafer" delay={0} />
              <div style={{ marginBottom: 40 }}>
                <Phone src="/screens/screen-2.png" label="Annonce Zafer" delay={0.1} />
              </div>
              <Phone src="/screens/screen-3.png" label="Profil Zafer" delay={0.2} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-12 py-32 max-w-7xl mx-auto">
        <motion.div {...fu(0)} className="max-w-2xl">
          <p className="text-xs tracking-widest uppercase mb-5" style={{ color: '#B85C38', fontFamily: "'Syne', sans-serif" }}>
            Accès limité · Lancement imminent
          </p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: '#F5ECE2', fontSize: 'clamp(2rem, 4vw, 4rem)', lineHeight: 1.05, letterSpacing: '-0.02em' }} className="mb-8">
            Sois parmi les<br />
            <span style={{ color: '#B85C38' }}>premiers à Maurice.</span>
          </h2>
          <div className="max-w-lg">
            <EmailForm />
          </div>
          <p style={{ color: '#4A3428', fontSize: 12, marginTop: 16 }}>
            Gratuit. Sans spam. Désabonnement en 1 clic.
          </p>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="px-6 lg:px-12 py-8 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ borderTop: '1px solid rgba(245,236,226,0.07)' }}>
        <Image src="/logo-splash.png" alt="Zafer" width={80} height={40} style={{ objectFit: 'contain' }} />
        <p style={{ color: '#3A2818', fontSize: 12 }}>© 2025 Zafer — Fait avec ❤️ à l&apos;île Maurice 🇲🇺</p>
      </footer>
    </div>
  )
}
