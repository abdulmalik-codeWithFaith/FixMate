'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from "next/navigation";
import { Search, MapPin, Star, SlidersHorizontal, X, ChevronDown, ArrowLeft } from 'lucide-react'

// FIREBASE IMPORTS
import { db } from '@/lib/firebase'; // Adjust this path to your firebase config file
import { collection, getDocs, query, where } from 'firebase/firestore';

const skills = ['All', 'Electrician', 'Plumber', 'Carpenter', 'Painter', 'Tiling', 'Technician', 'AC Repair']
const sortOptions = ['Top Rated', 'Most Jobs', 'Price: Low to High', 'Price: High to Low']

const S = `
  .explore-page { min-height: 100vh; background: #FAFAF8;}
  .explore-header { background: white; border-bottom: 1px solid #E8E6E1; padding: 30px 40px 0; }
  .explore-header-inner { max-width: 1200px; margin: 0 auto; }
  .explore-title { font-family: 'Syne', sans-serif; font-size: clamp(28px, 4vw, 42px); font-weight: 800; letter-spacing: -1.5px; color: #0F0F0F; margin-bottom: 6px; }
  .explore-title em { color: #FF5C1A; font-style: normal; }
  .explore-sub { font-size: 15px; color: #6B6B6B; font-weight: 300; margin-bottom: 28px; }
  .search-row { display: flex; gap: 12px; align-items: center; padding-bottom: 0; }
  .search-field { flex: 1; display: flex; align-items: center; gap: 10px; background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 12px; padding: 11px 16px; }
  .search-field input { flex: 1; border: none; outline: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 15px; color: #0F0F0F; }
  .filter-toggle-btn { display: flex; align-items: center; gap: 8px; background: #0F0F0F; color: white; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; border: none; border-radius: 12px; padding: 11px 20px; cursor: pointer; transition: background 0.2s; white-space: nowrap; }
  .filter-toggle-btn.active { background: #FF5C1A; }
  .skill-tabs { display: flex; gap: 8px; overflow-x: auto; padding: 20px 0 0; scrollbar-width: none; }
  .skill-tabs::-webkit-scrollbar { display: none; }
  .skill-tab { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; padding: 7px 16px; border-radius: 100px; white-space: nowrap; border: 1.5px solid #E8E6E1; background: transparent; color: #6B6B6B; cursor: pointer; transition: all 0.2s; }
  .skill-tab.active { background: #FF5C1A; border-color: #FF5C1A; color: white; }
  .explore-body { max-width: 1200px; margin: 0 auto; padding: 32px 40px; display: grid; grid-template-columns: 260px 1fr; gap: 32px; align-items: start; }
  .filter-sidebar { background: white; border: 1px solid #E8E6E1; border-radius: 16px; padding: 24px; position: sticky; top: 88px; }
  .filter-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; }
  .filter-clear { font-size: 12px; color: #FF5C1A; cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 500; background: none; border: none; }
  .filter-group { margin-bottom: 24px; }
  .filter-group-label { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; color: #0F0F0F; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; display: block; }
  .filter-option { display: flex; align-items: center; gap: 10px; padding: 8px 0; cursor: pointer; font-size: 14px; color: #6B6B6B; }
  .filter-checkbox { width: 18px; height: 18px; border-radius: 5px; border: 1.5px solid #E8E6E1; background: white; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .filter-checkbox.checked { background: #FF5C1A; border-color: #FF5C1A; }
  .filter-range { width: 100%; accent-color: #FF5C1A; }
  .filter-range-labels { display: flex; justify-content: space-between; font-size: 12px; color: #6B6B6B; margin-top: 6px; }
  .filter-radio { width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid #E8E6E1; background: white; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .filter-radio.checked { border-color: #FF5C1A; }
  .filter-radio.checked::after { content: ''; width: 8px; height: 8px; background: #FF5C1A; border-radius: 50%; }
  .apply-btn { width: 100%; background: #FF5C1A; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; border: none; border-radius: 10px; padding: 12px; cursor: pointer; }
  .results-area { min-width: 0; }
  .results-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; gap: 12px; flex-wrap: wrap; }
  .results-count { font-size: 14px; color: #6B6B6B; }
  .sort-select { display: flex; align-items: center; gap: 8px; background: white; border: 1.5px solid #E8E6E1; border-radius: 10px; padding: 8px 14px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #0F0F0F; cursor: pointer; }
  .sort-select select { border: none; outline: none; background: transparent; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; }
  .workers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
  .worker-card { background: white; border: 1px solid #E8E6E1; border-radius: 16px; padding: 22px; transition: all 0.25s; cursor: pointer; text-decoration: none; color: inherit; display: block; }
  .worker-card:hover { border-color: #FF5C1A; transform: translateY(-3px); box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
  .worker-top { display: flex; align-items: flex-start; gap: 13px; margin-bottom: 13px; }
  .worker-avatar { width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px; position: relative; }
  .avail-dot { position: absolute; bottom: 1px; right: 1px; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; }
  .worker-info { flex: 1; min-width: 0; }
  .worker-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .worker-skill-badge { display: inline-block; font-size: 11px; font-weight: 600; background: #FFF3EE; color: #FF5C1A; padding: 3px 9px; border-radius: 100px; margin: 3px 0; }
  .worker-loc { display: flex; align-items: center; gap: 3px; font-size: 12px; color: #6B6B6B; }
  .rating-pill { display: flex; align-items: center; gap: 4px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #0F0F0F; }
  .worker-bio { font-size: 13px; color: #6B6B6B; line-height: 1.6; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .worker-footer { display: flex; align-items: center; justify-content: space-between; }
  .worker-price { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; }
  .worker-price span { font-size: 12px; font-weight: 400; color: #6B6B6B; }
  .view-btn { background: #FF5C1A; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 13px; border: none; border-radius: 9px; padding: 8px 16px; cursor: pointer; text-decoration: none; }
  .location-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .location-modal { background: white; border-radius: 24px; padding: 40px; max-width: 420px; width: 100%; text-align: center; }
  .location-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: #0F0F0F; margin-bottom: 10px; }
  .location-allow { width: 100%; background: #FF5C1A; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 15px; border: none; border-radius: 12px; padding: 14px; cursor: pointer; margin-bottom: 10px; }
  .location-skip { width: 100%; background: transparent; color: #6B6B6B; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; border: 1.5px solid #E8E6E1; border-radius: 12px; padding: 12px; cursor: pointer; }
  @media (max-width: 900px) { .explore-body { grid-template-columns: 1fr; } .filter-sidebar { display: none; } }
`

