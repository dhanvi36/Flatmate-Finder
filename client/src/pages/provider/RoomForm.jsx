import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'

function photoUrl(photo) {
  const raw = Array.isArray(photo) ? photo[0] : photo
  if (!raw || typeof raw !== 'string') return null
  if (raw.startsWith('/uploads/')) return raw
  return `/uploads/${raw.replace(/.*[/\\]/, '')}`
}

const AMENITY_OPTIONS = [
  'WiFi', 'AC', 'Parking', 'Laundry', 'Gym', 'Swimming Pool',
  'Security', 'Power Backup', 'Water 24/7', 'Furnished',
]

const FIXED_CITY = 'Nadiad'

// ── Listing type option card ──────────────────────────────────────────────────
function TypeCard({ icon, title, desc, selected, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      border:        `2px solid ${selected ? 'var(--primary)' : 'var(--border)'}`,
      borderRadius:  'var(--radius-lg)',
      padding:       '1.5rem 1.25rem',
      background:    selected ? 'var(--primary-light)' : 'var(--surface)',
      cursor:        'pointer',
      textAlign:     'left',
      transition:    'all .15s',
      flex:          1,
      minWidth:      220,
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '.625rem' }}>{icon}</div>
      <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: '.35rem' }}>
        {title}
      </p>
      <p style={{ fontSize: '.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</p>
      {selected && (
        <div style={{
          marginTop: '.75rem', display: 'inline-block',
          background: 'var(--primary)', color: '#fff',
          fontSize: '.72rem', fontWeight: 700, padding: '.2rem .65rem',
          borderRadius: 999, letterSpacing: '.04em',
        }}>
          SELECTED
        </div>
      )}
    </button>
  )
}

