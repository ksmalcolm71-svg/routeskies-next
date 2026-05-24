import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — RouteSkies',
  description: 'Privacy Policy for RouteSkies, a product of Nece Unified LLC.',
}

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', fontFamily: "'Fira Code', monospace" }}>
            Effective Date: May 24, 2026
          </p>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

          <Section title="Who We Are">
            <P>RouteSkies is a product of <strong>Nece Unified LLC</strong>. We provide time-adjusted weather forecasts for road trips and driving routes. Our website is <strong>routeskies.com</strong>.</P>
          </Section>

          <Section title="What We Collect">
            <List items={[
              <><strong>Email address</strong> — when you join our waitlist</>,
              <><strong>Usage data</strong> — pages visited, time on site, general location (country/region) via Google Analytics</>,
              <><strong>Route data</strong> — origin, destination, and departure time you enter to plan a route. We do not store this data — it is processed in real time and discarded.</>,
            ]} />
          </Section>

          <Section title="What We Do NOT Collect">
            <List items={[
              'Your name (unless you provide it)',
              'Payment information',
              'Precise GPS location',
              'Any data from minors under 13',
            ]} />
          </Section>

          <Section title="How We Use Your Data">
            <List items={[
              'Email addresses are used only to send you waitlist updates and product announcements via Kit (ConvertKit)',
              'Usage data helps us understand how people use the app so we can improve it',
              'We never sell your data to third parties',
            ]} />
          </Section>

          <Section title="Third-Party Services We Use">
            <P style={{ marginBottom: 12 }}>Each of these services has their own privacy policy governing how they handle data.</P>
            <List items={[
              <><strong>Google Maps</strong> — for route calculation and geocoding</>,
              <><strong>Tomorrow.io</strong> — for weather forecast data</>,
              <><strong>Kit (ConvertKit)</strong> — for email list management</>,
              <><strong>Google Analytics</strong> — for usage tracking</>,
              <><strong>Vercel</strong> — for hosting</>,
            ]} />
          </Section>

          <Section title="Your Rights">
            <List items={[
              'You can unsubscribe from our email list at any time using the unsubscribe link in any email',
              <>You can request deletion of your email from our list by emailing us at <a href="mailto:hello@routeskies.com" style={{ color: '#fbbf24' }}>hello@routeskies.com</a></>,
              'We honor all GDPR and CAN-SPAM requirements',
            ]} />
          </Section>

          <Section title="Cookies">
            <P>We use Google Analytics which sets cookies to track usage. You can disable cookies in your browser settings at any time.</P>
          </Section>

          <Section title="Changes to This Policy">
            <P>We may update this policy as the product grows. We will notify subscribers of any material changes via email.</P>
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
