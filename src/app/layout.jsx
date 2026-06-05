import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar'

export const metadata = {
  title: 'RouteSkies — Weather Built for the Road',
  description: 'Time-adjusted weather forecasts for every mile of your drive. Built for truck drivers, field reps, and anyone who drives for a living.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;500;600;700;800;900&family=Barlow:wght@300;400;500;600;700&family=Fira+Code:wght@400;500;600&display=swap" rel="stylesheet" />

        {/* ── PWA / Apple Home Screen ─────────────────────────────── */}
        {/* Tells iOS Safari to support standalone (full-screen) mode   */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        {/* App name shown under the icon on the iOS home screen        */}
        <meta name="apple-mobile-web-app-title" content="RouteSkies" />
        {/* Status bar appearance when launched from home screen        */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* iOS home screen icon (180×180 is the recommended touch size) */}
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        {/* Viewport hint — prevents iOS from auto-zooming on inputs    */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-9830TLPCDK" />
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-9830TLPCDK');
        `}} />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#0f1520' }}>
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  )
}
