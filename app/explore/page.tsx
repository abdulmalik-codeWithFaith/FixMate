'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Star, SlidersHorizontal, X, ChevronDown, ArrowLeft, Navigation, Loader } from 'lucide-react'

// FIREBASE IMPORTS
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

const skills = ['All', 'Electrician', 'Plumber', 'Carpenter', 'Painter', 'Tiling', 'Technician', 'AC Repair']
const sortOptions = ['Top Rated', 'Most Jobs', 'Price: Low to High', 'Price: High to Low']

// ─── HAVERSINE DISTANCE ───────────────────────────────────────────────────────
// Calculates straight-line distance in km between two lat/lng coordinates
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m away`
  if (km < 10) return `${km.toFixed(1)}km away`
  return `${Math.round(km)}km away`
}

const S = `
  .explore-page { min-height: 100vh; background: #FAFAF8; padding-top: 68px; }
  .explore-header { background: white; border-bottom: 1px solid #E8E6E1; padding: 28px 40px 0; }
  .explore-header-inner { max-width: 1200px; margin: 0 auto; }
  .explore-back { display: flex; align-items: center; gap: 6px; color: #AFAFAF; cursor: pointer; margin-bottom: 14px; width: fit-content; transition: color 0.2s; border: none; background: none; padding: 0; font-family: 'DM Sans', sans-serif; font-size: 14px; }
  .explore-back:hover { color: #0F0F0F; }
  .explore-title { font-family: 'Syne', sans-serif; font-size: clamp(28px, 4vw, 42px); font-weight: 800; letter-spacing: -1.5px; color: #0F0F0F; margin-bottom: 4px; }
  .explore-title em { color: #FF5C1A; font-style: normal; }
  .explore-sub { font-size: 15px; color: #6B6B6B; font-weight: 300; margin-bottom: 22px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

  /* LOCATION PILL */
  .location-pill {
    display: inline-flex; align-items: center; gap: 5px;
    background: #F0FDF4; border: 1px solid rgba(22,163,74,0.2);
    color: #16A34A; font-family: 'Syne', sans-serif;
    font-size: 12px; font-weight: 600;
    padding: 4px 10px; border-radius: 100px;
  }
  .location-pill.loading {
    background: #FFF3EE; border-color: rgba(255,92,26,0.2); color: #FF5C1A;
  }
  .location-pill.error {
    background: #FEF2F2; border-color: rgba(239,68,68,0.2); color: #EF4444;
  }

  .search-row { display: flex; gap: 12px; align-items: center; }
  .search-field { flex: 1; display: flex; align-items: center; gap: 10px; background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 12px; padding: 11px 16px; transition: border-color 0.2s; }
  .search-field:focus-within { border-color: #FF5C1A; background: white; }
  .search-field input { flex: 1; border: none; outline: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 15px; color: #0F0F0F; }
  .search-field input::placeholder { color: #AFAFAF; }
  .filter-toggle-btn { display: flex; align-items: center; gap: 8px; background: #0F0F0F; color: white; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; border: none; border-radius: 12px; padding: 11px 20px; cursor: pointer; transition: background 0.2s; white-space: nowrap; }
  .filter-toggle-btn:hover { background: #1A1A1A; }
  .filter-toggle-btn.active { background: #FF5C1A; }
  .skill-tabs { display: flex; gap: 8px; overflow-x: auto; padding: 18px 0 0; scrollbar-width: none; }
  .skill-tabs::-webkit-scrollbar { display: none; }
  .skill-tab { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; padding: 7px 16px; border-radius: 100px; white-space: nowrap; border: 1.5px solid #E8E6E1; background: transparent; color: #6B6B6B; cursor: pointer; transition: all 0.2s; }
  .skill-tab:hover { border-color: #FF5C1A; color: #FF5C1A; }
  .skill-tab.active { background: #FF5C1A; border-color: #FF5C1A; color: white; }

  .explore-body { max-width: 1200px; margin: 0 auto; padding: 28px 40px; display: grid; grid-template-columns: 260px 1fr; gap: 28px; align-items: start; }

  .filter-sidebar { background: white; border: 1px solid #E8E6E1; border-radius: 16px; padding: 22px; position: sticky; top: 88px; }
  .filter-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between; }
  .filter-clear { font-size: 12px; color: #FF5C1A; cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 500; background: none; border: none; transition: opacity 0.2s; }
  .filter-clear:hover { opacity: 0.7; }
  .filter-group { margin-bottom: 22px; }
  .filter-group-label { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; color: #0F0F0F; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; display: block; }
  .filter-option { display: flex; align-items: center; gap: 10px; padding: 8px 0; cursor: pointer; font-size: 14px; color: #6B6B6B; user-select: none; transition: color 0.15s; }
  .filter-option:hover { color: #0F0F0F; }
  .filter-checkbox { width: 18px; height: 18px; border-radius: 5px; border: 1.5px solid #E8E6E1; background: white; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }
  .filter-checkbox.checked { background: #FF5C1A; border-color: #FF5C1A; color: white; font-size: 11px; }
  .filter-range { width: 100%; accent-color: #FF5C1A; }
  .filter-range-labels { display: flex; justify-content: space-between; font-size: 12px; color: #6B6B6B; margin-top: 6px; }
  .filter-radio { width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid #E8E6E1; background: white; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }
  .filter-radio.checked { border-color: #FF5C1A; }
  .filter-radio.checked::after { content: ''; width: 8px; height: 8px; background: #FF5C1A; border-radius: 50%; }
  .apply-btn { width: 100%; background: #FF5C1A; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; border: none; border-radius: 10px; padding: 12px; cursor: pointer; transition: background 0.2s; }
  .apply-btn:hover { background: #FF7A40; }

  .results-area { min-width: 0; }
  .results-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; gap: 12px; flex-wrap: wrap; }
  .results-count { font-size: 14px; color: #6B6B6B; }
  .results-count strong { font-family: 'Syne', sans-serif; color: #0F0F0F; font-weight: 700; }
  .sort-select { display: flex; align-items: center; gap: 8px; background: white; border: 1.5px solid #E8E6E1; border-radius: 10px; padding: 8px 14px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #0F0F0F; transition: border-color 0.2s; }
  .sort-select:hover { border-color: #FF5C1A; }
  .sort-select select { border: none; outline: none; background: transparent; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #0F0F0F; cursor: pointer; }

  .workers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
  .worker-card { background: white; border: 1px solid #E8E6E1; border-radius: 16px; padding: 22px; transition: all 0.25s; cursor: pointer; text-decoration: none; color: inherit; display: block; }
  .worker-card:hover { border-color: #FF5C1A; transform: translateY(-3px); box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
  .worker-top { display: flex; align-items: flex-start; gap: 13px; margin-bottom: 12px; }
  .worker-avatar { width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px; position: relative; flex-shrink: 0; }
  .avail-dot { position: absolute; bottom: 1px; right: 1px; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; }
  .worker-info { flex: 1; min-width: 0; }
  .worker-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .worker-skill-badge { display: inline-block; font-size: 11px; font-weight: 600; background: #FFF3EE; color: #FF5C1A; padding: 3px 9px; border-radius: 100px; margin: 3px 0; }
  .worker-loc { display: flex; align-items: center; gap: 3px; font-size: 12px; color: #6B6B6B; }
  .rating-pill { display: flex; align-items: center; gap: 4px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #0F0F0F; flex-shrink: 0; }
  .worker-bio { font-size: 13px; color: #6B6B6B; line-height: 1.6; margin-bottom: 14px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-weight: 300; }
  .worker-footer { display: flex; align-items: center; justify-content: space-between; }
  .worker-price { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; }
  .worker-price span { font-size: 12px; font-weight: 400; color: #6B6B6B; }
  .view-btn { background: #FF5C1A; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 13px; border: none; border-radius: 9px; padding: 8px 16px; cursor: pointer; text-decoration: none; transition: background 0.2s; }
  .view-btn:hover { background: #FF7A40; }

  /* DISTANCE BADGE ON CARD */
  .distance-badge {
    display: inline-flex; align-items: center; gap: 3px;
    font-size: 11px; font-weight: 600;
    background: #F0FDF4; color: #16A34A;
    border: 1px solid rgba(22,163,74,0.15);
    padding: 2px 8px; border-radius: 100px; margin-top: 3px;
  }

  /* LOCATION MODAL */
  .location-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.55);
    z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px;
    backdrop-filter: blur(4px);
  }
  .location-modal {
    background: white; border-radius: 24px; padding: 44px 40px;
    max-width: 420px; width: 100%; text-align: center;
    box-shadow: 0 24px 80px rgba(0,0,0,0.2);
    animation: popIn 0.35s cubic-bezier(0.175,0.885,0.32,1.275);
  }
  @keyframes popIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .location-modal-icon {
    width: 72px; height: 72px; border-radius: 50%;
    background: #FFF3EE; border: 2px solid rgba(255,92,26,0.2);
    display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;
  }
  .location-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: #0F0F0F; margin-bottom: 10px; }
  .location-sub { font-size: 14px; color: #6B6B6B; font-weight: 300; line-height: 1.65; margin-bottom: 28px; }
  .location-allow {
    width: 100%; background: #FF5C1A; color: white;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 15px;
    border: none; border-radius: 12px; padding: 14px; cursor: pointer;
    margin-bottom: 10px; transition: background 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .location-allow:hover:not(:disabled) { background: #FF7A40; }
  .location-allow:disabled { opacity: 0.7; cursor: not-allowed; }
  .location-skip {
    width: 100%; background: transparent; color: #6B6B6B;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px;
    border: 1.5px solid #E8E6E1; border-radius: 12px; padding: 12px; cursor: pointer;
    transition: all 0.2s;
  }
  .location-skip:hover { background: #F5F4F1; color: #0F0F0F; }
  .location-error { font-size: 13px; color: #EF4444; margin-top: 12px; display: flex; align-items: center; gap: 6px; justify-content: center; }

  /* LOADING & EMPTY */
  .loading-screen { height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; }
  .loading-spinner { width: 40px; height: 40px; border-radius: 50%; border: 3px solid #E8E6E1; border-top-color: #FF5C1A; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-text { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 15px; color: #6B6B6B; }
  .empty-state { text-align: center; padding: 60px 20px; }
  .empty-icon { width: 64px; height: 64px; background: #F5F4F1; border-radius: 18px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
  .empty-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px; color: #0F0F0F; margin-bottom: 6px; }
  .empty-sub { font-size: 14px; color: #6B6B6B; }

  @media (max-width: 900px) {
    .explore-header { padding: 20px 20px 0; }
    .explore-body { grid-template-columns: 1fr; padding: 20px 16px; }
    .filter-sidebar { display: none; }
  }
`

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface UserCoords { lat: number; lng: number }
type LocationStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'unavailable'

export default function ExplorePage() {
  const router = useRouter()

  const [workers, setWorkers]           = useState<any[]>([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [activeSkill, setActiveSkill]   = useState('All')
  const [showFilters, setShowFilters]   = useState(true)
  const [sortBy, setSortBy]             = useState('Top Rated')
  const [maxPrice, setMaxPrice]         = useState(100)
  const [minRating, setMinRating]       = useState(0)
  const [availableOnly, setAvailableOnly] = useState(false)

  // ── LOCATION STATE ──────────────────────────────────────────────────────────
  const [showLocationModal, setShowLocationModal] = useState(true)
  const [locationStatus, setLocationStatus]       = useState<LocationStatus>('idle')
  const [userCoords, setUserCoords]               = useState<UserCoords | null>(null)
  const [locationLabel, setLocationLabel]         = useState<string>('')
  const [locationError, setLocationError]         = useState<string>('')

  // ── FETCH WORKERS FROM FIREBASE ─────────────────────────────────────────────
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const snap = await getDocs(collection(db, 'workers'))
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setWorkers(data)
      } catch (err) {
        console.error('Error fetching workers:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchWorkers()
  }, [])

  // ── REQUEST GEOLOCATION ─────────────────────────────────────────────────────
  const handleAllowLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable')
      setLocationError('Geolocation is not supported by your browser.')
      return
    }

    setLocationStatus('loading')
    setLocationError('')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setUserCoords({ lat: latitude, lng: longitude })
        setLocationStatus('granted')

        // ── REVERSE GEOCODE to get a readable location name ──────────────────
        // Uses the free OpenStreetMap Nominatim API — no API key needed
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          )
          const data = await res.json()
          // Build a short label: neighbourhood + city, or just city
          const addr = data.address || {}
          const parts = [
            addr.neighbourhood || addr.suburb || addr.quarter || addr.village,
            addr.city || addr.town || addr.county,
          ].filter(Boolean)
          setLocationLabel(parts.join(', ') || data.display_name?.split(',')[0] || 'Your location')
        } catch {
          // Reverse geocode failed — still close the modal, just no label
          setLocationLabel('Your location')
        }

        // Close modal after a brief success flash
        setTimeout(() => setShowLocationModal(false), 800)
      },
      (error) => {
        // User denied or something else went wrong
        setLocationStatus('denied')
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Location access was denied. You can still browse all workers.')
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationError('Location unavailable. Check your device settings.')
        } else if (error.code === error.TIMEOUT) {
          setLocationError('Location request timed out. Please try again.')
        } else {
          setLocationError('Could not get your location. Please try again.')
        }
      },
      {
        enableHighAccuracy: false,  // faster + works better indoors
        timeout: 10000,
        maximumAge: 300000,         // reuse cached result if under 5 min old
      }
    )
  }

  const handleSkipLocation = () => {
    setShowLocationModal(false)
    setLocationStatus('denied')
  }

  // ── FILTER + SORT ───────────────────────────────────────────────────────────
  let filtered = workers.filter(w => {
    const matchSkill  = activeSkill === 'All' || w.skill === activeSkill
    const matchSearch = [w.name, w.skill, w.location]
      .map(v => (v || '').toLowerCase())
      .some(v => v.includes(search.toLowerCase()))
    const matchPrice  = (w.price || 0) <= maxPrice
    const matchRating = (w.rating || 0) >= minRating
    const matchAvail  = !availableOnly || w.available
    return matchSkill && matchSearch && matchPrice && matchRating && matchAvail
  })

  // ── SORT: if location granted, inject distance + sort nearby first ──────────
  if (userCoords) {
    filtered = filtered.map(w => ({
      ...w,
      _distanceKm: w.lat && w.lng
        ? getDistanceKm(userCoords.lat, userCoords.lng, w.lat, w.lng)
        : null,
    }))
  }

  if (sortBy === 'Top Rated')           filtered = [...filtered].sort((a, b) => b.rating - a.rating)
  if (sortBy === 'Most Jobs')           filtered = [...filtered].sort((a, b) => b.jobs - a.jobs)
  if (sortBy === 'Price: Low to High')  filtered = [...filtered].sort((a, b) => a.price - b.price)
  if (sortBy === 'Price: High to Low')  filtered = [...filtered].sort((a, b) => b.price - a.price)
  // When location is granted and "Top Rated" is selected, also sort by distance
  if (sortBy === 'Top Rated' && userCoords) {
    filtered = [...filtered].sort((a, b) => {
      // Workers without coordinates go to the bottom
      if (a._distanceKm === null) return 1
      if (b._distanceKm === null) return -1
      return a._distanceKm - b._distanceKm
    })
  }

  // ── LOADING SCREEN ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <style>{S}</style>
        <div className="loading-screen">
          <div className="loading-spinner" />
          <p className="loading-text">Loading workers…</p>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{S}</style>
      <div className="explore-page">

        {/* ── LOCATION MODAL ── */}
        {showLocationModal && (
          <div className="location-overlay">
            <div className="location-modal">
              <div className="location-modal-icon">
                {locationStatus === 'loading'
                  ? <Loader size={30} color="#FF5C1A" style={{ animation: 'spin 1s linear infinite' }} />
                  : <Navigation size={30} color="#FF5C1A" />
                }
              </div>
              <h2 className="location-title">
                {locationStatus === 'granted' ? 'Location Found!' : 'Find Workers Near You'}
              </h2>
              <p className="location-sub">
                {locationStatus === 'granted'
                  ? `Showing workers nearest to ${locationLabel}.`
                  : 'Allow location access so we can show the closest available workers first — no account required.'
                }
              </p>

              {locationStatus !== 'granted' && (
                <>
                  <button
                    className="location-allow"
                    onClick={handleAllowLocation}
                    disabled={locationStatus === 'loading'}
                  >
                    {locationStatus === 'loading' ? (
                      <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Getting location…</>
                    ) : (
                      <><Navigation size={16} /> Allow Location Access</>
                    )}
                  </button>
                  <button className="location-skip" onClick={handleSkipLocation}>
                    Skip — browse all workers
                  </button>
                  {locationError && (
                    <p className="location-error">{locationError}</p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── HEADER ── */}
        <div className="explore-header">
          <div className="explore-header-inner">
            <button className="explore-back" onClick={() => router.back()}>
              <ArrowLeft size={18} /> Back
            </button>

            <h1 className="explore-title">Find <em>Skilled Workers</em></h1>

            <div className="explore-sub">
              <span>Browse {workers.length} verified artisans</span>
              {locationStatus === 'granted' && locationLabel && (
                <span className="location-pill">
                  <Navigation size={11} /> Near {locationLabel}
                </span>
              )}
              {locationStatus === 'loading' && (
                <span className="location-pill loading">
                  <Loader size={11} style={{ animation: 'spin 1s linear infinite' }} /> Getting location…
                </span>
              )}
              {locationStatus === 'denied' && (
                <button
                  onClick={() => { setShowLocationModal(true); setLocationStatus('idle'); setLocationError('') }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF5C1A', fontFamily: 'Syne', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
                >
                  <Navigation size={11} /> Enable location
                </button>
              )}
            </div>

            <div className="search-row">
              <div className="search-field">
                <Search size={17} color="#AFAFAF" />
                <input
                  type="text"
                  placeholder="Search by name, skill or location…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <X size={16} onClick={() => setSearch('')} style={{ cursor: 'pointer', color: '#AFAFAF' }} />
                )}
              </div>
              <button
                className={`filter-toggle-btn${showFilters ? ' active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal size={16} /> Filters
              </button>
            </div>

            <div className="skill-tabs">
              {skills.map(s => (
                <button
                  key={s}
                  className={`skill-tab${activeSkill === s ? ' active' : ''}`}
                  onClick={() => setActiveSkill(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="explore-body" style={{ gridTemplateColumns: showFilters ? '260px 1fr' : '1fr' }}>

          {/* Sidebar */}
          {showFilters && (
            <div className="filter-sidebar">
              <div className="filter-title">
                Filters
                <button
                  className="filter-clear"
                  onClick={() => { setMinRating(0); setMaxPrice(100); setAvailableOnly(false) }}
                >
                  Clear all
                </button>
              </div>

              {/* Availability */}
              <div className="filter-group">
                <span className="filter-group-label">Availability</span>
                <div className="filter-option" onClick={() => setAvailableOnly(!availableOnly)}>
                  <div className={`filter-checkbox${availableOnly ? ' checked' : ''}`}>
                    {availableOnly && '✓'}
                  </div>
                  Available now only
                </div>
              </div>

              {/* Min Rating */}
              <div className="filter-group">
                <span className="filter-group-label">Minimum Rating</span>
                {[0, 4, 4.5, 4.8].map(r => (
                  <div key={r} className="filter-option" onClick={() => setMinRating(r)}>
                    <div className={`filter-radio${minRating === r ? ' checked' : ''}`} />
                    {r === 0 ? 'Any rating' : `${r}★ and above`}
                  </div>
                ))}
              </div>

              {/* Max Price */}
              <div className="filter-group">
                <span className="filter-group-label">Max Price ($/hr)</span>
                <input
                  type="range" min={10} max={100} step={5}
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="filter-range"
                  style={{ width: '100%', marginTop: 8 }}
                />
                <div className="filter-range-labels">
                  <span>$10</span>
                  <span style={{ color: '#FF5C1A', fontWeight: 600 }}>${maxPrice}/hr</span>
                  <span>$100+</span>
                </div>
              </div>

              <button className="apply-btn">Apply Filters</button>
            </div>
          )}

          {/* Results */}
          <div className="results-area">
            <div className="results-bar">
              <p className="results-count">
                <strong>{filtered.length}</strong> workers found
                {activeSkill !== 'All' && ` in ${activeSkill}`}
                {search && ` matching "${search}"`}
                {userCoords && ' · Sorted by distance'}
              </p>
              <div className="sort-select">
                <ChevronDown size={14} />
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  {sortOptions.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><Search size={26} color="#AFAFAF" /></div>
                <p className="empty-title">No workers found</p>
                <p className="empty-sub">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="workers-grid">
                {filtered.map(w => (
                  <Link key={w.id} href={`/explore/${w.id}`} className="worker-card">
                    <div className="worker-top">
                      <div
                        className="worker-avatar"
                        style={{ background: w.avatarBg || '#FFF3EE', color: w.avatarColor || '#FF5C1A' }}
                      >
                        {w.initials || w.name?.charAt(0) || '?'}
                        <span
                          className="avail-dot"
                          style={{ background: w.available ? '#22C55E' : '#D1D5DB' }}
                        />
                      </div>
                      <div className="worker-info">
                        <p className="worker-name">{w.name}</p>
                        <span className="worker-skill-badge">{w.skill}</span>
                        <div className="worker-loc"><MapPin size={11} /> {w.location}</div>
                        {/* Show distance badge only if we have their coordinates */}
                        {w._distanceKm !== null && w._distanceKm !== undefined && (
                          <span className="distance-badge">
                            <Navigation size={10} /> {formatDistance(w._distanceKm)}
                          </span>
                        )}
                      </div>
                      <div className="rating-pill">
                        <Star size={13} fill="#F59E0B" color="#F59E0B" /> {w.rating}
                      </div>
                    </div>
                    <p className="worker-bio">{w.bio}</p>
                    <div className="worker-footer">
                      <span className="worker-price">
                        {w.currency || '$'}{w.price} <span>/hr</span>
                      </span>
                      <span className="view-btn">View Profile</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}