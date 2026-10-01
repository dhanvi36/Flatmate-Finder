import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]     = useState({ name: '', email: '', password: '', role: 'seeker' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async e => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await api.post('/users/register', form)
      const { data } = await api.post('/users/login', { email: form.email, password: form.password })
      login(data.token, data.user)
      const r = data.user.role
      navigate(r === 'provider' ? '/provider' : r === 'admin' ? '/admin' : '/seeker')
    } catch (err) {
      setError(err.response?.data?.errors?.[0] || err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-card__logo">
          <div className="auth-card__logo-mark">
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7A1 1 0 003 11h1v6a1 1 0 001 1h4v-4h2v4h4a1 1 0 001-1v-6h1a1 1 0 00.707-1.707l-7-7z"/></svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)', letterSpacing:'-.02em' }}>FlatmateFinder</span>
        </div>
        <h1 className="auth-card__title">Create account</h1>
        <p className="auth-card__subtitle">Join thousands finding their perfect flatmate</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-control" name="name" value={form.name}
              onChange={handle} placeholder="Your full name" required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-control" type="email" name="email" value={form.email}
              onChange={handle} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" name="password" value={form.password}
              onChange={handle} placeholder="At least 6 characters" required minLength={6} />
          </div>
          <div className="form-group">
            <label className="form-label">I am a</label>
            <select className="form-control" name="role" value={form.role} onChange={handle}>
              <option value="seeker">Room Seeker — looking for a place</option>
              <option value="provider">Room Provider — listing a room</option>
            </select>
          </div>
          <button className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '.25rem' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign:'center', marginTop:'1.25rem', fontSize:'.875rem', color:'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'var(--primary)', fontWeight:600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
