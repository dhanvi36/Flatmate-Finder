import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

function photoUrl(photo) {
  const raw = Array.isArray(photo) ? photo[0] : photo
  if (!raw || typeof raw !== 'string') return null
  if (raw.startsWith('/uploads/')) return raw
  return `/uploads/${raw.replace(/.*[/\\]/, '')}`
}

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
)

export default function Rooms() {
  const { user: authUser } = useAuth()
  const [rooms,   setRooms]   = useState([])
  const [profile, setProfile] = useState(null)  // null = not loaded yet
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [maxRent, setMaxRent] = useState('')
  const [gender,  setGender]  = useState('')

  useEffect(() => {
    api.get('/users/profile').then(r => setProfile(r.data.user)).catch(() => setProfile({}))
    loadRooms()

    // Re-fetch rooms whenever this tab becomes visible again
    // so occupied status is always current for every user
    const onVisible = () => { if (document.visibilityState === 'visible') loadRooms() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  const loadRooms = async (rent = '', g = '') => {
    setLoading(true); setError('')
    try {
      let res
      if (rent)    res = await api.get(`/rooms/filter/rent?maxRent=${rent}`)
      else if (g)  res = await api.get(`/rooms/filter/gender?gender=${g}`)
      else         res = await api.get('/rooms')
      // Filter out rooms owned by the current user (switched providers)
      const allRooms = res.data.rooms || []
      const filtered = allRooms.filter(r =>
        (r.provider?._id || r.provider) !== authUser?.userId
      )
      setRooms(filtered)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load rooms')
    } finally { setLoading(false) }
  }

  const search = () => loadRooms(maxRent, gender)
  const clear  = () => { setMaxRent(''); setGender(''); loadRooms() }

  // Profile completion check
  const missing = []
  if (profile !== null) {
    if (!profile?.age)        missing.push('Age')
    if (!profile?.gender)     missing.push('Gender')
    if (!profile?.occupation) missing.push('Occupation')
  }
  const profileIncomplete = profile !== null && missing.length > 0

  return (
    <div className="page">

      {/* ── Profile completion banner ─────────────────────────────────── */}
      {profileIncomplete && (
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fcd34d',
          borderLeft: '4px solid #f59e0b',
          borderRadius: '10px',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          <div>
            <p style={{ fontWeight: 700, color: '#92400e', marginBottom: '.2rem' }}>
              Complete your profile for accurate compatibility scores
            </p>
            <p style={{ fontSize: '.875rem', color: '#b45309' }}>
              Missing: <strong>{missing.join(', ')}</strong> — rooms are still visible but match scores may not reflect your preferences.
            </p>
          </div>
          <Link to="/profile" className="btn btn-sm" style={{
            background: '#f59e0b', color: '#fff', border: 'none', whiteSpace: 'nowrap'
          }}>
            Complete Profile
          </Link>
        </div>
      )}

      <div className="section-header">
        <h1 className="page-title" style={{ margin: 0 }}>Available Rooms</h1>
        <span style={{ fontSize: '.875rem', color: 'var(--text-muted)' }}>
          {rooms.length} listing{rooms.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Filters ───────────────────────────────────────────────────── */}
      <div className="filter-bar">
        <div className="filter-bar__field">
          <label className="filter-bar__label">Max Rent (₹/mo)</label>
          <input className="form-control" type="number" placeholder="e.g. 10000"
            value={maxRent}
            onChange={e => { setMaxRent(e.target.value); setGender('') }} />
        </div>
        <div className="filter-bar__field">
          <label className="filter-bar__label">Preferred Gender</label>
          <select className="form-control" value={gender}
            onChange={e => { setGender(e.target.value); setMaxRent('') }}>
            <option value="">Any gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '.5rem', alignSelf: 'flex-end' }}>
          <button className="btn btn-primary" onClick={search}>Search</button>
          <button className="btn btn-ghost"   onClick={clear}>Clear</button>
        </div>
      </div>

      {error   && <div className="alert alert-error">{error}</div>}
      {loading && <div className="spinner-wrap"><div className="spinner" /></div>}

      {!loading && rooms.length === 0 && !error && (
        <div className="empty-state">
          <div className="empty-state__icon"><HomeIcon /></div>
          <p className="empty-state__title">No rooms found</p>
          <p className="empty-state__desc">Try adjusting your filters</p>
        </div>
      )}

      {/* ── Room grid ─────────────────────────────────────────────────── */}
      <div className="card-grid">
        {rooms.map(room => {
          const isOccupied = room.status === 'occupied'
          return (
            <div className="room-card" key={room._id} style={{
              opacity:        isOccupied ? 0.55 : 1,
              filter:         isOccupied ? 'grayscale(60%)' : 'none',
              pointerEvents:  isOccupied ? 'none' : 'auto',
              position:       'relative',
            }}>
              {/* Occupied overlay — like Swiggy's "closed" banner */}
              {isOccupied && (
                <div style={{
                  position:      'absolute', inset: 0, zIndex: 10,
                  display:       'flex', flexDirection: 'column',
                  alignItems:    'center', justifyContent: 'center',
                  background:    'rgba(0,0,0,0.45)',
                  borderRadius:  'var(--radius-lg)',
                }}>
                  <div style={{
                    background:    '#111827', color: '#fff',
                    padding:       '.45rem 1rem', borderRadius: 999,
                    fontSize:      '.8125rem', fontWeight: 700,
                    letterSpacing: '.04em', textTransform: 'uppercase',
                  }}>
                    Fully Occupied
                  </div>
                  <p style={{ color:'#e5e7eb', fontSize:'.75rem', marginTop:'.4rem' }}>
                    No vacancies available
                  </p>
                </div>
              )}

              {room.photos?.length > 0 && photoUrl(room.photos[0]) ? (
                <img className="room-card__img" src={photoUrl(room.photos[0])} alt={room.title}
                  onError={e => e.target.style.display = 'none'} />
              ) : (
                <div className="room-card__img-placeholder"><HomeIcon /></div>
              )}
              <div className="room-card__body">
                <p className="room-card__title">{room.title}</p>
                <p className="room-card__location">
                  {room.location?.area ? `${room.location.area}, ` : ''}{room.location?.city}
                </p>
                <p className="room-card__rent">₹{room.rent?.toLocaleString()}<span>/mo</span></p>
                <p style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginTop: '.3rem' }}>
                  by {room.provider?.name}
                </p>
              </div>
              <div className="room-card__footer">
                <span className={`badge badge-${isOccupied ? 'red' : 'green'}`}>
                  {isOccupied ? 'occupied' : 'available'}
                </span>
                {!isOccupied && (
                  <Link to={`/seeker/rooms/${room._id}`} className="btn btn-primary btn-sm">
                    View Details
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
