'use client'
import { useState } from 'react'

const TODAY = () => new Date().toISOString().split('T')[0]

export default function Landing({ onLaunchApp }) {
  // ── Waitlist state (preserved) ──────────────────────────────────
  const [email,      setEmail]      = useState('')
  const [submitted,  setSubmitted]  = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [subError,   setSubError]   = useState('')

  // ── Quick-launch form state ─────────────────────────────────────
  const [qOrigin, setQOrigin] = useState('')
  const [qDest,   setQDest]   = useState('')
  const [qDate,   setQDate]   = useState('')
  const [qHour,   setQHour]   = useState('8')

  async function handleWaitlist(e) {
    e.preventDefault()
    if (!email) return
    setSubmitting(true)
    setSubError('')
    try {
      const res  = await fetch('/api/waitlist', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email }) })
      const data = await res.json()
      if (data.success) { setSubmitted(true); setEmail('') }
      else setSubError(data.error || 'Something went wrong. Please try again.')
    } catch { setSubError('Something went wrong. Please try again.') }
    finally { setSubmitting(false) }
  }

  function handleQuickLaunch(e) {
    e.preventDefault()
    try {
      if (qOrigin || qDest) {
        localStorage.setItem('rs_prefill', JSON.stringify({
          origin: qOrigin.trim(), dest: qDest.trim(),
          date: qDate || TODAY(), timeHour: qHour,
        }))
      }
    } catch {}
    onLaunchApp()
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root {
          --forest: #1b4332;
          --trail:  #2d6a4f;
          --sage:   #52a86b;
          --sky:    #5b8fb9;
          --cloud:  #f7f9f7;
          --mist:   #edf2ee;
          --road:   #6b7480;
          --bark:   #1e2d23;
          --gold:   #b8720a;
          --text:   #1e2d23;
          --text2:  #4a5e52;
          --border: #d4ddd6;
        }
        html { scroll-behavior:smooth; }
        body { background:var(--cloud); color:var(--text); font-family:'Barlow',sans-serif; overflow-x:hidden; }
        a { color:inherit; text-decoration:none; }
        .container { max-width:1100px; margin:0 auto; padding:0 24px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:none} }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        /* ── NAV ─────────────────────────────────────────────── */
        .rs-nav {
          position:fixed; top:0; left:0; right:0; z-index:100;
          background:rgba(247,249,247,0.96); backdrop-filter:blur(10px);
          border-bottom:1px solid var(--border);
          padding:14px 24px;
        }
        .rs-nav-inner { max-width:1100px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; }
        .rs-logo {
          font-family:'Bebas Neue',sans-serif; font-size:24px; letter-spacing:.08em;
          color:var(--forest); display:flex; align-items:center; gap:8px; cursor:pointer;
        }
        .rs-beta {
          font-family:system-ui,sans-serif; font-size:10px; font-weight:700;
          letter-spacing:.1em; text-transform:uppercase; color:var(--cloud);
          background:var(--trail); padding:2px 8px; border-radius:4px; align-self:center;
        }
        .rs-nav-links { display:flex; align-items:center; gap:28px; }
        .rs-nav-links a { font-size:15px; font-weight:500; color:var(--text2); transition:color .2s; }
        .rs-nav-links a:hover { color:var(--forest); }
        .rs-nav-cta {
          background:var(--trail); color:#fff; font-weight:700; font-size:14px;
          padding:9px 22px; border-radius:8px; border:none; cursor:pointer;
          transition:background .2s,transform .15s;
        }
        .rs-nav-cta:hover { background:var(--forest); transform:scale(1.02); }

        /* ── HERO ────────────────────────────────────────────── */
        .rs-hero {
          min-height:92vh; position:relative; display:flex;
          align-items:center; padding:110px 24px 80px; overflow:hidden;
        }
        .rs-hero-photo {
          position:absolute; inset:0;
          background:url('/hero-bg.jpg') center/cover no-repeat;
          z-index:0;
        }
        .rs-hero-photo::after {
          content:''; position:absolute; inset:0;
          background:linear-gradient(
            108deg,
            rgba(247,249,247,0.97) 0%,
            rgba(247,249,247,0.93) 30%,
            rgba(247,249,247,0.72) 52%,
            rgba(247,249,247,0.28) 72%,
            transparent 100%
          );
        }
        .rs-hero-inner {
          position:relative; z-index:1; max-width:1100px;
          margin:0 auto; width:100%;
        }
        .rs-eyebrow {
          display:inline-flex; align-items:center; gap:8px;
          background:rgba(45,106,79,0.1); border:1px solid rgba(45,106,79,0.25);
          border-radius:100px; padding:5px 15px;
          font-size:13px; color:var(--trail); font-weight:600; letter-spacing:.02em;
          margin-bottom:24px; animation:fadeUp .5s .1s ease both;
        }
        .rs-eyebrow-dot { width:7px; height:7px; border-radius:50%; background:var(--sage); }
        .rs-h1 {
          font-family:'Barlow Condensed',sans-serif; font-weight:800;
          font-size:clamp(50px,7vw,88px); line-height:1.0; letter-spacing:.01em;
          color:var(--forest); max-width:640px;
          animation:fadeUp .5s .2s ease both;
        }
        .rs-h1 span { color:var(--trail); }
        .rs-hero-sub {
          margin-top:20px; font-size:clamp(17px,2vw,20px); color:var(--text2);
          max-width:520px; line-height:1.75; font-weight:400;
          animation:fadeUp .5s .3s ease both;
        }
        .rs-hero-actions { margin-top:32px; display:flex; flex-wrap:wrap; gap:14px; animation:fadeUp .5s .4s ease both; }
        .btn-primary-green {
          background:var(--trail); color:#fff; font-weight:700; font-size:17px;
          padding:16px 38px; border-radius:10px; border:none; cursor:pointer;
          box-shadow:0 4px 18px rgba(45,106,79,0.35); transition:all .2s;
          letter-spacing:.01em;
        }
        .btn-primary-green:hover { background:var(--forest); transform:translateY(-1px); box-shadow:0 6px 26px rgba(45,106,79,0.45); }
        .btn-outline {
          background:transparent; color:var(--forest); font-weight:600; font-size:16px;
          padding:15px 28px; border-radius:10px; border:2px solid var(--trail);
          cursor:pointer; transition:all .2s; letter-spacing:.01em;
        }
        .btn-outline:hover { background:rgba(45,106,79,0.07); }

        /* ── QUICK-SEARCH FORM ───────────────────────────────── */
        .rs-search {
          background:var(--cloud);
          border-top:1px solid var(--border); border-bottom:1px solid var(--border);
          padding:48px 24px;
        }
        .rs-search-card {
          max-width:860px; margin:0 auto;
          background:#fff; border:1px solid var(--border);
          border-radius:16px; padding:32px 32px 28px;
          box-shadow:0 4px 32px rgba(30,45,35,0.08);
        }
        .rs-search-title {
          font-family:'Barlow Condensed',sans-serif; font-weight:700;
          font-size:22px; color:var(--forest); margin-bottom:6px;
        }
        .rs-search-sub { font-size:14px; color:var(--text2); margin-bottom:22px; }
        .rs-form-grid {
          display:grid; grid-template-columns:1fr 1fr;
          gap:14px;
        }
        .rs-form-grid-4 { grid-template-columns:1fr 1fr 1fr 1fr; }
        @media(max-width:660px){ .rs-form-grid, .rs-form-grid-4 { grid-template-columns:1fr; } }
        .rs-label {
          display:block; font-size:12px; font-weight:700; color:var(--text2);
          letter-spacing:.06em; text-transform:uppercase; margin-bottom:6px;
        }
        .rs-input {
          width:100%; background:#f8faf9; border:1.5px solid var(--border);
          border-radius:9px; padding:12px 14px; color:var(--text); font-size:15px;
          font-family:'Barlow',sans-serif; outline:none; transition:border-color .2s;
        }
        .rs-input:focus { border-color:var(--trail); background:#fff; }
        .rs-input::placeholder { color:#9caaa2; }
        .rs-input[type=date]::-webkit-calendar-picker-indicator { opacity:.5; cursor:pointer; }
        .rs-btn-launch {
          margin-top:18px; width:100%; background:var(--trail); color:#fff;
          font-weight:700; font-size:17px; padding:15px 0; border-radius:10px;
          border:none; cursor:pointer; letter-spacing:.01em;
          transition:background .2s, transform .15s;
        }
        .rs-btn-launch:hover { background:var(--forest); transform:translateY(-1px); }

        /* ── SECTIONS shared ─────────────────────────────────── */
        .rs-section { padding:80px 24px; }
        .rs-section-alt { background:var(--mist); }
        .rs-label-tag {
          display:inline-block; font-size:12px; font-weight:700; letter-spacing:.1em;
          text-transform:uppercase; color:var(--trail); margin-bottom:12px;
        }
        .rs-section-h2 {
          font-family:'Bebas Neue',sans-serif; font-size:clamp(36px,5vw,58px);
          line-height:1; letter-spacing:.03em; color:var(--forest);
          margin-bottom:14px;
        }
        .rs-section-sub { font-size:17px; color:var(--text2); max-width:560px; line-height:1.75; }

        /* ── WHY section ─────────────────────────────────────── */
        .rs-why-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-top:44px; }
        @media(max-width:680px){ .rs-why-grid { grid-template-columns:1fr; } }
        .rs-why-card {
          background:#fff; border:1px solid var(--border); border-radius:14px;
          padding:26px 22px; transition:box-shadow .2s;
        }
        .rs-why-card:hover { box-shadow:0 4px 20px rgba(30,45,35,0.09); }
        .rs-why-icon { font-size:30px; margin-bottom:12px; }
        .rs-why-title { font-weight:700; font-size:17px; color:var(--forest); margin-bottom:8px; }
        .rs-why-body { font-size:14px; color:var(--text2); line-height:1.7; }
        .rs-diff-card {
          margin-top:20px; background:rgba(45,106,79,0.07);
          border:1px solid rgba(45,106,79,0.2);
          border-radius:14px; padding:22px 24px;
          display:flex; gap:16px; align-items:flex-start;
        }
        .rs-diff-icon { font-size:28px; flex-shrink:0; margin-top:2px; }
        .rs-diff-text strong { display:block; font-size:16px; color:var(--forest); margin-bottom:4px; }
        .rs-diff-text span { font-size:14px; color:var(--text2); line-height:1.7; }

        /* ── HOW IT WORKS ────────────────────────────────────── */
        .rs-steps { display:grid; grid-template-columns:repeat(3,1fr); gap:32px; margin-top:48px; }
        @media(max-width:680px){ .rs-steps { grid-template-columns:1fr; gap:24px; } }
        .rs-step { display:flex; flex-direction:column; }
        .rs-step-num {
          font-family:'Bebas Neue',sans-serif; font-size:52px; line-height:1;
          color:rgba(45,106,79,0.15); margin-bottom:2px;
        }
        .rs-step-icon { font-size:30px; margin-bottom:10px; }
        .rs-step-title { font-weight:700; font-size:18px; color:var(--forest); margin-bottom:8px; }
        .rs-step-body { font-size:15px; color:var(--text2); line-height:1.7; }
        .rs-step-connector { display:none; }

        /* ── BUILT FOR ───────────────────────────────────────── */
        .rs-for-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:18px; margin-top:44px; }
        @media(max-width:640px){ .rs-for-grid { grid-template-columns:1fr; } }
        .rs-for-card {
          background:#fff; border:1px solid var(--border); border-radius:14px;
          padding:26px 24px; transition:box-shadow .2s, transform .2s;
        }
        .rs-for-card:hover { box-shadow:0 6px 24px rgba(30,45,35,0.1); transform:translateY(-2px); }
        .rs-for-icon { font-size:32px; margin-bottom:12px; }
        .rs-for-title { font-weight:700; font-size:18px; color:var(--forest); margin-bottom:8px; }
        .rs-for-body { font-size:14px; color:var(--text2); line-height:1.7; }

        /* ── BETA NOTICE ─────────────────────────────────────── */
        .rs-beta-banner {
          background:#fffbf0; border-top:1px solid #e8d9a0;
          border-bottom:1px solid #e8d9a0; padding:20px 24px;
        }
        .rs-beta-inner {
          max-width:1100px; margin:0 auto;
          display:flex; align-items:center; gap:14px; flex-wrap:wrap;
        }
        .rs-beta-icon { font-size:20px; flex-shrink:0; }
        .rs-beta-text { font-size:14px; color:#7a5c00; line-height:1.6; }
        .rs-beta-text strong { color:#5a4000; }

        /* ── WAITLIST ────────────────────────────────────────── */
        .rs-waitlist { background:var(--forest); color:#fff; padding:72px 24px; }
        .rs-waitlist-inner { max-width:600px; margin:0 auto; text-align:center; }
        .rs-waitlist-label { font-size:12px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--sage); margin-bottom:12px; }
        .rs-waitlist-h2 {
          font-family:'Bebas Neue',sans-serif; font-size:clamp(36px,5vw,56px);
          letter-spacing:.03em; color:#fff; margin-bottom:14px;
        }
        .rs-waitlist-sub { font-size:17px; color:rgba(255,255,255,0.72); line-height:1.7; margin-bottom:28px; }
        .rs-waitlist-form { display:flex; gap:10px; flex-wrap:wrap; }
        .rs-waitlist-input {
          flex:1; min-width:200px; background:rgba(255,255,255,0.1);
          border:1.5px solid rgba(255,255,255,0.25); border-radius:10px;
          padding:13px 18px; color:#fff; font-size:15px;
          font-family:'Barlow',sans-serif; outline:none; transition:border-color .2s;
        }
        .rs-waitlist-input:focus { border-color:rgba(255,255,255,0.6); }
        .rs-waitlist-input::placeholder { color:rgba(255,255,255,0.45); }
        .rs-btn-waitlist {
          background:var(--sage); color:#fff; font-weight:700; font-size:15px;
          letter-spacing:.04em; padding:13px 28px; border-radius:10px;
          border:none; cursor:pointer; white-space:nowrap;
          transition:background .2s, transform .15s;
        }
        .rs-btn-waitlist:hover { background:#3d9456; transform:scale(1.02); }
        .rs-btn-waitlist:disabled { opacity:.6; cursor:not-allowed; transform:none; }
        .rs-waitlist-success {
          background:rgba(82,168,107,0.2); border:1px solid rgba(82,168,107,0.4);
          border-radius:12px; padding:18px 24px; color:#a8e6bc; font-size:16px;
          font-weight:600; margin-top:4px;
        }
        .rs-waitlist-note { margin-top:12px; font-size:12px; color:rgba(255,255,255,0.42); }
        .rs-waitlist-error { margin-top:10px; font-size:13px; color:#fca5a5; }

        /* ── MARQUEE ─────────────────────────────────────────── */
        .rs-marquee-wrap {
          overflow:hidden; background:var(--forest);
          border-top:1px solid rgba(255,255,255,0.07);
          padding:14px 0;
        }
        .rs-marquee-track { display:flex; width:max-content; animation:marquee 36s linear infinite; }
        .rs-marquee-item {
          font-size:13px; color:rgba(255,255,255,0.55);
          letter-spacing:.04em; padding:0 32px; white-space:nowrap;
          border-right:1px solid rgba(255,255,255,0.12);
        }
        .rs-marquee-item span { color:var(--sage); margin-right:8px; }

        /* ── FOOTER ──────────────────────────────────────────── */
        .rs-footer {
          background:var(--bark); color:rgba(255,255,255,0.65);
          padding:40px 24px 28px;
        }
        .rs-footer-inner {
          max-width:1100px; margin:0 auto;
          display:flex; flex-wrap:wrap; gap:24px;
          justify-content:space-between; align-items:flex-start;
        }
        .rs-footer-logo { font-family:'Bebas Neue',sans-serif; font-size:20px; color:#fff; letter-spacing:.08em; }
        .rs-footer-tagline { font-size:13px; margin-top:3px; }
        .rs-footer-links { display:flex; gap:20px; flex-wrap:wrap; }
        .rs-footer-links a { font-size:13px; transition:color .2s; }
        .rs-footer-links a:hover { color:#fff; }
        .rs-footer-copy {
          width:100%; text-align:center; font-size:12px;
          color:rgba(255,255,255,0.3); margin-top:24px; padding-top:18px;
          border-top:1px solid rgba(255,255,255,0.08);
        }

        @media(max-width:768px){
          .rs-nav-links { display:none; }
          .rs-hero { padding:100px 20px 60px; }
          .rs-hero-photo::after { background:rgba(247,249,247,0.88); }
          .rs-section { padding:56px 20px; }
        }
      `}</style>

      {/* ── NAV ──────────────────────────────────────────────────── */}
      <nav className="rs-nav">
        <div className="rs-nav-inner">
          <div className="rs-logo" onClick={onLaunchApp}>
            🛣️ RouteSkies
            <span className="rs-beta">Beta</span>
          </div>
          <div className="rs-nav-links">
            <a href="#how">How It Works</a>
            <a href="#for-whom">Who It's For</a>
            <a href="#waitlist">Join Waitlist</a>
            <button className="rs-nav-cta" onClick={onLaunchApp}>Plan My Route →</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="rs-hero">
        <div className="rs-hero-photo" />
        <div className="rs-hero-inner">
          <div className="rs-eyebrow">
            <span className="rs-eyebrow-dot" />
            Now in Beta · Free to use · routeskies.com
          </div>
          <h1 className="rs-h1">
            Weather for<br/>
            <span>the road ahead.</span>
          </h1>
          <p className="rs-hero-sub">
            RouteSkies shows the forecast along your actual driving route, timed to when
            you'll reach each stop — not just the weather where you are now or where you're going.
          </p>
          <div className="rs-hero-actions">
            <button className="btn-primary-green" onClick={onLaunchApp}>
              🚗 &nbsp;Plan My Route
            </button>
            <a href="#how" className="btn-outline">See How It Works</a>
          </div>
        </div>
      </section>

      {/* ── QUICK SEARCH ─────────────────────────────────────────── */}
      <section className="rs-search">
        <div className="rs-search-card">
          <div className="rs-search-title">Check your route weather</div>
          <div className="rs-search-sub">Enter your trip and see time-adjusted forecasts at every stop along the way.</div>
          <form onSubmit={handleQuickLaunch}>
            <div className="rs-form-grid" style={{ marginBottom:14 }}>
              <div>
                <label className="rs-label">Starting From</label>
                <input className="rs-input" placeholder="e.g. Fort Lauderdale, FL"
                  value={qOrigin} onChange={e => setQOrigin(e.target.value)} />
              </div>
              <div>
                <label className="rs-label">Destination</label>
                <input className="rs-input" placeholder="e.g. Nashville, TN"
                  value={qDest} onChange={e => setQDest(e.target.value)} />
              </div>
            </div>
            <div className="rs-form-grid">
              <div>
                <label className="rs-label">Departure Date</label>
                <input className="rs-input" type="date"
                  value={qDate} min={TODAY()} onChange={e => setQDate(e.target.value)} />
              </div>
              <div>
                <label className="rs-label">Departure Time</label>
                <select className="rs-input" value={qHour} onChange={e => setQHour(e.target.value)}>
                  {Array.from({length:24},(_,i) => {
                    const h12 = i % 12 || 12, ampm = i < 12 ? 'AM' : 'PM'
                    return <option key={i} value={i}>{h12}:00 {ampm}</option>
                  })}
                </select>
              </div>
            </div>
            <button type="submit" className="rs-btn-launch">
              Check My Route Weather →
            </button>
          </form>
        </div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────────── */}
      <div className="rs-marquee-wrap">
        <div className="rs-marquee-track">
          {[
            ['☀️','Fort Lauderdale, FL · 79° · Clear · 8:00 AM'],
            ['🌦️','Jacksonville, FL · 71° · Light Rain · 12:30 PM'],
            ['⛅','Savannah, GA · 68° · Partly Cloudy · 2:15 PM'],
            ['🌧️','Florence, SC · 63° · Rain · 4:00 PM'],
            ['☀️','Raleigh-Durham, NC · 61° · Clear · 6:30 PM'],
            ['⛈️','Nashville, TN · 58° · Thunderstorm · 10:00 AM'],
            ['☀️','Kansas City, MO · 72° · Sunny · 9:00 AM'],
            ['🌦️','St. Louis, MO · 66° · Drizzle · 11:30 AM'],
            ['☀️','Fort Lauderdale, FL · 79° · Clear · 8:00 AM'],
            ['🌦️','Jacksonville, FL · 71° · Light Rain · 12:30 PM'],
            ['⛅','Savannah, GA · 68° · Partly Cloudy · 2:15 PM'],
            ['🌧️','Florence, SC · 63° · Rain · 4:00 PM'],
            ['☀️','Raleigh-Durham, NC · 61° · Clear · 6:30 PM'],
            ['⛈️','Nashville, TN · 58° · Thunderstorm · 10:00 AM'],
          ].map(([icon,text],i) => (
            <div className="rs-marquee-item" key={i}><span>{icon}</span>{text}</div>
          ))}
        </div>
      </div>

      {/* ── WHY REGULAR APPS MISS THE DRIVE ──────────────────────── */}
      <section className="rs-section" id="why">
        <div className="container">
          <div className="rs-label-tag">The Problem</div>
          <h2 className="rs-section-h2">Why regular weather apps<br/>miss the drive.</h2>
          <p className="rs-section-sub">
            Weather apps are built for people standing still. You're not.
          </p>
          <div className="rs-why-grid">
            {[
              ['🕐',"They show now, not when you'll arrive",
               "Your destination shows the current conditions. But you won't be there for 4, 6, or 8 hours. A lot can change."],
              ['📍','One forecast for hundreds of miles',
               'Driving from Tampa to Atlanta crosses four distinct weather systems. You need a forecast for each one.'],
              ['🗺️','No sense of your travel time',
               "A storm forecast for 3 PM at your destination means something very different if you're leaving at 6 AM versus noon."],
            ].map(([icon,title,body]) => (
              <div className="rs-why-card" key={title}>
                <div className="rs-why-icon">{icon}</div>
                <div className="rs-why-title">{title}</div>
                <div className="rs-why-body">{body}</div>
              </div>
            ))}
          </div>
          <div className="rs-diff-card">
            <div className="rs-diff-icon">✅</div>
            <div className="rs-diff-text">
              <strong>RouteSkies is different.</strong>
              <span>
                We calculate your actual route using Google Maps, estimate your arrival time at each stop based
                on when you leave, then pull the weather forecast for that specific time and place.
                So the forecast for Jacksonville doesn't show what it's like right now — it shows what it
                will be like when you get there.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="rs-section rs-section-alt" id="how">
        <div className="container">
          <div className="rs-label-tag">How It Works</div>
          <h2 className="rs-section-h2">Ready in under<br/>60 seconds.</h2>
          <div className="rs-steps">
            {[
              ['01','📍','Enter your trip',
               'Type your starting point and destination. Add your departure date and time. That\'s it — no account required.'],
              ['02','🛣️','RouteSkies estimates where you\'ll be',
               'We calculate your real driving route via Google Maps and estimate your arrival time at 6–8 stops spaced evenly along the way.'],
              ['03','⛅','See weather at each stop',
               'Each stop shows a time-adjusted forecast — temperature, precipitation, wind — for when you\'ll actually be there. Not now. Not later. Then.'],
            ].map(([num,icon,title,body]) => (
              <div className="rs-step" key={num}>
                <div className="rs-step-num">{num}</div>
                <div className="rs-step-icon">{icon}</div>
                <div className="rs-step-title">{title}</div>
                <div className="rs-step-body">{body}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:40, textAlign:'center' }}>
            <button className="btn-primary-green" style={{ fontSize:16, padding:'14px 36px' }} onClick={onLaunchApp}>
              Try It Now — It's Free
            </button>
          </div>
        </div>
      </section>

      {/* ── BUILT FOR REAL ROAD TRIPS ─────────────────────────────── */}
      <section className="rs-section" id="for-whom">
        <div className="container">
          <div className="rs-label-tag">Who It's For</div>
          <h2 className="rs-section-h2">Built for real<br/>road trips.</h2>
          <p className="rs-section-sub">
            If you spend time behind the wheel on long drives, RouteSkies was made for you.
          </p>
          <div className="rs-for-grid">
            {[
              ['🛣️','Long Drives',
               'Any drive over 3 hours crosses multiple weather systems. Know what you\'re driving into — hour by hour, stop by stop — before you leave the driveway.'],
              ['🌴','Snowbird Routes',
               'Twice a year on I-75 or I-95 between the Midwest and Florida? You know the route. Now know the weather cold, every stop of the way, all season long.'],
              ['🚐','RV Travel',
               'Slower speeds, bigger footprint, and harder to maneuver in rain or wind. Knowing what\'s ahead — and when — lets you plan smarter overnight stops.'],
              ['⛈️','Weather-Sensitive Travel',
               'Mountain passes, coastal roads, tornado-prone corridors — if weather conditions can genuinely affect your safety or schedule, you need a smarter forecast tool.'],
            ].map(([icon,title,body]) => (
              <div className="rs-for-card" key={title}>
                <div className="rs-for-icon">{icon}</div>
                <div className="rs-for-title">{title}</div>
                <div className="rs-for-body">{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BETA NOTICE ──────────────────────────────────────────── */}
      <div className="rs-beta-banner">
        <div className="rs-beta-inner">
          <span className="rs-beta-icon">🚧</span>
          <p className="rs-beta-text">
            <strong>RouteSkies is currently in beta.</strong>{' '}
            Forecasts are informational and should be checked against official weather alerts and
            the National Weather Service before travel. Drive safe out there.
          </p>
        </div>
      </div>

      {/* ── WAITLIST ─────────────────────────────────────────────── */}
      <section className="rs-waitlist" id="waitlist">
        <div className="rs-waitlist-inner">
          <div className="rs-waitlist-label">Early Access</div>
          <h2 className="rs-waitlist-h2">Be first on the road.</h2>
          <p className="rs-waitlist-sub">
            Join the waitlist and get <strong>3 months of Pro free</strong> when we launch.
            No spam — just a launch notification and your free access.
          </p>

          {!submitted ? (
            <>
              <form className="rs-waitlist-form" onSubmit={handleWaitlist}>
                <input
                  className="rs-waitlist-input" type="email"
                  placeholder="your@email.com" value={email}
                  onChange={e => setEmail(e.target.value)} required
                />
                <button type="submit" className="rs-btn-waitlist" disabled={submitting}>
                  {submitting ? 'Joining...' : '🚗 Join Waitlist'}
                </button>
              </form>
              {subError && <p className="rs-waitlist-error">⚠️ {subError}</p>}
              <p className="rs-waitlist-note">No credit card. Cancel anytime. 14-day free trial on Pro.</p>
            </>
          ) : (
            <div className="rs-waitlist-success">
              ✅ You're on the list! Check your inbox for a welcome email. See you on the road. 🚗
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="rs-footer">
        <div className="rs-footer-inner">
          <div>
            <div className="rs-footer-logo">🛣️ RouteSkies</div>
            <div className="rs-footer-tagline">Weather built for the road.</div>
            <div style={{ fontSize:12, marginTop:4, color:'rgba(255,255,255,0.3)' }}>
              A Nece Unified LLC product
            </div>
          </div>
          <div className="rs-footer-links">
            <a href="#how">How It Works</a>
            <a href="#for-whom">Who It's For</a>
            <a href="#waitlist">Join Waitlist</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms</a>
          </div>
        </div>
        <div className="rs-footer-copy">© 2026 RouteSkies · Nece Unified LLC · routeskies.com</div>
      </footer>
    </>
  )
}
