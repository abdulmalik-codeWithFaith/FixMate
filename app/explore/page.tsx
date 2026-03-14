'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, Star, SlidersHorizontal, X, ChevronDown } from 'lucide-react'

// ─── DATA ────────────────────────────────────────────────────────────────────

const allWorkers = [
  { id: 'james-mitchell',    initials: 'JM', name: 'James Mitchell',    skill: 'Electrician', location: 'London, UK',       rating: 4.9, jobs: 214, price: 45,  currency: '£', bio: '9 years installing wiring, consumer units and solar systems. Fast, clean work with full compliance certification.',     avatarBg: '#FFF3EE', avatarColor: '#FF5C1A', available: true  },
  { id: 'carlos-rivera',     initials: 'CR', name: 'Carlos Rivera',     skill: 'Plumber',     location: 'Miami, USA',        rating: 4.8, jobs: 189, price: 60,  currency: '$', bio: 'Expert in pipe repairs, bathroom fitting and water heater installation. 12+ years. Bilingual — English & Spanish.',      avatarBg: '#EEF6FF', avatarColor: '#2563EB', available: true  },
  { id: 'aisha-patel',       initials: 'AP', name: 'Aisha Patel',       skill: 'Painter',     location: 'Dubai, UAE',        rating: 5.0, jobs: 302, price: 80,  currency: 'AED', bio: 'Interior & exterior painting specialist. Premium materials, minimal mess, stunning results every time.',              avatarBg: '#F0FDF4', avatarColor: '#16A34A', available: true  },
  { id: 'kenji-tanaka',      initials: 'KT', name: 'Kenji Tanaka',      skill: 'Carpenter',   location: 'Tokyo, Japan',      rating: 4.7, jobs: 155, price: 55,  currency: '$', bio: 'Custom furniture, cabinetry and woodwork. Trained in traditional Japanese joinery. Always delivers on time.',           avatarBg: '#FFF8EE', avatarColor: '#D97706', available: false },
  { id: 'amara-osei',        initials: 'AO', name: 'Amara Osei',        skill: 'Electrician', location: 'Accra, Ghana',      rating: 4.6, jobs: 98,  price: 30,  currency: '$', bio: 'Residential and commercial electrical installations. Reliable, punctual and safety-certified.',                        avatarBg: '#FFF3EE', avatarColor: '#FF5C1A', available: true  },
  { id: 'priya-sharma',      initials: 'PS', name: 'Priya Sharma',      skill: 'Technician',  location: 'Mumbai, India',     rating: 4.8, jobs: 267, price: 25,  currency: '$', bio: 'AC, appliance and electronics repair specialist. Fast diagnostics, same-day service available.',                        avatarBg: '#F5F0FF', avatarColor: '#7C3AED', available: true  },
  { id: 'lucas-mendes',      initials: 'LM', name: 'Lucas Mendes',      skill: 'Plumber',     location: 'São Paulo, Brazil', rating: 4.5, jobs: 143, price: 35,  currency: '$', bio: 'Pipe installation, leak repair and bathroom renovation. 8 years experience. Affordable and dependable.',               avatarBg: '#EEF6FF', avatarColor: '#2563EB', available: true  },
  { id: 'fatima-al-rashid',  initials: 'FR', name: 'Fatima Al-Rashid',  skill: 'Painter',     location: 'Riyadh, Saudi Arabia', rating: 4.9, jobs: 189, price: 70, currency: '$', bio: 'Decorative and textured wall painting expert. Creates stunning interiors with a refined eye for detail.',           avatarBg: '#F0FDF4', avatarColor: '#16A34A', available: false },
  { id: 'marco-rossi',       initials: 'MR', name: 'Marco Rossi',       skill: 'Carpenter',   location: 'Milan, Italy',      rating: 4.7, jobs: 211, price: 65,  currency: '€', bio: 'Bespoke furniture and restoration work. Classically trained Italian craftsman with an eye for detail.',              avatarBg: '#FFF8EE', avatarColor: '#D97706', available: true  },
  { id: 'sophie-dupont',     initials: 'SD', name: 'Sophie Dupont',     skill: 'Tiling',      location: 'Paris, France',     rating: 4.8, jobs: 134, price: 55,  currency: '€', bio: 'Bathroom, kitchen and floor tiling. Precision cuts, perfect finishes. 10 years professional experience.',             avatarBg: '#FFF0F5', avatarColor: '#DB2777', available: true  },
  { id: 'chen-wei',          initials: 'CW', name: 'Chen Wei',          skill: 'Technician',  location: 'Shanghai, China',   rating: 4.6, jobs: 322, price: 28,  currency: '$', bio: 'HVAC, electronics and appliance technician. Fast turnaround with transparent pricing.',                               avatarBg: '#F5F0FF', avatarColor: '#7C3AED', available: true  },
  { id: 'david-okonkwo',     initials: 'DO', name: 'David Okonkwo',     skill: 'Electrician', location: 'Lagos, Nigeria',    rating: 4.7, jobs: 176, price: 20,  currency: '$', bio: 'Solar installations, wiring and electrical fault repairs. Trusted by over 170 clients across Lagos.',                avatarBg: '#FFF3EE', avatarColor: '#FF5C1A', available: true  },
]

