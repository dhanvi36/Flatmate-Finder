import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'
import PublicNavbar from './components/PublicNavbar'

import Login    from './pages/auth/Login'
import Register from './pages/auth/Register'
import Profile  from './pages/Profile'

// Public pages
import Home    from './pages/public/Home'
import About   from './pages/public/About'
import Contact from './pages/public/Contact'

// Seeker
import Rooms      from './pages/seeker/Rooms'
import RoomDetail from './pages/seeker/RoomDetail'

// Provider
import MyRooms          from './pages/provider/MyRooms'
import RoomForm         from './pages/provider/RoomForm'
import ReceivedRequests from './pages/provider/ReceivedRequests'
import ProviderBookings from './pages/provider/ProviderBookings'

// Admin
import AdminUsers   from './pages/admin/AdminUsers'
import AdminReports from './pages/admin/AdminReports'

function RoleHome() {
  const { user, loading } = useAuth()
  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>
  if (!user)                return <Navigate to="/home"    replace />
  if (user.role === 'admin')    return <Navigate to="/admin"    replace />
  if (user.role === 'provider') return <Navigate to="/provider" replace />
  return <Navigate to="/seeker" replace />
}

export default function App() {
  const { user, loading } = useAuth()
  if (loading) return <div className="spinner-wrap" style={{ paddingTop:'35vh' }}><div className="spinner"/></div>

  // Show public navbar on public pages, app navbar when logged in
  const isPublic = !user

  return (
    <>
      {isPublic ? <PublicNavbar /> : <Navbar />}
      <Routes>
        {/* ── Public landing pages ── */}
        <Route path="/home"    element={<Home />} />
        <Route path="/about"   element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* ── Auth ── */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Root: redirect to home if not logged in, to dashboard if logged in ── */}
        <Route path="/" element={<RoleHome />} />

        {/* ── Shared ── */}
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

        {/* ── SEEKER ── */}
        <Route path="/seeker" element={<PrivateRoute roles={['seeker']}><Rooms /></PrivateRoute>} />
        <Route path="/seeker/rooms/:id" element={<PrivateRoute roles={['seeker']}><RoomDetail /></PrivateRoute>} />

        {/* ── PROVIDER ── */}
        <Route path="/provider"                element={<PrivateRoute roles={['provider']}><MyRooms /></PrivateRoute>} />
        <Route path="/provider/rooms/new"      element={<PrivateRoute roles={['provider']}><RoomForm /></PrivateRoute>} />
        <Route path="/provider/rooms/:id/edit" element={<PrivateRoute roles={['provider']}><RoomForm /></PrivateRoute>} />
        <Route path="/provider/requests"       element={<PrivateRoute roles={['provider']}><ReceivedRequests /></PrivateRoute>} />
        <Route path="/provider/bookings"       element={<PrivateRoute roles={['provider']}><ProviderBookings /></PrivateRoute>} />

        {/* ── ADMIN ── */}
        <Route path="/admin"         element={<PrivateRoute roles={['admin']}><AdminUsers /></PrivateRoute>} />
        <Route path="/admin/reports" element={<PrivateRoute roles={['admin']}><AdminReports /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
