import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

const BASE = ''

function photoUrl(photo) {
  const raw = Array.isArray(photo) ? photo[0] : photo
  if (!raw || typeof raw !== 'string') return null
  if (raw.startsWith('/uploads/')) return `${BASE}${raw}`
  const filename = raw.replace(/.*[/\\]/, '')
  return `${BASE}/uploads/${filename}`
}

export default function MyFavorites() {
  const [favorites, setFavorites] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [msg,       setMsg]       = useState('')

  useEffect(() => { fetchFavorites() }, [])

  const fetchFavorites = async () => {
    try {
      const { data } = await api.get('/favorites')
      setFavorites(data.favorites || data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (roomId) => {
    try {
      await api.delete(`/favorites/${roomId}`)
      setFavorites(fs => fs.filter(f => (f.room?._id || f.room) !== roomId))
      setMsg('Removed from favorites')
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to remove')
    }
  }

  if (loading) return <div className="spinner" />

  return (
    <div className="page">
      <h1 className="page-title">❤️ My Favorites</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {msg   && <div className="alert alert-success">{msg}</div>}

      {favorites.length === 0 && !error && (
        <div className="empty-state">
          <div className="icon">💔</div>
          <p>No favorites saved yet.</p>
          <p className="text-light">Browse rooms and click "Add to Favorites".</p>
        </div>
      )}

      <div className="card-grid">
        {favorites.map(fav => {
          const room = fav.room || fav
          return (
            <div className="room-card" key={fav._id || room._id}>
              {room.photos?.length > 0 ? (
                <img className="room-card__img"
                  src={photoUrl(room.photos[0])}
                  alt={room.title}
                  onError={e => e.target.style.display='none'} />
              ) : (
                <div className="room-card__img-placeholder">🏠</div>
              )}

              <div className="room-card__body">
                <p className="room-card__title">{room.title}</p>
                <p className="room-card__location">📍 {room.location?.area ? `${room.location.area}, ` : ''}{room.location?.city}</p>
                <p className="room-card__rent">₹{room.rent?.toLocaleString()}/mo</p>
              </div>

              <div className="room-card__footer">
                <Link to={`/seeker/rooms/${room._id}`} className="btn btn-primary btn-sm">View →</Link>
                <button className="btn btn-danger btn-sm" onClick={() => removeFavorite(room._id)}>
                  💔 Remove
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
