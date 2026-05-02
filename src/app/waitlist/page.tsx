'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'

// ─── Animation variants ──────────────────────────────────────────────────────

const ease = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease } },
}

// ─── Data ────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    label: 'Rapide',
    title: 'Publie en 30 secondes',
    desc: 'Prends une photo, fixe ton prix, et ton annonce est en ligne. Aussi simple que ça.',
    gradient: 'from-orange-500/20 to-amber-500/10',
    border: 'border-orange-500/15',
    iconColor: 'text-orange-400',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    label: 'Sécurisé',
    title: 'Transactions de confiance',
    desc: 'Profils vérifiés, système de notes et badges de confiance pour acheter sereinement.',
    gradient: 'from-emerald-500/20 to-teal-500/10',
    border: 'border-emerald-500/15',
    iconColor: 'text-emerald-400',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    label: 'Local',
    title: 'Deals près de chez toi',
    desc: 'Trouve des acheteurs et vendeurs dans ta ville, dans ton quartier, à Maurice.',
    gradient: 'from-blue-500/20 to-indigo-500/10',
    border: 'border-blue-500/15',
    iconColor: 'text-blue-400',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    label: 'Direct',
    title: 'Chat sans intermédiaire',
    desc: 'Discute directement avec les vendeurs. Pas de frais cachés, pas de plateforme entre vous.',
    gradient: 'from-violet-500/20 to-purple-500/10',
    border: 'border-violet-500/15',
    iconColor: 'text-violet-400',
  },
]

const AVATARS = [
  { initials: 'MR', bg: 'from-orange-400 to-rose-500' },
  { initials: 'SA', bg: 'from-amber-400 to-orange-500' },
  { initials: 'JP', bg: 'from-emerald-400 to-teal-500' },
  { initials: 'KD', bg: 'from-blue-400 to-indigo-500' },
  { initials: 'NB', bg: 'from-violet-400 to-purple-500' },
]

const PERKS = [
  'Interface en français et créole mauricien',
  'Vendeurs et acheteurs locaux uniquement',
  'Zéro commission sur tes ventes',
]

const APP_LISTINGS = [
  { title: 'iPhone 14 Pro', price: 'Rs 28 000', cat: 'Téléphones', color: 'from-blue-500/25 to-indigo-500/10', dot: 'bg-blue-400' },
  { title: 'Scooter Honda', price: 'Rs 45 000', cat: 'Véhicules', color: 'from-orange-500/25 to-amber-500/10', dot: 'bg-orange-400' },
  { title: 'Canapé cuir 3 places', price: 'Rs 8 500', cat: 'Maison', color: 'from-emerald-500/25 to-teal-500/10', dot: 'bg-emerald-400' },
]

// ─── Email Form ──────────────────────────────────────────────────────────────

type FormStatus = 'idle' | 'loading' | 'success' | 'error'

function EmailForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<FormStatus>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus('error')
      return
    }
    setStatus('loading')
    // Simulate network — replace with real API call when ready
    await new Promise(r => setTimeout(r, 1100))
    setStatus('success')
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease }}
        className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl px-5 py-4"
      >
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-emerald-400">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-emerald-300">Tu es sur la liste !</p>
          <p className="text-zinc-400 text-sm mt-0.5">On te contacte en premier lors du lancement. 🇲🇺</p>
        </div>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={`flex gap-3 ${compact ? 'flex-col' : 'flex-col sm:flex-row'}`}>
        <div className="relative flex-1">
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); if (status === 'error') setStatus('idle') }}
            placeholder="ton@email.com"
            className={[
              'waitlist-input w-full rounded-xl px-4 py-3.5 text-zinc-100 text-sm',
              'placeholder:text-zinc-600 focus:outline-none transition-all duration-200',
              'border bg-white/[0.07]',
              status === 'error'
                ? 'border-red-500/50 focus:border-red-400/70'
                : 'border-white/10 focus:border-orange-500/50 focus:bg-white/[0.10]',
            ].join(' ')}
            required
          />
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02, boxShadow: '0 0 24px rgba(249,115,22,0.35)' }}
          whileTap={{ scale: 0.97 }}
          disabled={status === 'loading'}
          className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm px-7 py-3.5 rounded-xl whitespace-nowrap disabled:opacity-60 cursor-pointer transition-all duration-200"
        >
          <AnimatePresence mode="wait" initial={false}>
            {status === 'loading' ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2"
              >
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Inscription…
              </motion.span>
            ) : (
              <motion.span
                key="cta"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Rejoindre la liste
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
      <AnimatePresence>
        {status === 'error' && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-red-400 text-xs mt-2 ml-1"
          >
            Adresse email invalide — vérifie le format
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  )
}

