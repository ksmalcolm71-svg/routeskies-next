import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — RouteSkies',
  description: 'Terms of Service for RouteSkies, a product of Nece Unified LLC.',
}

export default function TermsPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #07091A; color: #e2e8f0; font-family: 'Barlow', sans-serif; }
        a { color: inherit; text-decoration: none; }
      `}</style>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(7,9,26,.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(251,191,36,.12)',
        padding: '14px 24px',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 22,
            letterSpacing: '.1em', color: '#fbbf24',
            textShadow: '0 0 20px rgba(251,191,36,.4)',
          }}>
            🛣️ RouteSkies
          </Link>
          <Link href="/" style={{ fontSize: 13, color: '#94a3b8', transition: 'color .2s' }}>
            ← Back to home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '64px 24px 100px' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{
            fontFamily: "'Fira Code', monospace", fontSize: 11,
            color: '#fbbf24', letterSpacing: '.14em', textTransform: 'uppercase',
            marginBottom: 14,
          }}>
            Legal
          </div>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 8vw, 72px)',
            letterSpacing: '.03em', color: '#e2e8f0', lineHeight: 1, marginBottom: 16,
          }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', fontFamily: "'Fira Code', monospace" }}>
            Effective Date: May 24, 2026
          </p>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

          <Section title="Agreement">
            <P>By using RouteSkies at <strong>routeskies.com</strong> you agree to these terms. If you do not agree, please do not use the service.</P>
          </Section>

          <Section title="Who We Are">
            <P>RouteSkies is operated by <strong>Nece Unified LLC</strong>.</P>
          </Section>

          <Section title="What RouteSkies Is">
            <P>RouteSkies is a weather planning tool that provides estimated weather forecasts along driving routes based on publicly available weather data. It is designed to assist with trip planning — not to replace professional weather services, emergency alerts, or your own judgment while driving.</P>
          </Section>

          <Section title="Weather Data Disclaimer">
            <P style={{ marginBottom: 16 }}>Weather forecasts are inherently uncertain. RouteSkies provides estimated forecasts based on third-party data from Tomorrow.io and other sources. We make no guarantee that forecast data is accurate, complete, or current.</P>
            <P style={{ marginBottom: 12 }}>You agree that:</P>
            <List items={[
              'RouteSkies weather data is for planning purposes only',
              'You will not rely solely on RouteSkies for safety-critical driving decisions',
              'You will check official weather sources and emergency alerts before and during your trip',
              'Nece Unified LLC is not liable for any damages, losses, or injuries resulting from use of or reliance on RouteSkies data',
            ]} />
          </Section>

          <Section title="Limitation of Liability">
            <P>To the maximum extent permitted by law, Nece Unified LLC shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of RouteSkies. Our total liability to you for any claim shall not exceed $0 — RouteSkies is provided free of charge.</P>
          </Section>

          <Section title="Acceptable Use">
            <P style={{ marginBottom: 12 }}>You agree not to:</P>
            <List items={[
              'Use RouteSkies for any unlawful purpose',
              'Attempt to reverse engineer, scrape, or copy the service',
              'Use automated tools to make excessive API requests',
              'Resell or redistribute RouteSkies data without permission',
            ]} />
          </Section>

          <Section title="Intellectual Property">
            <P>The RouteSkies name, logo, design, and underlying technology are owned by Nece Unified LLC. The Synergy methodology used in our related products is a proprietary trade secret of Nece Unified LLC.</P>
          </Section>

          <Section title="Changes to the Service">
            <P>We may modify, suspend, or discontinue RouteSkies at any time without notice. We may also update these terms at any time. Continued use of the service after changes constitutes acceptance.</P>
          </Section>

          <Section title="Governing Law">
            <P>These terms are governed by the laws of the <strong>State of Florida, United States</strong>.</P>
          </Section>

          <Section title="Contact">
            <P>
              <strong>Nece Unified LLC</strong><br />
              <a href="mailto:hello@routeskies.com" style={{ color: '#fbbf24' }}>hello@routeskies.com</a><br />
              routeskies.com
            </P>
          </Section>

        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,.06)',
        padding: '28px 24px',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 12, color: '#334155', fontFamily: "'Fira Code', monospace" }}>
          © 2026 RouteSkies · Nece Unified LLC ·{' '}
          <Link href="/privacy" style={{ color: '#475569' }}>Privacy</Link>
          {' · '}
          <Link href="/terms" style={{ color: '#475569' }}>Terms</Link>
        </p>
      </footer>
    </>
  )
}

function Section({ title, children }) {
  return (
    <section>
      <h2 style={{
        fontFamily: "'Bebas Neue', sans-serif", fontSize: 26,
        letterSpacing: '.06em', color: '#fbbf24', marginBottom: 14,
      }}>
        {title}
      </h2>
      <div style={{
        background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)',
        borderRadius: 12, padding: '22px 24px',
      }}>
        {children}
      </div>
    </section>
  )
}

function P({ children, style }) {
  return (
    <p style={{ fontSize: 16, color: '#cbd5e1', lineHeight: 1.75, ...style }}>
      {children}
    </p>
  )
}

function List({ items }) {
  return (
    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 16, color: '#cbd5e1', lineHeight: 1.65 }}>
          <span style={{ color: '#fbbf24', fontSize: 14, marginTop: 3, flexShrink: 0 }}>▸</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
