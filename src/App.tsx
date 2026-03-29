import { useState, useEffect, useRef } from 'react'
import type { FormEvent } from 'react'

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const FB_PIXEL_ID = '1419561725602042'
const TRACKER_URL = 'http://204.168.143.240:8080/webinar-lead'

// Webinar config — update date here
const WEBINAR_DATE = new Date('2026-04-15T20:00:00+02:00')
const WEBINAR_DATE_LABEL = 'Mardi 15 avril à 20h (heure de Paris)'
const WEBINAR_REPLAY_URL = '' // fill after live

// ─── STYLES ──────────────────────────────────────────────────────────────────
const S = {
  orange: '#E8892B', orangeDark: '#C97520', orangeLight: '#FEF3E7',
  navy: '#1B2B4B', navyLight: '#2D4270',
  cream: '#FBF7F2', white: '#FFFFFF',
  border: '#E5E0D8', text: '#374151', textLight: '#6B7280',
}

// ─── UTILS ───────────────────────────────────────────────────────────────────
function initPixel() {
  if (typeof window === 'undefined' || (window as any).fbq) return
  const s = document.createElement('script')
  s.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${FB_PIXEL_ID}');fbq('track','PageView');`
  document.head.appendChild(s)
}
function pixelTrack(event: string, data?: Record<string, unknown>) {
  try { const fbq = (window as any).fbq; if (fbq) fbq('track', event, data || {}) } catch (_) {}
}
function getUTMs() {
  const p = new URLSearchParams(window.location.search)
  return {
    utm_source: p.get('utm_source') || '',
    utm_medium: p.get('utm_medium') || '',
    utm_campaign: p.get('utm_campaign') || '',
    utm_content: p.get('utm_content') || '',
    fbclid: p.get('fbclid') || '',
    ref: p.get('ref') || document.referrer || '',
  }
}

// ─── COUNTDOWN ───────────────────────────────────────────────────────────────
function useCountdown(target: Date) {
  const calc = () => {
    const diff = target.getTime() - Date.now()
    if (diff <= 0) return { j: 0, h: 0, m: 0, s: 0, over: true }
    const total = Math.floor(diff / 1000)
    return {
      j: Math.floor(total / 86400),
      h: Math.floor((total % 86400) / 3600),
      m: Math.floor((total % 3600) / 60),
      s: total % 60,
      over: false,
    }
  }
  const [tick, setTick] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setTick(calc()), 1000)
    return () => clearInterval(id)
  }, [])
  return tick
}

// ─── PAGE DETECT ─────────────────────────────────────────────────────────────
function getPage() {
  const path = window.location.pathname
  if (path.includes('confirmation')) return 'confirmation'
  if (path.includes('replay')) return 'replay'
  return 'register'
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: S.orange, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: S.white, fontWeight: 800, fontSize: 16 }}>ST</span>
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: S.navy, lineHeight: 1.2 }}>Samirra Trari</div>
        <div style={{ fontSize: 11, color: S.textLight }}>Méthode 15 Clés</div>
      </div>
    </div>
  )
}

function CountdownBlock({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 56 }}>
      <div style={{
        background: S.navy, color: S.white, fontWeight: 800,
        fontSize: 28, lineHeight: 1, padding: '12px 8px',
        borderRadius: 10, marginBottom: 6, fontVariantNumeric: 'tabular-nums',
      }}>
        {String(value).padStart(2, '0')}
      </div>
      <div style={{ fontSize: 11, color: S.textLight, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  )
}

