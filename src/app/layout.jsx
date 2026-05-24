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
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-9830TLPCDK" />
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-9830TLPCDK');
        `}} />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#07091A' }}>
        {children}
      </body>
    </html>
  )
}
