import { Link } from 'react-router-dom'

const values = [
  {
    title: 'Transparency',
    desc: 'No hidden fees, no fake listings. Every room is posted by a real verified provider.',
    color: '#dbeafe', icon: '🔍',
  },
  {
    title: 'Trust',
    desc: 'Reviews are only allowed after a completed booking — so feedback is always genuine.',
    color: '#dcfce7', icon: '🤝',
  },
  {
    title: 'Simplicity',
    desc: 'From registration to booking confirmation in under 5 minutes. No paperwork, no hassle.',
    color: '#fef3c7', icon: '⚡',
  },
  {
    title: 'Community',
    desc: 'We believe good flatmates make better homes. Our compatibility engine helps you find your tribe.',
    color: '#f3e8ff', icon: '🏡',
  },
]

const team = [
  { name: 'Product & Vision',   role: 'Building a local solution for a local problem — flatmate search in Nadiad.' },
  { name: 'Engineering',        role: 'Full-stack platform built with Node.js, React, and MongoDB.' },
  { name: 'Community',          role: 'Supporting both seekers and providers with fair, transparent tooling.' },
]

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)',
        padding: '5rem 1.25rem 4rem', textAlign: 'center',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{ fontSize: '.8125rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.75rem' }}>
            Our story
          </p>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-.04em', marginBottom: '1.25rem' }}>
            Built for Nadiad,<br />by people who get it
          </h1>
          <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', lineHeight: 1.75, maxWidth: 560, margin: '0 auto' }}>
            Finding a room or a trustworthy flatmate in a new city is stressful.
            FlatmateFinder was built to make that process fast, transparent, and human.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section style={{ padding: '5rem 1.25rem', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '.8125rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.75rem' }}>
              Our mission
            </p>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-.03em', marginBottom: '1.25rem' }}>
              Make co-living stress-free for everyone
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '1rem' }}>
              We started FlatmateFinder because the existing options — Facebook groups, scattered word-of-mouth,
              broker fees — were broken. Seekers wasted weeks. Providers had no reliable way to screen tenants.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '1.5rem' }}>
              Our platform brings both sides together with smart matching, verified profiles, and a booking
              system that handles everything from request to move-in.
            </p>
            <Link to="/register" className="btn btn-primary">Join for Free</Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { label: 'City', value: 'Nadiad' },
              { label: 'Platform', value: 'Web' },
              { label: 'Cost to join', value: 'Free' },
              { label: 'Roles', value: 'Seeker & Provider' },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '1.25rem',
              }}>
                <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.3rem' }}>{label}</p>
                <p style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text)' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: '5rem 1.25rem', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ fontSize: '.8125rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.5rem' }}>
              What we stand for
            </p>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-.03em' }}>Our values</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {values.map(v => (
              <div key={v.title} style={{
                background: v.color, borderRadius: 'var(--radius-lg)', padding: '1.75rem 1.5rem',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '.75rem' }}>{v.icon}</div>
                <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '.4rem', color: 'var(--text)' }}>{v.title}</p>
                <p style={{ fontSize: '.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: '5rem 1.25rem', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '.8125rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.5rem' }}>
            Behind the product
          </p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-.03em', marginBottom: '2.5rem' }}>
            Small team, big mission
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {team.map(t => (
              <div key={t.name} style={{
                display: 'flex', alignItems: 'center', gap: '1.25rem',
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '1.125rem 1.25rem', textAlign: 'left',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'var(--primary)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '.875rem', flexShrink: 0,
                }}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p style={{ fontWeight: 700 }}>{t.name}</p>
                  <p style={{ fontSize: '.875rem', color: 'var(--text-muted)' }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
        padding: '4rem 1.25rem', textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
          Be part of the community
        </h2>
        <p style={{ color: 'rgba(255,255,255,.8)', marginBottom: '1.75rem' }}>
          Whether you're looking for a place or offering one — you belong here.
        </p>
        <Link to="/register" style={{
          padding: '.7rem 2rem', background: '#fff', color: 'var(--primary)',
          borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: '.95rem',
        }}>
          Get Started Free
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--text)', color: 'rgba(255,255,255,.6)', padding: '2rem 1.25rem', textAlign: 'center' }}>
        <p style={{ fontSize: '.8125rem' }}>© {new Date().getFullYear()} FlatmateFinder · Nadiad, Gujarat</p>
      </footer>
    </div>
  )
}
