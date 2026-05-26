'use client'
import { useEffect, useRef } from 'react'

// ── Severity → border/dot color ──────────────────────────────────
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
  { elementType: 'geometry',              stylers: [{ color: '#0d1a2d' }] },
  { elementType: 'labels.text.stroke',    stylers: [{ color: '#0d1a2d' }] },
  { elementType: 'labels.text.fill',      stylers: [{ color: '#6b7280' }] },
  { featureType: 'administrative',        elementType: 'geometry.stroke', stylers: [{ color: '#1e2d42' }] },
  { featureType: 'road',                  elementType: 'geometry',        stylers: [{ color: '#1e2d42' }] },
  { featureType: 'road.highway',          elementType: 'geometry',        stylers: [{ color: '#243650' }] },
  { featureType: 'road.highway',          elementType: 'geometry.stroke', stylers: [{ color: '#0f1928' }] },
  { featureType: 'road.arterial',         elementType: 'labels',          stylers: [{ visibility: 'off' }] },
  { featureType: 'road.local',            elementType: 'labels',          stylers: [{ visibility: 'off' }] },
  { featureType: 'water',                 elementType: 'geometry',        stylers: [{ color: '#091525' }] },
  { featureType: 'poi',                   stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',               stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape.natural',     elementType: 'geometry',        stylers: [{ color: '#0f1928' }] },
  { featureType: 'landscape.man_made',    elementType: 'geometry',        stylers: [{ color: '#0d1a2d' }] },
]

const fmt = (m) => {
  const h = Math.floor(m / 60) % 24, mn = m % 60, h12 = h % 12 || 12
  return `${h12}${mn > 0 ? `:${String(mn).padStart(2, '0')}` : ''} ${h >= 12 ? 'PM' : 'AM'}`
}

// Truncate city name so cards stay compact
const city = (name) => name.length > 13 ? name.slice(0, 12) + '…' : name

