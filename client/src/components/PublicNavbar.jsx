import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

export default function PublicNavbar() {
  const [open, setOpen] = useState(false)

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      boxShadow: '0 1px 0 var(--border)',
    }}>
      <div style={{
        maxWidth: 1160, margin: '0 auto', padding: '0 1.25rem',
        height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '.5rem', textDecoration: 'none' }}>
          <div style={{
            width: 34, height: 34, background: 'var(--primary)', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 20 20" fill="white" width="18" height="18">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7A1 1 0 003 11h1v6a1 1 0 001 1h4v-4h2v4h4a1 1 0 001-1v-6h1a1 1 0 00.707-1.707l-7-7z"/>
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--primary)', letterSpacing: '-.02em' }}>
            FlatmateFinder
          </span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '.25rem' }}
          className="pub-nav-desktop">
          {[
            { to: '/',        label: 'Home'    },
            { to: '/about',   label: 'About'   },
            { to: '/contact', label: 'Contact' },
          ].map(({ to, label }) => (
            <NavLink key={to} to={to} end style={({ isActive }) => ({
              padding: '.45rem .9rem', borderRadius: 6,
              fontSize: '.875rem', fontWeight: 500, textDecoration: 'none',
              background: isActive ? 'var(--primary-light)' : 'transparent',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              transition: 'all .15s',
            })}>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: '.625rem', alignItems: 'center' }}>
          <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </div>
    </header>
  )
}
