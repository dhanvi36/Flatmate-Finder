import { useState, useEffect } from 'react'
import api from '../../api/axios'

function StarRating({ value, onChange }) {
  return (
    <div style={{ display:'flex', gap:'.25rem', fontSize:'1.5rem', cursor: onChange ? 'pointer' : 'default' }}>
      {[1,2,3,4,5].map(n => (
        <span key={n}
          onClick={() => onChange && onChange(n)}
          style={{ color: n <= value ? '#f59e0b' : '#d1d5db' }}>
          ★
        </span>
      ))}
    </div>
  )
}

export default function MyReviews() {
  const [reviews,  setReviews]  = useState([])
  const [bookings, setBookings] = useState([])  // completed bookings without review
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form,     setForm]     = useState({ room: '', provider: '', rating: 5, comment: '' })
  const [msg,      setMsg]      = useState({ type: '', text: '' })

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    try {
      const [revRes, bookRes] = await Promise.all([
        api.get('/reviews/my-reviews'),
        api.get('/bookings/my-bookings'),
      ])
      setReviews(revRes.data.reviews || revRes.data || [])
      const completed = (bookRes.data.bookings || bookRes.data || []).filter(b => b.status === 'completed')
      setBookings(completed)
    } catch { }
    finally { setLoading(false) }
  }

  const submitReview = async (e) => {
    e.preventDefault()
    try {
      await api.post('/reviews', form)
      setMsg({ type: 'success', text: 'Review submitted!' })
      setShowForm(false)
      setForm({ room: '', provider: '', rating: 5, comment: '' })
      loadAll()
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to submit review' })
    }
    setTimeout(() => setMsg({}), 4000)
  }

  const handleBookingSelect = (e) => {
    const bk = bookings.find(b => b._id === e.target.value)
    if (bk) setForm(f => ({ ...f, room: bk.room?._id || bk.room, provider: bk.provider?._id || bk.provider }))
  }

  if (loading) return <div className="spinner" />

  return (
    <div className="page">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <h1 className="page-title" style={{ margin:0 }}>⭐ My Reviews</h1>
        {bookings.length > 0 && (
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
            {showForm ? '✕ Cancel' : '+ Write a Review'}
          </button>
        )}
      </div>

      {msg.text && <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>{msg.text}</div>}

      {/* Write Review Form */}
      {showForm && (
        <div className="card" style={{ marginBottom:'1.5rem' }}>
          <h2 style={{ fontWeight:700, marginBottom:'1rem' }}>Write a Review</h2>
          <form onSubmit={submitReview}>
            <div className="form-group">
              <label>Select Completed Booking</label>
              <select className="form-control" onChange={handleBookingSelect} defaultValue="">
                <option value="" disabled>Choose a booking…</option>
                {bookings.map(b => (
                  <option key={b._id} value={b._id}>
                    {b.room?.title} — {b.provider?.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Rating</label>
              <StarRating value={form.rating} onChange={r => setForm(f => ({ ...f, rating: r }))} />
            </div>
            <div className="form-group">
              <label>Comment</label>
              <textarea className="form-control" rows={3}
                value={form.comment}
                onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                placeholder="Share your experience…" />
            </div>
            <button className="btn btn-primary" disabled={!form.room}>Submit Review</button>
          </form>
        </div>
      )}

      {reviews.length === 0 && (
        <div className="empty-state">
          <div className="icon">⭐</div>
          <p>No reviews yet.</p>
          <p className="text-light">Complete a booking to write a review.</p>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
        {reviews.map(r => (
          <div className="card" key={r._id}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <h3 style={{ fontWeight:700 }}>{r.room?.title || 'Room'}</h3>
                <p className="text-light" style={{ fontSize:'.85rem' }}>Provider: {r.provider?.name}</p>
              </div>
              <StarRating value={r.rating} />
            </div>
            {r.comment && <p style={{ marginTop:'.75rem', fontStyle:'italic', color:'var(--text-light)' }}>"{r.comment}"</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
