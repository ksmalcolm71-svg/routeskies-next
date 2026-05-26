export default function manifest() {
  return {
    name: 'RouteSkies',
    short_name: 'RouteSkies',
    description: 'Weather built for the road',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f1520',
    theme_color: '#2196F3',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  }
}