export default function ExplorePage() {
  const [workers, setWorkers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeSkill, setActiveSkill] = useState('All')
  const [showFilters, setShowFilters] = useState(true)
  const [sortBy, setSortBy] = useState('Top Rated')
  const [maxPrice, setMaxPrice] = useState(100)
  const [minRating, setMinRating] = useState(0)
  const [showLocation, setShowLocation] = useState(true)
  const [availableOnly, setAvailableOnly] = useState(false)
  const router = useRouter();

  // 1. FETCH DATA FROM FIREBASE
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "workers"));
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setWorkers(data);
      } catch (error) {
        console.error("Error fetching workers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  // 2. FILTER & SORT LOGIC
  let filtered = workers.filter(w => {
    const matchSkill  = activeSkill === 'All' || w.skill === activeSkill
    const matchSearch = (w.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
                        (w.skill?.toLowerCase() || "").includes(search.toLowerCase()) ||
                        (w.location?.toLowerCase() || "").includes(search.toLowerCase())
    const matchPrice  = (w.price || 0) <= maxPrice
    const matchRating = (w.rating || 0) >= minRating
    const matchAvail  = !availableOnly || w.available
    return matchSkill && matchSearch && matchPrice && matchRating && matchAvail
  })

  if (sortBy === 'Top Rated') filtered = [...filtered].sort((a, b) => b.rating - a.rating)
  if (sortBy === 'Most Jobs') filtered = [...filtered].sort((a, b) => b.jobs - a.jobs)
  if (sortBy === 'Price: Low to High') filtered = [...filtered].sort((a, b) => a.price - b.price)
  if (sortBy === 'Price: High to Low') filtered = [...filtered].sort((a, b) => b.price - a.price)

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 800 }}>Loading Workers...</div>

  return (
    <>
      <style>{S}</style>
      <div className="explore-page">
        {showLocation && (
          <div className="location-overlay">
            <div className="location-modal">
              <div style={{fontSize: '40px', marginBottom: '10px'}}>📍</div>
              <h2 className="location-title">Find Workers Near You</h2>
              <p style={{color: '#6B6B6B', marginBottom: '20px'}}>Allow access to show local artisans.</p>
              <button className="location-allow" onClick={() => setShowLocation(false)}>Allow Access</button>
              <button className="location-skip" onClick={() => setShowLocation(false)}>Skip</button>
            </div>
          </div>
        )}

        <div className="explore-header">
          <div className="explore-header-inner">
            <ArrowLeft size={30} color="#AFAFAF" className="cursor-pointer" onClick={() => router.back()} />
            <h1 className="explore-title">Find <em>Skilled Workers</em></h1>
            <p className="explore-sub">Browse {workers.length} verified artisans</p>

            <div className="search-row">
              <div className="search-field">
                <Search size={17} color="#AFAFAF" />
                <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
                {search && <X size={16} onClick={() => setSearch('')} style={{cursor:'pointer'}}/>}
              </div>
              <button className={`filter-toggle-btn${showFilters ? ' active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
                <SlidersHorizontal size={16} /> Filters
              </button>
            </div>

            <div className="skill-tabs">
              {skills.map(s => (
                <button key={s} className={`skill-tab${activeSkill === s ? ' active' : ''}`} onClick={() => setActiveSkill(s)}>{s}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="explore-body" style={{ gridTemplateColumns: showFilters ? '260px 1fr' : '1fr' }}>
          {showFilters && (
            <div className="filter-sidebar">
              <div className="filter-title">Filters <button className="filter-clear" onClick={() => { setMinRating(0); setMaxPrice(100); setAvailableOnly(false) }}>Clear</button></div>
              <div className="filter-group">
                <span className="filter-group-label">Availability</span>
                <label className="filter-option" onClick={() => setAvailableOnly(!availableOnly)}>
                  <div className={`filter-checkbox${availableOnly ? ' checked' : ''}`}>{availableOnly && "✓"}</div> Available Now
                </label>
              </div>
              <div className="filter-group">
                <span className="filter-group-label">Max Price ($/hr)</span>
                <input type="range" min={10} max={100} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} className="filter-range" />
                <div className="filter-range-labels"><span>$10</span><span style={{color:'#FF5C1A'}}>${maxPrice}</span><span>$100</span></div>
              </div>
              <button className="apply-btn">Apply</button>
            </div>
          )}

          <div className="results-area">
            <div className="results-bar">
              <p className="results-count"><strong>{filtered.length}</strong> workers found</p>
              <div className="sort-select">
                <ChevronDown size={14} />
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  {sortOptions.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div className="workers-grid">
              {filtered.map(w => (
                <Link key={w.id} href={`/explore/${w.id}`} className="worker-card">
                  <div className="worker-top">
                    <div className="worker-avatar" style={{ background: w.avatarBg || '#EEE', color: w.avatarColor || '#333' }}>
                      {w.initials || '??'}
                      <span className="avail-dot" style={{ background: w.available ? '#22C55E' : '#D1D5DB' }} />
                    </div>
                    <div className="worker-info">
                      <p className="worker-name">{w.name}</p>
                      <span className="worker-skill-badge">{w.skill}</span>
                      <div className="worker-loc"><MapPin size={11} /> {w.location}</div>
                    </div>
                    <div className="rating-pill"><Star size={13} fill="#F59E0B" color="#F59E0B" /> {w.rating}</div>
                  </div>
                  <p className="worker-bio">{w.bio}</p>
                  <div className="worker-footer">
                    <span className="worker-price">{w.currency || '$'}{w.price} <span>/hr</span></span>
                    <span className="view-btn">View Profile</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}