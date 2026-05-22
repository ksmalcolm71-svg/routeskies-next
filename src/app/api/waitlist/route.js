export async function POST(request) {
  const { email } = await request.json()

  if (!email) return Response.json({ error: 'Email required' }, { status: 400 })

  const apiKey = process.env.KIT_API_KEY
  const formId = process.env.KIT_FORM_ID

  if (!apiKey || !formId) {
    return Response.json({ error: 'Kit not configured' }, { status: 500 })
  }

  try {
    const res = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ api_key: apiKey, email }),
    })

    const data = await res.json()

    if (data.subscription || res.ok) {
      return Response.json({ success: true })
    } else {
      return Response.json({ error: data.message || 'Kit error' }, { status: 400 })
    }
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