export default function RoomForm() {
  const { id }     = useParams()
  const isEdit     = Boolean(id)
  const navigate   = useNavigate()

  // Step 1 — only shown for new listings
  const [listingType,    setListingType]    = useState('')   // 'roommate' | 'tenant'
  const [stepDone,       setStepDone]       = useState(isEdit)

  const [form, setForm] = useState({
    title: '', description: '', rent: '', availableFrom: '',
    maxOccupants: 1, preferredGender: '', preferredOccupation: '',
    'location.area': '',
    amenities: [],
  })
  const [photos,       setPhotos]       = useState([])
  const [existPhotos,  setExistPhotos]  = useState([])
  const [loading,      setLoading]      = useState(false)
  const [fetchLoading, setFetchLoading] = useState(isEdit)
  const [error,        setError]        = useState('')

  useEffect(() => { if (isEdit) loadRoom() }, [id])

  const loadRoom = async () => {
    try {
      const { data } = await api.get(`/rooms/${id}`)
      const r = data.room || data
      setForm({
        title:               r.title               || '',
        description:         r.description         || '',
        rent:                r.rent                || '',
        availableFrom:       r.availableFrom ? r.availableFrom.slice(0, 10) : '',
        maxOccupants:        r.maxOccupants         || 1,
        preferredGender:     r.preferredGender      || '',
        preferredOccupation: r.preferredOccupation  || '',
        'location.area':     r.location?.area       || '',
        amenities:           r.amenities            || [],
      })
      setExistPhotos(r.photos || [])
    } catch { setError('Failed to load room') }
    finally  { setFetchLoading(false) }
  }

  // Pre-fill title hint based on listing type
  const proceedFromStep1 = () => {
    if (!listingType) return
    if (listingType === 'roommate') {
      setForm(f => ({ ...f, maxOccupants: 1,
        title: 'Room available — looking for flatmate',
        description: 'I own/rent a flat and am looking for a flatmate to share it with.',
      }))
    } else {
      setForm(f => ({ ...f,
        title: 'Room for rent',
        description: 'Full flat/room available for rent. Looking for a reliable tenant.',
      }))
    }
    setStepDone(true)
  }

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const toggleAmenity = a => setForm(f => ({
    ...f,
    amenities: f.amenities.includes(a)
      ? f.amenities.filter(x => x !== a)
      : [...f.amenities, a],
  }))

  const submit = async e => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const fd = new FormData()
      fd.append('title',               form.title)
      fd.append('description',         form.description)
      fd.append('rent',                form.rent)
      fd.append('availableFrom',       form.availableFrom)
      fd.append('maxOccupants',        form.maxOccupants)
      fd.append('preferredGender',     form.preferredGender)
      fd.append('preferredOccupation', form.preferredOccupation)
      fd.append('location[city]',      FIXED_CITY)           // always Nadiad
      fd.append('location[area]',      form['location.area'])
      form.amenities.forEach(a => fd.append('amenities', a))
      photos.forEach(ph => fd.append('photos', ph))

      if (isEdit) {
        await api.put(`/rooms/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        await api.post('/rooms', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      navigate('/provider')
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed')
    } finally { setLoading(false) }
  }

  if (fetchLoading) return <div className="spinner-wrap"><div className="spinner" /></div>

  // ── STEP 1: Choose listing type ─────────────────────────────────────────────
  if (!stepDone) {
    return (
      <div className="page" style={{ maxWidth: 680 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/provider')}
          style={{ marginBottom: '1.5rem' }}>
          ← Back
        </button>

        <h1 className="page-title">Create a Listing</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '.95rem' }}>
          Tell us what kind of listing you are creating so we can set it up correctly.
        </p>

        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <TypeCard
            icon="🤝"
            title="Looking for a Flatmate"
            desc="You already live in or own a flat and want someone to share it with you. You will be living together."
            selected={listingType === 'roommate'}
            onClick={() => setListingType('roommate')}
          />
          <TypeCard
            icon="🏠"
            title="Renting Out a Room / Flat"
            desc="You own or manage a property and want to rent it out fully to a tenant. You will not be living there."
            selected={listingType === 'tenant'}
            onClick={() => setListingType('tenant')}
          />
        </div>

        {listingType && (
          <div style={{
            background: 'var(--primary-light)', border: '1px solid var(--primary-mid)',
            borderRadius: 'var(--radius)', padding: '1rem 1.25rem', marginBottom: '1.5rem',
          }}>
            <p style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '.25rem' }}>
              {listingType === 'roommate' ? 'Flatmate listing selected' : 'Rental listing selected'}
            </p>
            <p style={{ fontSize: '.875rem', color: 'var(--text-secondary)' }}>
              {listingType === 'roommate'
                ? 'Max occupants will default to 1. You can adjust this on the next screen.'
                : 'We will set this up as a full rental. Set the number of people you want to accommodate.'}
            </p>
          </div>
        )}

        <button
          className="btn btn-primary btn-lg"
          onClick={proceedFromStep1}
          disabled={!listingType}
        >
          Continue to Listing Details →
        </button>
      </div>
    )
  }

  // ── STEP 2: Full listing form ───────────────────────────────────────────────
  return (
    <div className="page">
      <button className="btn btn-ghost btn-sm"
        onClick={() => { if (isEdit) navigate('/provider'); else setStepDone(false) }}
        style={{ marginBottom: '1rem' }}>
        ← {isEdit ? 'Back to My Rooms' : 'Back'}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>
          {isEdit ? 'Edit Room' : listingType === 'roommate' ? 'Flatmate Listing' : 'Rental Listing'}
        </h1>
        {!isEdit && (
          <span style={{
            background: listingType === 'roommate' ? '#d1fae5' : '#dbeafe',
            color:       listingType === 'roommate' ? '#065f46' : '#1e40af',
            padding: '.25rem .75rem', borderRadius: 999,
            fontSize: '.78rem', fontWeight: 700,
          }}>
            {listingType === 'roommate' ? 'Flatmate' : 'Rental'}
          </span>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ maxWidth: 720 }}>
        <form onSubmit={submit}>

          {/* Basic Info */}
          <p style={{ fontWeight: 700, fontSize: '.825rem', textTransform: 'uppercase',
            letterSpacing: '.06em', color: 'var(--text-muted)', marginBottom: '.75rem' }}>
            Basic Info
          </p>

          <div className="form-group">
            <label className="form-label">Room Title *</label>
            <input className="form-control" name="title" value={form.title} onChange={handle}
              placeholder="e.g. Spacious 2BHK near CHARUSAT" required />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" name="description" value={form.description}
              onChange={handle} rows={3} placeholder="Describe your room or flat..." />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Monthly Rent (₹) *</label>
              <input className="form-control" type="number" name="rent" value={form.rent}
                onChange={handle} min={0} placeholder="e.g. 6000" required />
            </div>
            <div className="form-group">
              <label className="form-label">Max Occupants *</label>
              <input className="form-control" type="number" name="maxOccupants"
                value={form.maxOccupants} onChange={handle} min={1} required />
            </div>
            <div className="form-group">
              <label className="form-label">Available From *</label>
              <input className="form-control" type="date" name="availableFrom"
                value={form.availableFrom} onChange={handle} required />
            </div>
          </div>

          {/* Location — city locked */}
          <p style={{ fontWeight: 700, fontSize: '.825rem', textTransform: 'uppercase',
            letterSpacing: '.06em', color: 'var(--text-muted)', margin: '1.25rem 0 .75rem' }}>
            Location
          </p>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">City</label>
              <div style={{
                padding: '.6rem .875rem',
                background: '#f1f5f9',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span>{FIXED_CITY}</span>
                <span style={{
                  fontSize: '.72rem', fontWeight: 700, color: 'var(--text-muted)',
                  background: 'var(--border)', padding: '.1rem .5rem', borderRadius: 999,
                }}>
                  Fixed
                </span>
              </div>
              <span className="form-hint">Only {FIXED_CITY} is supported right now</span>
            </div>
            <div className="form-group">
              <label className="form-label">Area / Neighbourhood</label>
              <input className="form-control" name="location.area" value={form['location.area']}
                onChange={handle} placeholder="e.g. College Road, Vallabh Vidyanagar" />
            </div>
          </div>

          {/* Preferences */}
          <p style={{ fontWeight: 700, fontSize: '.825rem', textTransform: 'uppercase',
            letterSpacing: '.06em', color: 'var(--text-muted)', margin: '1.25rem 0 .75rem' }}>
            Tenant Preferences
          </p>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Preferred Gender</label>
              <select className="form-control" name="preferredGender"
                value={form.preferredGender} onChange={handle}>
                <option value="">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="any">Any</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Preferred Occupation</label>
              <input className="form-control" name="preferredOccupation"
                value={form.preferredOccupation} onChange={handle}
                placeholder="e.g. Student, Working Professional" />
            </div>
          </div>

          {/* Amenities */}
          <p style={{ fontWeight: 700, fontSize: '.825rem', textTransform: 'uppercase',
            letterSpacing: '.06em', color: 'var(--text-muted)', margin: '1.25rem 0 .75rem' }}>
            Amenities
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginBottom: '1rem' }}>
            {AMENITY_OPTIONS.map(a => (
              <button type="button" key={a}
                className={`btn btn-sm ${form.amenities.includes(a) ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => toggleAmenity(a)}>
                {form.amenities.includes(a) ? '✓ ' : ''}{a}
              </button>
            ))}
          </div>

          {/* Photos */}
          <p style={{ fontWeight: 700, fontSize: '.825rem', textTransform: 'uppercase',
            letterSpacing: '.06em', color: 'var(--text-muted)', margin: '1.25rem 0 .75rem' }}>
            Photos (up to 5)
          </p>

          {existPhotos.length > 0 && (
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '.75rem' }}>
              {existPhotos.map((ph, i) => (
                <img key={i} src={photoUrl(ph)} alt={`Photo ${i + 1}`}
                  style={{ height: 72, width: 72, objectFit: 'cover', borderRadius: 8,
                    border: '1px solid var(--border)' }}
                  onError={e => e.target.style.display = 'none'} />
              ))}
              <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                Current photos. Upload below to replace them.
              </p>
            </div>
          )}

          <div className="form-group">
            <input type="file" className="form-control" accept="image/*" multiple
              onChange={e => setPhotos(Array.from(e.target.files).slice(0, 5))} />
            {photos.length > 0 && (
              <span className="form-hint">{photos.length} file(s) selected</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.5rem',
            paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Listing'}
            </button>
            <button type="button" className="btn btn-ghost"
              onClick={() => isEdit ? navigate('/provider') : setStepDone(false)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
