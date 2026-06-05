'use client'
import { useEffect, useRef, useState } from 'react'

// ── Severity → pin/border color ──────────────────────────────────
const PIN = {
  clear:        '#34d399',
  cloudy:       '#94a3b8',
  'light-rain': '#7dd3fc',
  rain:         '#2196F3',
  severe:       '#f87171',
  snow:         '#e2e8f0',
}

// ── Dark map style ────────────────────────────────────────────────
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

const clip = (name) => name.length > 13 ? name.slice(0, 12) + '…' : name

export default function MapView({ route, stops, departHour, active }) {
  const containerRef = useRef(null)
  const mapRef       = useRef(null)   // google.maps.Map instance
  const overlaysRef  = useRef([])     // WeatherCard OverlayView instances
  const markersRef   = useRef([])     // Marker instances
  const polylineRef  = useRef(null)   // Polyline instance
  const boundsRef    = useRef(null)   // LatLngBounds reused on re-activation
  const prevKeyRef   = useRef('')     // stops fingerprint — detects data changes

  const [mapStatus, setMapStatus] = useState('idle') // idle | loading | ready | error

  // ─────────────────────────────────────────────────────────────────
  // EFFECT 1 — Data-driven initialization.
  //
  // Intentionally does NOT depend on `active`.  The map is built as
  // soon as route + stops arrive, regardless of which tab is showing.
  //
  // WHY: the container's parent clips to maxHeight:0 when inactive
  // (see JSX), but the container itself always has height:350 so
  // Google Maps can measure real pixel dimensions on any tab.
  // Decoupling init from `active` means the map is ready the moment
  // the user first opens Map View — no "build-on-first-show" race.
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!route?.polyline?.length || !stops.length) return
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
    if (!apiKey) return

    // Fingerprint so we skip rebuilds when only the tab changed
    const dataKey = stops.map(s => `${s.lat},${s.lon},${s.temp},${s.severity}`).join(';')
    if (prevKeyRef.current === dataKey && mapRef.current) return
    prevKeyRef.current = dataKey

    function init() {
      // rAF×2: first frame commits the DOM, second frame ensures the
      // browser has calculated layout (offsetWidth/offsetHeight).
      // This guarantees containerRef has real pixel dimensions when
      // Google Maps reads them — even on the very first render.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (containerRef.current) buildMap()
        })
      )
    }

    if (window.google?.maps) {
      init()
    } else {
      setMapStatus('loading')
      const existing = document.querySelector('script[data-gm-loader]')
      if (existing) {
        if (window.google?.maps) { init(); return }
        existing.addEventListener('load', init, { once: true })
        existing.addEventListener('error', () => setMapStatus('error'), { once: true })
      } else {
        const s = document.createElement('script')
        s.src   = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async`
        s.async = true
        s.setAttribute('data-gm-loader', '1')
        s.addEventListener('load',  init,                         { once: true })
        s.addEventListener('error', () => setMapStatus('error'),  { once: true })
        document.head.appendChild(s)
      }
    }
  }, [route, stops, departHour]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────────────────────────
  // EFFECT 2 — Re-center when the Map View tab is opened.
  //
  // When the parent clips the container back to visible (maxHeight
  // goes from 0 → 'none'), Google Maps needs a resize event to
  // re-measure the container and repaint tiles.  We also re-call
  // fitBounds so the full route is always visible on return.
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!active || !mapRef.current || !window.google?.maps) return
    const tid = setTimeout(() => {
      const gm = window.google.maps
      gm.event.trigger(mapRef.current, 'resize')
      if (boundsRef.current) mapRef.current.fitBounds(boundsRef.current)
    }, 80)
    return () => clearTimeout(tid)
  }, [active])

  // ─────────────────────────────────────────────────────────────────
  // buildMap — creates / rebuilds the map, polyline, markers, cards
  // ─────────────────────────────────────────────────────────────────
  function buildMap() {
    if (!containerRef.current || !route?.polyline?.length) return
    const gm = window.google.maps

    setMapStatus('loading')

    // Tear down previous overlays, markers, polyline
    overlaysRef.current.forEach(o => { try { o.setMap(null) } catch {} })
    overlaysRef.current = []
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []
    if (polylineRef.current) polylineRef.current.setMap(null)

    // Compute bounds across the full polyline
    const bounds = new gm.LatLngBounds()
    route.polyline.forEach(p => bounds.extend({ lat: p.lat, lng: p.lon }))
    boundsRef.current = bounds

    // ── Create or reuse the Map instance ───────────────────────────
    let map = mapRef.current
    if (!map) {
      // Use a reasonable starting center so the map isn't blank while
      // tiles load before `idle` fires
      const mid = route.polyline[Math.floor(route.polyline.length / 2)]
      map = new gm.Map(containerRef.current, {
        center:            { lat: mid.lat, lng: mid.lon },
        zoom:              6,
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

    // ── Route polyline ──────────────────────────────────────────────
    polylineRef.current = new gm.Polyline({
      path:          route.polyline.map(p => ({ lat: p.lat, lng: p.lon })),
      geodesic:      true,
      strokeColor:   '#2196F3',
      strokeOpacity: 0.80,
      strokeWeight:  4,
      map,
    })

    // ── OverlayView subclass — always-visible weather pill cards ────
    // Must be defined inside buildMap() because gm.OverlayView is only
    // available after the Maps API has loaded.
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
        div.innerHTML = this._html
        div.addEventListener('click', this._onClick)
        this._div = div
        this.getPanes().overlayMouseTarget.appendChild(div)
      }
      draw() {
        if (!this._div) return
        const pt = this.getProjection().fromLatLngToDivPixel(this._latlng)
        this._div.style.left      = `${pt.x}px`
        this._div.style.top       = `${pt.y + 12}px`
        this._div.style.transform = 'translateX(-50%)'
      }
      onRemove() {
        if (this._div?.parentNode) this._div.parentNode.removeChild(this._div)
        this._div = null
      }
    }

    // ── Per-stop: circle marker + pill card + click popup ──────────
    let openWindow = null

    stops.forEach((stop) => {
      const col    = PIN[stop.severity] || '#94a3b8'
      const pos    = new gm.LatLng(stop.lat, stop.lon)
      const arrMin = departHour * 60 + (stop.offsetMin || 0)
      const isEdge = stop.isStart || stop.isEnd

      // Circle marker
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
        title:  stop.name + (stop.state ? `, ${stop.state}` : ''),
        zIndex: isEdge ? 10 : 1,
      })
      markersRef.current.push(marker)

      // Click → full-detail InfoWindow
      const popup = new gm.InfoWindow({
        maxWidth: 240,
        content: `
          <div style="font-family:system-ui,sans-serif;padding:6px 2px;min-width:170px">
            <div style="font-weight:800;font-size:15px;margin-bottom:1px;color:#111">
              ${stop.name}${stop.state ? `, ${stop.state}` : ''}
            </div>
            <div style="font-size:12px;color:#2d6a4f;font-weight:700;margin-bottom:7px">
              ${stop.isStart ? '📍 Departure' : `⏱ ~Arrive ${fmt(arrMin)}`}
            </div>
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
              <span style="font-size:28px;line-height:1">${stop.icon}</span>
              <div>
                <div style="font-size:24px;font-weight:800;color:#111;line-height:1">${stop.temp}°F</div>
                <div style="font-size:12px;font-weight:700;margin-top:3px;color:${col}">${stop.condition}</div>
              </div>
            </div>
            <div style="padding-top:7px;border-top:1px solid #e5e7eb;display:flex;gap:12px;font-size:12px;color:#4b5563">
              <span>💧 ${stop.precipPct}% precip</span>
              <span>💨 ${stop.wind} mph</span>
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

      // Always-visible pill card (OverlayView)
      const label = clip(stop.name)
      const card = new WeatherCard(pos, `
        <div style="
          background:rgba(10,20,38,0.90);
          border:1.5px solid ${col};
          border-radius:20px;
          padding:${isEdge ? '4px 11px' : '3px 9px'};
          font-size:${isEdge ? '12px' : '11px'};
          font-weight:${isEdge ? '700' : '500'};
          font-family:system-ui,-apple-system,sans-serif;
          color:#f1f5f9;
          white-space:nowrap;
          cursor:pointer;
          box-shadow:0 2px 10px rgba(0,0,0,0.55),0 0 0 1px rgba(0,0,0,0.3);
          user-select:none;
          line-height:1.4;
          letter-spacing:0.01em;
        ">
          ${stop.icon}&thinsp;${stop.temp}°&thinsp;<span style="color:${col}">${label}</span>
        </div>
      `, openPopup)
      card.setMap(map)
      overlaysRef.current.push(card)
    })

    // ── fitBounds AFTER idle ────────────────────────────────────────
    // KEY FIX: calling fitBounds() immediately after new gm.Map() fails
    // because Google Maps hasn't finished its internal layout pass and
    // reports 0×0 pixel dimensions for the container.  Waiting for the
    // first `idle` event (fires after tiles load and layout is done)
    // guarantees fitBounds has real dimensions to work with.
    gm.event.addListenerOnce(map, 'idle', () => {
      map.fitBounds(bounds)
      setMapStatus('ready')
    })
  }

  // ── Render ────────────────────────────────────────────────────────
  const hasKey = !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY

  // IMPORTANT: use maxHeight clip instead of display:none/block.
  // maxHeight:0 + overflow:hidden hides the map visually and removes it
  // from page flow, BUT the container div inside still has an explicit
  // height:350px so Google Maps always reads real pixel dimensions.
  // display:none would report 0×0 and break Maps initialization.
  return (
    <div style={{
      maxHeight: active ? 600 : 0,
      overflow:  'hidden',
      transition: 'max-height 0.25s ease',
      marginBottom: active ? 14 : 0,
    }}>
      {!hasKey ? (
        <div style={{
          width:'100%', height:200, borderRadius:12,
          background:'rgba(255,255,255,0.03)',
          border:'1px solid rgba(255,255,255,0.08)',
          display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center', gap:10,
        }}>
          <div style={{ fontSize:28 }}>🗺️</div>
          <div style={{ fontSize:13, fontWeight:600, color:'#94a3b8' }}>Map View needs a key</div>
          <div style={{ fontSize:11, fontFamily:'monospace', color:'#475569', textAlign:'center', padding:'0 24px', lineHeight:1.6 }}>
            Add <strong style={{ color:'#2196F3' }}>NEXT_PUBLIC_GOOGLE_MAPS_KEY</strong> to your
            Vercel environment variables (same value as GOOGLE_MAPS_KEY)
          </div>
        </div>
      ) : (
        <div style={{ position:'relative', borderRadius:12, overflow:'hidden' }}>
          {/* The map container — always height:350 so Google Maps can measure it */}
          <div
            ref={containerRef}
            style={{ width:'100%', height:350, background:'#0d1a2d' }}
          />

          {/* Loading overlay */}
          {mapStatus === 'loading' && (
            <div style={{
              position:'absolute', inset:0, background:'rgba(13,26,45,0.75)',
              display:'flex', flexDirection:'column', alignItems:'center',
              justifyContent:'center', gap:12,
            }}>
              <div style={{
                width:36, height:36,
                border:'3px solid rgba(33,150,243,0.2)',
                borderTop:'3px solid #2196F3',
                borderRadius:'50%',
                animation:'spin 1.2s linear infinite',
              }} />
              <div style={{ color:'#94a3b8', fontSize:13, fontFamily:'monospace' }}>Loading map…</div>
            </div>
          )}

          {/* Error overlay */}
          {mapStatus === 'error' && (
            <div style={{
              position:'absolute', inset:0, background:'rgba(13,26,45,0.85)',
              display:'flex', flexDirection:'column', alignItems:'center',
              justifyContent:'center', gap:10,
            }}>
              <div style={{ fontSize:28 }}>⚠️</div>
              <div style={{ color:'#f87171', fontSize:13, fontWeight:600 }}>Map failed to load</div>
              <div style={{ color:'#64748b', fontSize:12, textAlign:'center', padding:'0 20px' }}>
                Check your NEXT_PUBLIC_GOOGLE_MAPS_KEY and network connection.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
