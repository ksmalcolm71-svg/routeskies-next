export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const origin = searchParams.get('origin')
  const dest   = searchParams.get('dest')
  const avoid  = searchParams.get('avoid') || ''
  const key    = process.env.GOOGLE_MAPS_KEY

  if (!key)           return Response.json({ error: 'API key not configured' }, { status: 500 })
  if (!origin || !dest) return Response.json({ error: 'Missing origin or dest' }, { status: 400 })

  const avoidParam = avoid ? `&avoid=${avoid}` : ''
  const url = `https://maps.googleapis.com/maps/api/directions/json` +
    `?origin=${encodeURIComponent(origin)}` +
    `&destination=${encodeURIComponent(dest)}` +
    `&mode=driving${avoidParam}` +
    `&key=${key}`

  try {
    const res  = await fetch(url)
    const data = await res.json()
    return Response.json(data)
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
