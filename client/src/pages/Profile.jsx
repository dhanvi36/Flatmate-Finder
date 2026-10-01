import { useState, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

// ── Small SVG icons ──────────────────────────────────────────────────────────
const icons = {
  user:     <svg viewBox="0 0 20 20" fill="currentColor" className="profile-sidebar__nav-icon"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg>,
  request:  <svg viewBox="0 0 20 20" fill="currentColor" className="profile-sidebar__nav-icon"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/></svg>,
  booking:  <svg viewBox="0 0 20 20" fill="currentColor" className="profile-sidebar__nav-icon"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>,
  favorite: <svg viewBox="0 0 20 20" fill="currentColor" className="profile-sidebar__nav-icon"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/></svg>,
  review:   <svg viewBox="0 0 20 20" fill="currentColor" className="profile-sidebar__nav-icon"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>,
  report:   <svg viewBox="0 0 20 20" fill="currentColor" className="profile-sidebar__nav-icon"><path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd"/></svg>,
  lock:     <svg viewBox="0 0 20 20" fill="currentColor" className="profile-sidebar__nav-icon"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>,
}

const LIFESTYLE_OPTS = {
  sleepSchedule:     ['early_bird','night_owl','flexible'],
  dietaryPreference: ['vegetarian','non_vegetarian','vegan','eggetarian','any'],
  guestPolicy:       ['no_guests','weekends_only','anytime'],
  smokingHabit:      ['non_smoker','smoker','outside_only'],
}

// ── Shared status badge helper ───────────────────────────────────────────────
const STATUS = { pending:'badge-yellow', accepted:'badge-green', rejected:'badge-red', active:'badge-green', completed:'badge-blue', cancelled:'badge-red' }
const Badge = ({ s }) => <span className={`badge ${STATUS[s]||'badge-gray'}`}>{s}</span>

function photoUrl(photo) {
  const raw = Array.isArray(photo) ? photo[0] : photo
  if (!raw || typeof raw !== 'string') return null
  if (raw.startsWith('/uploads/')) return raw
  return `/uploads/${raw.replace(/.*[/\\]/, '')}`
}

// ── Stars ────────────────────────────────────────────────────────────────────
function Stars({ value, onChange }) {
  return (
    <div className="stars" style={{ fontSize: '1.4rem', cursor: onChange ? 'pointer' : 'default' }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} className={n <= value ? 'star-filled' : 'star-empty'} onClick={() => onChange?.(n)}>★</span>
      ))}
    </div>
  )
}

