import { useState, useEffect } from 'react'
import api from '../../api/axios'

const STATUS_BADGE = {
  active:    'badge-green',
  completed: 'badge-blue',
  cancelled: 'badge-red',
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [msg,      setMsg]      = useState('')

  useEffect(() => { fetchBookings() }, [])

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings/my-bookings')
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
      setMsg(`Booking marked as ${status}`)
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setMsg(err.response?.data?.message || 'Update failed')
    }
  }

  if (loading) return <div className="spinner" />

  return (
    <div className="page">
      <h1 className="page-title">📅 My Bookings</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {msg   && <div className="alert alert-success">{msg}</div>}

      {bookings.length === 0 && !error && (
        <div className="empty-state">
          <div className="icon">🗓️</div>
          <p>No bookings yet.</p>
          <p className="text-light">Once your request is accepted, create a booking from My Requests.</p>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
        {bookings.map(b => (
          <div className="card" key={b._id}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'.5rem' }}>
              <div>
                <h3 style={{ fontWeight: 700 }}>{b.room?.title || 'Room'}</h3>
                <p className="text-light">📍 {b.room?.location?.city} &nbsp;·&nbsp; ₹{b.room?.rent?.toLocaleString()}/mo</p>
                <p className="text-light" style={{ fontSize:'.85rem', marginTop:'.25rem' }}>
                  Provider: <strong>{b.provider?.name}</strong>
                </p>
              </div>
              <span className={`badge ${STATUS_BADGE[b.status] || 'badge-gray'}`}>{b.status}</span>
            </div>

            <div style={{ display:'flex', gap:'1.5rem', marginTop:'.75rem', flexWrap:'wrap' }}>
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
  )
}
