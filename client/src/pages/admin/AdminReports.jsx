import { useState, useEffect } from 'react'
import api from '../../api/axios'

const STATUS_BADGE = {
  pending:   'badge-yellow',
  reviewed:  'badge-blue',
  resolved:  'badge-green',
  dismissed: 'badge-gray',
}

const REPORT_STATUSES = ['pending', 'reviewed', 'resolved', 'dismissed']

export default function AdminReports() {
  const [reports,  setReports]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [msg,      setMsg]      = useState({ type:'', text:'' })
  const [filter,   setFilter]   = useState('all')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => { fetchReports() }, [])

  const fetchReports = async () => {
    try {
      const { data } = await api.get('/reports')
      setReports(data.reports || data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const updateReportStatus = async (reportId, status) => {
    try {
      await api.put(`/reports/${reportId}/status`, { status })
      setReports(rs => rs.map(r => r._id === reportId ? { ...r, status } : r))
      setMsg({ type:'success', text:`Report marked as ${status}.` })
      setTimeout(() => setMsg({}), 3000)
    } catch (err) {
      setMsg({ type:'error', text: err.response?.data?.message || 'Update failed' })
    }
  }

  const blockUser = async (userId) => {
    if (!confirm('Block this user?')) return
    try {
      await api.put(`/reports/block/user/${userId}`)
      setMsg({ type:'success', text:'User blocked.' })
      setTimeout(() => setMsg({}), 3000)
    } catch (err) {
      setMsg({ type:'error', text: err.response?.data?.message || 'Failed to block user' })
    }
  }

  const blockRoom = async (roomId) => {
    if (!confirm('Block this room listing?')) return
    try {
      await api.put(`/reports/block/room/${roomId}`)
      setMsg({ type:'success', text:'Room blocked.' })
      setTimeout(() => setMsg({}), 3000)
    } catch (err) {
      setMsg({ type:'error', text: err.response?.data?.message || 'Failed to block room' })
    }
  }

  const displayed = filter === 'all'
    ? reports
    : reports.filter(r => r.status === filter)

  // Stats
  const stats = REPORT_STATUSES.reduce((acc, s) => {
    acc[s] = reports.filter(r => r.status === s).length
    return acc
  }, {})

  if (loading) return <div className="spinner" />

  return (
    <div className="page">
      <h1 className="page-title">🚩 Reports Management</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {msg.text && (
        <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>{msg.text}</div>
      )}

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
        {[
          { label:'Total',     value: reports.length,   color:'var(--primary)' },
          { label:'Pending',   value: stats.pending,    color:'var(--warning)' },
          { label:'Resolved',  value: stats.resolved,   color:'var(--secondary)' },
          { label:'Dismissed', value: stats.dismissed,  color:'var(--text-light)' },
        ].map(s => (
          <div className="card" key={s.label} style={{ textAlign:'center' }}>
            <p style={{ fontSize:'2rem', fontWeight:800, color:s.color }}>{s.value}</p>
            <p className="text-light" style={{ fontSize:'.85rem' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:'.5rem', marginBottom:'1rem', flexWrap:'wrap' }}>
        {['all', ...REPORT_STATUSES].map(s => (
          <button key={s}
            className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(s)}>
            {s === 'all' ? `All (${reports.length})` : `${s} (${stats[s] || 0})`}
          </button>
        ))}
      </div>

      {displayed.length === 0 && (
        <div className="empty-state">
          <div className="icon">✅</div>
          <p>No reports in this category.</p>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
        {displayed.map(r => (
          <div className="card" key={r._id}>
            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'.5rem' }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'.25rem' }}>
                  <p style={{ fontWeight:700, textTransform:'capitalize' }}>
                    {r.reason?.replace(/_/g,' ')}
                  </p>
                  <span className={`badge ${STATUS_BADGE[r.status] || 'badge-gray'}`}>{r.status}</span>
                </div>
                <p className="text-light" style={{ fontSize:'.85rem' }}>
                  Reported by: <strong>{r.reporter?.name}</strong> ({r.reporter?.email})
                </p>
                {r.reportedUser && (
                  <p className="text-light" style={{ fontSize:'.85rem' }}>
                    Against user: <strong>{r.reportedUser?.name || r.reportedUser}</strong>
                  </p>
                )}
                {r.reportedRoom && (
                  <p className="text-light" style={{ fontSize:'.85rem' }}>
                    Against room: <strong>{r.reportedRoom?.title || r.reportedRoom}</strong>
                  </p>
                )}
              </div>
              <button className="btn btn-outline btn-sm"
                onClick={() => setExpanded(e => e === r._id ? null : r._id)}>
                {expanded === r._id ? '▲ Less' : '▼ Details'}
              </button>
            </div>

            {/* Expanded details */}
            {expanded === r._id && (
              <div style={{ marginTop:'1rem', paddingTop:'1rem', borderTop:'1px solid var(--border)' }}>
                {r.description && (
                  <div style={{ marginBottom:'1rem' }}>
                    <p className="text-light" style={{ fontSize:'.78rem', textTransform:'uppercase', marginBottom:'.3rem' }}>Description</p>
                    <p>{r.description}</p>
                  </div>
                )}

                {r.adminAction && r.adminAction !== 'none' && (
                  <div style={{ marginBottom:'1rem' }}>
                    <p className="text-light" style={{ fontSize:'.78rem', textTransform:'uppercase', marginBottom:'.3rem' }}>Admin Action Taken</p>
                    <span className="badge badge-blue" style={{ textTransform:'capitalize' }}>
                      {r.adminAction.replace(/_/g,' ')}
                    </span>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display:'flex', gap:'.75rem', flexWrap:'wrap' }}>
                  {/* Status updates */}
                  {REPORT_STATUSES.filter(s => s !== r.status).map(s => (
                    <button key={s} className="btn btn-outline btn-sm"
                      onClick={() => updateReportStatus(r._id, s)}
                      style={{ textTransform:'capitalize' }}>
                      → Mark {s}
                    </button>
                  ))}

                  {/* Block actions */}
                  {r.reportedUser && (
                    <button className="btn btn-danger btn-sm"
                      onClick={() => blockUser(r.reportedUser?._id || r.reportedUser)}>
                      🚫 Block User
                    </button>
                  )}
                  {r.reportedRoom && (
                    <button className="btn btn-warning btn-sm"
                      onClick={() => blockRoom(r.reportedRoom?._id || r.reportedRoom)}>
                      🔒 Block Room
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
