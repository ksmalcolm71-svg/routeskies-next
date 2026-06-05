'use client'
import { useState, useEffect } from 'react'

// Dismiss is remembered for 30 days so returning users aren't pestered
const DISMISS_DAYS = 30

export default function InstallPrompt() {
  const [platform,    setPlatform]    = useState(null)  // 'ios' | 'chromium' | null
  const [deferred,    setDeferred]    = useState(null)  // beforeinstallprompt event
  const [showSheet,   setShowSheet]   = useState(false) // iOS instructions modal
  const [visible,     setVisible]     = useState(false)

  useEffect(() => {
    // ── Already running as installed PWA? ──────────────────────────
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true          // iOS Safari property
    if (standalone) return

    // ── Recently dismissed? ────────────────────────────────────────
    try {
      const ts = localStorage.getItem('rs_pwa_dismissed')
      if (ts && Date.now() - Number(ts) < DISMISS_DAYS * 864e5) return
    } catch {}

    const ua = navigator.userAgent

    // ── iOS Safari ────────────────────────────────────────────────
    // iOS does NOT fire beforeinstallprompt. We detect iOS + Safari
    // and show manual "Share → Add to Home Screen" instructions.
    const isIOS    = /iPad|iPhone|iPod/.test(ua) && !window.MSStream
    // CriOS = Chrome for iOS, FxiOS = Firefox for iOS — those don't
    // support PWA add-to-homescreen either, so only match plain Safari
    const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|OPiOS/.test(ua)

    if (isIOS && isSafari) {
      setPlatform('ios')
      setVisible(true)
      return
    }

    // ── Chrome / Edge / Samsung Internet ──────────────────────────
    // beforeinstallprompt fires when the browser decides the PWA is
    // installable (manifest + SW registered + HTTPS + not installed).
    const handler = (e) => {
      e.preventDefault()       // prevent automatic mini-infobar
      setDeferred(e)
      setPlatform('chromium')
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => {
      setVisible(false)
      setDeferred(null)
    })
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    setVisible(false)
    setShowSheet(false)
    try { localStorage.setItem('rs_pwa_dismissed', String(Date.now())) } catch {}
  }

  async function installChromium() {
    if (!deferred) return
    deferred.prompt()
    const { outcome } = await deferred.userChoice
    if (outcome === 'accepted') setVisible(false)
    setDeferred(null)
  }

  if (!visible) return null

  // ── iOS: small button + slide-up instruction sheet ────────────────
  if (platform === 'ios') {
    return (
      <>
        <button
          onClick={() => setShowSheet(true)}
          style={{
            fontSize: 11, padding: '5px 10px', fontWeight: 700,
            background: 'rgba(45,106,79,0.12)', color: '#2d6a4f',
            border: '1px solid rgba(45,106,79,0.35)', borderRadius: 8,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            gap: 5, whiteSpace: 'nowrap', letterSpacing: '.04em',
          }}
          aria-label="Add RouteSkies to Home Screen"
        >
          📲 Add to Home Screen
        </button>

        {showSheet && (
          // Fixed overlay behind the instruction sheet
          <div
            onClick={() => setShowSheet(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 9000,
              background: 'rgba(0,0,0,0.55)',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: '#fff', borderRadius: '18px 18px 0 0',
                padding: '24px 24px 36px', width: '100%', maxWidth: 480,
                boxShadow: '0 -4px 32px rgba(0,0,0,0.18)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 28 }}>🛣️</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: '#1b4332' }}>Add RouteSkies</div>
                    <div style={{ fontSize: 12, color: '#6b7480' }}>to your Home Screen</div>
                  </div>
                </div>
                <button
                  onClick={dismiss}
                  style={{ background: 'none', border: 'none', fontSize: 22, color: '#9ca3af', cursor: 'pointer', lineHeight: 1, padding: 4 }}
                  aria-label="Close"
                >×</button>
              </div>

              {/* Steps */}
              {[
                ['1', '⬆', 'Tap the Share button', 'It\'s the box with an arrow at the bottom of Safari.'],
                ['2', '➕', 'Tap "Add to Home Screen"', 'Scroll down in the Share menu until you see this option.'],
                ['3', '✓',  'Tap "Add" to confirm', 'RouteSkies will appear on your home screen like a native app.'],
              ].map(([n, icon, title, body]) => (
                <div key={n} style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(45,106,79,0.1)', border: '1px solid rgba(45,106,79,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16,
                  }}>{icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1e2d23', marginBottom: 2 }}>{title}</div>
                    <div style={{ fontSize: 13, color: '#6b7480', lineHeight: 1.5 }}>{body}</div>
                  </div>
                </div>
              ))}

              <button
                onClick={dismiss}
                style={{
                  marginTop: 8, width: '100%', background: '#2d6a4f', color: '#fff',
                  border: 'none', borderRadius: 10, padding: '13px 0',
                  fontWeight: 700, fontSize: 15, cursor: 'pointer',
                }}
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    )
  }

  // ── Chrome / Edge / Android: native install button ────────────────
  if (platform === 'chromium') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button
          onClick={installChromium}
          style={{
            fontSize: 11, padding: '5px 10px', fontWeight: 700,
            background: 'rgba(45,106,79,0.12)', color: '#2d6a4f',
            border: '1px solid rgba(45,106,79,0.35)', borderRadius: 8,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            gap: 5, whiteSpace: 'nowrap', letterSpacing: '.04em',
          }}
          aria-label="Install RouteSkies app"
        >
          ⬇ Install App
        </button>
        <button
          onClick={dismiss}
          style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '4px 2px' }}
          aria-label="Dismiss install prompt"
        >×</button>
      </div>
    )
  }

  return null
}