export default function MapView({ route, stops, departHour, active }) {
  const containerRef = useRef(null)
  const mapRef       = useRef(null)    // google.maps.Map instance
  const overlaysRef  = useRef([])      // WeatherCard OverlayView instances
  const markersRef   = useRef([])      // Marker instances
  const polylineRef  = useRef(null)    // Polyline instance
  const prevKeyRef   = useRef('')      // fingerprint of last-rendered data

  useEffect(() => {
    if (!active) return
    if (!route?.polyline?.length || !stops.length) return

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
    if (!apiKey) return

    // Fingerprint the current stops so we can tell "same data, just returning
    // to tab" (→ resize only) from "data changed" (→ full rebuild).
    const dataKey = stops.map(s => `${s.lat},${s.lon},${s.temp},${s.severity}`).join(';')

    if (prevKeyRef.current === dataKey && mapRef.current && window.google?.maps) {
      // User switched away and came back — tiles need a nudge but no rebuild
      window.google.maps.event.trigger(mapRef.current, 'resize')
      return
    }

    prevKeyRef.current = dataKey

    // Small delay so the container has real pixel dimensions after
    // transitioning from display:none → display:block
    const tid = setTimeout(() => {
      if (!containerRef.current) return
      if (window.google?.maps) {
        buildMap()
      } else {
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

  // ── Main map builder — runs on first load and when stops change ─
  function buildMap() {
    if (!containerRef.current || !route?.polyline?.length) return
    const gm = window.google.maps

    // ── Tear down any previous overlays, markers, polyline ───────
    overlaysRef.current.forEach(o => { try { o.setMap(null) } catch {} })
    overlaysRef.current = []
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []
    if (polylineRef.current) polylineRef.current.setMap(null)

    // ── Create (or reuse) the Map instance ───────────────────────
    const bounds = new gm.LatLngBounds()
    route.polyline.forEach(p => bounds.extend({ lat: p.lat, lng: p.lon }))

    // Reuse the existing map instance to avoid full DOM reinit;
    // only create a new one on first call.
    let map = mapRef.current
    if (!map) {
      map = new gm.Map(containerRef.current, {
        mapTypeId:         'roadmap',
        mapTypeControl:    false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl:       true,
        gestureHandling:   'cooperative',
        styles:            DARK_STYLE,
      })
      mapRef.current = map
    }
    map.fitBounds(bounds)

    // ── Route polyline ────────────────────────────────────────────
    polylineRef.current = new gm.Polyline({
      path:          route.polyline.map(p => ({ lat: p.lat, lng: p.lon })),
      geodesic:      true,
      strokeColor:   '#2196F3',
      strokeOpacity: 0.80,
      strokeWeight:  4,
      map,
    })

    // ── OverlayView subclass for always-visible weather cards ─────
    // Defined here because gm.OverlayView is only available post-load.
    class WeatherCard extends gm.OverlayView {
      constructor(latlng, html, onClick) {
        super()
        this._latlng  = latlng
        this._html    = html
        this._onClick = onClick
        this._div     = null
      }

      onAdd() {
        const div = document.createElement('div')
        div.style.cssText = 'position:absolute;'
        div.innerHTML     = this._html
        div.addEventListener('click', this._onClick)
        this._div = div
        // overlayMouseTarget pane keeps click events working
        this.getPanes().overlayMouseTarget.appendChild(div)
      }

      draw() {
        if (!this._div) return
        const proj = this.getProjection()
        const pt   = proj.fromLatLngToDivPixel(this._latlng)
        // Centre the card horizontally; push it 12 px below the marker dot
        this._div.style.left      = `${pt.x}px`
        this._div.style.top       = `${pt.y + 12}px`
        this._div.style.transform = 'translateX(-50%)'
      }

      onRemove() {
        if (this._div?.parentNode) this._div.parentNode.removeChild(this._div)
        this._div = null
      }
    }

    // ── Per-stop: marker + always-visible card + click popup ──────
    let openWindow = null

    stops.forEach((stop) => {
      const col    = PIN[stop.severity] || '#94a3b8'
      const pos    = new gm.LatLng(stop.lat, stop.lon)
      const arrMin = departHour * 60 + (stop.offsetMin || 0)
      const isEdge = stop.isStart || stop.isEnd

      // ── Circle marker (the colored dot on the polyline) ────────
      const marker = new gm.Marker({
        position: pos,
        map,
        icon: {
          path:         gm.SymbolPath.CIRCLE,
          scale:        isEdge ? 9 : 6,
          fillColor:    col,
          fillOpacity:  1,
          strokeColor:  '#0d1a2d',
          strokeWeight: 2,
        },
        title:  stop.name,
        zIndex: isEdge ? 10 : 1,
      })
      markersRef.current.push(marker)

      // ── Full-detail InfoWindow (opened on click) ───────────────
      const popup = new gm.InfoWindow({
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

      const openPopup = () => {
        if (openWindow) openWindow.close()
        popup.open({ map, anchor: marker })
        openWindow = popup
      }
      marker.addListener('click', openPopup)

      // ── Always-visible weather card (OverlayView) ─────────────
      // Pill shape, severity-colored border, dark translucent fill
      const label = city(stop.name)
      const cardHtml = `
        <div style="
          background: rgba(10,20,38,0.88);
          border: 1.5px solid ${col};
          border-radius: 20px;
          padding: ${isEdge ? '4px 11px' : '3px 9px'};
          font-size: ${isEdge ? '12px' : '11px'};
          font-weight: ${isEdge ? '700' : '500'};
          font-family: system-ui, -apple-system, sans-serif;
          color: #f1f5f9;
          white-space: nowrap;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.3);
          user-select: none;
          line-height: 1.4;
          letter-spacing: 0.01em;
        ">
          ${stop.icon}&thinsp;${stop.temp}°&thinsp;<span style="color:${col}">${label}</span>
        </div>
      `

      const card = new WeatherCard(pos, cardHtml, openPopup)
      card.setMap(map)
      overlaysRef.current.push(card)
    })
  }

  // ── No API key fallback ───────────────────────────────────────
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
          <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#475569', textAlign: 'center', padding: '0 24px', lineHeight: 1.6 }}>
            Add <strong style={{ color: '#2196F3' }}>NEXT_PUBLIC_GOOGLE_MAPS_KEY</strong> to your
            Vercel environment variables (same value as GOOGLE_MAPS_KEY)
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          style={{ width: '100%', height: 350, borderRadius: 12, overflow: 'hidden', background: '#0d1a2d' }}
        />
      )}
    </div>
  )
}
