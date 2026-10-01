import { useState, useEffect } from 'react'
import api from '../../api/axios'

const STATUS_BADGE = {
  pending:  'badge-yellow',
  accepted: 'badge-green',
  rejected: 'badge-red',
}

export default function ReceivedRequests() {
  const [requests, setRequests] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [msg,      setMsg]      = useState('')
  const [contact,  setContact]  = useState({})

  useEffect(() => { fetchRequests() }, [])

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/requests/received')
      setRequests(data.requests || data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (reqId, status) => {
    try {
      const { data } = await api.put(`/requests/${reqId}/status`, { status })
      setRequests(rs => rs.map(r => r._id === reqId ? { ...r, status } : r))
      setMsg(`Request ${status}.`)
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setMsg(err.response?.data?.message || 'Update failed')
    }
  }

  const unlockContact = async (reqId) => {
    try {
      const { data } = await api.get(`/requests/${reqId}/contact-info`)
      setContact(c => ({ ...c, [reqId]: data }))
    } catch (err) {
      alert(err.response?.data?.message || 'Could not unlock contact info')
    }
  }

  if (loading) return <div className="spinner" />

  // Group by room
  const grouped = requests.reduce((acc, req) => {
    const key = req.room?._id || 'unknown'
    if (!acc[key]) acc[key] = { room: req.room, reqs: [] }
    acc[key].reqs.push(req)
    return acc
  }, {})

  return (
    <div className="page">
      <h1 className="page-title">📩 Received Requests</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {msg   && <div className="alert alert-success">{msg}</div>}

      {requests.length === 0 && !error && (
        <div className="empty-state">
          <div className="icon">📭</div>
          <p>No requests received yet.</p>
          <p className="text-light">Seekers will send requests once they find your listings.</p>
        </div>
      )}

      {Object.values(grouped).map(({ room, reqs }) => (
        <div key={room?._id || 'unknown'} style={{ marginBottom:'2rem' }}>
          <h2 style={{ fontWeight:700, fontSize:'1.1rem', marginBottom:'.75rem', padding:'.5rem .75rem',
            background:'var(--primary-light)', borderRadius:8 }}>
            🏠 {room?.title || 'Room'} &nbsp;
            <span className="text-light" style={{ fontWeight:400, fontSize:'.88rem' }}>
              ₹{room?.rent?.toLocaleString()}/mo · {room?.location?.city}
            </span>
          </h2>

          <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
            {reqs.map(req => (
              <div className="card" key={req._id}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'.5rem' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'.25rem' }}>
                      <p style={{ fontWeight:700 }}>{req.seeker?.name}</p>
                      <span className="text-light" style={{ fontSize:'.85rem' }}>{req.seeker?.email}</span>
                    </div>

                    {/* Seeker details */}
                    <div style={{ display:'flex', gap:'.75rem', flexWrap:'wrap', fontSize:'.85rem', color:'var(--text-light)' }}>
                      {req.seeker?.age && <span>Age: {req.seeker.age}</span>}
                      {req.seeker?.gender && <span>· {req.seeker.gender}</span>}
                      {req.seeker?.occupation && <span>· {req.seeker.occupation}</span>}
                    </div>

                    {req.message && (
                      <p style={{ marginTop:'.5rem', fontStyle:'italic', fontSize:'.9rem', color:'var(--text-light)' }}>
                        "{req.message}"
                      </p>
                    )}

                    <div style={{ display:'flex', gap:'1rem', marginTop:'.4rem', fontSize:'.82rem', color:'var(--text-light)' }}>
                      {req.expectedMoveInDate && (
                        <span>📅 Move-in: {new Date(req.expectedMoveInDate).toLocaleDateString()}</span>
                      )}
                      {req.numberOfPeople && <span>👥 {req.numberOfPeople} person(s)</span>}
                    </div>
                  </div>

                  <div style={{ textAlign:'right' }}>
                    <span className={`badge ${STATUS_BADGE[req.status] || 'badge-gray'}`}>{req.status}</span>
                    {req.compatibilityScore !== undefined && (
                      <p style={{ fontSize:'.82rem', color:'var(--secondary)', marginTop:'.4rem', fontWeight:600 }}>
                        🎯 {req.compatibilityScore?.score ?? req.compatibilityScore}% match
                      </p>
                    )}
                    {req.compatibilityScore !== undefined && (
                      <div className="compat-bar" style={{ width:80, marginTop:'.3rem', marginLeft:'auto' }}>
                        <div className="compat-bar__fill" style={{ width:`${req.compatibilityScore?.score ?? req.compatibilityScore}%` }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display:'flex', gap:'.75rem', marginTop:'1rem', flexWrap:'wrap' }}>
                  {req.status === 'pending' && (
                    <>
                      <button className="btn btn-success btn-sm"
                        onClick={() => updateStatus(req._id, 'accepted')}>
                        ✅ Accept
                      </button>
                      <button className="btn btn-danger btn-sm"
                        onClick={() => updateStatus(req._id, 'rejected')}>
                        ✕ Reject
                      </button>
                    </>
                  )}

                  {req.status === 'accepted' && (
                    contact[req._id] ? (
                      <div style={{ background:'var(--primary-light)', borderRadius:8, padding:'.6rem .9rem', fontSize:'.85rem' }}>
                        <strong>Seeker Contact:</strong> {contact[req._id].seeker?.email}
                        {contact[req._id].seeker?.phone && ` · ${contact[req._id].seeker.phone}`}
                      </div>
                    ) : (
                      <button className="btn btn-outline btn-sm" onClick={() => unlockContact(req._id)}>
                        🔓 View Seeker Contact
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