const skills    = ['All', 'Electrician', 'Plumber', 'Carpenter', 'Painter', 'Tiling', 'Technician', 'AC Repair']
const sortOptions = ['Top Rated', 'Most Jobs', 'Price: Low to High', 'Price: High to Low']

// ─── STYLES ──────────────────────────────────────────────────────────────────

const S = `
  .explore-page { min-height: 100vh; background: #FAFAF8; padding-top: 68px; }

  /* HEADER */
  .explore-header {
    background: white;
    border-bottom: 1px solid #E8E6E1;
    padding: 40px 40px 0;
  }
  .explore-header-inner { max-width: 1200px; margin: 0 auto; }
  .explore-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(28px, 4vw, 42px);
    font-weight: 800;
    letter-spacing: -1.5px;
    color: #0F0F0F;
    margin-bottom: 6px;
  }
  .explore-title em { color: #FF5C1A; font-style: normal; }
  .explore-sub { font-size: 15px; color: #6B6B6B; font-weight: 300; margin-bottom: 28px; }

  /* SEARCH ROW */
  .search-row {
    display: flex; gap: 12px; align-items: center;
    padding-bottom: 0;
  }
  .search-field {
    flex: 1;
    display: flex; align-items: center; gap: 10px;
    background: #F5F4F1; border: 1.5px solid #E8E6E1;
    border-radius: 12px; padding: 11px 16px;
  }
  .search-field input {
    flex: 1; border: none; outline: none; background: transparent;
    font-family: 'DM Sans', sans-serif; font-size: 15px; color: #0F0F0F;
  }
  .search-field input::placeholder { color: #AFAFAF; }
  .filter-toggle-btn {
    display: flex; align-items: center; gap: 8px;
    background: #0F0F0F; color: white;
    font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600;
    border: none; border-radius: 12px; padding: 11px 20px;
    cursor: pointer; transition: background 0.2s; white-space: nowrap;
  }
  .filter-toggle-btn:hover { background: #1A1A1A; }
  .filter-toggle-btn.active { background: #FF5C1A; }

  /* SKILL TABS */
  .skill-tabs {
    display: flex; gap: 8px; overflow-x: auto;
    padding: 20px 0 0;
    scrollbar-width: none;
  }
  .skill-tabs::-webkit-scrollbar { display: none; }
  .skill-tab {
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
    padding: 7px 16px; border-radius: 100px; white-space: nowrap;
    border: 1.5px solid #E8E6E1; background: transparent; color: #6B6B6B;
    cursor: pointer; transition: all 0.2s;
  }
  .skill-tab:hover { border-color: #FF5C1A; color: #FF5C1A; }
  .skill-tab.active { background: #FF5C1A; border-color: #FF5C1A; color: white; }

  /* BODY LAYOUT */
  .explore-body {
    max-width: 1200px; margin: 0 auto;
    padding: 32px 40px;
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 32px;
    align-items: start;
  }

  /* FILTER SIDEBAR */
  .filter-sidebar {
    background: white; border: 1px solid #E8E6E1;
    border-radius: 16px; padding: 24px;
    position: sticky; top: 88px;
  }
  .filter-title {
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px;
    color: #0F0F0F; margin-bottom: 20px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .filter-clear {
    font-size: 12px; color: #FF5C1A; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-weight: 500;
    background: none; border: none;
  }
  .filter-group { margin-bottom: 24px; }
  .filter-group-label {
    font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700;
    color: #0F0F0F; letter-spacing: 1px; text-transform: uppercase;
    margin-bottom: 12px; display: block;
  }
  .filter-option {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 0; cursor: pointer;
    font-size: 14px; color: #6B6B6B; transition: color 0.2s;
  }
  .filter-option:hover { color: #0F0F0F; }
  .filter-checkbox {
    width: 18px; height: 18px; border-radius: 5px;
    border: 1.5px solid #E8E6E1; background: white;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.2s; cursor: pointer;
  }
  .filter-checkbox.checked { background: #FF5C1A; border-color: #FF5C1A; }
  .filter-range { width: 100%; accent-color: #FF5C1A; }
  .filter-range-labels {
    display: flex; justify-content: space-between;
    font-size: 12px; color: #6B6B6B; margin-top: 6px;
  }
  .filter-radio {
    width: 18px; height: 18px; border-radius: 50%;
    border: 1.5px solid #E8E6E1; background: white;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.2s; cursor: pointer; flex-shrink: 0;
  }
  .filter-radio.checked { border-color: #FF5C1A; }
  .filter-radio.checked::after {
    content: ''; width: 8px; height: 8px;
    background: #FF5C1A; border-radius: 50%;
  }
  .apply-btn {
    width: 100%; background: #FF5C1A; color: white;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px;
    border: none; border-radius: 10px; padding: 12px;
    cursor: pointer; transition: background 0.2s;
  }
  .apply-btn:hover { background: #FF7A40; }

  /* RESULTS AREA */
  .results-area { min-width: 0; }
  .results-bar {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px; gap: 12px; flex-wrap: wrap;
  }
  .results-count { font-size: 14px; color: #6B6B6B; }
  .results-count strong { font-family: 'Syne', sans-serif; color: #0F0F0F; font-weight: 700; }
  .sort-select {
    display: flex; align-items: center; gap: 8px;
    background: white; border: 1.5px solid #E8E6E1;
    border-radius: 10px; padding: 8px 14px;
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
    color: #0F0F0F; cursor: pointer; transition: border-color 0.2s;
  }
  .sort-select:hover { border-color: #FF5C1A; }
  .sort-select select {
    border: none; outline: none; background: transparent;
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
    color: #0F0F0F; cursor: pointer;
  }

  /* WORKER CARDS GRID */
  .workers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
  .worker-card {
    background: white; border: 1px solid #E8E6E1;
    border-radius: 16px; padding: 22px;
    transition: all 0.25s; cursor: pointer; text-decoration: none; color: inherit;
    display: block;
  }
  .worker-card:hover { border-color: #FF5C1A; transform: translateY(-3px); box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
  .worker-top { display: flex; align-items: flex-start; gap: 13px; margin-bottom: 13px; }
  .worker-avatar {
    width: 52px; height: 52px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px;
    flex-shrink: 0; position: relative;
  }
  .avail-dot {
    position: absolute; bottom: 1px; right: 1px;
    width: 12px; height: 12px; border-radius: 50%;
    border: 2px solid white;
  }
  .worker-info { flex: 1; min-width: 0; }
  .worker-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .worker-skill-badge {
    display: inline-block; font-size: 11px; font-weight: 600;
    background: #FFF3EE; color: #FF5C1A;
    padding: 3px 9px; border-radius: 100px; margin: 3px 0;
  }
  .worker-loc { display: flex; align-items: center; gap: 3px; font-size: 12px; color: #6B6B6B; }
  .worker-rating-col { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
  .rating-pill {
    display: flex; align-items: center; gap: 4px;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #0F0F0F;
  }
  .jobs-count { font-size: 11px; color: #6B6B6B; }
  .worker-bio { font-size: 13px; color: #6B6B6B; line-height: 1.6; font-weight: 300; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .worker-footer { display: flex; align-items: center; justify-content: space-between; }
  .worker-price { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; }
  .worker-price span { font-size: 12px; font-weight: 400; color: #6B6B6B; }
  .view-btn {
    background: #FF5C1A; color: white;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 13px;
    border: none; border-radius: 9px; padding: 8px 16px;
    cursor: pointer; text-decoration: none; transition: background 0.2s;
  }
  .view-btn:hover { background: #FF7A40; }

  /* LOCATION POPUP */
  .location-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
    z-index: 200; display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .location-modal {
    background: white; border-radius: 24px; padding: 40px;
    max-width: 420px; width: 100%; text-align: center;
    box-shadow: 0 24px 80px rgba(0,0,0,0.2);
  }
  .location-icon {
    width: 72px; height: 72px; background: #FFF3EE; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 32px; margin: 0 auto 20px;
  }
  .location-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: #0F0F0F; margin-bottom: 10px; }
  .location-sub { font-size: 15px; color: #6B6B6B; font-weight: 300; line-height: 1.65; margin-bottom: 28px; }
  .location-allow {
    width: 100%; background: #FF5C1A; color: white;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 15px;
    border: none; border-radius: 12px; padding: 14px;
    cursor: pointer; transition: background 0.2s; margin-bottom: 10px;
  }
  .location-allow:hover { background: #FF7A40; }
  .location-skip {
    width: 100%; background: transparent; color: #6B6B6B;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px;
    border: 1.5px solid #E8E6E1; border-radius: 12px; padding: 12px;
    cursor: pointer; transition: all 0.2s;
  }
  .location-skip:hover { background: #F5F4F1; color: #0F0F0F; }

  /* EMPTY STATE */
  .empty-state { text-align: center; padding: 80px 20px; }
  .empty-icon { font-size: 48px; margin-bottom: 16px; }
  .empty-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 20px; color: #0F0F0F; margin-bottom: 8px; }
  .empty-sub { font-size: 15px; color: #6B6B6B; }

  /* MOBILE SIDEBAR DRAWER */
  .sidebar-mobile-hidden { display: none; }

  @media (max-width: 900px) {
    .explore-header { padding: 28px 20px 0; }
    .explore-body { grid-template-columns: 1fr; padding: 24px 20px; gap: 20px; }
    .filter-sidebar { position: static; }
    .sidebar-mobile-hidden { display: none !important; }
  }
  @media (max-width: 600px) {
    .search-row { flex-wrap: wrap; }
    .results-bar { flex-direction: column; align-items: flex-start; }
  }
`

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function ExplorePage() {
  const [search, setSearch]           = useState('')
  const [activeSkill, setActiveSkill] = useState('All')
  const [showFilters, setShowFilters] = useState(true)
  const [sortBy, setSortBy]           = useState('Top Rated')
  const [maxPrice, setMaxPrice]       = useState(100)
  const [minRating, setMinRating]     = useState(0)
  const [showLocation, setShowLocation] = useState(true)
  const [availableOnly, setAvailableOnly] = useState(false)

  // Filter
  let filtered = allWorkers.filter(w => {
    const matchSkill  = activeSkill === 'All' || w.skill === activeSkill
    const matchSearch = w.name.toLowerCase().includes(search.toLowerCase()) ||
                        w.skill.toLowerCase().includes(search.toLowerCase()) ||
                        w.location.toLowerCase().includes(search.toLowerCase())
    const matchPrice  = w.price <= maxPrice
    const matchRating = w.rating >= minRating
    const matchAvail  = !availableOnly || w.available
    return matchSkill && matchSearch && matchPrice && matchRating && matchAvail
  })

  // Sort
  if (sortBy === 'Top Rated')            filtered = [...filtered].sort((a, b) => b.rating - a.rating)
  if (sortBy === 'Most Jobs')            filtered = [...filtered].sort((a, b) => b.jobs - a.jobs)
  if (sortBy === 'Price: Low to High')   filtered = [...filtered].sort((a, b) => a.price - b.price)
  if (sortBy === 'Price: High to Low')   filtered = [...filtered].sort((a, b) => b.price - a.price)

  return (
    <>
      <style>{S}</style>
      <div className="explore-page">

        {/* Location popup */}
        {showLocation && (
          <div className="location-overlay">
            <div className="location-modal">
              <div className="location-icon">📍</div>
              <h2 className="location-title">Find Workers Near You</h2>
              <p className="location-sub">
                Allow location access so we can show you the closest available workers first.
              </p>
              <button className="location-allow" onClick={() => setShowLocation(false)}>
                Allow Location Access
              </button>
              <button className="location-skip" onClick={() => setShowLocation(false)}>
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="explore-header">
          <div className="explore-header-inner">
            <h1 className="explore-title">Find <em>Skilled Workers</em></h1>
            <p className="explore-sub">Browse {allWorkers.length} verified artisans across the globe</p>

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
                  <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B6B', display: 'flex' }}>
                    <X size={16} />
                  </button>
                )}
              </div>
              <button
                className={`filter-toggle-btn${showFilters ? ' active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal size={16} />
                Filters
              </button>
            </div>

            {/* Skill tabs */}
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

        {/* Body */}
        <div className="explore-body" style={{ gridTemplateColumns: showFilters ? '260px 1fr' : '1fr' }}>

          {/* Sidebar */}
          {showFilters && (
            <div className="filter-sidebar">
              <div className="filter-title">
                Filters
                <button className="filter-clear" onClick={() => { setMinRating(0); setMaxPrice(100); setAvailableOnly(false) }}>
                  Clear all
                </button>
              </div>

              {/* Availability */}
              <div className="filter-group">
                <span className="filter-group-label">Availability</span>
                <label className="filter-option" style={{ userSelect: 'none' }}>
                  <div
                    className={`filter-checkbox${availableOnly ? ' checked' : ''}`}
                    onClick={() => setAvailableOnly(!availableOnly)}
                  >
                    {availableOnly && <span style={{ color: 'white', fontSize: 12, lineHeight: 1 }}>✓</span>}
                  </div>
                  Available now only
                </label>
              </div>

              {/* Min Rating */}
              <div className="filter-group">
                <span className="filter-group-label">Minimum Rating</span>
                {[0, 4, 4.5, 4.8].map(r => (
                  <label key={r} className="filter-option" style={{ userSelect: 'none' }} onClick={() => setMinRating(r)}>
                    <div className={`filter-radio${minRating === r ? ' checked' : ''}`} />
                    {r === 0 ? 'Any rating' : `${r}★ and above`}
                  </label>
                ))}
              </div>

              {/* Price Range */}
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
                {activeSkill !== 'All' && ` for "${activeSkill}"`}
                {search && ` matching "${search}"`}
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
                <div className="empty-icon">🔍</div>
                <p className="empty-title">No workers found</p>
                <p className="empty-sub">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="workers-grid">
                {filtered.map(w => (
                  <Link key={w.id} href={`/explore/${w.id}`} className="worker-card">
                    <div className="worker-top">
                      <div className="worker-avatar" style={{ background: w.avatarBg, color: w.avatarColor }}>
                        {w.initials}
                        <span className="avail-dot" style={{ background: w.available ? '#22C55E' : '#D1D5DB' }} />
                      </div>
                      <div className="worker-info">
                        <p className="worker-name">{w.name}</p>
                        <span className="worker-skill-badge">{w.skill}</span>
                        <div className="worker-loc">
                          <MapPin size={11} />
                          {w.location}
                        </div>
                      </div>
                      <div className="worker-rating-col">
                        <div className="rating-pill">
                          <Star size={13} color="#F59E0B" fill="#F59E0B" />
                          {w.rating}
                        </div>
                        <span className="jobs-count">{w.jobs} jobs</span>
                      </div>
                    </div>
                    <p className="worker-bio">{w.bio}</p>
                    <div className="worker-footer">
                      <span className="worker-price">
                        {w.currency}{w.price} <span>/hr</span>
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