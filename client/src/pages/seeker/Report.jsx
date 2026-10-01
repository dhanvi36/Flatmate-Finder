import { useState, useEffect } from 'react'
import api from '../../api/axios'

const REASONS = ['fake_listing','fake_user','scam','inappropriate_content','spam','other']

export default function Report() {
  const [form, setForm] = useState({
    reportedUser: '', reportedRoom: '', reason: '', description: '',
  })
  const [myReports, setMyReports] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [msg,       setMsg]       = useState({ type:'', text:'' })
  const [target,    setTarget]    = useState('user') // 'user' | 'room'

  useEffect(() => { fetchMyReports() }, [])

  const fetchMyReports = async () => {
    try {
      const { data } = await api.get('/reports/my-reports')
      setMyReports(data.reports || data || [])
    } catch { }
    finally { setLoading(false) }
  }

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const payload = {
      reason:      form.reason,
      description: form.description,
      ...(target === 'user' ? { reportedUser: form.reportedUser } : { reportedRoom: form.reportedRoom }),
    }
    try {
      await api.post('/reports', payload)
      setMsg({ type:'success', text:'Report submitted. Our team will review it.' })
      setForm({ reportedUser:'', reportedRoom:'', reason:'', description:'' })
      fetchMyReports()
    } catch (err) {
      setMsg({ type:'error', text: err.response?.data?.message || 'Failed to submit report' })
    }
    setTimeout(() => setMsg({}), 5000)
  }

  const BADGE = { pending:'badge-yellow', reviewed:'badge-blue', resolved:'badge-green', dismissed:'badge-gray' }

  return (
    <div className="page">
      <h1 className="page-title">🚩 Report a User or Room</h1>

      {msg.text && (
        <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>{msg.text}</div>
      )}

      {/* Submit Form */}
      <div className="card" style={{ marginBottom:'2rem', maxWidth:580 }}>
        <h2 style={{ fontWeight:700, marginBottom:'1rem' }}>Submit a Report</h2>

        <div style={{ display:'flex', gap:'.75rem', marginBottom:'1rem' }}>
          {['user','room'].map(t => (
            <button key={t}
              className={`btn btn-sm ${target === t ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setTarget(t)}>
              {t === 'user' ? '👤 Report a User' : '🏠 Report a Room'}
            </button>
          ))}
        </div>

        <form onSubmit={submit}>
          {target === 'user' ? (
            <div className="form-group">
              <label>User ID to Report</label>
              <input className="form-control" name="reportedUser" value={form.reportedUser}
                onChange={handle} placeholder="Paste the user's ID" required />
              <span className="form-error" style={{ color:'var(--text-light)', fontSize:'.8rem' }}>
                You can find a user's ID from their profile or contact info
              </span>
            </div>
          ) : (
            <div className="form-group">
              <label>Room ID to Report</label>
              <input className="form-control" name="reportedRoom" value={form.reportedRoom}
                onChange={handle} placeholder="Paste the room's ID" required />
            </div>
          )}

          <div className="form-group">
            <label>Reason</label>
            <select className="form-control" name="reason" value={form.reason} onChange={handle} required>
              <option value="">Select a reason…</option>
              {REASONS.map(r => (
                <option key={r} value={r}>{r.replace(/_/g,' ')}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" name="description" rows={4}
              value={form.description} onChange={handle}
              placeholder="Describe the issue in detail…" />
          </div>

          <button className="btn btn-danger">🚩 Submit Report</button>
        </form>
      </div>

      {/* My Reports */}
      <h2 style={{ fontWeight:700, marginBottom:'1rem' }}>My Submitted Reports</h2>

      {loading && <div className="spinner" />}

      {!loading && myReports.length === 0 && (
        <div className="empty-state">
          <div className="icon">✅</div>
          <p>No reports submitted yet.</p>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
        {myReports.map(r => (
          <div className="card" key={r._id}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <p style={{ fontWeight:600, textTransform:'capitalize' }}>{r.reason?.replace(/_/g,' ')}</p>
                <p className="text-light" style={{ fontSize:'.85rem' }}>
                  {r.reportedUser ? `User: ${r.reportedUser?.name || r.reportedUser}` : ''}
                  {r.reportedRoom ? `Room: ${r.reportedRoom?.title || r.reportedRoom}` : ''}
                </p>
                {r.description && <p style={{ fontSize:'.88rem', marginTop:'.4rem' }}>{r.description}</p>}
              </div>
              <span className={`badge ${BADGE[r.status] || 'badge-gray'}`}>{r.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
