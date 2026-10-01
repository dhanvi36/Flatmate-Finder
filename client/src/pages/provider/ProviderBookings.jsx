import { useState, useEffect } from 'react'
import api from '../../api/axios'

const STATUS_BADGE = {
  active:    'badge-green',
  completed: 'badge-blue',
  cancelled: 'badge-red',
}

export default function ProviderBookings() {
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [msg,      setMsg]      = useState('')

  useEffect(() => { fetchBookings() }, [])

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings/provider-bookings')
      setBookings(data.bookings || data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (bookingId, status) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status })
      setBookings(bs => bs.map(b => b._id === bookingId ? { ...b, status } : b))
      setMsg(`Booking marked as ${status}.`)
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setMsg(err.response?.data?.message || 'Update failed')
    }
  }

  if (loading) return <div className="spinner" />

  // Group by room
  const grouped = bookings.reduce((acc, b) => {
    const key = b.room?._id || 'unknown'
    if (!acc[key]) acc[key] = { room: b.room, bookings: [] }
    acc[key].bookings.push(b)
    return acc
  }, {})

  return (
    <div className="page">
      <h1 className="page-title">📅 My Bookings</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {msg   && <div className="alert alert-success">{msg}</div>}

      {bookings.length === 0 && !error && (
        <div className="empty-state">
          <div className="icon">🗓️</div>
          <p>No bookings on your rooms yet.</p>
        </div>
      )}

      {Object.values(grouped).map(({ room, bookings: bks }) => (
        <div key={room?._id || 'unknown'} style={{ marginBottom:'2rem' }}>
          <h2 style={{ fontWeight:700, fontSize:'1.1rem', marginBottom:'.75rem', padding:'.5rem .75rem',
            background:'var(--primary-light)', borderRadius:8 }}>
            🏠 {room?.title || 'Room'} &nbsp;
            <span className="text-light" style={{ fontWeight:400, fontSize:'.88rem' }}>
              ₹{room?.rent?.toLocaleString()}/mo · {room?.location?.city}
            </span>
          </h2>

          <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
            {bks.map(b => (
              <div className="card" key={b._id}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'.5rem' }}>
                  <div>
                    <p style={{ fontWeight:700 }}>
                      {b.seeker?.name}
                      <span className="text-light" style={{ fontWeight:400, fontSize:'.88rem', marginLeft:'.5rem' }}>
                        {b.seeker?.email}
                      </span>
                    </p>
                    <div style={{ display:'flex', gap:'1.5rem', marginTop:'.5rem' }}>
                      <div>
                        <p className="text-light" style={{ fontSize:'.78rem' }}>START DATE</p>
                        <p style={{ fontWeight:600 }}>{new Date(b.startDate).toLocaleDateString()}</p>
                      </div>
                      {b.endDate && (
                        <div>
                          <p className="text-light" style={{ fontSize:'.78rem' }}>END DATE</p>
                          <p style={{ fontWeight:600 }}>{new Date(b.endDate).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`badge ${STATUS_BADGE[b.status] || 'badge-gray'}`}>{b.status}</span>
                </div>

                {b.status === 'active' && (
                  <div style={{ display:'flex', gap:'.75rem', marginTop:'1rem' }}>
                    <button className="btn btn-outline btn-sm"
                      onClick={() => updateStatus(b._id, 'completed')}>
                      ✅ Mark Completed
                    </button>
                    <button className="btn btn-danger btn-sm"
                      onClick={() => updateStatus(b._id, 'cancelled')}>
                      ✕ Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
