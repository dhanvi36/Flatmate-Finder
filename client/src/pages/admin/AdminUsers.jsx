import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const ROLE_BADGE = {
  seeker:   'badge-green',
  provider: 'badge-blue',
  admin:    'badge-red',
}

export default function AdminUsers() {
  const { user: me } = useAuth()
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [msg,     setMsg]     = useState('')
  const [search,  setSearch]  = useState('')

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users/all')
      setUsers(data.users || data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const blockUser = async (userId) => {
    if (!confirm('Block this user? They will no longer be able to log in.')) return
    try {
      await api.put(`/users/${userId}/block`)
      setUsers(us => us.map(u => u._id === userId ? { ...u, accountStatus: 'blocked' } : u))
      setMsg('User blocked successfully.')
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to block user')
    }
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="spinner" />

  // Summary stats
  const stats = {
    total:    users.length,
    seekers:  users.filter(u => u.role === 'seeker').length,
    providers:users.filter(u => u.role === 'provider').length,
    blocked:  users.filter(u => u.accountStatus === 'blocked').length,
  }

  return (
    <div className="page">
      <h1 className="page-title">👥 User Management</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {msg   && <div className="alert alert-success">{msg}</div>}

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
        {[
          { label:'Total Users',   value: stats.total,     color:'var(--primary)' },
          { label:'Seekers',       value: stats.seekers,   color:'var(--secondary)' },
          { label:'Providers',     value: stats.providers, color:'#8b5cf6' },
          { label:'Blocked',       value: stats.blocked,   color:'var(--danger)' },
        ].map(s => (
          <div className="card" key={s.label} style={{ textAlign:'center' }}>
            <p style={{ fontSize:'2rem', fontWeight:800, color: s.color }}>{s.value}</p>
            <p className="text-light" style={{ fontSize:'.85rem' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="card" style={{ marginBottom:'1rem' }}>
        <input className="form-control" placeholder="🔍  Search by name, email or role…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Verification</th>
                <th>Age / Gender</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u._id}>
                  <td style={{ fontWeight:600 }}>{u.name}</td>
                  <td className="text-light">{u.email}</td>
                  <td><span className={`badge ${ROLE_BADGE[u.role] || 'badge-gray'}`}>{u.role}</span></td>
                  <td>
                    <span className={`badge badge-${u.accountStatus === 'active' ? 'green' : 'red'}`}>
                      {u.accountStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${
                      u.verificationStatus === 'verified' ? 'green' :
                      u.verificationStatus === 'rejected' ? 'red' : 'yellow'
                    }`}>{u.verificationStatus || 'pending'}</span>
                  </td>
                  <td className="text-light">
                    {u.age || '—'} / {u.gender || '—'}
                  </td>
                  <td>
                    {u._id !== me?.userId && u.accountStatus !== 'blocked' ? (
                      <button className="btn btn-danger btn-sm" onClick={() => blockUser(u._id)}>
                        🚫 Block
                      </button>
                    ) : u.accountStatus === 'blocked' ? (
                      <span className="text-light" style={{ fontSize:'.82rem' }}>Blocked</span>
                    ) : (
                      <span className="text-light" style={{ fontSize:'.82rem' }}>You</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign:'center', color:'var(--text-light)', padding:'2rem' }}>
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
