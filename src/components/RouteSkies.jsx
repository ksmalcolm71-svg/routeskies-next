'use client'
import { useState, useEffect } from 'react'

// ─────────────────────────────────────────────────────────────────
// CITY AUTOCOMPLETE DATABASE
// ─────────────────────────────────────────────────────────────────
const CITIES = [
  { name:"Miami",             state:"FL" }, { name:"Fort Lauderdale",  state:"FL" },
  { name:"West Palm Beach",   state:"FL" }, { name:"Boca Raton",       state:"FL" },
  { name:"Naples",            state:"FL" }, { name:"Fort Myers",       state:"FL" },
  { name:"Sarasota",          state:"FL" }, { name:"Tampa",            state:"FL" },
  { name:"Orlando",           state:"FL" }, { name:"Daytona Beach",    state:"FL" },
  { name:"Jacksonville",      state:"FL" }, { name:"Gainesville",      state:"FL" },
  { name:"Tallahassee",       state:"FL" }, { name:"Pensacola",        state:"FL" },
  { name:"Key West",          state:"FL" }, { name:"St. Augustine",    state:"FL" },
  { name:"Savannah",          state:"GA" }, { name:"Atlanta",          state:"GA" },
  { name:"Augusta",           state:"GA" }, { name:"Macon",            state:"GA" },
  { name:"Valdosta",          state:"GA" }, { name:"Columbus",         state:"GA" },
  { name:"Charleston",        state:"SC" }, { name:"Columbia",         state:"SC" },
  { name:"Greenville",        state:"SC" }, { name:"Myrtle Beach",     state:"SC" },
  { name:"Charlotte",         state:"NC" }, { name:"Raleigh",          state:"NC" },
  { name:"Raleigh-Durham",    state:"NC" }, { name:"Greensboro",       state:"NC" },
  { name:"Wilmington",        state:"NC" }, { name:"Asheville",        state:"NC" },
  { name:"Fayetteville",      state:"NC" }, { name:"Richmond",         state:"VA" },
  { name:"Virginia Beach",    state:"VA" }, { name:"Washington DC",    state:"DC" },
  { name:"Baltimore",         state:"MD" }, { name:"Philadelphia",     state:"PA" },
  { name:"New York City",     state:"NY" }, { name:"Newark",           state:"NJ" },
  { name:"Boston",            state:"MA" }, { name:"Hartford",         state:"CT" },
  { name:"Buffalo",           state:"NY" }, { name:"Albany",           state:"NY" },
  { name:"Nashville",         state:"TN" }, { name:"Memphis",          state:"TN" },
  { name:"Knoxville",         state:"TN" }, { name:"Chattanooga",      state:"TN" },
  { name:"Louisville",        state:"KY" }, { name:"Lexington",        state:"KY" },
  { name:"Birmingham",        state:"AL" }, { name:"Montgomery",       state:"AL" },
  { name:"Mobile",            state:"AL" }, { name:"Huntsville",       state:"AL" },
  { name:"Jackson",           state:"MS" }, { name:"Gulfport",         state:"MS" },
  { name:"New Orleans",       state:"LA" }, { name:"Baton Rouge",      state:"LA" },
  { name:"Shreveport",        state:"LA" }, { name:"Houston",          state:"TX" },
  { name:"Dallas",            state:"TX" }, { name:"Dallas-Fort Worth",state:"TX" },
  { name:"San Antonio",       state:"TX" }, { name:"Austin",           state:"TX" },
  { name:"El Paso",           state:"TX" }, { name:"Kansas City",      state:"MO" },
  { name:"St. Louis",         state:"MO" }, { name:"Columbia",         state:"MO" },
  { name:"Kansas City",       state:"KS" }, { name:"Wichita",          state:"KS" },
  { name:"Indianapolis",      state:"IN" }, { name:"Chicago",          state:"IL" },
  { name:"Springfield",       state:"IL" }, { name:"Columbus",         state:"OH" },
  { name:"Cleveland",         state:"OH" }, { name:"Cincinnati",       state:"OH" },
  { name:"Detroit",           state:"MI" }, { name:"Minneapolis",      state:"MN" },
  { name:"Denver",            state:"CO" }, { name:"Phoenix",          state:"AZ" },
  { name:"Tucson",            state:"AZ" }, { name:"Las Vegas",        state:"NV" },
  { name:"Los Angeles",       state:"CA" }, { name:"San Francisco",    state:"CA" },
  { name:"Sacramento",        state:"CA" }, { name:"San Diego",        state:"CA" },
  { name:"Seattle",           state:"WA" }, { name:"Portland",         state:"OR" },
  { name:"Salt Lake City",    state:"UT" }, { name:"Albuquerque",      state:"NM" },
  { name:"Oklahoma City",     state:"OK" }, { name:"Omaha",            state:"NE" },
  { name:"Des Moines",        state:"IA" }, { name:"Milwaukee",        state:"WI" },
  { name:"Pittsburgh",        state:"PA" }, { name:"Little Rock",      state:"AR" },
  { name:"Roanoke",           state:"VA" }, { name:"Charleston",       state:"WV" },
  { name:"Rapid City",        state:"SD" }, { name:"Sioux Falls",      state:"SD" },
  { name:"Billings",          state:"MT" }, { name:"Missoula",         state:"MT" },
  { name:"Spokane",           state:"WA" }, { name:"Boise",            state:"ID" },
  { name:"Cheyenne",          state:"WY" }, { name:"Amarillo",         state:"TX" },
  { name:"Lubbock",           state:"TX" }, { name:"Midland",          state:"TX" },
]

