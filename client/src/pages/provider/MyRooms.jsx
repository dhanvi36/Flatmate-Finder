import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

function photoUrl(photo) {
  const raw = Array.isArray(photo) ? photo[0] : photo
  if (!raw || typeof raw !== 'string') return null
  if (raw.startsWith('/uploads/')) return raw
  return `/uploads/${raw.replace(/.*[/\\]/, '')}`
}

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
  </svg>
)

export default function MyRooms() {
  const [rooms,   setRooms]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [msg,     setMsg]     = useState('')

  useEffect(() => { fetchRooms() }, [])

  const fetchRooms = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/users/my-rooms')
      setRooms(data.rooms || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load rooms')
    } finally { setLoading(false) }
  }

  const deleteRoom = async (id) => {
    if (!confirm('Delete this room? This cannot be undone.')) return
    try {
      await api.delete(`/rooms/${id}`)
      setRooms(rs => rs.filter(r => r._id !== id))
      setMsg('Room deleted.')
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setMsg(err.response?.data?.message || 'Delete failed')
    }
  }

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>

  return (
    <div className="page">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <h1 className="page-title" style={{ margin:0 }}>My Rooms</h1>
        <Link to="/provider/rooms/new" className="btn btn-primary">+ Add New Room</Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {msg   && <div className="alert alert-success">{msg}</div>}

      {rooms.length === 0 && !error && (
        <div className="empty-state">
          <div className="empty-state__icon"><HomeIcon /></div>
          <p className="empty-state__title">No rooms listed yet</p>
          <Link to="/provider/rooms/new" className="btn btn-primary" style={{ marginTop:'1rem' }}>
            Create Your First Listing
          </Link>
        </div>
      )}

      <div className="card-grid">
        {rooms.map(room => {
          const isOccupied = room.status === 'occupied'
          return (
            <div className="room-card" key={room._id} style={{ position: 'relative' }}>

              {/* ── Occupied overlay ── */}
              {isOccupied && (
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 10,
                  background: 'rgba(0,0,0,0.52)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  pointerEvents: 'none',
                }}>
                  <div style={{
                    background: '#111827', color: '#fff',
                    padding: '.45rem 1.1rem', borderRadius: 999,
                    fontSize: '.8125rem', fontWeight: 700,
                    letterSpacing: '.05em', textTransform: 'uppercase',
                  }}>
                    Fully Occupied
                  </div>
                  <p style={{ color: '#d1d5db', fontSize: '.75rem', marginTop: '.4rem' }}>
                    No vacancies
                  </p>
                </div>
              )}

              {room.photos?.length > 0 && photoUrl(room.photos[0]) ? (
                <img className="room-card__img"
                  src={photoUrl(room.photos[0])} alt={room.title}
                  style={{ filter: isOccupied ? 'grayscale(70%) brightness(0.6)' : 'none' }}
                  onError={e => e.target.style.display = 'none'} />
              ) : (
                <div className="room-card__img-placeholder"
                  style={{ filter: isOccupied ? 'grayscale(70%) brightness(0.7)' : 'none' }}>
                  <HomeIcon />
                </div>
              )}

              <div className="room-card__body" style={{ opacity: isOccupied ? 0.65 : 1 }}>
                <p className="room-card__title">{room.title}</p>
                <p className="room-card__location">
                  {room.location?.area ? `${room.location.area}, ` : ''}{room.location?.city}
                </p>
                <p className="room-card__rent">₹{room.rent?.toLocaleString()}<span>/mo</span></p>
                <div style={{ display:'flex', gap:'.4rem', marginTop:'.5rem', flexWrap:'wrap' }}>
                  <span className={`badge badge-${isOccupied ? 'red' : 'green'}`}>
                    {room.status}
                  </span>
                  <span className={`badge badge-${room.listingStatus === 'active' ? 'blue' : 'red'}`}>
                    {room.listingStatus}
                  </span>
                </div>
              </div>

              <div className="room-card__footer">
                <Link to={`/provider/rooms/${room._id}/edit`} className="btn btn-outline btn-sm">
                  Edit
                </Link>
                <button className="btn btn-danger btn-sm" onClick={() => deleteRoom(room._id)}>
                  Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