// ─── Phone Mockup ────────────────────────────────────────────────────────────

function PhoneMockup() {
  return (
    <div className="relative mx-auto" style={{ width: 256, height: 520 }}>
      {/* Glow behind phone */}
      <div className="absolute inset-0 rounded-[44px] bg-orange-500/10 blur-2xl scale-110" />

      {/* Phone body */}
      <div className="relative w-full h-full rounded-[44px] bg-gradient-to-b from-zinc-700/80 to-zinc-800/80 border border-white/10 shadow-2xl shadow-black/60 backdrop-blur-sm overflow-hidden">
        {/* Side buttons */}
        <div className="absolute left-[-3px] top-24 w-1 h-8 bg-zinc-600 rounded-l-full" />
        <div className="absolute left-[-3px] top-36 w-1 h-12 bg-zinc-600 rounded-l-full" />
        <div className="absolute left-[-3px] top-52 w-1 h-12 bg-zinc-600 rounded-l-full" />
        <div className="absolute right-[-3px] top-32 w-1 h-16 bg-zinc-600 rounded-r-full" />

        {/* Screen */}
        <div className="absolute inset-[2.5px] rounded-[42px] bg-[#0F0E0D] overflow-hidden">
          {/* Dynamic Island */}
          <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-[72px] h-6 bg-black rounded-full z-20 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-zinc-800 border border-zinc-700" />
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800/60" />
          </div>

          {/* Status bar */}
          <div className="absolute top-1 left-4 right-4 flex items-center justify-between z-10">
            <span className="text-white text-[9px] font-semibold opacity-60">9:41</span>
            <div className="flex items-center gap-1 opacity-60">
              <div className="flex gap-0.5 items-end h-3">
                {[2, 3, 4, 4].map((h, i) => (
                  <div key={i} className="w-0.5 bg-white rounded-sm" style={{ height: `${h * 2}px` }} />
                ))}
              </div>
              <div className="w-3 h-1.5 border border-white/60 rounded-sm">
                <div className="w-2/3 h-full bg-white/60 rounded-sm" />
              </div>
            </div>
          </div>

          {/* App UI */}
          <div className="absolute inset-0 pt-12 px-3.5 pb-4 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-zinc-500 text-[9px]">Bonjour 👋</p>
                <p className="text-white font-bold text-sm leading-tight">Bonne journée</p>
              </div>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                <span className="text-white text-[9px] font-bold">JP</span>
              </div>
            </div>

            {/* Search */}
            <div className="bg-white/6 border border-white/8 rounded-xl px-3 py-2 mb-3 flex items-center gap-2">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-zinc-500 shrink-0">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
              <span className="text-zinc-600 text-[10px]">Rechercher sur Zafer…</span>
            </div>

            {/* Category chips */}
            <div className="flex gap-1.5 mb-3 overflow-hidden">
              {['Tout', 'Véhicules', 'Phones'].map((cat, i) => (
                <span
                  key={cat}
                  className={`text-[9px] px-2 py-1 rounded-full whitespace-nowrap ${i === 0 ? 'bg-orange-500/30 border border-orange-500/40 text-orange-300' : 'bg-white/5 border border-white/8 text-zinc-500'}`}
                >
                  {cat}
                </span>
              ))}
            </div>

            {/* Listings */}
            <div className="flex flex-col gap-2 flex-1">
              {APP_LISTINGS.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.18, duration: 0.4, ease }}
                  className={`bg-gradient-to-r ${item.color} border border-white/8 rounded-xl p-2.5 flex items-center gap-2.5`}
                >
                  <div className="w-10 h-10 rounded-lg bg-white/8 border border-white/8 shrink-0 flex items-center justify-center">
                    <div className={`w-3 h-3 rounded-full ${item.dot} opacity-60`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-[10px] font-semibold truncate leading-tight">{item.title}</p>
                    <p className="text-zinc-500 text-[8px] leading-tight">{item.cat}</p>
                    <p className="text-orange-400 text-[10px] font-bold leading-tight">{item.price}</p>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5 text-zinc-500">
                      <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-2.184C4.045 12.637 2 10.62 2 8c0-2.21 1.79-4 4-4 1.13 0 2.13.49 2.823 1.27A3.986 3.986 0 0112 4c2.21 0 4 1.79 4 4 0 2.62-2.045 4.637-3.885 6.036a22.045 22.045 0 01-2.582 2.184 20.759 20.759 0 01-1.18.692l-.005.003-.001.001-.001.001a.75.75 0 01-.693 0l-.001-.001z" />
                    </svg>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom nav bar */}
            <div className="mt-3 bg-white/4 border border-white/8 rounded-2xl px-4 py-2 flex items-center justify-around">
              {[
                <path key="h" strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />,
                <path key="s" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />,
                <path key="p" strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />,
                <path key="u" strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />,
              ].map((path, i) => (
                <div
                  key={i}
                  className={`w-7 h-7 flex items-center justify-center rounded-xl ${i === 0 ? 'bg-orange-500/20' : ''}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={`w-3.5 h-3.5 ${i === 0 ? 'text-orange-400' : 'text-zinc-600'}`}>
                    {path}
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <motion.div
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-10 top-20 bg-zinc-900/90 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-2 shadow-xl"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🎉</span>
          <div>
            <p className="text-white text-[10px] font-semibold leading-tight">Vendu en 2h !</p>
            <p className="text-zinc-500 text-[8px]">Scooter Honda</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [5, -5, 5] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        className="absolute -left-12 bottom-32 bg-zinc-900/90 backdrop-blur-md border border-orange-500/20 rounded-2xl px-3 py-2 shadow-xl"
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          <p className="text-orange-300 text-[10px] font-semibold">+12 vues aujourd&apos;hui</p>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Section wrapper with scroll reveal ─────────────────────────────────────

function RevealSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WaitlistPage() {
  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: '#0A0908', fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}
    >
      {/* ── Background: animated gradient orbs ──────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div
          className="absolute rounded-full"
          style={{
            top: '-15%',
            right: '-8%',
            width: 700,
            height: 700,
            background: 'radial-gradient(circle, rgba(249,115,22,0.14) 0%, transparent 70%)',
            animation: 'orb-drift 14s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            bottom: '-20%',
            left: '-10%',
            width: 600,
            height: 600,
            background: 'radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 70%)',
            animation: 'orb-drift 18s ease-in-out infinite reverse',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            top: '45%',
            left: '30%',
            width: 400,
            height: 400,
            background: 'radial-gradient(circle, rgba(234,88,12,0.06) 0%, transparent 70%)',
            animation: 'orb-drift 22s ease-in-out infinite 4s',
          }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="relative z-20 flex items-center justify-between px-6 lg:px-10 py-5 max-w-6xl mx-auto"
      >
        <span
          className="font-extrabold text-xl tracking-tight"
          style={{ background: 'linear-gradient(90deg, #fb923c, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          Zafer
        </span>

        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-2 text-xs text-zinc-500 border border-zinc-800 rounded-full px-3 py-1.5">
            <span>🇲🇺</span>
            <span>Île Maurice</span>
          </span>
          <a
            href="#waitlist-form"
            className="text-xs font-semibold bg-white/8 hover:bg-white/12 border border-white/10 text-zinc-200 px-4 py-2 rounded-full transition-colors duration-200 cursor-pointer"
          >
            Rejoindre →
          </a>
        </div>
      </motion.nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 lg:px-10 pt-16 pb-24 max-w-6xl mx-auto">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="max-w-3xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2.5 mb-8">
            <span className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 text-orange-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              Bientôt disponible à l&apos;île Maurice
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-[clamp(2.75rem,7vw,5.5rem)] font-extrabold tracking-tight leading-[1.04] mb-6 text-zinc-50"
          >
            Achète. Vends.{' '}
            <br className="hidden sm:block" />
            <span
              style={{
                background: 'linear-gradient(135deg, #fb923c 0%, #f59e0b 50%, #fb923c 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'gradient-pan 4s linear infinite',
              }}
            >
              Instantanément.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeUp}
            className="text-lg sm:text-xl text-zinc-400 leading-relaxed max-w-xl mx-auto mb-10"
          >
            Zafer est la façon la plus rapide d&apos;acheter et vendre entre particuliers à Maurice —
            sans arnaque, sans commission.
          </motion.p>

          {/* Form */}
          <motion.div variants={fadeUp} id="waitlist-form" className="max-w-lg mx-auto mb-8">
            <EmailForm />
          </motion.div>

          {/* Social proof */}
          <motion.div
            variants={fadeUp}
            className="flex items-center justify-center gap-3"
          >
            <div className="flex -space-x-2.5">
              {AVATARS.map(({ initials, bg }, i) => (
                <div
                  key={initials}
                  className={`w-9 h-9 rounded-full bg-gradient-to-br ${bg} border-2 border-[#0A0908] flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}
                  style={{ zIndex: AVATARS.length - i }}
                >
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-zinc-400 text-sm">
              <span className="text-zinc-200 font-semibold">1 200+</span> personnes déjà en attente
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 lg:px-10 py-20 max-w-6xl mx-auto">
        <RevealSection className="text-center mb-14">
          <p className="text-orange-400 text-xs font-semibold uppercase tracking-widest mb-3">Pourquoi Zafer</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-50 mb-4">
            Tout ce dont tu as besoin
          </h2>
          <p className="text-zinc-400 max-w-md mx-auto">
            Simple, rapide, et conçu spécialement pour l&apos;île Maurice.
          </p>
        </RevealSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((feat, i) => (
            <RevealSection key={i} delay={i * 0.08}>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
                className={`group relative bg-gradient-to-br ${feat.gradient} border ${feat.border} rounded-2xl p-6 cursor-default overflow-hidden`}
              >
                <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white/5 border border-white/8 mb-4 ${feat.iconColor}`}>
                  {feat.icon}
                </div>
                <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/8 rounded-full px-2.5 py-0.5 mb-3 ml-2">
                  <span className="text-zinc-500 text-[10px] font-medium">{feat.label}</span>
                </div>
                <h3 className="font-semibold text-lg text-zinc-100 mb-2">{feat.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ── App Mockup + copy ────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 lg:px-10 py-20 max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">

          {/* Copy */}
          <RevealSection className="flex-1 max-w-lg lg:max-w-none">
            <p className="text-orange-400 text-xs font-semibold uppercase tracking-widest mb-4">L&apos;app</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-50 mb-6 leading-tight">
              Une marketplace pensée pour{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, #fb923c, #f59e0b)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                les Mauriciens
              </span>
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-8 text-base sm:text-lg">
              Que tu veuilles vendre ton ancien scooter, un canapé ou ton dernier iPhone —
              Zafer rend ça simple. Rencontre des acheteurs sérieux près de chez toi.
            </p>

            <ul className="space-y-3.5">
              {PERKS.map((perk, i) => (
                <RevealSection key={i} delay={0.15 + i * 0.1}>
                  <li className="flex items-center gap-3 text-zinc-300 text-sm sm:text-base">
                    <span className="w-6 h-6 rounded-full bg-orange-500/15 border border-orange-500/25 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-orange-400">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    </span>
                    {perk}
                  </li>
                </RevealSection>
              ))}
            </ul>
          </RevealSection>

          {/* Phone */}
          <RevealSection className="flex-1 flex justify-center lg:justify-end" delay={0.15}>
            <PhoneMockup />
          </RevealSection>
        </div>
      </section>

      {/* ── Scarcity banner ──────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 lg:px-10 py-16 max-w-6xl mx-auto">
        <RevealSection>
          <div className="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/8 to-amber-500/5 px-8 py-14 text-center">
            {/* Corner glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/25 rounded-full px-4 py-1.5 text-orange-400 text-xs font-semibold mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                Accès limité
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-50 mb-4">
                Les premiers places partent vite
              </h2>
              <p className="text-zinc-400 text-base sm:text-lg max-w-md mx-auto">
                On ouvre l&apos;accès beta à un nombre limité d&apos;utilisateurs.
                <br />
                <span className="text-orange-400 font-semibold">Sois parmi les premiers à Maurice.</span>
              </p>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 lg:px-10 py-20 max-w-6xl mx-auto">
        <RevealSection className="max-w-lg mx-auto text-center">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.div variants={scaleIn} className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-6">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="w-6 h-6 text-orange-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </motion.div>

            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-zinc-50 mb-4">
              Prêt à essayer Zafer ?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-zinc-400 mb-8 text-base">
              Inscris-toi maintenant et reçois un accès anticipé dès le lancement.
              <br />
              <span className="text-zinc-500 text-sm">Gratuit. Sans spam. Désabonnement en 1 clic.</span>
            </motion.p>

            <motion.div variants={fadeUp}>
              <EmailForm compact />
            </motion.div>
          </motion.div>
        </RevealSection>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/5 px-6 lg:px-10 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span
            className="font-extrabold text-lg"
            style={{ background: 'linear-gradient(90deg, #fb923c, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Zafer
          </span>
          <p className="text-zinc-600 text-sm text-center">
            © 2025 Zafer — Marketplace entre particuliers à l&apos;île Maurice
          </p>
          <p className="text-zinc-700 text-xs">Fait avec ❤️ à Maurice 🇲🇺</p>
        </div>
      </footer>

      {/* Gradient pan animation for hero text */}
      <style>{`
        @keyframes gradient-pan {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  )
}
