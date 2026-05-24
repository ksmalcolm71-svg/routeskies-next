'use client'
import { useState } from 'react'

export default function Landing({ onLaunchApp }) {
  const [email,      setEmail]      = useState('')
  const [submitted,  setSubmitted]  = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [subError,   setSubError]   = useState('')

  async function handleWaitlist(e) {
    e.preventDefault()
    if (!email) return
    setSubmitting(true)
    setSubError('')
    try {
      const res  = await fetch('/api/waitlist', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
        setEmail('')
      } else {
        setSubError(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setSubError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Fira+Code:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --amber:#2196F3; --amber2:#1976D2; --dark:#0f1520; --dark2:#151f2e;
          --muted:#64748b; --subtle:#1e2a44; --text:#e2e8f0; --text2:#94a3b8;
          --green:#34d399;
        }
        html { scroll-behavior: smooth; }
        body { background: var(--dark); color: var(--text); font-family: 'Barlow', sans-serif; overflow-x: hidden; }
        a { color: inherit; text-decoration: none; }
        .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:none; } }
        @keyframes glow   { 0%,100% { box-shadow:0 0 8px 2px rgba(33,150,243,.3); } 50% { box-shadow:0 0 28px 8px rgba(33,150,243,.6); } }
        @keyframes marquee { from { transform:translateX(0); } to { transform:translateX(-50%); } }

        nav { position:fixed; top:0; left:0; right:0; z-index:100; background:rgba(15,21,32,.92); backdrop-filter:blur(12px); border-bottom:1px solid rgba(33,150,243,.12); padding:14px 24px; }
        .nav-inner { max-width:1100px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; }
        .nav-logo { font-family:'Bebas Neue',sans-serif; font-size:26px; letter-spacing:.1em; color:var(--amber); text-shadow:0 0 24px rgba(33,150,243,.4); display:flex; align-items:center; gap:8px; cursor:pointer; }
        .beta-badge { font-family:system-ui,sans-serif; font-size:10px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--dark); background:var(--amber); padding:2px 7px; border-radius:4px; line-height:1.6; align-self:center; margin-bottom:2px; }
        .nav-links { display:flex; align-items:center; gap:24px; }
        .nav-links a { font-size:14px; font-weight:500; color:var(--text2); transition:color .2s; }
        .nav-links a:hover { color:var(--text); }
        .nav-cta { background:var(--amber); color:var(--dark); font-weight:700; font-size:13px; letter-spacing:.07em; text-transform:uppercase; padding:9px 20px; border-radius:8px; border:none; cursor:pointer; transition:box-shadow .2s, transform .15s; }
        .nav-cta:hover { box-shadow:0 0 24px rgba(33,150,243,.5); transform:scale(1.03); }

        .hero { min-height:100vh; display:flex; flex-direction:column; justify-content:center; padding:120px 24px 80px; position:relative; overflow:hidden; }
        .hero::before { content:''; position:absolute; left:50%; top:0; bottom:0; width:2px; background:repeating-linear-gradient(to bottom,rgba(33,150,243,.15) 0,rgba(33,150,243,.15) 24px,transparent 24px,transparent 48px); transform:translateX(-50%); pointer-events:none; }
        .hero::after { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 70% 50% at 50% 40%,rgba(33,150,243,.07) 0%,transparent 70%); pointer-events:none; }
        .hero-inner { position:relative; z-index:2; max-width:1100px; margin:0 auto; width:100%; }
        .eyebrow { display:inline-flex; align-items:center; gap:10px; background:rgba(33,150,243,.1); border:1px solid rgba(33,150,243,.25); border-radius:100px; padding:6px 16px; font-family:'Fira Code',monospace; font-size:12px; color:var(--amber); letter-spacing:.06em; margin-bottom:28px; animation:fadeUp .6s .1s ease both; }
        .eyebrow-dot { width:7px; height:7px; border-radius:50%; background:var(--amber); animation:glow 2s ease-in-out infinite; }
        .hero-title { font-family:'Bebas Neue',sans-serif; font-size:clamp(56px,10vw,120px); line-height:.95; letter-spacing:.02em; color:var(--text); animation:fadeUp .6s .2s ease both; }
        .hero-title .accent { color:var(--amber); }
        .hero-title .dim { color:var(--text2); }
        .hero-sub { margin-top:24px; font-size:clamp(17px,2.2vw,21px); color:var(--text2); max-width:540px; line-height:1.7; animation:fadeUp .6s .35s ease both; }
        .hero-actions { margin-top:36px; display:flex; flex-wrap:wrap; gap:14px; align-items:center; animation:fadeUp .6s .45s ease both; }
        .btn-hero { background:linear-gradient(135deg,var(--amber),var(--amber2)); color:var(--dark); font-weight:800; font-size:16px; letter-spacing:.08em; text-transform:uppercase; padding:16px 36px; border-radius:12px; border:none; cursor:pointer; box-shadow:0 0 40px rgba(33,150,243,.3); transition:transform .15s,box-shadow .2s; }
        .btn-hero:hover { transform:scale(1.04); box-shadow:0 0 56px rgba(33,150,243,.55); }
        .btn-try { background:rgba(255,255,255,.07); color:var(--text); font-weight:700; font-size:15px; letter-spacing:.06em; text-transform:uppercase; padding:16px 28px; border-radius:12px; border:1px solid rgba(255,255,255,.12); cursor:pointer; transition:all .2s; }
        .btn-try:hover { background:rgba(255,255,255,.12); }
        .hero-stats { margin-top:52px; display:flex; flex-wrap:wrap; gap:12px; animation:fadeUp .6s .55s ease both; }
        .stat-pill { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:10px; padding:12px 20px; display:flex; align-items:center; gap:10px; }
        .stat-num { font-family:'Bebas Neue',sans-serif; font-size:28px; color:var(--amber); }
        .stat-label { font-size:12px; color:var(--muted); line-height:1.4; }

        .marquee-wrap { overflow:hidden; border-top:1px solid rgba(255,255,255,.06); border-bottom:1px solid rgba(255,255,255,.06); background:rgba(255,255,255,.02); padding:14px 0; }
        .marquee-track { display:flex; width:max-content; animation:marquee 32s linear infinite; }
        .marquee-item { font-family:'Fira Code',monospace; font-size:12px; color:var(--muted); letter-spacing:.06em; padding:0 32px; white-space:nowrap; border-right:1px solid rgba(255,255,255,.06); }
        .marquee-item span { color:var(--amber); margin-right:8px; }

        section { padding:96px 0; }
        .section-label { font-family:'Fira Code',monospace; font-size:11px; color:var(--amber); letter-spacing:.14em; text-transform:uppercase; margin-bottom:14px; }
        .section-title { font-family:'Bebas Neue',sans-serif; font-size:clamp(38px,6vw,64px); line-height:1; letter-spacing:.03em; color:var(--text); margin-bottom:18px; }
        .section-sub { font-size:17px; color:var(--text2); max-width:520px; line-height:1.7; }

        .personas { background:var(--dark2); }
        .personas-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); gap:16px; margin-top:44px; }
        .persona-card { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:16px; padding:26px 22px; transition:border-color .25s,transform .2s; }
        .persona-card:hover { border-color:rgba(33,150,243,.3); transform:translateY(-3px); }
        .persona-icon { font-size:34px; margin-bottom:14px; }
        .persona-title { font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:.05em; color:var(--text); margin-bottom:8px; }
        .persona-body { font-size:14px; color:var(--text2); line-height:1.65; }
        .persona-quote { margin-top:14px; padding:11px 13px; background:rgba(33,150,243,.06); border-left:3px solid var(--amber); border-radius:0 8px 8px 0; font-size:13px; color:var(--text); font-style:italic; line-height:1.6; }

        .how { background:var(--dark); }
        .steps { margin-top:52px; display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:32px; }
        .step-num { font-family:'Bebas Neue',sans-serif; font-size:60px; line-height:1; color:rgba(33,150,243,.12); }
        .step-icon { font-size:28px; margin-bottom:12px; }
        .step-title { font-weight:700; font-size:17px; color:var(--text); margin-bottom:8px; }
        .step-body { font-size:14px; color:var(--text2); line-height:1.65; }

        .features { background:var(--dark2); }
        .feature-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:44px; }
        @media(max-width:640px){.feature-grid{grid-template-columns:1fr;}}
        .feature-card { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:16px; padding:26px 22px; transition:border-color .25s; }
        .feature-card:hover { border-color:rgba(33,150,243,.22); }
        .feature-card.large { grid-column:span 2; }
        @media(max-width:640px){.feature-card.large{grid-column:span 1;}}
        .feature-tag { display:inline-block; font-family:'Fira Code',monospace; font-size:10px; color:var(--amber); background:rgba(33,150,243,.1); border:1px solid rgba(33,150,243,.2); padding:2px 8px; border-radius:4px; letter-spacing:.07em; margin-bottom:12px; }
        .feature-icon { font-size:30px; margin-bottom:12px; }
        .feature-title { font-weight:700; font-size:19px; color:var(--text); margin-bottom:8px; }
        .feature-body { font-size:14px; color:var(--text2); line-height:1.7; }
        .demo-strip { margin-top:22px; display:flex; flex-direction:column; gap:7px; }
        .demo-stop { display:flex; align-items:center; gap:12px; background:rgba(255,255,255,.04); border-radius:10px; padding:9px 13px; }
        .demo-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
        .demo-city { font-weight:600; font-size:14px; flex:1; }
        .demo-time { font-family:'Fira Code',monospace; font-size:11px; color:var(--muted); }
        .demo-weather { display:flex; align-items:center; gap:6px; font-size:13px; }
        .demo-temp { font-family:'Fira Code',monospace; font-weight:600; }

        .pricing { background:var(--dark); }
        .pricing-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-top:44px; align-items:start; }
        @media(max-width:768px){.pricing-grid{grid-template-columns:1fr;}}
        .pricing-card { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); border-radius:20px; padding:30px 26px; position:relative; transition:transform .2s; }
        .pricing-card:hover { transform:translateY(-4px); }
        .pricing-card.featured { background:rgba(33,150,243,.06); border-color:rgba(33,150,243,.4); box-shadow:0 0 48px rgba(33,150,243,.1); }
        .pricing-badge { position:absolute; top:-13px; left:50%; transform:translateX(-50%); background:var(--amber); color:var(--dark); font-weight:800; font-size:11px; letter-spacing:.1em; text-transform:uppercase; padding:4px 14px; border-radius:100px; white-space:nowrap; }
        .pricing-name { font-family:'Bebas Neue',sans-serif; font-size:20px; letter-spacing:.08em; color:var(--text2); margin-bottom:6px; }
        .pricing-price { font-family:'Bebas Neue',sans-serif; font-size:54px; line-height:1; color:var(--text); margin-bottom:4px; }
        .pricing-price sup { font-size:26px; vertical-align:super; }
        .pricing-period { font-size:13px; color:var(--muted); margin-bottom:22px; }
        .pricing-features { list-style:none; display:flex; flex-direction:column; gap:10px; margin-bottom:24px; }
        .pricing-features li { display:flex; align-items:flex-start; gap:9px; font-size:14px; color:var(--text2); line-height:1.5; }
        .check { color:var(--green); font-size:13px; flex-shrink:0; margin-top:2px; }
        .cross { color:var(--muted); font-size:13px; flex-shrink:0; margin-top:2px; }
        .btn-plan { width:100%; padding:12px; border-radius:12px; border:none; font-family:'Barlow',sans-serif; font-weight:700; font-size:14px; letter-spacing:.06em; text-transform:uppercase; cursor:pointer; transition:all .2s; }
        .btn-plan-primary { background:linear-gradient(135deg,var(--amber),var(--amber2)); color:var(--dark); box-shadow:0 0 28px rgba(33,150,243,.25); }
        .btn-plan-primary:hover { box-shadow:0 0 44px rgba(33,150,243,.5); transform:scale(1.02); }
        .btn-plan-ghost { background:rgba(255,255,255,.05); color:var(--text2); border:1px solid rgba(255,255,255,.1); }
        .btn-plan-ghost:hover { background:rgba(255,255,255,.09); color:var(--text); }

        .waitlist-section { background:var(--dark2); border-top:1px solid rgba(33,150,243,.1); border-bottom:1px solid rgba(33,150,243,.1); }
        .waitlist-inner { text-align:center; max-width:580px; margin:0 auto; }
        .waitlist-form { display:flex; gap:10px; margin-top:28px; flex-wrap:wrap; }
        .waitlist-input { flex:1; min-width:200px; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); border-radius:12px; padding:13px 18px; color:var(--text); font-size:15px; font-family:'Barlow',sans-serif; outline:none; transition:border-color .2s; }
        .waitlist-input:focus { border-color:rgba(33,150,243,.5); }
        .waitlist-input::placeholder { color:var(--muted); }
        .btn-waitlist { background:linear-gradient(135deg,var(--amber),var(--amber2)); color:var(--dark); font-weight:800; font-size:14px; letter-spacing:.08em; text-transform:uppercase; padding:13px 26px; border-radius:12px; border:none; cursor:pointer; white-space:nowrap; box-shadow:0 0 32px rgba(33,150,243,.25); transition:all .2s; }
        .btn-waitlist:hover { box-shadow:0 0 48px rgba(33,150,243,.5); transform:scale(1.03); }
        .btn-waitlist:disabled { opacity:.6; cursor:not-allowed; transform:none; }
        .waitlist-success { background:rgba(52,211,153,.1); border:1px solid rgba(52,211,153,.3); border-radius:12px; padding:18px 24px; color:var(--green); font-size:16px; font-weight:600; margin-top:24px; }
        .waitlist-note { margin-top:12px; font-size:12px; color:var(--muted); font-family:'Fira Code',monospace; }
        .waitlist-error { margin-top:10px; font-size:13px; color:#f87171; font-family:'Fira Code',monospace; }

        footer { background:var(--dark); border-top:1px solid rgba(255,255,255,.06); padding:44px 24px 28px; }
        .footer-inner { max-width:1100px; margin:0 auto; display:flex; flex-wrap:wrap; gap:28px; justify-content:space-between; align-items:flex-start; }
        .footer-logo { font-family:'Bebas Neue',sans-serif; font-size:22px; color:var(--amber); letter-spacing:.1em; }
        .footer-tagline { font-size:13px; color:var(--muted); margin-top:4px; }
        .footer-links { display:flex; gap:22px; flex-wrap:wrap; }
        .footer-links a { font-size:13px; color:var(--muted); transition:color .2s; }
        .footer-links a:hover { color:var(--text); }
        .footer-copy { width:100%; text-align:center; font-size:11px; color:var(--subtle); margin-top:28px; padding-top:20px; border-top:1px solid rgba(255,255,255,.05); font-family:'Fira Code',monospace; }

        @media(max-width:768px){ .nav-links{display:none;} .hero{padding:100px 20px 60px;} }
      `}</style>

      {/* NAV */}
      <nav>
        <div className="nav-inner">
          <div className="nav-logo">🛣️ RouteSkies <span className="beta-badge">Beta</span></div>
          <div className="nav-links">
            <a href="#how">How It Works</a>
            <a href="#who">Who It's For</a>
            <a href="#pricing">Pricing</a>
            <button className="nav-cta" onClick={onLaunchApp}>Try the App →</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="eyebrow">
            <div className="eyebrow-dot"></div>
            Now in Beta · routeskies.com
          </div>
          <h1 className="hero-title">
            Weather built<br/>
            <span className="accent">for the road.</span><br/>
            <span className="dim">Not your backyard.</span>
          </h1>
          <p className="hero-sub">
            <strong>See the forecast for where you'll actually be</strong> — not just your destination.
            Time-adjusted weather at every stop on your drive.
          </p>
          <div className="hero-actions">
            <button className="btn-hero" onClick={onLaunchApp}>🚗 &nbsp;Try It Free</button>
            <a href="#waitlist" className="btn-try">Join Waitlist →</a>
          </div>
          <div className="hero-stats">
            {[['13+','Major highway','corridors'],['165+','Cities in the','route database'],['8','Time-adjusted','stops per route'],['$0','To get','started']].map(([n,l1,l2]) => (
              <div className="stat-pill" key={n}>
                <div className="stat-num">{n}</div>
                <div className="stat-label">{l1}<br/>{l2}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {[['☀️','Fort Lauderdale · 79°F · Clear · 8:00 AM'],['🌦️','Jacksonville · 71°F · Light Rain · 12:30 PM'],['⛅','Savannah · 68°F · Partly Cloudy · 2:15 PM'],['🌧️','Florence SC · 63°F · Rain · 4:00 PM'],['☀️','Raleigh-Durham · 61°F · Clear · 8:30 PM'],['⛈️','Nashville · 58°F · Thunderstorm · 3:00 PM'],['☀️','Kansas City · 72°F · Sunny · 9:00 AM'],['🌦️','St. Louis · 66°F · Drizzle · 11:30 AM'],
            ['☀️','Fort Lauderdale · 79°F · Clear · 8:00 AM'],['🌦️','Jacksonville · 71°F · Light Rain · 12:30 PM'],['⛅','Savannah · 68°F · Partly Cloudy · 2:15 PM'],['🌧️','Florence SC · 63°F · Rain · 4:00 PM'],['☀️','Raleigh-Durham · 61°F · Clear · 8:30 PM'],['⛈️','Nashville · 58°F · Thunderstorm · 3:00 PM'],['☀️','Kansas City · 72°F · Sunny · 9:00 AM'],['🌦️','St. Louis · 66°F · Drizzle · 11:30 AM'],
          ].map(([icon,text],i) => (
            <div className="marquee-item" key={i}><span>{icon}</span>{text}</div>
          ))}
        </div>
      </div>

      {/* WHO IT'S FOR */}
      <section className="personas" id="who">
        <div className="container">
          <div className="section-label">Who It's For</div>
          <h2 className="section-title">Built for people<br/>who drive for a living.</h2>
          <p className="section-sub">Most weather apps are built for people standing in their driveway. RouteSkies is built for people who spend their days on I-75, I-95, and I-40.</p>
          <div className="personas-grid">
            {[
              ['🚛','Long-Haul Truckers','Weather is a safety issue, not just a convenience. A storm window between Memphis and Jackson can mean pulling over for hours. Know before you go.','I need to know if there\'s rain near Macon at 2pm — not what it\'s like in Atlanta right now.'],
              ['💼','Regional Field Reps','Project managers, pharma reps, construction supervisors — anyone with a territory across multiple states. You\'re in a different city every day. Plan your drive like a pro.','I cover the entire southern US. I need to know what I\'m driving into, not just where I\'m going.'],
              ['🚌','Bus & Charter Operators','You have passengers and a schedule. A surprise storm doesn\'t just slow you down — it affects everyone on board. Route smarter before you leave the depot.','If there\'s severe weather near Charlotte at 4pm, I need to know that before I leave at 8am.'],
              ['🌴','Snowbirds & Road Trippers','Twice a year, I-95 or I-75 — all the way from Michigan to Florida and back. Now know the weather cold too, stop by stop, hour by hour.','I drive this route every November. I just want to know where to stop and wait out the rain.'],
            ].map(([icon,title,body,quote]) => (
              <div className="persona-card" key={title}>
                <div className="persona-icon">{icon}</div>
                <div className="persona-title">{title}</div>
                <div className="persona-body">{body}</div>
                <div className="persona-quote">{quote}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how" id="how">
        <div className="container">
          <div className="section-label">How It Works</div>
          <h2 className="section-title">Plan your drive in<br/>under 60 seconds.</h2>
          <div className="steps">
            {[
              ['01','📍','Enter Your Route','Type your origin and destination. Smart autocomplete fills in cities. RouteSkies covers every major highway corridor in the US.'],
              ['02','🛣️','Route Is Calculated','Google Maps calculates your real highway route. Up to 8 waypoints are selected along the way — evenly spaced by distance.'],
              ['03','⏱️','Time-Adjusted Forecasts','Based on your departure time, RouteSkies shows the weather forecast for when you\'ll actually arrive at each stop — not just now.'],
              ['04','✏️','Customize Your Stops','Add stops you know you\'re taking. Remove ones you\'re skipping. All arrival times recalculate automatically.'],
            ].map(([num,icon,title,body]) => (
              <div className="step" key={num}>
                <div className="step-num">{num}</div>
                <div className="step-icon">{icon}</div>
                <div className="step-title">{title}</div>
                <div className="step-body">{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features" id="features">
        <div className="container">
          <div className="section-label">Features</div>
          <h2 className="section-title">Everything you need.<br/>Nothing you don't.</h2>
          <div className="feature-grid">
            <div className="feature-card large">
              <div className="feature-tag">CORE FEATURE</div>
              <div className="feature-icon">🗺️</div>
              <div className="feature-title">Time-Adjusted Route Weather</div>
              <div className="feature-body">Every stop shows the forecast for when you'll actually arrive. Leaving Fort Lauderdale at 8am? Jacksonville gets the noon forecast. Savannah gets the 2pm forecast. That's the intelligence that makes RouteSkies different from every other weather app.</div>
              <div className="demo-strip">
                {[['#2196F3','Fort Lauderdale, FL','Depart 8:00 AM','☀️','#34d399','79°','Clear'],['#7dd3fc','Jacksonville, FL','~Arrive 12:30 PM','🌦️','#7dd3fc','71°','Light Rain'],['#94a3b8','Savannah, GA','~Arrive 2:15 PM','⛅','#94a3b8','68°','Partly Cloudy'],['#34d399','Raleigh-Durham, NC','~Arrive 8:30 PM','☀️','#34d399','61°','Clear']].map(([dot,city,time,icon,col,temp,cond]) => (
                  <div className="demo-stop" key={city}>
                    <div className="demo-dot" style={{background:dot}}></div>
                    <div className="demo-city">{city}</div>
                    <div className="demo-time">{time}</div>
                    <div className="demo-weather"><span>{icon}</span><span className="demo-temp" style={{color:col}}>{temp}</span><span style={{color:'#64748b',fontSize:'12px'}}>{cond}</span></div>
                  </div>
                ))}
              </div>
            </div>
            {[['OFFLINE','📴','Works Without Signal','Save your route before you leave. It caches to your device so you can see your full trip forecast even in dead zones on I-75 through rural Georgia.'],['EXPORT','🖨️','Print Your Route Card','One tap exports a clean route weather card — ready to print, screenshot, or share with dispatch or your co-driver.'],['ALERTS','⚠️','Automatic Weather Advisories','If rain or severe weather is expected at any stop, a weather advisory fires automatically. You see it the moment you plan — before you\'re on the road.'],['ROUTES','⚡','Three Route Modes','Fastest for direct interstates. Scenic to avoid highways. No Tolls for toll-free corridors. Choose before you plan, customize after.']].map(([tag,icon,title,body]) => (
              <div className="feature-card" key={title}>
                <div className="feature-tag">{tag}</div>
                <div className="feature-icon">{icon}</div>
                <div className="feature-title">{title}</div>
                <div className="feature-body">{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing" id="pricing">
        <div className="container">
          <div className="section-label">Pricing</div>
          <h2 className="section-title">Less than a cup of<br/>coffee. Per month.</h2>
          <p className="section-sub">Start free. Upgrade when it's part of your routine. Fleet pricing for teams.</p>
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-name">Free</div>
              <div className="pricing-price"><sup>$</sup>0</div>
              <div className="pricing-period">forever</div>
              <ul className="pricing-features">
                {[['✓','3 routes free (no expiry)'],['✓','Up to 8 stops per route'],['✓','All major highway corridors'],['✓','Weather advisory alerts'],['–','Offline save'],['–','PDF / print export'],['–','Push alerts'],['–','Shareable links']].map(([c,t]) => (
                  <li key={t}><span className={c==='✓'?'check':'cross'}>{c}</span>{t}</li>
                ))}
              </ul>
              <button className="btn-plan btn-plan-ghost" onClick={() => document.getElementById('waitlist').scrollIntoView({behavior:'smooth'})}>Get Started Free</button>
            </div>
            <div className="pricing-card featured">
              <div className="pricing-badge">Most Popular</div>
              <div className="pricing-name">Pro</div>
              <div className="pricing-price"><sup>$</sup>4<span style={{fontSize:'30px'}}>.99</span></div>
              <div className="pricing-period">per month · or $39/year (save 35%)</div>
              <ul className="pricing-features">
                {[['✓','Unlimited route checks'],['✓','Up to 8 stops per route'],['✓','All major highway corridors'],['✓','Weather advisory alerts'],['✓','Offline save to device'],['✓','PDF / print export'],['✓','Severe weather push alerts'],['✓','Shareable route links']].map(([c,t]) => (
                  <li key={t}><span className="check">✓</span><span>{t}</span></li>
                ))}
              </ul>
              <button className="btn-plan btn-plan-primary" onClick={() => document.getElementById('waitlist').scrollIntoView({behavior:'smooth'})}>Start Pro — $4.99/mo</button>
            </div>
            <div className="pricing-card">
              <div className="pricing-name">Fleet</div>
              <div className="pricing-price"><sup>$</sup>29</div>
              <div className="pricing-period">per month · up to 10 drivers</div>
              <ul className="pricing-features">
                {[['✓','Everything in Pro'],['✓','Up to 10 driver seats'],['✓','Dispatch dashboard'],['✓','Route sharing across team'],['✓','Bulk route planning'],['✓','Priority support'],['✓','Custom branding (coming)'],['✓','API access (coming)']].map(([c,t]) => (
                  <li key={t}><span className="check">✓</span><span>{t}</span></li>
                ))}
              </ul>
              <button className="btn-plan btn-plan-ghost" onClick={() => document.getElementById('waitlist').scrollIntoView({behavior:'smooth'})}>Contact for Fleet</button>
            </div>
          </div>
          <p style={{textAlign:'center',marginTop:'24px',fontSize:'13px',color:'var(--muted)',fontFamily:"'Fira Code',monospace"}}>
            No credit card required · Cancel anytime · 14-day free trial on Pro
          </p>
        </div>
      </section>

      {/* WAITLIST */}
      <section className="waitlist-section" id="waitlist">
        <div className="container">
          <div className="waitlist-inner">
            <div className="section-label" style={{textAlign:'center'}}>Early Access</div>
            <h2 className="section-title" style={{textAlign:'center'}}>Be first on the road.</h2>
            <p style={{fontSize:'17px',color:'var(--text2)',lineHeight:'1.7',textAlign:'center'}}>
              Join the waitlist and get <strong style={{color:'var(--amber)'}}>3 months of Pro free</strong> when we launch.
            </p>

            {!submitted ? (
              <>
                <form className="waitlist-form" onSubmit={handleWaitlist}>
                  <input
                    className="waitlist-input"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn-waitlist" disabled={submitting}>
                    {submitting ? 'Joining...' : '🚗 Join Waitlist'}
                  </button>
                </form>
                {subError && <p className="waitlist-error">⚠️ {subError}</p>}
                <p className="waitlist-note">No spam. No selling your email. Just a launch notification and your free Pro access.</p>
              </>
            ) : (
              <div className="waitlist-success">
                ✅ You're on the list! Check your inbox for a welcome email. See you on the road. 🚗
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div>
            <div className="footer-logo">🛣️ RouteSkies</div>
            <div className="footer-tagline">Weather built for the road.</div>
            <div style={{fontSize:'12px',color:'var(--muted)',marginTop:'4px',fontFamily:"'Fira Code',monospace"}}>A Nece Unified LLC product</div>
          </div>
          <div className="footer-links">
            <a href="#how">How It Works</a>
            <a href="#pricing">Pricing</a>
            <a href="#waitlist">Join Waitlist</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms</a>
          </div>
        </div>
        <div className="footer-copy">© 2026 RouteSkies · Nece Unified LLC · routeskies.com</div>
      </footer>
    </>
  )
}
