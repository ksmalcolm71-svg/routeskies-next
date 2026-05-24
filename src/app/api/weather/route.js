const TOMORROW_CODES = {
  1000: { condition: 'Clear Sky',      severity: 'clear'      },
  1100: { condition: 'Mostly Clear',   severity: 'clear'      },
  1101: { condition: 'Partly Cloudy',  severity: 'cloudy'     },
  1102: { condition: 'Mostly Cloudy',  severity: 'cloudy'     },
  1001: { condition: 'Cloudy',         severity: 'cloudy'     },
  2000: { condition: 'Fog',            severity: 'cloudy'     },
  4000: { condition: 'Drizzle',        severity: 'light-rain' },
  4001: { condition: 'Rain',           severity: 'rain'       },
  4200: { condition: 'Light Rain',     severity: 'light-rain' },
  4201: { condition: 'Heavy Rain',     severity: 'rain'       },
  5000: { condition: 'Snow',           severity: 'snow'       },
  8000: { condition: 'Thunderstorm',   severity: 'severe'     },
}

const ICONS = { clear:'☀️', cloudy:'⛅', 'light-rain':'🌦️', rain:'🌧️', severe:'⛈️', snow:'❄️' }

function wxCode(code) {
  return TOMORROW_CODES[code] || { condition: 'Partly Cloudy', severity: 'cloudy' }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const lat  = searchParams.get('lat')
  const lon  = searchParams.get('lon')
  const date = searchParams.get('date')   // YYYY-MM-DD
  const hour = parseInt(searchParams.get('hour') || '12')

  if (!lat || !lon || !date) {
    return Response.json({ error: 'lat, lon, and date are required' }, { status: 400 })
  }

  const apiKey = process.env.TOMORROW_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'TOMORROW_API_KEY not configured' }, { status: 500 })
  }

  // Fetch a ±2-hour window around the target to absorb timezone drift
  const pad       = h => String(Math.max(0, Math.min(23, h))).padStart(2, '0')
  const startTime = `${date}T${pad(hour - 1)}:00:00Z`
  const endTime   = `${date}T${pad(hour + 2)}:00:00Z`

  const params = new URLSearchParams({
    location:  `${lat},${lon}`,
    fields:    'temperature,precipitationProbability,weatherCode,windSpeed,humidity',
    timesteps: '1h',
    startTime,
    endTime,
    units:     'imperial',
    apikey:    apiKey,
  })

  try {
    const res  = await fetch(`https://api.tomorrow.io/v4/timelines?${params}`)
    const data = await res.json()

    if (!res.ok) {
      console.error('[weather] Tomorrow.io error:', res.status, JSON.stringify(data))
      return Response.json(
        { error: data.message || `Tomorrow.io ${res.status}` },
        { status: 502 }
      )
    }

    const intervals = data.data?.timelines?.[0]?.intervals || []
    if (!intervals.length) {
      return Response.json({ error: 'No weather data returned' }, { status: 404 })
    }

    // Prefer the interval matching the target hour; fall back to the middle one
    const targetPrefix = `${date}T${pad(hour)}:`
    const interval = intervals.find(i => i.startTime.startsWith(targetPrefix))
      || intervals[Math.floor(intervals.length / 2)]

    const v                    = interval.values
    const { condition, severity } = wxCode(v.weatherCode)

    return Response.json({
      temp:      Math.round(v.temperature),
      precipPct: Math.round(v.precipitationProbability),
      wind:      Math.round(v.windSpeed),
      humidity:  Math.round(v.humidity),
      condition,
      severity,
      icon: ICONS[severity] || '🌤️',
    })
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
