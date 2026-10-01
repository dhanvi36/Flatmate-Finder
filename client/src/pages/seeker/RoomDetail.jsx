import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

function photoUrl(photo) {
  const raw = Array.isArray(photo) ? photo[0] : photo
  if (!raw || typeof raw !== 'string') return null
  if (raw.startsWith('/uploads/')) return raw
  return `/uploads/${raw.replace(/.*[/\\]/, '')}`
}

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="56" height="56">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
  </svg>
)

export default function RoomDetail() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { user: authUser } = useAuth()

  const [room,        setRoom]       = useState(null)
  const [compat,      setCompat]     = useState(null)
  const [loading,     setLoading]    = useState(true)
  const [pageError,   setPageError]  = useState('')

  // Favorite
  const [faved,       setFaved]      = useState(false)
  const [favMsg,      setFavMsg]     = useState({ type: '', text: '' })

  // Request
  const [showReq,     setShowReq]    = useState(false)
  const [reqForm,     setReqForm]    = useState({ message: '', expectedMoveInDate: '', numberOfPeople: 1 })
  const [reqLoading,  setReqLoading] = useState(false)
  const [reqMsg,      setReqMsg]     = useState({ type: '', text: '' })  // separate from fav msg
  const [reqDone,     setReqDone]    = useState(false)  // hides button after success

  useEffect(() => { loadAll() }, [id])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [roomRes, compatRes] = await Promise.all([
        api.get(`/rooms/${id}`),
        api.get(`/requests/check-compatibility/${id}`).catch(() => null),
      ])
      setRoom(roomRes.data.room || roomRes.data)
      if (compatRes) setCompat(compatRes.data)
    } catch (err) {
      setPageError(err.response?.data?.message || 'Failed to load room')
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async () => {
    try {
      if (faved) {
        await api.delete(`/favorites/${id}`)
        setFaved(false)
        setFavMsg({ type: 'success', text: 'Removed from favorites' })
      } else {
        await api.post(`/favorites/${id}`)
        setFaved(true)
        setFavMsg({ type: 'success', text: 'Added to favorites' })
      }
    } catch (err) {
      setFavMsg({ type: 'error', text: err.response?.data?.message || 'Failed' })
    }
    setTimeout(() => setFavMsg({ type: '', text: '' }), 3000)
  }

  const sendRequest = async (e) => {
    e.preventDefault()
    setReqLoading(true)
    setReqMsg({ type: '', text: '' })
    try {
      const payload = {
        room: id,
        message:            reqForm.message,
        numberOfPeople:     reqForm.numberOfPeople,
        expectedMoveInDate: reqForm.expectedMoveInDate || undefined,
      }
      console.log('Sending request payload:', payload)   // visible in browser console
      const { data } = await api.post('/requests', payload)
      console.log('Request response:', data)
      setReqMsg({ type: 'success', text: 'Request sent! Go to Profile → My Requests to view it.' })
      setReqDone(true)
      setShowReq(false)
    } catch (err) {
      console.error('Request error:', err.response?.data)
      setReqMsg({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to send request' })
    } finally {
      setReqLoading(false)
    }
  }

  if (loading)   return <div className="spinner-wrap" style={{ paddingTop:'4rem' }}><div className="spinner"/></div>
  if (pageError) return <div className="page"><div className="alert alert-error">{pageError}</div></div>
  if (!room)     return null

  const compatScore = compat?.compatibility?.score ?? compat?.score ?? null

  return (
    <div className="page">
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom:'1rem' }}>
        ← Back to Rooms
      </button>

      {/* Photos */}
      <div className="detail-photos">
        {room.photos?.length > 0
          ? room.photos.map((ph, i) => {
              const url = photoUrl(ph)
              return url ? (
                <img key={i} src={url} alt={`Room ${i + 1}`} onError={e => e.target.style.display='none'} />
              ) : null
            })
          : <div className="detail-photos__placeholder"><HomeIcon /></div>
        }
      </div>

      <div className="detail-grid">
        {/* ── Left ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem' }}>
              <div>
                <h1 style={{ fontSize:'1.5rem', fontWeight:800, letterSpacing:'-.02em', marginBottom:'.25rem' }}>{room.title}</h1>
                <p style={{ color:'var(--text-muted)', fontSize:'.875rem' }}>
                  {room.location?.area ? `${room.location.area}, ` : ''}{room.location?.city}
                </p>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <p style={{ fontSize:'1.5rem', fontWeight:800, color:'var(--primary)' }}>
                  ₹{room.rent?.toLocaleString()}<span style={{ fontSize:'.875rem', fontWeight:400, color:'var(--text-muted)' }}>/mo</span>
                </p>
                <span className={`badge badge-${room.status === 'available' ? 'green' : 'gray'}`} style={{ marginTop:'.3rem' }}>
                  {room.status}
                </span>
              </div>
            </div>
            {room.description && (
              <p style={{ marginTop:'1rem', lineHeight:1.75, color:'var(--text-secondary)' }}>{room.description}</p>
            )}
          </div>

          <div className="card">
            <p style={{ fontWeight:700, marginBottom:'1rem' }}>Room Details</p>
            <div className="info-grid">
              {[
                ['Available From', new Date(room.availableFrom).toLocaleDateString()],
                ['Max Occupants',  room.maxOccupants],
                ['Preferred Gender',     room.preferredGender     || 'Any'],
                ['Preferred Occupation', room.preferredOccupation || 'Any'],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="info-item__label">{k}</p>
                  <p className="info-item__value">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {room.amenities?.length > 0 && (
            <div className="card">
              <p style={{ fontWeight:700, marginBottom:'.75rem' }}>Amenities</p>
              <div className="amenity-list">
                {room.amenities.map(a => <span key={a} className="amenity-pill">{a}</span>)}
              </div>
            </div>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

          {/* Provider info — contact hidden until request accepted */}
          <div className="card">
            <p style={{ fontWeight:700, marginBottom:'.75rem' }}>Provider</p>
            <p style={{ fontWeight:600 }}>{room.provider?.name}</p>
            <p style={{ fontSize:'.875rem', color:'var(--text-muted)', marginTop:'.2rem' }}>
              contact@hidden.com
            </p>
            <p style={{
              fontSize:'.78rem', color:'var(--text-muted)',
              marginTop:'.5rem', padding:'.4rem .65rem',
              background:'var(--bg)', borderRadius:6,
              border:'1px solid var(--border)',
              display:'flex', alignItems:'center', gap:'.4rem'
            }}>
              <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12" style={{ flexShrink:0 }}>
                <path d="M8 1a5 5 0 00-5 5v1H2a1 1 0 00-1 1v5a1 1 0 001 1h12a1 1 0 001-1V8a1 1 0 00-1-1h-1V6a5 5 0 00-5-5zm-3 6V6a3 3 0 016 0v1H5z"/>
              </svg>
              Contact unlocks once provider accepts your request
            </p>
          </div>

          {/* Compatibility */}
          {compatScore !== null && (
            <div className="card">
              <p style={{ fontWeight: 700, marginBottom: '.875rem' }}>Compatibility Score</p>

              {/* Big score */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '.4rem', marginBottom: '.5rem' }}>
                <span style={{ fontSize: '2.25rem', fontWeight: 800, color: compatScore >= 70 ? 'var(--success)' : compatScore >= 40 ? 'var(--warning)' : 'var(--danger)', lineHeight: 1 }}>
                  {compatScore}%
                </span>
                <span style={{ fontSize: '.875rem', color: 'var(--text-muted)' }}>match</span>
              </div>

              {/* Overall bar */}
              <div className="compat-bar" style={{ marginBottom: '1rem' }}>
                <div className="compat-bar__fill" style={{ width: `${compatScore}%` }} />
              </div>

              {/* Breakdown table */}
              {(() => {
                const bd = compat?.compatibility?.breakdown ?? compat?.breakdown ?? null
                if (!bd) return null
                const labels = {
                  genderMatch:     'Gender Match',
                  occupationMatch: 'Occupation Match',
                  capacityMatch:   'Capacity Match',
                  dateMatch:       'Move-in Date',
                  lifestyleMatch:  'Lifestyle Match',
                }
                return (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '.875rem', display: 'flex', flexDirection: 'column', gap: '.625rem' }}>
                    {Object.entries(bd).map(([key, val]) => {
                      const score = val?.score ?? 0
                      const max   = val?.max   ?? 0
                      const pct   = max > 0 ? Math.round((score / max) * 100) : 0
                      const color = pct === 100 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)'
                      return (
                        <div key={key}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.2rem' }}>
                            <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                              {labels[key] || key}
                            </span>
                            <span style={{ fontSize: '.8rem', fontWeight: 700, color }}>
                              {score} / {max}
                            </span>
                          </div>
                          <div style={{ background: 'var(--border)', borderRadius: 999, height: 5, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999, transition: 'width .5s' }} />
                          </div>
                          {val?.detail && (
                            <p style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: '.2rem' }}>{val.detail}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          )}

          {/* Favorite message */}
          {favMsg.text && (
            <div className={`alert alert-${favMsg.type === 'error' ? 'error' : 'success'}`}>{favMsg.text}</div>
          )}

          {/* Request message — always visible, never auto-hides */}
          {reqMsg.text && (
            <div className={`alert alert-${reqMsg.type === 'error' ? 'error' : 'success'}`}>
              {reqMsg.text}
            </div>
          )}

          {/* Action buttons */}
          <div className="card" style={{ display:'flex', flexDirection:'column', gap:'.625rem' }}>
            {room.status === 'occupied' ? (
              <div style={{ textAlign:'center', padding:'.75rem', background:'var(--danger-light)', borderRadius:6, fontSize:'.875rem', color:'var(--danger)', fontWeight:600 }}>
                Room is fully occupied — no requests accepted
              </div>
            ) : room.provider?._id === undefined
                ? null
                : String(room.provider?._id || room.provider) === String(authUser?.userId) ? (
              <div style={{ textAlign:'center', padding:'.75rem', background:'#fef3c7', borderRadius:6, fontSize:'.875rem', color:'#92400e', fontWeight:600 }}>
                This is your own listing — you cannot request it
              </div>
            ) : (
              <>
                {!reqDone && (
                  <button className="btn btn-primary btn-full" onClick={() => { setShowReq(s => !s); setReqMsg({ type:'', text:'' }) }}>
                    {showReq ? 'Cancel' : 'Send Request'}
                  </button>
                )}
                {reqDone && (
                  <div style={{ textAlign:'center', padding:'.5rem', fontSize:'.875rem', color:'var(--success)', fontWeight:600 }}>
                    Request sent successfully
                  </div>
                )}
              </>
            )}
            <button
              className={`btn btn-full ${faved ? 'btn-danger' : 'btn-outline'}`}
              onClick={toggleFavorite}
            >
              {faved ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
          </div>

          {/* Request form */}
          {showReq && !reqDone && (
            <div className="card">
              <p style={{ fontWeight:700, marginBottom:'1rem' }}>Request this Room</p>
              <form onSubmit={sendRequest}>
                <div className="form-group">
                  <label className="form-label">Message (optional)</label>
                  <textarea className="form-control" rows={3}
                    value={reqForm.message}
                    onChange={e => setReqForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Introduce yourself to the provider..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Expected Move-in Date</label>
                  <input className="form-control" type="date"
                    value={reqForm.expectedMoveInDate}
                    onChange={e => setReqForm(f => ({ ...f, expectedMoveInDate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Number of People</label>
                  <input className="form-control" type="number" min={1} max={room.maxOccupants}
                    value={reqForm.numberOfPeople}
                    onChange={e => setReqForm(f => ({ ...f, numberOfPeople: parseInt(e.target.value) || 1 }))} />
                  <span className="form-hint">Max {room.maxOccupants} allowed</span>
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={reqLoading}>
                  {reqLoading ? 'Sending...' : 'Confirm & Send Request'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