// ─── REGISTER PAGE ───────────────────────────────────────────────────────────
function RegisterPage() {
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const utms = useRef(getUTMs())
  const countdown = useCountdown(WEBINAR_DATE)

  useEffect(() => { initPixel(); pixelTrack('ViewContent', { content_name: 'Webinar_Register' }) }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) { setError('Adresse email invalide.'); return }
    setLoading(true)
    setError('')
    pixelTrack('Lead', { content_name: 'Webinar_Register' })
    try {
      await fetch(TRACKER_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, prenom,
          source: 'webinar',
          ...utms.current,
          device: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
          ts: new Date().toISOString(),
        }),
      })
    } catch (_) {}
    // Redirect to confirmation
    window.location.href = '/confirmation'
  }

  const POINTS = [
    { icon: '✍️', text: 'Les vraies causes de l\'écriture difficile (pas celles qu\'on croit)' },
    { icon: '🔑', text: 'Les 3 clés les plus puissantes pour un résultat rapide en 10 min/jour' },
    { icon: '🎯', text: 'Comment savoir si votre enfant / vos élèves en ont besoin maintenant' },
    { icon: '🚀', text: 'Un plan d\'action concret à appliquer dès le lendemain' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: S.cream }}>

      {/* Header */}
      <header style={{ background: S.white, borderBottom: `1px solid ${S.border}`, padding: '14px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <Logo />
        </div>
      </header>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* Badge */}
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: 20 }}>
          <span style={{
            display: 'inline-block', background: S.orangeLight, color: S.orangeDark,
            fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', padding: '6px 16px', borderRadius: 99,
          }}>
            Webinaire 100% gratuit
          </span>
        </div>

        {/* Hero */}
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(24px, 5vw, 38px)', fontWeight: 800,
            color: S.navy, lineHeight: 1.2, marginBottom: 14,
          }}>
            Découvrez les 15 Clés qui transforment l'écriture de votre enfant en 10 min/jour
          </h1>
          <p style={{ fontSize: 17, color: S.textLight, lineHeight: 1.6, maxWidth: 520, margin: '0 auto' }}>
            Un webinaire en direct avec Samirra Trari — la méthode qu'utilisent déjà + de 5 500 familles en France.
          </p>
        </div>

        {/* Date + Countdown */}
        <div className="fade-up" style={{
          background: S.navy, borderRadius: 16, padding: '20px 24px',
          textAlign: 'center', marginBottom: 28,
        }}>
          <div style={{ color: '#94A3B8', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Prochain webinaire
          </div>
          <div style={{ color: S.white, fontWeight: 700, fontSize: 18, marginBottom: 16 }}>
            📅 {WEBINAR_DATE_LABEL}
          </div>
          {!countdown.over ? (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <CountdownBlock label="Jours" value={countdown.j} />
              <div style={{ color: S.white, fontSize: 24, fontWeight: 800, alignSelf: 'center', marginBottom: 18 }}>:</div>
              <CountdownBlock label="Heures" value={countdown.h} />
              <div style={{ color: S.white, fontSize: 24, fontWeight: 800, alignSelf: 'center', marginBottom: 18 }}>:</div>
              <CountdownBlock label="Min" value={countdown.m} />
              <div style={{ color: S.white, fontSize: 24, fontWeight: 800, alignSelf: 'center', marginBottom: 18 }}>:</div>
              <CountdownBlock label="Sec" value={countdown.s} />
            </div>
          ) : (
            <div style={{ color: S.orange, fontWeight: 700, fontSize: 16 }}>Le webinaire est en cours — rejoignez maintenant !</div>
          )}
        </div>

        {/* Two columns layout on wide screens */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* What you'll learn */}
          <div className="fade-up" style={{ background: S.white, borderRadius: 16, padding: '24px', border: `1px solid ${S.border}` }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: S.navy, marginBottom: 16 }}>
              Ce que vous allez découvrir
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {POINTS.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{p.icon}</span>
                  <span style={{ fontSize: 15, color: S.text, lineHeight: 1.5 }}>{p.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Registration form */}
          <div className="fade-up" style={{
            background: S.white, borderRadius: 16, padding: '28px 24px',
            border: `2px solid ${S.orange}`,
            boxShadow: '0 8px 32px rgba(232,137,43,0.15)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>🎟️</div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: S.navy, marginBottom: 4 }}>
                Je réserve ma place gratuite
              </h2>
              <p style={{ fontSize: 14, color: S.textLight }}>
                Places limitées — confirmation immédiate par email
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="text"
                placeholder="Votre prénom"
                value={prenom}
                onChange={e => setPrenom(e.target.value)}
                style={{
                  padding: '14px 16px', borderRadius: 10, border: `1.5px solid ${S.border}`,
                  fontSize: 15, outline: 'none', background: S.cream,
                  fontFamily: 'inherit',
                }}
              />
              <input
                type="email"
                placeholder="Votre email *"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  padding: '14px 16px', borderRadius: 10, border: `1.5px solid ${S.border}`,
                  fontSize: 15, outline: 'none', background: S.cream,
                  fontFamily: 'inherit',
                }}
              />
              {error && <div style={{ color: '#DC2626', fontSize: 13 }}>{error}</div>}
              <button
                type="submit"
                disabled={loading || !email.trim()}
                style={{
                  padding: '16px', borderRadius: 12,
                  background: loading || !email.trim() ? '#D1D5DB' : S.orange,
                  color: S.white, border: 'none',
                  cursor: !email.trim() || loading ? 'not-allowed' : 'pointer',
                  fontSize: 16, fontWeight: 700,
                  animation: email.trim() && !loading ? 'pulse 2s ease-in-out infinite' : 'none',
                  transition: 'background 0.2s',
                  fontFamily: 'inherit',
                }}
              >
                {loading ? 'Inscription en cours…' : 'Je réserve ma place →'}
              </button>
              <p style={{ fontSize: 12, color: S.textLight, textAlign: 'center' }}>
                100% gratuit · Aucune carte bancaire · Désabonnement en 1 clic
              </p>
            </form>
          </div>

          {/* Speaker */}
          <div className="fade-up" style={{ background: S.white, borderRadius: 16, padding: '24px', border: `1px solid ${S.border}`, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: S.orangeLight, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
              👩‍🏫
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: S.navy, marginBottom: 4 }}>Samirra Trari</div>
              <div style={{ fontSize: 14, color: S.textLight, lineHeight: 1.6 }}>
                Spécialiste en rééducation de l'écriture, formée en neuropsychologie du geste graphique.
                Elle a accompagné + de 5 500 enfants et formé + de 1 500 professionnels avec sa Méthode 15 Clés.
              </div>
            </div>
          </div>

          {/* Social proof */}
          <div className="fade-up" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { n: '5 500+', l: 'enfants aidés' },
              { n: '1 500+', l: 'pros formés' },
              { n: '10 min', l: 'par jour suffit' },
            ].map((s, i) => (
              <div key={i} style={{
                flex: 1, minWidth: 100, background: S.white,
                border: `1px solid ${S.border}`, borderRadius: 12,
                padding: '16px 12px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: S.orange }}>{s.n}</div>
                <div style={{ fontSize: 12, color: S.textLight, marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── CONFIRMATION PAGE ────────────────────────────────────────────────────────
function ConfirmationPage() {
  const countdown = useCountdown(WEBINAR_DATE)

  useEffect(() => { initPixel() }, [])

  const gcalUrl = () => {
    const start = WEBINAR_DATE.toISOString().replace(/[-:]/g, '').replace('.000', '')
    const end = new Date(WEBINAR_DATE.getTime() + 90 * 60000).toISOString().replace(/[-:]/g, '').replace('.000', '')
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Webinaire+Méthode+15+Clés&dates=${start}/${end}&details=Webinaire+gratuit+avec+Samirra+Trari`
  }

  return (
    <div style={{ minHeight: '100vh', background: S.cream }}>
      <header style={{ background: S.white, borderBottom: `1px solid ${S.border}`, padding: '14px 24px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}><Logo /></div>
      </header>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 20px', textAlign: 'center' }}>

        <div className="fade-up" style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>

        <div className="fade-up">
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 800,
            color: S.navy, marginBottom: 12,
          }}>
            Votre place est réservée !
          </h1>
          <p style={{ fontSize: 16, color: S.textLight, lineHeight: 1.6, marginBottom: 28 }}>
            Vérifiez vos emails — un lien de connexion vous sera envoyé la veille et le jour J.
          </p>
        </div>

        {/* Countdown */}
        {!countdown.over && (
          <div className="fade-up" style={{ background: S.navy, borderRadius: 16, padding: '20px 24px', marginBottom: 24 }}>
            <div style={{ color: '#94A3B8', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              Le webinaire commence dans
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <CountdownBlock label="Jours" value={countdown.j} />
              <div style={{ color: S.white, fontSize: 24, fontWeight: 800, alignSelf: 'center', marginBottom: 18 }}>:</div>
              <CountdownBlock label="Heures" value={countdown.h} />
              <div style={{ color: S.white, fontSize: 24, fontWeight: 800, alignSelf: 'center', marginBottom: 18 }}>:</div>
              <CountdownBlock label="Min" value={countdown.m} />
              <div style={{ color: S.white, fontSize: 24, fontWeight: 800, alignSelf: 'center', marginBottom: 18 }}>:</div>
              <CountdownBlock label="Sec" value={countdown.s} />
            </div>
          </div>
        )}

        {/* Add to calendar */}
        <div className="fade-up" style={{ background: S.white, borderRadius: 16, padding: '24px', border: `1px solid ${S.border}`, marginBottom: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: S.navy, marginBottom: 6 }}>
            📅 {WEBINAR_DATE_LABEL}
          </div>
          <p style={{ fontSize: 14, color: S.textLight, marginBottom: 16 }}>
            Ajoutez le webinaire à votre agenda pour ne pas l'oublier.
          </p>
          <a
            href={gcalUrl()}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block', padding: '12px 24px', borderRadius: 10,
              background: S.navy, color: S.white, fontWeight: 600, fontSize: 14,
              textDecoration: 'none',
            }}
          >
            Ajouter à Google Agenda
          </a>
        </div>

        {/* Share */}
        <div className="fade-up" style={{ background: S.orangeLight, borderRadius: 16, padding: '20px 24px', border: `1px solid ${S.orange}` }}>
          <p style={{ fontSize: 14, color: S.orangeDark, fontWeight: 600, marginBottom: 4 }}>
            Vous connaissez un parent ou un prof qui pourrait être concerné ?
          </p>
          <p style={{ fontSize: 13, color: S.text }}>
            Partagez ce webinaire — l'accès est 100% gratuit.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── REPLAY PAGE ─────────────────────────────────────────────────────────────
function ReplayPage() {
  useEffect(() => { initPixel(); pixelTrack('ViewContent', { content_name: 'Webinar_Replay' }) }, [])

  return (
    <div style={{ minHeight: '100vh', background: S.cream }}>
      <header style={{ background: S.white, borderBottom: `1px solid ${S.border}`, padding: '14px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}><Logo /></div>
      </header>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px 60px' }}>

        <div className="fade-up" style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{
            display: 'inline-block', background: '#FEE2E2', color: '#DC2626',
            fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', padding: '6px 16px', borderRadius: 99, marginBottom: 12,
          }}>
            🔴 Replay disponible pour 48h
          </span>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800,
            color: S.navy, marginBottom: 10,
          }}>
            Replay — Les 15 Clés qui transforment l'écriture
          </h1>
          <p style={{ fontSize: 15, color: S.textLight }}>
            Webinaire avec Samirra Trari · Regardez avant que le replay ne disparaisse
          </p>
        </div>

        {/* Video placeholder */}
        <div className="fade-up" style={{ marginBottom: 28 }}>
          {WEBINAR_REPLAY_URL ? (
            <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: 16, overflow: 'hidden', background: '#000' }}>
              <iframe
                src={WEBINAR_REPLAY_URL}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                frameBorder="0"
                allowFullScreen
                title="Replay webinaire"
              />
            </div>
          ) : (
            <div style={{
              background: S.navy, borderRadius: 16, padding: '60px 24px',
              textAlign: 'center', color: S.white,
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>▶️</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Le replay arrive bientôt</div>
              <div style={{ fontSize: 14, color: '#94A3B8' }}>Il sera disponible ici juste après le webinaire en direct.</div>
            </div>
          )}
        </div>

        {/* CTA after replay */}
        <div className="fade-up" style={{
          background: S.white, borderRadius: 16, padding: '28px 24px',
          border: `2px solid ${S.orange}`, textAlign: 'center',
          boxShadow: '0 8px 32px rgba(232,137,43,0.12)',
        }}>
          <div style={{ fontSize: 20, marginBottom: 8 }}>⏰</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: S.navy, marginBottom: 8 }}>
            Prêt à passer à l'action ?
          </h2>
          <p style={{ fontSize: 15, color: S.textLight, marginBottom: 20, lineHeight: 1.6 }}>
            Découvrez la formation complète Méthode 15 Clés et commencez dès demain.
          </p>
          <a
            href="https://offre.trari-pedagogie.com"
            style={{
              display: 'inline-block', padding: '16px 32px', borderRadius: 12,
              background: S.orange, color: S.white, fontWeight: 700, fontSize: 16,
              textDecoration: 'none',
            }}
          >
            Accéder à la formation →
          </a>
          <p style={{ fontSize: 12, color: S.textLight, marginTop: 10 }}>
            Offre spéciale webinaire — disponible 48h
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page] = useState(getPage)
  if (page === 'confirmation') return <ConfirmationPage />
  if (page === 'replay') return <ReplayPage />
  return <RegisterPage />
}
