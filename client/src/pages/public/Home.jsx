import { Link } from 'react-router-dom'

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z"/>
      </svg>
    ),
    title: 'Find Rooms Instantly',
    desc: 'Browse verified listings in Nadiad. Filter by rent, gender preference and availability in seconds.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    title: 'Smart Compatibility',
    desc: 'Our matching engine scores your lifestyle, schedule and preferences against each listing for the best fit.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
      </svg>
    ),
    title: 'Connect Directly',
    desc: 'Once a provider accepts your request, contact details unlock instantly — no middleman, no delays.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819"/>
      </svg>
    ),
    title: 'List Your Space',
    desc: 'Providers can post rooms in minutes. Choose between renting out or finding a flatmate to share with.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
      </svg>
    ),
    title: 'Verified Reviews',
    desc: 'Only tenants with completed bookings can leave reviews — keeping feedback honest and trustworthy.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/>
      </svg>
    ),
    title: 'Switch Roles Anytime',
    desc: 'Already settled in? Switch from seeker to provider and list your own room — no new account needed.',
  },
]

const steps = [
  { n: '01', title: 'Create your account',    desc: 'Sign up as a seeker or provider in under a minute.' },
  { n: '02', title: 'Complete your profile',  desc: 'Add your lifestyle details to unlock compatibility scores.' },
  { n: '03', title: 'Browse or list rooms',   desc: 'Seekers browse; providers post. Both take seconds.' },
  { n: '04', title: 'Connect & move in',      desc: 'Provider accepts → booking confirmed → contact unlocked.' },
]

export default function Home() {
  return (
    <div style={{ overflowX: 'hidden' }}>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 50%, #f0fdf4 100%)',
        padding: '5rem 1.25rem 4rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '.5rem',
            background: 'var(--primary-light)', color: 'var(--primary)',
            padding: '.35rem 1rem', borderRadius: 999,
            fontSize: '.8125rem', fontWeight: 600, marginBottom: '1.5rem',
            border: '1px solid var(--primary-mid)',
          }}>
            <span style={{ width: 7, height: 7, background: 'var(--primary)', borderRadius: '50%', display: 'inline-block' }} />
            Now live in Nadiad, Gujarat
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            fontWeight: 800, lineHeight: 1.15,
            letterSpacing: '-.04em', color: 'var(--text)',
            marginBottom: '1.25rem',
          }}>
            Find your perfect<br />
            <span style={{ color: 'var(--primary)' }}>flatmate or room</span>
          </h1>

          <p style={{
            fontSize: '1.125rem', color: 'var(--text-secondary)',
            lineHeight: 1.7, marginBottom: '2.25rem', maxWidth: 540, margin: '0 auto 2.25rem',
          }}>
            FlatmateFinder connects room seekers and providers in Nadiad.
            Smart compatibility matching, instant bookings, verified reviews.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Find a Room — It's Free
            </Link>
            <Link to="/about" className="btn btn-outline btn-lg">
              Learn How It Works
            </Link>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', gap: '2.5rem', justifyContent: 'center',
            marginTop: '3.5rem', flexWrap: 'wrap',
          }}>
            {[['Seekers & Providers','Active users'],['Nadiad','City covered'],['Free','Always']].map(([v, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-.03em' }}>{v}</p>
                <p style={{ fontSize: '.8125rem', color: 'var(--text-muted)', marginTop: '.1rem' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.25rem', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ fontSize: '.8125rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.5rem' }}>
              Simple process
            </p>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-.03em' }}>
              Up and running in 4 steps
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {steps.map((s) => (
              <div key={s.n} style={{
                padding: '1.75rem 1.5rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  fontSize: '3rem', fontWeight: 900, color: 'var(--primary-light)',
                  lineHeight: 1, marginBottom: '.75rem', letterSpacing: '-.05em',
                }}>
                  {s.n}
                </div>
                <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '.4rem' }}>{s.title}</p>
                <p style={{ fontSize: '.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.25rem', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ fontSize: '.8125rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.5rem' }}>
              Everything you need
            </p>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-.03em' }}>
              Built for real flatmate searches
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {features.map((f) => (
              <div key={f.title} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: '1.5rem',
                transition: 'box-shadow .2s, transform .2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
              >
                <div style={{
                  width: 48, height: 48, background: 'var(--primary-light)',
                  borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--primary)', marginBottom: '1rem',
                }}>
                  {f.icon}
                </div>
                <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '.4rem' }}>{f.title}</p>
                <p style={{ fontSize: '.875rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
        padding: '4.5rem 1.25rem', textAlign: 'center',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: '#fff', letterSpacing: '-.03em', marginBottom: '1rem' }}>
            Ready to find your perfect flatmate?
          </h2>
          <p style={{ color: 'rgba(255,255,255,.8)', fontSize: '1rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            Join FlatmateFinder today — it's completely free for seekers and providers alike.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              padding: '.7rem 1.75rem', borderRadius: 8, fontWeight: 700,
              background: '#fff', color: 'var(--primary)', textDecoration: 'none',
              fontSize: '.95rem', transition: 'opacity .15s',
            }}>
              Create Free Account
            </Link>
            <Link to="/login" style={{
              padding: '.7rem 1.75rem', borderRadius: 8, fontWeight: 700,
              background: 'transparent', color: '#fff',
              border: '2px solid rgba(255,255,255,.5)', textDecoration: 'none',
              fontSize: '.95rem',
            }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer style={{ background: 'var(--text)', color: 'rgba(255,255,255,.6)', padding: '2.5rem 1.25rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {[['/','/','Home'],['/about','/about','About'],['/contact','/contact','Contact'],['/login','/login','Sign In'],['/register','/register','Register']].map(([to,,label]) => (
              <Link key={label} to={to} style={{ color: 'rgba(255,255,255,.6)', textDecoration: 'none', fontSize: '.875rem', transition: 'color .15s' }}
                onMouseEnter={e => e.target.style.color='#fff'}
                onMouseLeave={e => e.target.style.color='rgba(255,255,255,.6)'}>
                {label}
              </Link>
            ))}
          </div>
          <p style={{ fontSize: '.8125rem' }}>© {new Date().getFullYear()} FlatmateFinder · Nadiad, Gujarat · All rights reserved</p>
        </div>
      </footer>
    </div>
  )
}
