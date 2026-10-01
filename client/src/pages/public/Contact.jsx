import { useState } from 'react'
import { Link } from 'react-router-dom'

const faqs = [
  { q: 'Is FlatmateFinder free to use?', a: 'Yes — completely free for both seekers and providers. No hidden charges.' },
  { q: 'Which cities are supported?', a: 'Currently only Nadiad, Gujarat. We plan to expand soon.' },
  { q: 'How does compatibility scoring work?', a: 'We compare your lifestyle preferences (sleep schedule, diet, smoking habits, cleanliness) against the room\'s requirements to give a percentage match score.' },
  { q: 'Can I switch between seeker and provider?', a: 'Yes. From your Profile page you can switch roles anytime. Your old data stays intact.' },
  { q: 'How do I report a fake listing?', a: 'Use the Report option in your Profile → Report section. Our admin team reviews all reports within 24 hours.' },
  { q: 'When can I see provider contact details?', a: 'Contact info unlocks automatically once a provider accepts your request.' },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = e => {
    e.preventDefault()
    // In a real deployment this would POST to a backend or email service
    setSent(true)
    setForm({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)',
        padding: '5rem 1.25rem 4rem', textAlign: 'center',
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <p style={{ fontSize: '.8125rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.75rem' }}>
            Get in touch
          </p>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-.04em', marginBottom: '1rem' }}>
            We'd love to hear from you
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7 }}>
            Have a question, a suggestion, or a problem? Reach out and we'll get back to you quickly.
          </p>
        </div>
      </section>

      {/* Contact grid */}
      <section style={{ padding: '5rem 1.25rem', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '3rem', alignItems: 'start' }}>

          {/* Left — info */}
          <div>
            <h2 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1.5rem' }}>Contact Info</h2>

            {[
              {
                label: 'Email',
                value: 'support@flatmatefinder.in',
                icon: <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>,
              },
              {
                label: 'Location',
                value: 'Nadiad, Gujarat, India',
                icon: <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>,
              },
              {
                label: 'Response time',
                value: 'Within 24 hours',
                icon: <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>,
              },
            ].map(c => (
              <div key={c.label} style={{ display: 'flex', gap: '.875rem', marginBottom: '1.25rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: 38, height: 38, background: 'var(--primary-light)', borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--primary)', flexShrink: 0,
                }}>
                  {c.icon}
                </div>
                <div>
                  <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '.15rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>{c.label}</p>
                  <p style={{ fontWeight: 600, fontSize: '.9375rem' }}>{c.value}</p>
                </div>
              </div>
            ))}

            <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'var(--primary-light)', borderRadius: 'var(--radius)', border: '1px solid var(--primary-mid)' }}>
              <p style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '.4rem' }}>Already have an account?</p>
              <p style={{ fontSize: '.875rem', color: 'var(--text-secondary)', marginBottom: '.875rem' }}>
                Issues with listings, bookings or your profile are resolved fastest through the in-app report system.
              </p>
              <Link to="/login" className="btn btn-primary btn-sm">Go to Dashboard</Link>
            </div>
          </div>

          {/* Right — form */}
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '1.5rem' }}>Send us a message</h2>

            {sent ? (
              <div style={{
                background: 'var(--success-light)', border: '1px solid #86efac',
                borderRadius: 'var(--radius)', padding: '1.5rem', textAlign: 'center',
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>✓</div>
                <p style={{ fontWeight: 700, color: '#166534', fontSize: '1rem', marginBottom: '.35rem' }}>Message sent!</p>
                <p style={{ fontSize: '.875rem', color: '#166534' }}>We'll get back to you within 24 hours.</p>
                <button className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }} onClick={() => setSent(false)}>
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Your Name</label>
                    <input className="form-control" name="name" value={form.name} onChange={handle} placeholder="Full name" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input className="form-control" type="email" name="email" value={form.email} onChange={handle} placeholder="you@example.com" required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select className="form-control" name="subject" value={form.subject} onChange={handle} required>
                    <option value="">Select a topic...</option>
                    <option>General question</option>
                    <option>Report a problem</option>
                    <option>Listing issue</option>
                    <option>Account help</option>
                    <option>Suggestion / feedback</option>
                    <option>Partnership</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea className="form-control" name="message" rows={5} value={form.message}
                    onChange={handle} placeholder="Describe your issue or question in detail..." required />
                </div>
                <button type="submit" className="btn btn-primary btn-full">Send Message</button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '5rem 1.25rem', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p style={{ fontSize: '.8125rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.5rem' }}>
              FAQ
            </p>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-.03em' }}>
              Frequently asked questions
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {faqs.map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--text)', color: 'rgba(255,255,255,.6)', padding: '2rem 1.25rem', textAlign: 'center' }}>
        <p style={{ fontSize: '.8125rem' }}>© {new Date().getFullYear()} FlatmateFinder · Nadiad, Gujarat</p>
      </footer>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', padding: '1.125rem 1.25rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
      }}>
        <span style={{ fontWeight: 600, fontSize: '.9375rem', color: 'var(--text)' }}>{q}</span>
        <span style={{
          width: 24, height: 24, borderRadius: '50%', background: open ? 'var(--primary)' : 'var(--bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: open ? '#fff' : 'var(--text-muted)', flexShrink: 0, marginLeft: '1rem',
          fontSize: '1rem', fontWeight: 700, transition: 'all .15s',
        }}>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 1.25rem 1.125rem', fontSize: '.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          {a}
        </div>
      )}
    </div>
  )
}
