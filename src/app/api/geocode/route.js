export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const lat  = searchParams.get('lat')
  const lon  = searchParams.get('lon')
  const city = searchParams.get('city')
  const key  = process.env.GOOGLE_MAPS_KEY

  if (!key) return Response.json({ error: 'API key not configured' }, { status: 500 })

  const url = city
    ? `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${key}`
    : `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&result_type=locality|administrative_area_level_2&key=${key}`

  try {
    const res  = await fetch(url)
    const data = await res.json()

    if (!data.results?.length) {
      return Response.json({ city: 'En Route', state: '', lat: parseFloat(lat), lon: parseFloat(lon) })
    }

    const result = data.results[0]
    const comps  = result.address_components
    const get    = type => comps.find(c => c.types.includes(type))?.long_name  || ''
    const getS   = type => comps.find(c => c.types.includes(type))?.short_name || ''

    // Skip pure county results — prefer actual city names
    const cityName = get('locality') || get('sublocality') || get('neighborhood') ||
                     (get('administrative_area_level_2').includes('County') ? 'En Route' : get('administrative_area_level_2'))

    return Response.json({
      city:  cityName || 'En Route',
      state: getS('administrative_area_level_1'),
      lat:   result.geometry.location.lat,
      lon:   result.geometry.location.lng,
    })
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