function fuzzyMatch(input) {
  const q = input.toLowerCase().trim().replace(/,.*$/, '').trim()
  if (q.length < 2) return []
  const seen = new Set()
  return CITIES
    .map(c => {
      const n = c.name.toLowerCase()
      let score = 0
      if (n === q) score = 100
      else if (n.startsWith(q)) score = 85
      else if (n.includes(q)) score = 65
      else if (q.split(/\s+/).filter(w => w.length > 2).every(w => n.includes(w))) score = 55
      const abbr = c.name.split(/[\s-]+/).map(w => w[0]).join('').toLowerCase()
      if (abbr === q && q.length >= 2) score = Math.max(score, 72)
      return { ...c, score }
    })
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .filter(c => { const k = `${c.name}-${c.state}`; if (seen.has(k)) return false; seen.add(k); return true })
    .slice(0, 6)
}

// ─────────────────────────────────────────────────────────────────
// POLYLINE DECODER — Google encoded polyline algorithm
// ─────────────────────────────────────────────────────────────────
function decodePolyline(encoded) {
  const pts = []
  let i = 0, lat = 0, lng = 0
  while (i < encoded.length) {
    let b, shift = 0, result = 0
    do { b = encoded.charCodeAt(i++) - 63; result |= (b & 0x1f) << shift; shift += 5 } while (b >= 0x20)
    lat += (result & 1) ? ~(result >> 1) : (result >> 1)
    shift = 0; result = 0
    do { b = encoded.charCodeAt(i++) - 63; result |= (b & 0x1f) << shift; shift += 5 } while (b >= 0x20)
    lng += (result & 1) ? ~(result >> 1) : (result >> 1)
    pts.push({ lat: lat / 1e5, lon: lng / 1e5 })
  }
  return pts
}

// Haversine distance in meters between two {lat, lon} points
function haversine(a, b) {
  const R = 6371000, r = x => x * Math.PI / 180
  const dLat = r(b.lat - a.lat), dLon = r(b.lon - a.lon)
  const s = Math.sin(dLat/2)**2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s))
}

// Extract 2-letter state code from a Google address string
function extractState(addr) {
  const parts = addr.split(',')
  const seg   = parts[parts.length - 2]?.trim() || ''
  return seg.match(/\b([A-Z]{2})\b/)?.[1] || ''
}

