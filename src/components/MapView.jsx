'use client'
import { useEffect, useRef } from 'react'

// ── Pin colors match the app's severity palette ──────────────────
const PIN = {
  clear:        '#34d399',
  cloudy:       '#94a3b8',
  'light-rain': '#7dd3fc',
  rain:         '#2196F3',
  severe:       '#f87171',
  snow:         '#e2e8f0',
}

// ── Dark map style matching the app's navy theme ─────────────────
const DARK_STYLE = [
  { elementType: 'geometry',               stylers: [{ color: '#0d1a2d' }] },
  { elementType: 'labels.text.stroke',     stylers: [{ color: '#0d1a2d' }] },
  { elementType: 'labels.text.fill',       stylers: [{ color: '#6b7280' }] },
  { featureType: 'administrative',         elementType: 'geometry.stroke', stylers: [{ color: '#1e2d42' }] },
  { featureType: 'road',                   elementType: 'geometry',        stylers: [{ color: '#1e2d42' }] },
  { featureType: 'road.highway',           elementType: 'geometry',        stylers: [{ color: '#243650' }] },
  { featureType: 'road.highway',           elementType: 'geometry.stroke', stylers: [{ color: '#0f1928' }] },
  { featureType: 'road.arterial',          elementType: 'labels',          stylers: [{ visibility: 'off' }] },
  { featureType: 'road.local',             elementType: 'labels',          stylers: [{ visibility: 'off' }] },
  { featureType: 'water',                  elementType: 'geometry',        stylers: [{ color: '#091525' }] },
  { featureType: 'poi',                    stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',               stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape.natural',     elementType: 'geometry',        stylers: [{ color: '#0f1928' }] },
  { featureType: 'landscape.man_made',    elementType: 'geometry',        stylers: [{ color: '#0d1a2d' }] },
]

const fmt = (m) => {
  const h = Math.floor(m / 60) % 24, mn = m % 60, h12 = h % 12 || 12
  return `${h12}${mn > 0 ? `:${String(mn).padStart(2, '0')}` : ''} ${h >= 12 ? 'PM' : 'AM'}`
}

export default function MapView({ route, stops, departHour, active }) {
  const containerRef   = useRef(null)
  const mapRef         = useRef(null)   // google.maps.Map instance
  const builtRef       = useRef(false)  // has the map been built yet

  // ── Build or resize the map whenever active changes ───────────
  useEffect(() => {
    if (!active) return

    // If already built, just trigger a resize so tiles repaint
    // after the container transitions from display:none → block
    if (builtRef.current && mapRef.current && window.google?.maps) {
      window.google.maps.event.trigger(mapRef.current, 'resize')
      return
    }

    if (!route?.polyline?.length || !stops.length) return

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
    if (!apiKey) return

    // Small delay so the container is visibly laid out before Google
    // Maps tries to measure its dimensions
    const tid = setTimeout(() => {
      if (!containerRef.current) return
      if (window.google?.maps) {
        buildMap()
      } else {
        // Avoid duplicate <script> tags if another component beat us to it
        const existing = document.querySelector('script[data-gm-loader]')
        if (existing) {
          existing.addEventListener('load', buildMap)
        } else {
          const s = document.createElement('script')
          s.src   = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async`
          s.async = true
          s.setAttribute('data-gm-loader', '1')
          s.addEventListener('load', buildMap)
          document.head.appendChild(s)
        }
      }
    }, 60)

    return () => clearTimeout(tid)
  }, [active, route, stops, departHour]) // eslint-disable-line react-hooks/exhaustive-deps

  function buildMap() {
    if (!containerRef.current || !route?.polyline?.length) return
    const gm = window.google.maps

    // Fit bounds to the entire polyline
    const bounds = new gm.LatLngBounds()
    route.polyline.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lon }))

    const map = new gm.Map(containerRef.current, {
      mapTypeId:         'roadmap',
      mapTypeControl:    false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl:       true,
      gestureHandling:   'cooperative',
      styles:            DARK_STYLE,
    })
    map.fitBounds(bounds)
    mapRef.current = map
    builtRef.current = true

    // ── Route polyline ──────────────────────────────────────────
    new gm.Polyline({
      path:          route.polyline.map((p) => ({ lat: p.lat, lng: p.lon })),
      geodesic:      true,
      strokeColor:   '#2196F3',
      strokeOpacity: 0.80,
      strokeWeight:  4,
      map,
    })

    // ── Weather stop markers ────────────────────────────────────
    let openWindow = null

    stops.forEach((stop) => {
      const col  = PIN[stop.severity] || '#94a3b8'
      const size = stop.isStart || stop.isEnd ? 10 : 7

      const marker = new gm.Marker({
        position: { lat: stop.lat, lng: stop.lon },
        map,
        icon: {
          path:         gm.SymbolPath.CIRCLE,
          scale:        size,
          fillColor:    col,
          fillOpacity:  1,
          strokeColor:  '#0d1a2d',
          strokeWeight: 2.5,
        },
        title:  stop.name,
        zIndex: stop.isStart || stop.isEnd ? 10 : 1,
      })

      const arrMin = departHour * 60 + (stop.offsetMin || 0)
      const popup  = new gm.InfoWindow({
        maxWidth: 220,
        content: `
          <div style="font-family:system-ui,sans-serif;padding:6px 2px;min-width:155px">
            <div style="font-weight:800;font-size:14px;margin-bottom:2px;color:#111">
              ${stop.name}${stop.state ? `, ${stop.state}` : ''}
            </div>
            <div style="font-size:11px;color:#64748b;margin-bottom:8px;font-family:monospace">
              ${stop.isStart ? 'Depart' : '~Arrive'} ${fmt(arrMin)}
            </div>
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:26px;line-height:1">${stop.icon}</span>
              <div>
                <div style="font-size:22px;font-weight:700;color:#111;line-height:1">${stop.temp}°F</div>
                <div style="font-size:12px;font-weight:700;margin-top:2px;color:${col}">${stop.condition}</div>
              </div>
            </div>
            <div style="margin-top:8px;padding-top:7px;border-top:1px solid #e5e7eb;display:flex;gap:10px;font-size:11px;color:#6b7280;font-family:monospace">
              <span>💧${stop.precipPct}%</span>
              <span>💨${stop.wind}mph</span>
              <span>💦${stop.humidity}%</span>
            </div>
          </div>
        `,
      })

      marker.addListener('click', () => {
        if (openWindow) openWindow.close()
        popup.open({ map, anchor: marker })
        openWindow = popup
      })
    })
  }

  // ── No API key — show a clear setup message ───────────────────
  const hasKey = !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY

  return (
    <div style={{ display: active ? 'block' : 'none', marginBottom: 14 }}>
      {!hasKey ? (
        <div style={{
          width: '100%', height: 200, borderRadius: 12,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <div style={{ fontSize: 28 }}>🗺️</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>Map View needs a key</div>
          <div style={{
            fontSize: 11, fontFamily: 'monospace', color: '#475569',
            textAlign: 'center', padding: '0 24px', lineHeight: 1.6,
          }}>
            Add <strong style={{ color: '#2196F3' }}>NEXT_PUBLIC_GOOGLE_MAPS_KEY</strong> to your
            Vercel environment variables (same value as GOOGLE_MAPS_KEY)
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          style={{
            width: '100%', height: 350, borderRadius: 12,
            overflow: 'hidden', background: '#0d1a2d',
          }}
        />
      )}
    </div>
  )
}