// ── SECTION: My Requests ─────────────────────────────────────────────────────
function MyRequests() {
  const [requests, setRequests] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [contact,  setContact]  = useState({})
  const [msg,      setMsg]      = useState('')

  const load = () => {
    setLoading(true)
    api.get('/requests/my-requests')
      .then(r => setRequests(r.data.requests || []))
      .catch(() => setMsg('Failed to load requests'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const unlock = async id => {
    try {
      const { data } = await api.get(`/requests/${id}/contact-info`)
      setContact(c => ({ ...c, [id]: data }))
    } catch(e) { alert(e.response?.data?.message || 'Could not unlock') }
  }

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>

  return (
    <div>
      {msg && <div className="alert alert-error">{msg}</div>}
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'1rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={load}>
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/></svg>
          Refresh
        </button>
      </div>
      {!requests.length ? (
        <div className="empty-state">
          <div className="empty-state__icon">{icons.request}</div>
          <p className="empty-state__title">No requests yet</p>
          <p className="empty-state__desc">Browse rooms and send a request to a provider</p>
        </div>
      ) : requests.map(req => (
        <div className="list-item" key={req._id}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem' }}>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:700, fontSize:'.975rem' }}>{req.room?.title || 'Room'}</p>
              <p style={{ fontSize:'.8125rem', color:'var(--text-muted)', margin:'.2rem 0 .5rem' }}>
                {req.room?.location?.city} &nbsp;·&nbsp; ₹{req.room?.rent?.toLocaleString()}/mo &nbsp;·&nbsp; To: {req.provider?.name}
              </p>
              {req.message && <p style={{ fontSize:'.875rem', color:'var(--text-secondary)', fontStyle:'italic' }}>"{req.message}"</p>}
            </div>
            <div style={{ textAlign:'right', flexShrink:0 }}>
              <Badge s={req.status} />
              {req.compatibilityScore?.score != null && (
                <p style={{ fontSize:'.75rem', color:'var(--success)', fontWeight:600, marginTop:'.35rem' }}>
                  {req.compatibilityScore.score}% match
                </p>
              )}
            </div>
          </div>
          {req.status === 'accepted' && (
            <div style={{ marginTop:'.875rem', paddingTop:'.875rem', borderTop:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:'.625rem' }}>
              {/* Booking auto-created notice */}
              <div style={{ background:'var(--success-light)', border:'1px solid #86efac', borderRadius:6, padding:'.6rem .875rem', fontSize:'.875rem', color:'#166534', fontWeight:500 }}>
                Booking created automatically — check <strong>My Bookings</strong> tab
              </div>
              {/* Contact unlock */}
              {contact[req._id] ? (
                <div style={{ background:'var(--primary-light)', borderRadius:6, padding:'.75rem 1rem', fontSize:'.875rem' }}>
                  <strong>Provider Contact</strong>
                  <p style={{ marginTop:'.3rem' }}>{contact[req._id].provider?.name} · {contact[req._id].provider?.email}
                    {contact[req._id].provider?.phone && ` · ${contact[req._id].provider.phone}`}
                  </p>
                </div>
              ) : (
                <button className="btn btn-outline btn-sm" onClick={() => unlock(req._id)}>View Provider Contact</button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── SECTION: My Bookings ─────────────────────────────────────────────────────
function MyBookings() {
  const [bookings,    setBookings]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [msg,         setMsg]         = useState({ type:'', text:'' })
  const [reviewForm,  setReviewForm]  = useState(null) // { bookingId, room, provider, rating, comment }
  const [reviewedIds, setReviewedIds] = useState(new Set())

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    const [bkRes, rvRes] = await Promise.all([
      api.get('/bookings/my-bookings').catch(() => ({ data: { bookings: [] } })),
      api.get('/reviews/my-reviews').catch(() => ({ data: { reviews: [] } })),
    ])
    setBookings(bkRes.data.bookings || [])
    // Track which room IDs already have a review
    const reviewed = new Set((rvRes.data.reviews || []).map(r => r.room?._id || r.room))
    setReviewedIds(reviewed)
    setLoading(false)
  }

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status })
      setBookings(bs => bs.map(b => b._id === id ? { ...b, status } : b))
      setMsg({ type:'success', text:`Booking marked as ${status}.` })
      setTimeout(() => setMsg({}), 3000)
    } catch(e) { setMsg({ type:'error', text: e.response?.data?.message || 'Failed' }) }
  }

  const submitReview = async (e) => {
    e.preventDefault()
    try {
      await api.post('/reviews', {
        room:     reviewForm.room,
        provider: reviewForm.provider,
        rating:   reviewForm.rating,
        comment:  reviewForm.comment,
      })
      setMsg({ type:'success', text:'Review submitted!' })
      setReviewedIds(s => new Set([...s, reviewForm.room]))
      setReviewForm(null)
      setTimeout(() => setMsg({}), 3000)
    } catch(e) { setMsg({ type:'error', text: e.response?.data?.message || 'Failed to submit review' }) }
  }

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>
  if (!bookings.length) return (
    <div className="empty-state">
      <div className="empty-state__icon">{icons.booking}</div>
      <p className="empty-state__title">No bookings yet</p>
      <p className="empty-state__desc">Bookings appear here automatically once a provider accepts your request</p>
    </div>
  )

  return (
    <div>
      {msg.text && <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>{msg.text}</div>}

      {bookings.map(b => {
        const roomId     = b.room?._id || b.room
        const providerId = b.provider?._id || b.provider
        const alreadyReviewed = reviewedIds.has(roomId)
        const canReview  = b.status === 'completed' && !alreadyReviewed
        const isWriting  = reviewForm?.bookingId === b._id

        return (
          <div className="list-item" key={b._id}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <p style={{ fontWeight:700 }}>{b.room?.title}</p>
                <p style={{ fontSize:'.8125rem', color:'var(--text-muted)', margin:'.2rem 0 .4rem' }}>
                  {b.room?.location?.city} &nbsp;·&nbsp; ₹{b.room?.rent?.toLocaleString()}/mo &nbsp;·&nbsp; {b.provider?.name}
                </p>
                <p style={{ fontSize:'.8125rem', color:'var(--text-muted)' }}>
                  From {new Date(b.startDate).toLocaleDateString()}
                  {b.endDate ? ` – ${new Date(b.endDate).toLocaleDateString()}` : ''}
                </p>
              </div>
              <Badge s={b.status} />
            </div>

            {/* Action buttons */}
            <div style={{ display:'flex', gap:'.5rem', marginTop:'.875rem', flexWrap:'wrap' }}>
              {b.status === 'active' && (
                <>
                  <button className="btn btn-outline btn-sm" onClick={() => updateStatus(b._id, 'completed')}>
                    Mark Completed
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => updateStatus(b._id, 'cancelled')}>
                    Cancel
                  </button>
                </>
              )}
              {canReview && (
                <button className="btn btn-primary btn-sm"
                  onClick={() => setReviewForm({ bookingId: b._id, room: roomId, provider: providerId, rating: 5, comment: '' })}>
                  Write a Review
                </button>
              )}
              {alreadyReviewed && b.status === 'completed' && (
                <span style={{ fontSize:'.8125rem', color:'var(--success)', fontWeight:600, alignSelf:'center' }}>
                  ✓ Reviewed
                </span>
              )}
            </div>

            {/* Inline review form */}
            {isWriting && (
              <form onSubmit={submitReview} style={{
                marginTop:'1rem', padding:'1rem', background:'var(--bg)',
                borderRadius:8, border:'1px solid var(--border)'
              }}>
                <p style={{ fontWeight:700, marginBottom:'.75rem' }}>Review for {b.room?.title}</p>
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <Stars value={reviewForm.rating}
                    onChange={r => setReviewForm(f => ({ ...f, rating: r }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Comment</label>
                  <textarea className="form-control" rows={3}
                    value={reviewForm.comment}
                    onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                    placeholder="Share your experience..." />
                </div>
                <div style={{ display:'flex', gap:'.5rem' }}>
                  <button type="submit" className="btn btn-primary btn-sm">Submit Review</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setReviewForm(null)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── SECTION: My Favorites ────────────────────────────────────────────────────
function MyFavorites() {
  const navigate = useNavigate()
  const [favs,    setFavs]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/favorites')
      .then(r => setFavs(r.data.favorites || []))
      .finally(() => setLoading(false))
  }, [])

  const remove = async roomId => {
    await api.delete(`/favorites/${roomId}`)
    setFavs(fs => fs.filter(f => (f.room?._id || f.room) !== roomId))
  }

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>
  if (!favs.length) return (
    <div className="empty-state">
      <div className="empty-state__icon">{icons.favorite}</div>
      <p className="empty-state__title">No favourites saved</p>
      <p className="empty-state__desc">Browse rooms and save ones you like</p>
    </div>
  )

  return (
    <div className="card-grid" style={{ gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))' }}>
      {favs.map(fav => {
        const room = fav.room || fav
        return (
          <div className="room-card" key={fav._id || room._id}>
            {room.photos?.length > 0 && photoUrl(room.photos[0])
              ? <img className="room-card__img" src={photoUrl(room.photos[0])} alt={room.title} onError={e => e.target.style.display='none'} />
              : <div className="room-card__img-placeholder" style={{ height:140 }}/>}
            <div className="room-card__body" style={{ padding:'.75rem 1rem' }}>
              <p className="room-card__title" style={{ fontSize:'.9rem' }}>{room.title}</p>
              <p className="room-card__location">{room.location?.city}</p>
              <p className="room-card__rent" style={{ fontSize:'1rem' }}>₹{room.rent?.toLocaleString()}<span>/mo</span></p>
            </div>
            <div className="room-card__footer">
              <button className="btn btn-primary btn-sm" onClick={() => navigate(`/seeker/rooms/${room._id}`)}>View</button>
              <button className="btn btn-ghost btn-sm" style={{ color:'var(--danger)' }} onClick={() => remove(room._id)}>Remove</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── SECTION: My Reviews ──────────────────────────────────────────────────────
function MyReviews() {
  const [reviews,  setReviews]  = useState([])
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form,     setForm]     = useState({ room:'', provider:'', rating:5, comment:'' })
  const [msg,      setMsg]      = useState({ type:'', text:'' })

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    const [rv, bk] = await Promise.all([
      api.get('/reviews/my-reviews').catch(() => ({ data: { reviews: [] } })),
      api.get('/bookings/my-bookings').catch(() => ({ data: { bookings: [] } })),
    ])
    setReviews(rv.data.reviews || [])
    setBookings((bk.data.bookings || []).filter(b => b.status === 'completed'))
    setLoading(false)
  }

  const submit = async e => {
    e.preventDefault()
    try {
      await api.post('/reviews', form)
      setMsg({ type:'success', text:'Review submitted!' })
      setShowForm(false); setForm({ room:'', provider:'', rating:5, comment:'' }); loadAll()
    } catch(err) { setMsg({ type:'error', text: err.response?.data?.message || 'Failed' }) }
    setTimeout(() => setMsg({}), 4000)
  }

  const pickBooking = e => {
    const b = bookings.find(x => x._id === e.target.value)
    if (b) setForm(f => ({ ...f, room: b.room?._id || b.room, provider: b.provider?._id || b.provider }))
  }

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>

  return (
    <div>
      {msg.text && <div className={`alert alert-${msg.type==='error'?'error':'success'}`}>{msg.text}</div>}
      {bookings.length > 0 && (
        <div style={{ marginBottom:'1rem' }}>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(s => !s)}>
            {showForm ? 'Cancel' : 'Write a Review'}
          </button>
        </div>
      )}
      {showForm && (
        <div className="card" style={{ marginBottom:'1.25rem' }}>
          <p style={{ fontWeight:700, marginBottom:'.875rem' }}>New Review</p>
          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Booking</label>
              <select className="form-control" onChange={pickBooking} defaultValue="">
                <option value="" disabled>Select a completed booking...</option>
                {bookings.map(b => <option key={b._id} value={b._id}>{b.room?.title} — {b.provider?.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Rating</label>
              <Stars value={form.rating} onChange={r => setForm(f => ({ ...f, rating:r }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Comment</label>
              <textarea className="form-control" rows={3} value={form.comment}
                onChange={e => setForm(f => ({ ...f, comment:e.target.value }))} placeholder="Share your experience..." />
            </div>
            <button className="btn btn-primary" disabled={!form.room}>Submit</button>
          </form>
        </div>
      )}
      {!reviews.length && (
        <div className="empty-state">
          <div className="empty-state__icon">{icons.review}</div>
          <p className="empty-state__title">No reviews yet</p>
          <p className="empty-state__desc">Complete a booking to leave a review</p>
        </div>
      )}
      {reviews.map(r => (
        <div className="list-item" key={r._id}>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <div>
              <p style={{ fontWeight:700 }}>{r.room?.title}</p>
              <p style={{ fontSize:'.8125rem', color:'var(--text-muted)', marginBottom:'.4rem' }}>{r.provider?.name}</p>
              {r.comment && <p style={{ fontSize:'.875rem', color:'var(--text-secondary)', fontStyle:'italic' }}>"{r.comment}"</p>}
            </div>
            <Stars value={r.rating} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── SECTION: Report ──────────────────────────────────────────────────────────
const REASONS = ['fake_listing','fake_user','scam','inappropriate_content','spam','other']
function MyReport() {
  const [form,      setForm]      = useState({ reportedUser:'', reportedRoom:'', reason:'', description:'' })
  const [myReports, setMyReports] = useState([])
  const [target,    setTarget]    = useState('user')
  const [loading,   setLoading]   = useState(true)
  const [msg,       setMsg]       = useState({ type:'', text:'' })

  useEffect(() => {
    api.get('/reports/my-reports')
      .then(r => setMyReports(r.data.reports || []))
      .finally(() => setLoading(false))
  }, [])

  const submit = async e => {
    e.preventDefault()
    const payload = { reason: form.reason, description: form.description,
      ...(target === 'user' ? { reportedUser: form.reportedUser } : { reportedRoom: form.reportedRoom }) }
    try {
      await api.post('/reports', payload)
      setMsg({ type:'success', text:'Report submitted successfully.' })
      setForm({ reportedUser:'', reportedRoom:'', reason:'', description:'' })
      const r = await api.get('/reports/my-reports')
      setMyReports(r.data.reports || [])
    } catch(err) { setMsg({ type:'error', text: err.response?.data?.message || 'Failed' }) }
    setTimeout(() => setMsg({}), 5000)
  }

  const RBADGE = { pending:'badge-yellow', reviewed:'badge-blue', resolved:'badge-green', dismissed:'badge-gray' }

  return (
    <div>
      {msg.text && <div className={`alert alert-${msg.type==='error'?'error':'success'}`}>{msg.text}</div>}
      <div className="card" style={{ marginBottom:'1.5rem', maxWidth:540 }}>
        <p style={{ fontWeight:700, marginBottom:'1rem' }}>Submit a Report</p>
        <div style={{ display:'flex', gap:'.5rem', marginBottom:'1rem' }}>
          {['user','room'].map(t => (
            <button key={t} className={`btn btn-sm ${target===t?'btn-primary':'btn-outline'}`} onClick={() => setTarget(t)}>
              {t === 'user' ? 'Report a User' : 'Report a Room'}
            </button>
          ))}
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">{target === 'user' ? 'User Email or ID' : 'Room ID'}</label>
            <input className="form-control"
              name={target === 'user' ? 'reportedUser' : 'reportedRoom'}
              value={target === 'user' ? form.reportedUser : form.reportedRoom}
              onChange={e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))}
              placeholder={target === 'user' ? 'Enter email (e.g. user@example.com) or user ID' : 'Paste the Room ID'} required />
          </div>
          <div className="form-group">
            <label className="form-label">Reason</label>
            <select className="form-control" value={form.reason} onChange={e => setForm(f => ({ ...f, reason:e.target.value }))} required>
              <option value="">Select reason...</option>
              {REASONS.map(r => <option key={r} value={r}>{r.replace(/_/g,' ')}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows={3} value={form.description}
              onChange={e => setForm(f => ({ ...f, description:e.target.value }))} placeholder="Describe the issue..." />
          </div>
          <button className="btn btn-danger">Submit Report</button>
        </form>
      </div>

      {!loading && myReports.length > 0 && (
        <>
          <p style={{ fontWeight:700, marginBottom:'.875rem' }}>My Submitted Reports</p>
          {myReports.map(r => (
            <div className="list-item" key={r._id}>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <div>
                  <p style={{ fontWeight:600, textTransform:'capitalize' }}>{r.reason?.replace(/_/g,' ')}</p>
                  <p style={{ fontSize:'.8125rem', color:'var(--text-muted)', marginTop:'.2rem' }}>
                    {r.reportedUser ? `User: ${r.reportedUser?.name||r.reportedUser}` : `Room: ${r.reportedRoom?.title||r.reportedRoom}`}
                  </p>
                </div>
                <span className={`badge ${RBADGE[r.status]||'badge-gray'}`}>{r.status}</span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

// ── SECTION: Provider — My Listings (inline) ────────────────────────────────
function ProviderMyRooms() {
  const navigate = useNavigate()
  const [rooms,   setRooms]   = useState([])
  const [loading, setLoading] = useState(true)
  const [msg,     setMsg]     = useState('')

  useEffect(() => {
    api.get('/users/my-rooms')
      .then(r => setRooms(r.data.rooms || []))
      .finally(() => setLoading(false))
  }, [])

  const deleteRoom = async id => {
    if (!confirm('Delete this room?')) return
    try {
      await api.delete(`/rooms/${id}`)
      setRooms(rs => rs.filter(r => r._id !== id))
      setMsg('Room deleted.')
      setTimeout(() => setMsg(''), 3000)
    } catch(e) { setMsg(e.response?.data?.message || 'Failed') }
  }

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>

  return (
    <div>
      {msg && <div className="alert alert-success">{msg}</div>}
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'1rem' }}>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/provider/rooms/new')}>
          + Add New Room
        </button>
      </div>
      {!rooms.length ? (
        <div className="empty-state">
          <div className="empty-state__icon">{icons.booking}</div>
          <p className="empty-state__title">No listings yet</p>
          <p className="empty-state__desc">Create your first room listing</p>
        </div>
      ) : rooms.map(room => {
        const isOccupied = room.status === 'occupied'
        return (
          <div className="list-item" key={room._id} style={{ opacity: isOccupied ? 0.65 : 1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <p style={{ fontWeight:700 }}>{room.title}</p>
                <p style={{ fontSize:'.8125rem', color:'var(--text-muted)', margin:'.2rem 0 .4rem' }}>
                  {room.location?.area ? `${room.location.area}, ` : ''}{room.location?.city}
                  &nbsp;·&nbsp; ₹{room.rent?.toLocaleString()}/mo
                </p>
              </div>
              <div style={{ display:'flex', gap:'.5rem', flexShrink:0, alignItems:'center' }}>
                <span className={`badge badge-${isOccupied ? 'red' : 'green'}`}>{room.status}</span>
                <span className={`badge badge-${room.listingStatus === 'active' ? 'blue' : 'gray'}`}>{room.listingStatus}</span>
              </div>
            </div>
            <div style={{ display:'flex', gap:'.5rem', marginTop:'.75rem' }}>
              <button className="btn btn-outline btn-sm" onClick={() => navigate(`/provider/rooms/${room._id}/edit`)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => deleteRoom(room._id)}>Delete</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── SECTION: Provider — Received Requests (inline) ──────────────────────────
function ProviderRequests() {
  const [requests, setRequests] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [msg,      setMsg]      = useState({ type:'', text:'' })
  const [contact,  setContact]  = useState({})

  useEffect(() => {
    api.get('/requests/received')
      .then(r => setRequests(r.data.requests || []))
      .finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/requests/${id}/status`, { status })
      setRequests(rs => rs.map(r => r._id === id ? { ...r, status } : r))
      setMsg({ type:'success', text:`Request ${status}.` })
      setTimeout(() => setMsg({}), 3000)
    } catch(e) { setMsg({ type:'error', text: e.response?.data?.message || 'Failed' }) }
  }

  const unlockContact = async id => {
    try {
      const { data } = await api.get(`/requests/${id}/contact-info`)
      setContact(c => ({ ...c, [id]: data }))
    } catch(e) { alert(e.response?.data?.message || 'Could not unlock') }
  }

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>
  if (!requests.length) return (
    <div className="empty-state">
      <div className="empty-state__icon">{icons.request}</div>
      <p className="empty-state__title">No requests received</p>
      <p className="empty-state__desc">Requests from seekers will appear here</p>
    </div>
  )

  return (
    <div>
      {msg.text && <div className={`alert alert-${msg.type==='error'?'error':'success'}`}>{msg.text}</div>}
      {requests.map(req => (
        <div className="list-item" key={req._id}>
          <div style={{ display:'flex', justifyContent:'space-between', gap:'1rem' }}>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:700 }}>{req.room?.title}</p>
              <p style={{ fontSize:'.8125rem', color:'var(--text-muted)', margin:'.2rem 0 .3rem' }}>
                From: <strong>{req.seeker?.name}</strong> · {req.seeker?.email}
              </p>
              {req.seeker?.occupation && <p style={{ fontSize:'.8125rem', color:'var(--text-muted)' }}>{req.seeker.occupation}</p>}
              {req.message && <p style={{ fontSize:'.875rem', fontStyle:'italic', color:'var(--text-secondary)', marginTop:'.3rem' }}>"{req.message}"</p>}
            </div>
            <div style={{ textAlign:'right', flexShrink:0 }}>
              <Badge s={req.status} />
              {req.compatibilityScore?.score != null && (
                <p style={{ fontSize:'.75rem', color:'var(--success)', fontWeight:600, marginTop:'.3rem' }}>
                  {req.compatibilityScore.score}% match
                </p>
              )}
            </div>
          </div>

          <div style={{ display:'flex', gap:'.5rem', marginTop:'.75rem', flexWrap:'wrap' }}>
            {req.status === 'pending' && (
              <>
                <button className="btn btn-success btn-sm" onClick={() => updateStatus(req._id,'accepted')}>Accept</button>
                <button className="btn btn-danger btn-sm"  onClick={() => updateStatus(req._id,'rejected')}>Reject</button>
              </>
            )}
            {req.status === 'accepted' && (
              contact[req._id] ? (
                <div style={{ background:'var(--primary-light)', borderRadius:6, padding:'.5rem .875rem', fontSize:'.85rem' }}>
                  {contact[req._id].seeker?.name} · {contact[req._id].seeker?.email}
                  {contact[req._id].seeker?.phone && ` · ${contact[req._id].seeker.phone}`}
                </div>
              ) : (
                <button className="btn btn-outline btn-sm" onClick={() => unlockContact(req._id)}>View Contact</button>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── SECTION: Provider — Bookings (inline) ───────────────────────────────────
function ProviderBookingsInline() {
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [msg,      setMsg]      = useState({ type:'', text:'' })

  useEffect(() => {
    api.get('/bookings/provider-bookings')
      .then(r => setBookings(r.data.bookings || []))
      .finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status })
      setBookings(bs => bs.map(b => b._id === id ? { ...b, status } : b))
      setMsg({ type:'success', text:`Booking ${status}.` })
      setTimeout(() => setMsg({}), 3000)
    } catch(e) { setMsg({ type:'error', text: e.response?.data?.message || 'Failed' }) }
  }

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>
  if (!bookings.length) return (
    <div className="empty-state">
      <div className="empty-state__icon">{icons.booking}</div>
      <p className="empty-state__title">No bookings yet</p>
    </div>
  )

  return (
    <div>
      {msg.text && <div className={`alert alert-${msg.type==='error'?'error':'success'}`}>{msg.text}</div>}
      {bookings.map(b => (
        <div className="list-item" key={b._id}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <p style={{ fontWeight:700 }}>{b.room?.title}</p>
              <p style={{ fontSize:'.8125rem', color:'var(--text-muted)', margin:'.2rem 0 .3rem' }}>
                Seeker: <strong>{b.seeker?.name}</strong> · {b.seeker?.email}
              </p>
              <p style={{ fontSize:'.8125rem', color:'var(--text-muted)' }}>
                From {new Date(b.startDate).toLocaleDateString()}
              </p>
            </div>
            <Badge s={b.status} />
          </div>
          {b.status === 'active' && (
            <div style={{ display:'flex', gap:'.5rem', marginTop:'.75rem' }}>
              <button className="btn btn-outline btn-sm" onClick={() => updateStatus(b._id,'completed')}>Mark Completed</button>
              <button className="btn btn-danger btn-sm"  onClick={() => updateStatus(b._id,'cancelled')}>Cancel</button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}


function SwitchRole({ profile, onSwitched }) {
  const [loading, setLoading] = useState(false)
  const [msg,     setMsg]     = useState({ type:'', text:'' })
  const [confirm, setConfirm] = useState(false)
  const { login }         = useAuth()

  const currentRole = profile?.role
  const targetRole  = currentRole === 'seeker' ? 'provider' : 'seeker'

  const doSwitch = async () => {
    setLoading(true)
    try {
      const { data } = await api.put('/users/switch-role')
      // Store the NEW token (which has the updated role in its payload)
      login(data.token, data.user)
      setMsg({ type:'success', text:`Switched to ${data.user.role}! Redirecting...` })
      // Immediate hard reload — new token is already in localStorage
      window.location.href = data.user.role === 'provider' ? '/provider' : '/seeker'
    } catch(err) {
      setMsg({ type:'error', text: err.response?.data?.message || 'Switch failed' })
      setLoading(false)
      setConfirm(false)
    }
  }

  const warnings = {
    provider: [
      'Your active room listings will remain but you will lose provider dashboard access.',
      'Pending received requests will stay in the database.',
      'You can switch back to provider any time.',
    ],
    seeker: [
      'Your sent requests and bookings as a seeker will remain.',
      'You will gain access to create room listings.',
      'You can switch back to seeker any time.',
    ],
  }

  return (
    <div>
      {msg.text && <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>{msg.text}</div>}

      <div className="card" style={{ border:'2px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1rem' }}>
          <div style={{
            width:44, height:44, borderRadius:'50%',
            background: currentRole === 'seeker' ? 'var(--primary-light)' : '#f0fdf4',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
          }}>
            <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22"
              style={{ color: currentRole === 'seeker' ? 'var(--primary)' : 'var(--success)' }}>
              {currentRole === 'seeker'
                ? <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                : <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7A1 1 0 003 11h1v6a1 1 0 001 1h4v-4h2v4h4a1 1 0 001-1v-6h1a1 1 0 00.707-1.707l-7-7z"/>}
            </svg>
          </div>
          <div>
            <p style={{ fontWeight:700 }}>
              Switch to {targetRole === 'provider' ? 'Provider' : 'Seeker'}
            </p>
            <p style={{ fontSize:'.875rem', color:'var(--text-muted)' }}>
              {currentRole === 'seeker'
                ? 'You found a flat and want to list a room for a flatmate?'
                : 'Want to look for a room or flatmate yourself?'}
            </p>
          </div>
        </div>

        {!confirm ? (
          <button className="btn btn-outline btn-sm" onClick={() => setConfirm(true)}>
            Switch to {targetRole} account
          </button>
        ) : (
          <div style={{ background:'var(--bg)', borderRadius:8, padding:'1rem', border:'1px solid var(--border)' }}>
            <p style={{ fontWeight:700, marginBottom:'.5rem', color:'var(--warning)' }}>
              Before you switch — please note:
            </p>
            <ul style={{ paddingLeft:'1.25rem', marginBottom:'.875rem' }}>
              {warnings[currentRole].map((w, i) => (
                <li key={i} style={{ fontSize:'.875rem', color:'var(--text-secondary)', marginBottom:'.3rem' }}>{w}</li>
              ))}
            </ul>
            <div style={{ display:'flex', gap:'.625rem' }}>
              <button className="btn btn-primary btn-sm" onClick={doSwitch} disabled={loading}>
                {loading ? 'Switching...' : `Yes, switch to ${targetRole}`}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirm(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
function EditProfile({ profile, onSaved }) {
  const [form, setForm] = useState({
    name:        profile.name        || '',
    age:         profile.age         || '',
    gender:      profile.gender      || '',
    occupation:  profile.occupation  || '',
    preferences: profile.preferences || '',
    phone:       profile.phone       || '',
    lifestyle: {
      sleepSchedule:     profile.lifestyle?.sleepSchedule     || '',
      cleanlinessLevel:  profile.lifestyle?.cleanlinessLevel  || 3,
      dietaryPreference: profile.lifestyle?.dietaryPreference || '',
      guestPolicy:       profile.lifestyle?.guestPolicy       || '',
      smokingHabit:      profile.lifestyle?.smokingHabit      || '',
      petFriendly:       profile.lifestyle?.petFriendly       ?? false,
    }
  })
  const [msg, setMsg] = useState({ type:'', text:'' })

  const field  = e => setForm(f => ({ ...f, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const lsField= e => setForm(f => ({ ...f, lifestyle: { ...f.lifestyle, [e.target.name]: e.target.type==='checkbox'?e.target.checked: e.target.type==='range'?Number(e.target.value):e.target.value }}))

  const save = async e => {
    e.preventDefault()
    try {
      const { data } = await api.put('/users/profile', form)
      onSaved(data.user)
      setMsg({ type:'success', text:'Profile updated!' })
    } catch(err) { setMsg({ type:'error', text: err.response?.data?.message || 'Update failed' }) }
    setTimeout(() => setMsg({}), 3000)
  }

  return (
    <form onSubmit={save}>
      {msg.text && <div className={`alert alert-${msg.type==='error'?'error':'success'}`}>{msg.text}</div>}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Name</label>
          <input className="form-control" name="name" value={form.name} onChange={field} required />
        </div>
        <div className="form-group">
          <label className="form-label">Age</label>
          <input className="form-control" type="number" name="age" value={form.age} onChange={field} min={18} max={100} />
        </div>
        <div className="form-group">
          <label className="form-label">Gender</label>
          <select className="form-control" name="gender" value={form.gender} onChange={field}>
            <option value="">Select...</option>
            {['male','female','other','prefer_not_to_say'].map(g => <option key={g} value={g}>{g.replace(/_/g,' ')}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Occupation</label>
          <input className="form-control" name="occupation" value={form.occupation} onChange={field} />
        </div>
        <div className="form-group">
          <label className="form-label">Phone</label>
          <input className="form-control" name="phone" value={form.phone} onChange={field} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Preferences</label>
        <textarea className="form-control" name="preferences" value={form.preferences} onChange={field} rows={2} />
      </div>

      <p style={{ fontWeight:700, margin:'1rem 0 .75rem', fontSize:'.925rem' }}>Lifestyle</p>
      <div className="form-row">
        {Object.entries(LIFESTYLE_OPTS).map(([key, opts]) => (
          <div className="form-group" key={key}>
            <label className="form-label">{key.replace(/([A-Z])/g,' $1').trim()}</label>
            <select className="form-control" name={key} value={form.lifestyle[key]} onChange={lsField}>
              <option value="">Select...</option>
              {opts.map(o => <option key={o} value={o}>{o.replace(/_/g,' ')}</option>)}
            </select>
          </div>
        ))}
        <div className="form-group">
          <label className="form-label">Cleanliness Level: {form.lifestyle.cleanlinessLevel}/5</label>
          <input type="range" min={1} max={5} name="cleanlinessLevel"
            value={form.lifestyle.cleanlinessLevel} onChange={lsField} style={{ width:'100%' }} />
        </div>
        <div className="form-group" style={{ flexDirection:'row', alignItems:'center', gap:'.75rem' }}>
          <input type="checkbox" id="pf" name="petFriendly" checked={form.lifestyle.petFriendly} onChange={lsField} />
          <label htmlFor="pf" className="form-label" style={{ margin:0 }}>Pet Friendly</label>
        </div>
      </div>
      <button type="submit" className="btn btn-primary">Save Changes</button>
    </form>
  )
}

// ── SECTION: Change Password ──────────────────────────────────────────────────
function ChangePassword() {
  const [form, setForm] = useState({ currentPassword:'', newPassword:'' })
  const [msg,  setMsg]  = useState({ type:'', text:'' })

  const submit = async e => {
    e.preventDefault()
    try {
      await api.put('/users/change-password', form)
      setMsg({ type:'success', text:'Password changed successfully!' })
      setForm({ currentPassword:'', newPassword:'' })
    } catch(err) { setMsg({ type:'error', text: err.response?.data?.message || 'Failed' }) }
    setTimeout(() => setMsg({}), 4000)
  }

  return (
    <form onSubmit={submit} style={{ maxWidth:400 }}>
      {msg.text && <div className={`alert alert-${msg.type==='error'?'error':'success'}`}>{msg.text}</div>}
      <div className="form-group">
        <label className="form-label">Current Password</label>
        <input className="form-control" type="password" value={form.currentPassword}
          onChange={e => setForm(f => ({ ...f, currentPassword:e.target.value }))} required />
      </div>
      <div className="form-group">
        <label className="form-label">New Password</label>
        <input className="form-control" type="password" value={form.newPassword}
          onChange={e => setForm(f => ({ ...f, newPassword:e.target.value }))} required minLength={6} />
      </div>
      <button type="submit" className="btn btn-primary">Update Password</button>
    </form>
  )
}

// ── MAIN Profile Page ─────────────────────────────────────────────────────────
// Seeker: full feature set
const SEEKER_SECTIONS = [
  { key:'overview',   label:'Overview',          icon: icons.user     },
  { key:'requests',   label:'My Requests',       icon: icons.request  },
  { key:'bookings',   label:'My Bookings',       icon: icons.booking  },
  { key:'favorites',  label:'Favourites',        icon: icons.favorite },
  { key:'reviews',    label:'My Reviews',        icon: icons.review   },
  { key:'report',     label:'Report',            icon: icons.report   },
  { key:'switchrole', label:'Switch to Provider',icon: icons.lock     },
  { key:'password',   label:'Password',          icon: icons.lock     },
]
// Provider: full provider sections in profile sidebar
const PROVIDER_SECTIONS = [
  { key:'overview',   label:'Overview',          icon: icons.user     },
  { key:'myrooms',    label:'My Listings',       icon: icons.booking  },
  { key:'preqs',      label:'Received Requests', icon: icons.request  },
  { key:'pbookings',  label:'My Bookings',       icon: icons.booking  },
  { key:'switchrole', label:'Switch to Seeker',  icon: icons.lock     },
  { key:'password',   label:'Password',          icon: icons.lock     },
]
// Admin: no switch
const ADMIN_SECTIONS = [
  { key:'overview',  label:'Overview', icon: icons.user },
  { key:'password',  label:'Password', icon: icons.lock },
]

export default function Profile() {
  const { user: authUser, updateUser } = useAuth()
  const [profile,  setProfile]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [active,   setActive]   = useState('overview')

  useEffect(() => {
    api.get('/users/profile')
      .then(r => setProfile(r.data.user))
      .finally(() => setLoading(false))
  }, [])

  const onSaved = updated => { setProfile(updated); updateUser({ name: updated.name }) }

  if (loading) return <div className="spinner-wrap" style={{ paddingTop:'4rem' }}><div className="spinner"/></div>

  const sections = authUser?.role === 'seeker'   ? SEEKER_SECTIONS
                 : authUser?.role === 'provider' ? PROVIDER_SECTIONS
                 : ADMIN_SECTIONS
  const initials = profile?.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() || 'U'

  const renderContent = () => {
    switch(active) {
      case 'requests':   return <MyRequests />
      case 'bookings':   return <MyBookings />
      case 'favorites':  return <MyFavorites />
      case 'reviews':    return <MyReviews />
      case 'report':     return <MyReport />
      case 'myrooms':    return <ProviderMyRooms />
      case 'preqs':      return <ProviderRequests />
      case 'pbookings':  return <ProviderBookingsInline />
      case 'switchrole': return <SwitchRole profile={profile} onSwitched={onSaved} />
      case 'password':   return <ChangePassword />
      default: return (
        <div>
          {/* Info grid */}
          <div className="card" style={{ marginBottom:'1rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
              <p style={{ fontWeight:700, fontSize:'1rem' }}>Account Details</p>
              <span className={`badge badge-${profile?.role==='provider'?'blue':profile?.role==='admin'?'red':'green'}`}>{profile?.role}</span>
            </div>
            <div className="info-grid">
              {[['Name',profile?.name],['Email',profile?.email],['Age',profile?.age||'—'],
                ['Gender',(profile?.gender||'—').replace(/_/g,' ')],
                ['Occupation',profile?.occupation||'—'],['Phone',profile?.phone||'—']
              ].map(([k,v]) => (
                <div key={k}>
                  <p className="info-item__label">{k}</p>
                  <p className="info-item__value">{v}</p>
                </div>
              ))}
              {profile?.preferences && (
                <div style={{ gridColumn:'1/-1' }}>
                  <p className="info-item__label">Preferences</p>
                  <p style={{ fontSize:'.9rem', color:'var(--text-secondary)' }}>{profile.preferences}</p>
                </div>
              )}
            </div>
          </div>

          {/* Edit form */}
          <div className="card">
            <p style={{ fontWeight:700, marginBottom:'1.25rem' }}>Edit Profile</p>
            <EditProfile profile={profile} onSaved={onSaved} />
          </div>
        </div>
      )
    }
  }

  const sectionTitle = sections.find(s => s.key === active)?.label || 'Profile'

  return (
    <div className="page">
      <div className="profile-layout">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-sidebar__header">
            <div className="profile-sidebar__avatar">{initials}</div>
            <p className="profile-sidebar__name">{profile?.name}</p>
            <p className="profile-sidebar__role">{profile?.role} account</p>
          </div>
          <nav className="profile-sidebar__nav">
            {sections.map((s, i) => (
              <div key={s.key}>
                {i === sections.length - 2 && <div className="profile-sidebar__divider" />}
                <a
                  href="#"
                  className={active === s.key ? 'active' : ''}
                  onClick={e => { e.preventDefault(); setActive(s.key) }}
                >
                  {s.icon}
                  {s.label}
                </a>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main>
          <div className="section-header" style={{ marginBottom:'1.25rem' }}>
            <h2 style={{ fontWeight:700, fontSize:'1.2rem', letterSpacing:'-.02em' }}>{sectionTitle}</h2>
          </div>
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
