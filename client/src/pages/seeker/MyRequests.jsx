import { useState, useEffect } from 'react'
import api from '../../api/axios'

const STATUS_BADGE = {
  pending:  'badge-yellow',
  accepted: 'badge-green',
  rejected: 'badge-red',
}

export default function MyRequests() {
  const [requests, setRequests] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [contact,  setContact]  = useState({}) // { [reqId]: contactInfo }

  useEffect(() => { fetchRequests() }, [])

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/requests/my-requests')
      setRequests(data.requests || data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load requests')
    } finally {
      setLoading(false)
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

  return (
    <div className="page">
      <h1 className="page-title">📋 My Requests</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {requests.length === 0 && !error && (
        <div className="empty-state">
          <div className="icon">📭</div>
          <p>You haven't sent any requests yet.</p>
          <p className="text-light">Browse rooms and send a request to a provider.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {requests.map(req => (
          <div className="card" key={req._id}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'.5rem' }}>
              <div>
                <h3 style={{ fontWeight: 700 }}>{req.room?.title || 'Room'}</h3>
                <p className="text-light">
                  📍 {req.room?.location?.city} &nbsp;·&nbsp; ₹{req.room?.rent?.toLocaleString()}/mo
                </p>
                <p className="text-light" style={{ fontSize: '.85rem', marginTop: '.25rem' }}>
                  Sent to: <strong>{req.provider?.name}</strong>
                </p>
                {req.message && (
                  <p style={{ marginTop: '.5rem', fontStyle:'italic', color:'var(--text-light)', fontSize:'.9rem' }}>
                    "{req.message}"
                  </p>
                )}
              </div>
              <div style={{ textAlign:'right' }}>
                <span className={`badge ${STATUS_BADGE[req.status] || 'badge-gray'}`}>{req.status}</span>
                {req.compatibilityScore !== undefined && (
                  <p style={{ fontSize: '.82rem', color:'var(--text-light)', marginTop:'.4rem' }}>
                    🎯 {req.compatibilityScore?.score ?? req.compatibilityScore}% match
                  </p>
                )}
              </div>
            </div>

            {req.expectedMoveInDate && (
              <p className="text-light" style={{ fontSize:'.85rem', marginTop:'.5rem' }}>
                📅 Move-in: {new Date(req.expectedMoveInDate).toLocaleDateString()}
              </p>
            )}

            {/* Unlock contact info if accepted */}
            {req.status === 'accepted' && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                {contact[req._id] ? (
                  <div style={{ background:'var(--primary-light)', borderRadius:8, padding:'.75rem' }}>
                    <p style={{ fontWeight:600, marginBottom:'.4rem' }}>📞 Provider Contact</p>
                    <p>Name: {contact[req._id].provider?.name}</p>
                    <p>Email: {contact[req._id].provider?.email}</p>
                    {contact[req._id].provider?.phone && <p>Phone: {contact[req._id].provider.phone}</p>}
                  </div>
                ) : (
                  <button className="btn btn-success btn-sm" onClick={() => unlockContact(req._id)}>
                    🔓 Unlock Contact Info
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