// Strip HTML tags from Google's html_instructions
function stripHtml(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

const MANEUVER_ICON = {
  'turn-left':'↰',       'turn-slight-left':'↖',  'turn-sharp-left':'◀',
  'turn-right':'↱',      'turn-slight-right':'↗',  'turn-sharp-right':'▶',
  'uturn-left':'↩',      'uturn-right':'↪',
  'ramp-left':'↖',       'ramp-right':'↗',
  'fork-left':'↖',       'fork-right':'↗',
  'merge':'⬆',           'straight':'⬆',
  'roundabout-left':'↺', 'roundabout-right':'↻',
  'ferry':'⛴',           'ferry-train':'🚂',
}

// ─────────────────────────────────────────────────────────────────
// ROUTING ENGINE — calls our Next.js API route (server-side)
// ─────────────────────────────────────────────────────────────────
async function getRoute(origin, dest, routeType) {
  const avoid = routeType === 'notolls' ? 'tolls' : routeType === 'scenic' ? 'highways' : ''
  const res   = await fetch(`/api/route-plan?origin=${encodeURIComponent(origin)}&dest=${encodeURIComponent(dest)}&avoid=${avoid}`)
  const data  = await res.json()

  if (!data.routes?.length) throw new Error('No route found. Try entering full city names like "Fort Lauderdale, FL"')

  const legs       = data.routes[0].legs
  const totalMiles = Math.round(legs.reduce((s, l) => s + l.distance.value, 0) * 0.000621371)
  const totalMin   = Math.round(legs.reduce((s, l) => s + l.duration.value, 0) / 60)

  // Decode the overview_polyline — gives 200-500 points evenly spread along
  // the actual road, vs. step endpoints which cluster near the origin and leave
  // entire states with no candidates (root cause of the "En Route" skipping bug).
  const rawPts = decodePolyline(data.routes[0].overview_polyline.points)
  let cumDist  = 0
  const allPoints = rawPts.map((p, i) => {
    if (i > 0) cumDist += haversine(rawPts[i - 1], p)
    return { lat: p.lat, lon: p.lon, name: null, state: '', dist: cumDist }
  })
  // Label the endpoints with the Directions API address strings
  allPoints[0].name  = legs[0].start_address.split(',')[0]
  allPoints[0].state = extractState(legs[0].start_address)
  allPoints[allPoints.length - 1].name  = legs[legs.length - 1].end_address.split(',')[0]
  allPoints[allPoints.length - 1].state = extractState(legs[legs.length - 1].end_address)

  const waypoints = selectByDistance(allPoints, 8)

  // Reverse geocode unnamed stops via our API
  const named = await Promise.all(waypoints.map(async wp => {
    if (wp.name) return wp
    try {
      const r = await fetch(`/api/geocode?lat=${wp.lat}&lon=${wp.lon}`)
      const d = await r.json()
      return { ...wp, name: d.city || 'En Route', state: d.state || '' }
    } catch {
      return { ...wp, name: 'En Route', state: '' }
    }
  }))

  const directions = legs.flatMap(l => l.steps).map(s => ({
    instruction: stripHtml(s.html_instructions),
    distance:    s.distance.text,
    duration:    s.duration.text,
    maneuver:    s.maneuver || '',
  }))

  return { waypoints: named, totalMiles, totalMin, directions }
}

function selectByDistance(points, max) {
  if (points.length <= max) return points
  const total    = points[points.length - 1].dist
  const interval = total / (max - 1)
  const result   = [points[0]]
  for (let i = 1; i < max - 1; i++) {
    const target  = interval * i
    const closest = points.reduce((best, p) =>
      Math.abs(p.dist - target) < Math.abs(best.dist - target) ? p : best
    )
    if (closest !== result[result.length - 1]) result.push(closest)
  }
  result.push(points[points.length - 1])
  return result
}

// ─────────────────────────────────────────────────────────────────
// WEATHER ENGINE — Open-Meteo (free, no key, works server-to-server)
// ─────────────────────────────────────────────────────────────────
function wxCode(code) {
  if (code === 0)  return { condition: 'Clear Sky',     severity: 'clear'      }
  if (code <= 2)   return { condition: 'Mostly Clear',  severity: 'clear'      }
  if (code === 3)  return { condition: 'Overcast',      severity: 'cloudy'     }
  if (code <= 48)  return { condition: 'Foggy',         severity: 'cloudy'     }
  if (code <= 55)  return { condition: 'Drizzle',       severity: 'light-rain' }
  if (code <= 65)  return { condition: 'Rain',          severity: 'rain'       }
  if (code <= 77)  return { condition: 'Snow',          severity: 'snow'       }
  if (code <= 82)  return { condition: 'Rain Showers',  severity: 'rain'       }
  if (code === 95) return { condition: 'Thunderstorm',  severity: 'severe'     }
  if (code >= 96)  return { condition: 'Severe Storm',  severity: 'severe'     }
  return                  { condition: 'Partly Cloudy', severity: 'cloudy'     }
}

async function fetchWeather(lat, lon, dateStr, hour) {
  const url = `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m,precipitation_probability,weathercode,windspeed_10m,relativehumidity_2m` +
    `&temperature_unit=fahrenheit&timezone=auto&forecast_days=3`
  const res    = await fetch(url)
  const data   = await res.json()
  const target = `${dateStr}T${String(hour).padStart(2, '0')}:00`
  const idx    = data.hourly.time.indexOf(target)
  if (idx === -1) return null
  const { condition, severity } = wxCode(data.hourly.weathercode[idx])
  const icons = { clear: '☀️', cloudy: '⛅', 'light-rain': '🌦️', rain: '🌧️', severe: '⛈️', snow: '❄️' }
  return {
    temp:      Math.round(data.hourly.temperature_2m[idx]),
    precipPct: data.hourly.precipitation_probability[idx],
    wind:      Math.round(data.hourly.windspeed_10m[idx]),
    humidity:  data.hourly.relativehumidity_2m[idx],
    condition, severity,
    icon: icons[severity] || '🌤️',
  }
}

function estimateWeather(lat, lon, hour, month) {
  const seed  = Math.abs(Math.sin(lat * 127.1 + lon * 311.7 + hour * 17.3 + month * 53.2)) * 9999
  const rand  = n => Math.abs(Math.sin(seed + n * 91.3))
  const temp  = Math.round([52,55,62,70,77,83,86,85,80,71,62,54][month] + (lat-25)*-1.1 + (hour<12?-3:hour<16?4:0) + (rand(1)-.5)*9)
  const pp    = Math.round(Math.max(0, Math.min(95, 30 + (rand(2)-.38)*65)))
  const { condition, severity } = wxCode(pp > 70 ? 95 : pp > 50 ? 61 : pp > 35 ? 51 : pp > 20 ? 2 : 0)
  const icons = { clear:'☀️', cloudy:'⛅', 'light-rain':'🌦️', rain:'🌧️', severe:'⛈️', snow:'❄️' }
  return { temp, precipPct:pp, wind:Math.round(7+rand(3)*22), humidity:Math.round(48+rand(4)*44), condition, severity, icon:icons[severity]||'🌤️' }
}

// ─────────────────────────────────────────────────────────────────
// FORMATTERS
// ─────────────────────────────────────────────────────────────────
const today   = () => new Date().toISOString().split('T')[0]
const fmtTime = m  => { const h=Math.floor(m/60)%24, mn=m%60, h12=h%12||12; return `${h12}${mn>0?`:${String(mn).padStart(2,'0')}`:''} ${h>=12?'PM':'AM'}` }
const fmtOff  = m  => { if(!m) return null; const h=Math.floor(m/60),mn=m%60; return !h?`+${mn}m`:!mn?`+${h}h`:`+${h}h ${mn}m` }
const fmtTot  = m  => { const h=Math.floor(m/60),mn=m%60; return mn?`${h}h ${mn}m`:`${h}h` }
const timeAgo = ts => { const m=Math.floor((Date.now()-ts)/60000); if(m<1) return 'just now'; if(m<60) return `${m}m ago`; const h=Math.floor(m/60); if(h<24) return `${h}h ago`; return `${Math.floor(h/24)}d ago` }

// ─────────────────────────────────────────────────────────────────
// COLORS
// ─────────────────────────────────────────────────────────────────
const SCOL = { clear:'#34d399', cloudy:'#94a3b8', 'light-rain':'#7dd3fc', rain:'#60a5fa', severe:'#f87171', snow:'#e2e8f0' }
const SBG  = { clear:'rgba(52,211,153,0.07)', cloudy:'rgba(148,163,184,0.07)', 'light-rain':'rgba(125,211,252,0.09)', rain:'rgba(96,165,250,0.10)', severe:'rgba(248,113,113,0.13)', snow:'rgba(226,232,240,0.08)' }

const ROUTE_OPTS = [
  { id:'fastest', label:'Fastest',  icon:'⚡', desc:'Major interstates' },
  { id:'scenic',  label:'Scenic',   icon:'🌄', desc:'Avoid highways'    },
  { id:'notolls', label:'No Tolls', icon:'🚫', desc:'Avoid toll roads'  },
]

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────
export default function RouteSkies({ onBack }) {
  const [screen,    setScreen]    = useState('home')
  const [origin,    setOrigin]    = useState('')
  const [dest,      setDest]      = useState('')
  const [date,      setDate]      = useState(today())
  const [timeHour,  setTimeHour]  = useState('8')
  const [routeType, setRouteType] = useState('fastest')
  const [route,     setRoute]     = useState(null)
  const [stops,     setStops]     = useState([])
  const [revealed,  setRevealed]  = useState(0)
  const [loading,   setLoading]   = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [error,     setError]     = useState('')
  const [addSlots,  setAddSlots]  = useState({})
  const [oSug,      setOSug]      = useState([])
  const [dSug,      setDSug]      = useState([])
  const [directions, setDirections] = useState([])
  const [activeTab,  setActiveTab]  = useState('weather')
  const [savedRoute, setSavedRoute] = useState(null)

  // On mount, load any previously saved route from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('rs_last')
      if (raw) setSavedRoute(JSON.parse(raw))
    } catch {}
  }, [])

  function restoreRoute() {
    if (!savedRoute) return
    setOrigin(savedRoute.origin || savedRoute.route?.origin || '')
    setDest(savedRoute.dest   || savedRoute.route?.dest   || '')
    if (savedRoute.date)     setDate(savedRoute.date)
    if (savedRoute.timeHour) setTimeHour(savedRoute.timeHour)
    setRoute(savedRoute.route)
    setStops(savedRoute.stops      || [])
    setDirections(savedRoute.directions || [])
    setRevealed((savedRoute.stops  || []).length)
    setActiveTab('weather')
    setScreen('results')
    setSavedRoute(null)
  }

  function dismissSaved() { setSavedRoute(null) }

  async function handleSearch() {
    setError('')
    if (!origin.trim() || !dest.trim()) { setError('Enter both a starting point and destination.'); return }
    setLoading(true)
    setScreen('results')
    setStops([])
    setDirections([])
    setRevealed(0)
    setAddSlots({})
    setActiveTab('weather')

    try {
      const { waypoints, totalMiles, totalMin, directions } = await getRoute(origin, dest, routeType)
      const dh    = parseInt(timeHour)
      const month = new Date(date).getMonth()
      setRoute({ origin, dest, totalMiles, totalMin })

      const liveStops = await Promise.all(
        waypoints.map(async (wp, i) => {
          const frac      = i / Math.max(waypoints.length - 1, 1)
          const offsetMin = Math.round(frac * totalMin)
          const arrH      = Math.floor((dh * 60 + offsetMin) / 60) % 24
          let weather
          try { weather = await fetchWeather(wp.lat, wp.lon, date, arrH) } catch {}
          if (!weather) weather = estimateWeather(wp.lat, wp.lon, arrH, month)
          return { ...wp, offsetMin, isStart: i===0, isEnd: i===waypoints.length-1, custom: false, ...weather }
        })
      )

      setStops(liveStops)
      setDirections(directions)
      let i = 0
      const iv = setInterval(() => { i++; setRevealed(i); if (i >= liveStops.length) clearInterval(iv) }, 190)
    } catch (e) {
      setError(e.message || 'Could not plan route. Try full city names like "Fort Lauderdale, FL".')
      setScreen('home')
    } finally {
      setLoading(false)
    }
  }

  function removeStop(idx) {
    const filtered = stops.filter((_, i) => i !== idx)
    const updated  = filtered.map((s, i) => ({ ...s, isStart: i===0, isEnd: i===filtered.length-1 }))
    setStops(updated)
    setRevealed(updated.length)
    setAddSlots(prev => {
      const n = {}
      Object.entries(prev).forEach(([k,v]) => { const ki=parseInt(k); if(ki<idx) n[ki]=v; else if(ki>idx) n[ki-1]=v })
      return n
    })
  }

  async function confirmAddStop(idx, cityName) {
    if (!cityName.trim()) { closeSlot(idx); return }
    try {
      const r     = await fetch(`/api/geocode?city=${encodeURIComponent(cityName)}`)
      const d     = await r.json()
      const dh    = parseInt(timeHour)
      const frac  = (idx+1) / Math.max(stops.length, 1)
      const off   = Math.round(frac * (route?.totalMin || 600))
      const arrH  = Math.floor((dh*60+off)/60)%24
      const month = new Date(date).getMonth()
      let weather
      try { weather = await fetchWeather(d.lat, d.lon, date, arrH) } catch {}
      if (!weather) weather = estimateWeather(d.lat, d.lon, arrH, month)
      const newStop  = { lat:d.lat, lon:d.lon, name:d.city||cityName.split(',')[0], state:d.state||'', offsetMin:off, isStart:false, isEnd:false, custom:true, ...weather }
      const newStops = [...stops.slice(0,idx+1), newStop, ...stops.slice(idx+1)]
      setStops(newStops)
      setRevealed(prev => prev+1)
      closeSlot(idx)
    } catch {
      closeSlot(idx)
    }
  }

  const openSlot   = idx => setAddSlots(prev => ({...prev, [idx]:{input:''}}))
  const closeSlot  = idx => setAddSlots(prev => { const n={...prev}; delete n[idx]; return n })
  const updateSlot = (idx,v) => setAddSlots(prev => ({...prev, [idx]:{input:v}}))

  const alerts = stops.filter(s => ['rain','heavy-rain','severe'].includes(s.severity))
  const dh     = parseInt(timeHour)

  return (
    <div style={{ minHeight:'100vh', background:'#07091A', fontFamily:"'Barlow Condensed',sans-serif", color:'#e2e8f0' }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        .rise{animation:riseIn .4s cubic-bezier(.22,.68,0,1.2) both;}
        @keyframes riseIn{from{opacity:0;transform:translateY(14px) scale(.97);}to{opacity:1;transform:none;}}
        .fade{animation:fadeIn .25s ease both;}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
        .pulse{animation:glow 2.4s ease-in-out infinite;}
        @keyframes glow{0%,100%{box-shadow:0 0 5px 1px var(--dc);}50%{box-shadow:0 0 18px 6px var(--dc);}}
        .spin{animation:spin 1.2s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg);}}

        .inp{width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:11px 14px;color:#f1f5f9;font-family:'Fira Code',monospace;font-size:13px;outline:none;transition:border-color .2s,background .2s;}
        .inp:focus{border-color:rgba(251,191,36,.5);background:rgba(255,255,255,0.08);}
        .inp::placeholder{color:#334155;}

        .btn-primary{background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#07091A;border:none;border-radius:12px;padding:14px 0;width:100%;font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;box-shadow:0 0 32px rgba(251,191,36,0.3);transition:transform .15s,box-shadow .15s;}
        .btn-primary:hover{transform:scale(1.02);box-shadow:0 0 44px rgba(251,191,36,0.5);}
        .btn-primary:disabled{opacity:0.5;cursor:not-allowed;transform:none;}
        .btn-ghost{background:rgba(255,255,255,0.05);color:#94a3b8;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:9px 16px;font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;transition:all .2s;}
        .btn-ghost:hover{background:rgba(255,255,255,0.09);color:#e2e8f0;}
        .btn-save{background:rgba(52,211,153,0.1);color:#34d399;border:1px solid rgba(52,211,153,0.3);border-radius:10px;padding:9px 16px;font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;transition:all .2s;}
        .btn-save:hover{background:rgba(52,211,153,0.18);}
        .btn-add-stop{background:none;border:1px dashed rgba(251,191,36,0.3);border-radius:8px;color:#64748b;font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:6px 14px;cursor:pointer;flex:1;transition:all .2s;}
        .btn-add-stop:hover{border-color:rgba(251,191,36,0.7);color:#fbbf24;background:rgba(251,191,36,0.06);}
        .btn-remove{background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.3);border-radius:6px;color:#f87171;font-size:11px;font-weight:700;font-family:'Barlow Condensed',sans-serif;padding:3px 9px;cursor:pointer;transition:all .15s;flex-shrink:0;}
        .btn-remove:hover{background:rgba(248,113,113,0.22);}
        .route-pill{padding:9px 12px;border-radius:10px;cursor:pointer;border:1px solid transparent;transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:2px;font-family:'Barlow Condensed',sans-serif;}
        .sug-box{position:absolute;top:calc(100% + 4px);left:0;right:0;z-index:50;background:#0f1628;border:1px solid rgba(251,191,36,0.2);border-radius:10px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.5);}
        .sug-item{padding:9px 14px;font-family:'Fira Code',monospace;font-size:12px;color:#94a3b8;cursor:pointer;transition:background .15s;display:flex;gap:8px;align-items:center;}
        .sug-item:hover{background:rgba(251,191,36,0.1);color:#f1f5f9;}
        .sug-badge{font-size:10px;color:#fbbf24;background:rgba(251,191,36,0.12);padding:1px 6px;border-radius:4px;flex-shrink:0;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:#1e2a44;border-radius:3px;}
        @media print{.no-print{display:none!important;}body{background:white!important;color:#111!important;}}
      `}</style>

      {/* HEADER */}
      <div className="no-print" style={{ background:'linear-gradient(180deg,#0d1428 0%,#07091A 100%)', borderBottom:'1px solid rgba(251,191,36,0.15)', padding:'15px 20px 11px', position:'sticky', top:0, zIndex:30 }}>
        <div style={{ maxWidth:580, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, cursor:onBack?'pointer':'default' }} onClick={onBack}>
            <span style={{ fontSize:20 }}>🛣️</span>
            <span style={{ fontSize:21, fontWeight:900, letterSpacing:'.1em', color:'#fbbf24', textShadow:'0 0 24px rgba(251,191,36,.4)', textTransform:'uppercase' }}>RouteSkies</span>
            <span style={{ fontFamily:"'Fira Code',monospace", fontSize:9, color:'#fbbf24', background:'rgba(251,191,36,0.12)', border:'1px solid rgba(251,191,36,0.25)', padding:'2px 6px', borderRadius:4 }}>BETA</span>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {screen==='results' && <button className="btn-ghost" style={{ fontSize:12, padding:'6px 12px' }} onClick={() => { setScreen('home'); setStops([]); setDirections([]); setActiveTab('weather') }}>← New Route</button>}
            {onBack && <button className="btn-ghost" style={{ fontSize:12, padding:'6px 12px' }} onClick={onBack}>🏠 Home</button>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:580, margin:'0 auto', padding:'20px 16px 64px' }}>

        {/* HOME */}
        {screen==='home' && (
          <div className="rise">
            <div style={{ textAlign:'center', padding:'24px 0 28px' }}>
              <div style={{ fontSize:48, marginBottom:10 }}>🌦️</div>
              <h1 style={{ fontSize:28, fontWeight:900, letterSpacing:'.04em', color:'#f1f5f9', lineHeight:1.2, marginBottom:8 }}>
                See weather where<br/><em style={{ color:'#fbbf24' }}>you'll actually be.</em>
              </h1>
              <p style={{ fontSize:14, color:'#64748b', lineHeight:1.8, maxWidth:300, margin:'0 auto' }}>
                Time-adjusted forecasts at every stop on your drive.
              </p>
            </div>

            {/* RESUME LAST ROUTE */}
            {savedRoute?.route && (
              <div className="rise" style={{ background:'rgba(52,211,153,0.06)', border:'1px solid rgba(52,211,153,0.25)', borderRadius:14, padding:'13px 16px', marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"'Fira Code',monospace", fontSize:10, color:'#34d399', letterSpacing:'.08em', marginBottom:4 }}>
                      LAST ROUTE · {savedRoute.savedAt ? timeAgo(savedRoute.savedAt) : 'saved'}
                    </div>
                    <div style={{ fontSize:17, fontWeight:800, color:'#f1f5f9' }}>
                      {(savedRoute.origin || savedRoute.route.origin || '').split(',')[0]}
                      <span style={{ color:'#fbbf24', margin:'0 6px' }}>→</span>
                      {(savedRoute.dest   || savedRoute.route.dest   || '').split(',')[0]}
                    </div>
                    <div style={{ fontFamily:"'Fira Code',monospace", fontSize:11, color:'#64748b', marginTop:2 }}>
                      {savedRoute.route.totalMiles}mi · ~{fmtTot(savedRoute.route.totalMin)}
                      {savedRoute.stops?.length ? ` · ${savedRoute.stops.length} stops` : ''}
                    </div>
                  </div>
                  <button onClick={dismissSaved} style={{ background:'none', border:'none', color:'#334155', cursor:'pointer', fontSize:18, lineHeight:1, padding:'2px 4px', flexShrink:0 }}>✕</button>
                </div>
                <button className="btn-primary" style={{ marginTop:12, fontSize:15, padding:'11px 0' }} onClick={restoreRoute}>
                  Resume This Route →
                </button>
              </div>
            )}

            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'20px 18px', display:'flex', flexDirection:'column', gap:14 }}>

              {/* Route type */}
              <div>
                <div style={{ fontFamily:"'Fira Code',monospace", fontSize:10, color:'#64748b', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:8 }}>Route Preference</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                  {ROUTE_OPTS.map(o => {
                    const active = routeType===o.id
                    return (
                      <button key={o.id} className="route-pill" onClick={() => setRouteType(o.id)} style={{ background:active?'rgba(251,191,36,0.12)':'rgba(255,255,255,0.04)', border:active?'1px solid rgba(251,191,36,0.5)':'1px solid rgba(255,255,255,0.08)', color:active?'#fbbf24':'#64748b' }}>
                        <span style={{ fontSize:18 }}>{o.icon}</span>
                        <span style={{ fontSize:13, fontWeight:800 }}>{o.label}</span>
                        <span style={{ fontSize:10, fontFamily:"'Fira Code',monospace", opacity:.7, textTransform:'none', letterSpacing:0 }}>{o.desc}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Origin */}
              <div>
                <label style={{ display:'block', fontFamily:"'Fira Code',monospace", fontSize:10, color:'#64748b', letterSpacing:'.08em', marginBottom:5, textTransform:'uppercase' }}>Starting From</label>
                <div style={{ position:'relative' }}>
                  <input className="inp" placeholder="e.g. Fort Lauderdale, FL" value={origin}
                    onChange={e => { setOrigin(e.target.value); setOSug(e.target.value.length>1?fuzzyMatch(e.target.value):[]) }}
                    onBlur={() => setTimeout(()=>setOSug([]),160)}
                  />
                  {oSug.length>0 && (
                    <div className="sug-box fade">
                      {oSug.map(c => (
                        <div key={`${c.name}-${c.state}`} className="sug-item" onMouseDown={() => { setOrigin(`${c.name}, ${c.state}`); setOSug([]) }}>
                          <span>{c.name}</span><span className="sug-badge">{c.state}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Destination */}
              <div>
                <label style={{ display:'block', fontFamily:"'Fira Code',monospace", fontSize:10, color:'#64748b', letterSpacing:'.08em', marginBottom:5, textTransform:'uppercase' }}>Destination</label>
                <div style={{ position:'relative' }}>
                  <input className="inp" placeholder="e.g. Tampa, FL" value={dest}
                    onChange={e => { setDest(e.target.value); setDSug(e.target.value.length>1?fuzzyMatch(e.target.value):[]) }}
                    onBlur={() => setTimeout(()=>setDSug([]),160)}
                  />
                  {dSug.length>0 && (
                    <div className="sug-box fade">
                      {dSug.map(c => (
                        <div key={`${c.name}-${c.state}`} className="sug-item" onMouseDown={() => { setDest(`${c.name}, ${c.state}`); setDSug([]) }}>
                          <span>{c.name}</span><span className="sug-badge">{c.state}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Date + Time */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ display:'block', fontFamily:"'Fira Code',monospace", fontSize:10, color:'#64748b', letterSpacing:'.08em', marginBottom:5, textTransform:'uppercase' }}>Departure Date</label>
                  <input type="date" className="inp" value={date} onChange={e=>setDate(e.target.value)} style={{ colorScheme:'dark' }} />
                </div>
                <div>
                  <label style={{ display:'block', fontFamily:"'Fira Code',monospace", fontSize:10, color:'#64748b', letterSpacing:'.08em', marginBottom:5, textTransform:'uppercase' }}>Leave At</label>
                  <select className="inp" value={timeHour} onChange={e=>setTimeHour(e.target.value)} style={{ cursor:'pointer' }}>
                    {Array.from({length:18},(_,i)=>i+5).map(h => {
                      const h12=h%12||12, ap=h>=12?'PM':'AM'
                      return <option key={h} value={h}>{h12}:00 {ap}</option>
                    })}
                  </select>
                </div>
              </div>

              {error && <div style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#fca5a5', fontFamily:"'Fira Code',monospace" }}>⚠️ {error}</div>}

              <button className="btn-primary" onClick={handleSearch} disabled={loading}>
                {loading ? '🔍 Planning Route...' : '🚗 Plan My Route'}
              </button>
            </div>

            <div style={{ marginTop:16, padding:'10px 14px', borderRadius:10, background:'rgba(251,191,36,0.04)', border:'1px solid rgba(251,191,36,0.09)', textAlign:'center' }}>
              <div style={{ fontSize:10, color:'#334155', fontFamily:"'Fira Code',monospace", lineHeight:1.8 }}>
                Real routes via Google Maps · Live weather via Open-Meteo · Works anywhere in the US
              </div>
            </div>
          </div>
        )}

        {/* RESULTS */}
        {screen==='results' && (
          <>
            {loading && (
              <div style={{ textAlign:'center', padding:'48px 20px' }}>
                <div style={{ width:40, height:40, border:'3px solid rgba(251,191,36,0.2)', borderTop:'3px solid #fbbf24', borderRadius:'50%', margin:'0 auto 16px' }} className="spin" />
                <div style={{ color:'#fbbf24', fontSize:13, fontFamily:"'Fira Code',monospace", letterSpacing:'.06em' }}>Planning your route...</div>
                <div style={{ color:'#334155', fontSize:11, fontFamily:"'Fira Code',monospace", marginTop:6 }}>Fetching live weather for each stop</div>
              </div>
            )}

            {!loading && route && (
              <div className="rise" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'13px 16px', marginBottom:14, display:'flex', flexWrap:'wrap', gap:8, alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontSize:18, fontWeight:800, color:'#f1f5f9' }}>
                    {origin.split(',')[0]} <span style={{ color:'#fbbf24' }}>→</span> {dest.split(',')[0]}
                  </div>
                  <div style={{ fontFamily:"'Fira Code',monospace", fontSize:11, color:'#64748b', marginTop:2 }}>
                    {new Date(date+'T12:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}
                    &nbsp;·&nbsp;Depart {fmtTime(dh*60)}&nbsp;·&nbsp;~{fmtTot(route.totalMin)}&nbsp;·&nbsp;{route.totalMiles}mi
                  </div>
                </div>
                <div style={{ display:'flex', gap:3 }}>
                  {stops.map((s,i) => (
                    <div key={i} title={`${s.name}: ${s.condition}`} style={{ width:8, height:24, borderRadius:3, background:SCOL[s.severity]||'#94a3b8', opacity:.85 }} />
                  ))}
                </div>
              </div>
            )}

            {/* TAB SWITCHER */}
            {!loading && stops.length>0 && revealed>=stops.length && (
              <div className="no-print rise" style={{ display:'flex', gap:4, marginBottom:14, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:4 }}>
                {[
                  { id:'weather',    label:'🌦️ Weather Stops' },
                  { id:'directions', label:'🗺️ Turn-by-Turn'  },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                    flex:1, padding:'8px 0', border:'none', borderRadius:9, cursor:'pointer',
                    fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, fontWeight:700, letterSpacing:'.05em',
                    transition:'all .2s',
                    background: activeTab===tab.id ? 'rgba(251,191,36,0.15)' : 'transparent',
                    color:      activeTab===tab.id ? '#fbbf24' : '#475569',
                    boxShadow:  activeTab===tab.id ? 'inset 0 0 0 1px rgba(251,191,36,0.3)' : 'none',
                  }}>
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* WEATHER TAB */}
            {!loading && activeTab==='weather' && alerts.length>0 && revealed>=stops.length && (
              <div className="rise" style={{ background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.28)', borderRadius:12, padding:'11px 15px', marginBottom:12, display:'flex', gap:10, alignItems:'flex-start' }}>
                <span style={{ fontSize:17, flexShrink:0 }}>⚠️</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:800, color:'#fca5a5', marginBottom:2 }}>WEATHER ADVISORY</div>
                  <div style={{ fontSize:13, color:'#94a3b8', lineHeight:1.55 }}>
                    Precipitation expected near <span style={{ color:'#fca5a5', fontWeight:700 }}>{alerts.map(a=>a.name).join(', ')}</span>.
                  </div>
                </div>
              </div>
            )}

            {activeTab==='weather' && stops.map((wp, i) => {
              if (i >= revealed) return null
              const color     = SCOL[wp.severity]||'#94a3b8'
              const bg        = SBG[wp.severity]||'rgba(148,163,184,0.07)'
              const nextColor = SCOL[stops[i+1]?.severity||'clear']
              const isLast    = i === stops.length - 1
              const arrMin    = dh * 60 + wp.offsetMin
              const slot      = addSlots[i]

              return (
                <div key={`${wp.name}-${i}`}>
                  <div style={{ display:'flex' }}>
                    <div style={{ width:44, display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
                      <div className="pulse" style={{ '--dc':color, width:wp.isStart||wp.isEnd?16:11, height:wp.isStart||wp.isEnd?16:11, borderRadius:'50%', background:color, border:`2px solid ${color}`, zIndex:2, flexShrink:0, marginTop:22 }} />
                      {!isLast && <div style={{ width:2, flexGrow:1, minHeight:22, background:`linear-gradient(to bottom,${color}60,${nextColor}60)` }} />}
                    </div>

                    <div className="rise" style={{ flex:1, background:bg, border:`1px solid ${color}1a`, borderRadius:14, padding:'12px 14px', marginLeft:10, marginTop:10, animationDelay:`${i*45}ms` }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                        <div style={{ flex:1 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:3, flexWrap:'wrap' }}>
                            <span style={{ fontSize:16, fontWeight:800, color:'#f1f5f9' }}>{wp.name}</span>
                            {wp.state && <span style={{ fontFamily:"'Fira Code',monospace", fontSize:10, color:'#475569', background:'rgba(255,255,255,0.05)', padding:'1px 5px', borderRadius:4 }}>{wp.state}</span>}
                            {wp.isStart && <span style={{ fontSize:9, fontWeight:800, color:'#fbbf24', letterSpacing:'.08em' }}>START</span>}
                            {wp.isEnd   && <span style={{ fontSize:9, fontWeight:800, color:'#34d399', letterSpacing:'.08em' }}>DEST</span>}
                            {wp.custom  && <span style={{ fontSize:9, fontWeight:700, color:'#a78bfa' }}>CUSTOM</span>}
                            {!wp.isStart && !wp.isEnd && revealed>=stops.length && (
                              <button className="btn-remove no-print" onClick={() => removeStop(i)}>✕ Remove</button>
                            )}
                          </div>
                          <div style={{ fontFamily:"'Fira Code',monospace", fontSize:11, color:'#64748b' }}>
                            {wp.isStart?'Depart':'~Arrive'} <span style={{ color:'#94a3b8' }}>{fmtTime(arrMin)}</span>
                            {fmtOff(wp.offsetMin) && <span style={{ color:'#334155' }}> · {fmtOff(wp.offsetMin)}</span>}
                          </div>
                        </div>
                        <div style={{ textAlign:'right', flexShrink:0, marginLeft:10 }}>
                          <div style={{ fontSize:26, lineHeight:1 }}>{wp.icon}</div>
                          <div style={{ fontSize:20, fontWeight:700, fontFamily:"'Fira Code',monospace", color:'#f1f5f9', marginTop:2 }}>{wp.temp}°</div>
                        </div>
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8, paddingTop:8, borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize:13, fontWeight:700, color }}>{wp.condition}</span>
                        <div style={{ display:'flex', gap:9, fontFamily:"'Fira Code',monospace", fontSize:11, color:'#64748b' }}>
                          <span style={{ color:wp.precipPct>=50?'#60a5fa':'#64748b' }}>💧{wp.precipPct}%</span>
                          <span>💨{wp.wind}mph</span>
                          <span>💦{wp.humidity}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {!isLast && revealed>=stops.length && (
                    <div className="no-print" style={{ paddingLeft:44 }}>
                      <div style={{ marginLeft:10, borderLeft:'2px dashed rgba(255,255,255,0.06)', paddingLeft:12, paddingTop:5, paddingBottom:5 }}>
                        {!slot ? (
                          <button className="btn-add-stop" onClick={() => openSlot(i)}>+ Add a Stop After {wp.name}</button>
                        ) : (
                          <div className="fade" style={{ background:'rgba(167,139,250,0.07)', border:'1px solid rgba(167,139,250,0.25)', borderRadius:10, padding:'11px 13px' }}>
                            <div style={{ fontFamily:"'Fira Code',monospace", fontSize:10, color:'#a78bfa', letterSpacing:'.07em', marginBottom:7 }}>ADD STOP AFTER {wp.name.toUpperCase()}</div>
                            <input autoFocus className="inp" style={{ fontSize:12 }} placeholder="City, State (e.g. Savannah, GA)"
                              value={slot.input}
                              onChange={e => updateSlot(i, e.target.value)}
                              onKeyDown={e => { if(e.key==='Enter') confirmAddStop(i, slot.input) }}
                            />
                            <div style={{ display:'flex', gap:8, marginTop:8 }}>
                              <button className="btn-ghost" style={{ flex:1, fontSize:11, padding:'7px 0' }} onClick={() => confirmAddStop(i, slot.input)}>Add Stop</button>
                              <button className="btn-ghost" style={{ flex:1, fontSize:11, padding:'7px 0' }} onClick={() => closeSlot(i)}>Cancel</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* DIRECTIONS TAB */}
            {!loading && activeTab==='directions' && directions.length>0 && (
              <div className="rise" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, overflow:'hidden' }}>
                {directions.map((step, i) => (
                  <div key={i} style={{ display:'flex', gap:12, padding:'11px 14px', borderBottom: i < directions.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems:'flex-start' }}>
                    <div style={{ width:30, height:30, borderRadius:'50%', background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.18)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:14, color:'#fbbf24' }}>
                      {MANEUVER_ICON[step.maneuver] || '⬆'}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:14, color:'#e2e8f0', lineHeight:1.45 }}>{step.instruction}</div>
                      <div style={{ fontFamily:"'Fira Code',monospace", fontSize:10, color:'#475569', marginTop:3 }}>
                        {step.distance}&nbsp;·&nbsp;{step.duration}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && revealed>=stops.length && stops.length>0 && (
              <div className="rise no-print" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginTop:18 }}>
                <button className="btn-save" onClick={() => { setSaved(true); try{localStorage.setItem('rs_last',JSON.stringify({route,stops,directions,origin,dest,date,timeHour,savedAt:Date.now()}))}catch(e){} setTimeout(()=>setSaved(false),3000) }}>
                  {saved?'✅ Saved!':'📴 Save Offline'}
                </button>
                <button className="btn-ghost" onClick={() => window.print()}>🖨️ Print</button>
                <button className="btn-ghost" onClick={() => { setScreen('home'); setStops([]); setDirections([]); setActiveTab('weather') }}>← New Route</button>
              </div>
            )}

            {!loading && stops.length>0 && (
              <div style={{ marginTop:12, padding:'10px 14px', borderRadius:10, background:'rgba(251,191,36,0.03)', border:'1px solid rgba(251,191,36,0.08)', textAlign:'center' }}>
                <div style={{ fontSize:10, color:'#334155', fontFamily:"'Fira Code',monospace", lineHeight:1.8 }}>
                  Real routes via Google Maps · Live weather via Open-Meteo · Arrival times approx at 65mph
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
