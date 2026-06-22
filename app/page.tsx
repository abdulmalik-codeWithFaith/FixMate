import Link from 'next/link'
import { Search, MapPin, Star, ChevronRight, Wrench, Hammer, Wind, Paintbrush, Settings, Layers, Zap } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import InstallBanner from '@/components/InstallBanner'
import Logo from "@/public/logo.svg"

const services = [
  { icon: Wrench,     name: 'Plumbing',    count: '8,200+' },
  { icon: Zap,        name: 'Electrical',  count: '7,500+' },
  { icon: Hammer,     name: 'Carpentry',   count: '5,100+' },
  { icon: Wind,       name: 'AC Repair',   count: '4,300+' },
  { icon: Paintbrush, name: 'Painting',    count: '6,000+' },
  { icon: Layers,     name: 'Tiling',      count: '3,800+' },
  { icon: Settings,   name: 'Technician',  count: '4,100+' },
]

const steps = [
  { num: '01', title: 'Search or Describe', desc: 'Type what you need fixed or use our AI Assistant to describe your problem. We match you with the right skill category automatically.' },
  { num: '02', title: 'Choose a Worker',    desc: 'Browse verified workers near you filtered by skill, rating, price and availability. View profiles and reviews before deciding.' },
  { num: '03', title: 'Book & Get It Done', desc: 'Send a booking request, chat with your worker, confirm the details — then sit back while it gets handled professionally.' },
]

const workers = [
  { initials: 'JM', name: 'James Mitchell', skill: 'Electrician', location: 'London, UK',    rating: 4.9, price: '£45/hr',      bio: '9 years installing wiring, consumer units and solar systems. Fast, clean work with full compliance certification.', avatarBg: '#FFF3EE', avatarColor: '#FF5C1A' },
  { initials: 'CR', name: 'Carlos Rivera',  skill: 'Plumber',     location: 'Miami, USA',    rating: 4.8, price: '$60/hr',      bio: 'Expert in pipe repairs, bathroom fitting and water heater installation. 12+ years. Bilingual — English & Spanish.', avatarBg: '#EEF6FF', avatarColor: '#2563EB' },
  { initials: 'AP', name: 'Aisha Patel',    skill: 'Painter',     location: 'Dubai, UAE',    rating: 5.0, price: 'AED 80/hr',   bio: 'Interior & exterior painting specialist. Premium materials. Minimal mess, stunning results every time.', avatarBg: '#F0FDF4', avatarColor: '#16A34A' },
  { initials: 'KT', name: 'Kenji Tanaka',   skill: 'Carpenter',   location: 'Tokyo, Japan',  rating: 4.7, price: '¥5,500/hr',  bio: 'Custom furniture, cabinetry and woodwork. Trained in traditional Japanese joinery. Always delivers on time.', avatarBg: '#FFF8EE', avatarColor: '#D97706' },
]

const testimonials = [
  { text: 'Found an electrician in under 5 minutes. He arrived the same day and fixed everything perfectly. Incredibly easy to use.', name: 'Sophie Laurent', location: 'Paris, France',     initials: 'SL', avatarBg: '#FFF3EE', avatarColor: '#FF5C1A' },
  { text: 'The AI assistant found me 3 great plumbers nearby. Booked one, problem solved in 2 hours. Genuinely impressed.',          name: 'David Kim',      location: 'Toronto, Canada',   initials: 'DK', avatarBg: '#EEF6FF', avatarColor: '#2563EB' },
  { text: 'As a carpenter, FixMate has tripled my client base. The booking system is smooth and I get paid on time. Best decision.',  name: 'Ravi Menon',     location: 'Bangalore, India',  initials: 'RM', avatarBg: '#F0FDF4', avatarColor: '#16A34A' },
]

const stats   = [{ value: '2+', label: 'Verified Workers' }, { value: '3+', label: 'Jobs Completed' }, { value: '1', label: 'Countries' }, { value: '4.8★', label: 'Average Rating' }]
const regions = [{ flag: '🌍', label: 'Africa' }, { flag: '🌎', label: 'Americas' }, { flag: '🌏', label: 'Asia Pacific' }, { flag: '🇪🇺', label: 'Europe' }, { flag: '🌐', label: '150+ Countries' }]


const S = `
  .page { overflow-x: hidden; }

  /* HERO */
  .hero {
    min-height: 100vh;
    padding: 100px 40px 80px;
    display: flex;
    align-items: center;
    background: linear-gradient(160deg, #FAFAF8 55%, #FFF3EE 100%);
    position: relative;
  }
  .hero-glow {
    position: absolute;
    top: -200px; right: -200px;
    width: 700px; height: 700px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,92,26,0.07) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-inner {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
  }
  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #FFF3EE;
    color: #FF5C1A;
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 600;
    padding: 6px 14px;
    border-radius: 100px;
    border: 1px solid rgba(255,92,26,0.15);
    margin-bottom: 24px;
  }
  .hero-badge-dot { width: 7px; height: 7px; background: #FF5C1A; border-radius: 50%; }
  .hero-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(42px, 5vw, 64px);
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -2px;
    color: #0F0F0F;
    margin-bottom: 20px;
  }
  .hero-title em { color: #FF5C1A; font-style: normal; }
  .hero-sub {
    font-size: 17px;
    color: #6B6B6B;
    line-height: 1.75;
    font-weight: 300;
    max-width: 460px;
    margin-bottom: 40px;
  }
  .search-box {
    display: flex;
    align-items: center;
    background: white;
    border: 1.5px solid #E8E6E1;
    border-radius: 14px;
    padding: 6px 6px 6px 18px;
    margin-bottom: 24px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  }
  .search-box input {
    flex: 1;
    border: none;
    outline: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    color: #0F0F0F;
    background: transparent;
    min-width: 0;
  }
  .search-box input::placeholder { color: #AFAFAF; }
  .search-btn {
    background: #FF5C1A;
    color: white;
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 600;
    border: none;
    border-radius: 10px;
    padding: 12px 22px;
    cursor: pointer;
    white-space: nowrap;
    text-decoration: none;
    display: inline-block;
    transition: background 0.2s;
  }
  .search-btn:hover { background: #FF7A40; }
  .hero-ctas { display: flex; flex-wrap: wrap; gap: 12px; }
  .btn-dark {
    display: inline-flex; align-items: center; gap: 8px;
    background: #0F0F0F; color: white;
    font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 600;
    padding: 13px 24px; border-radius: 12px;
    text-decoration: none; transition: background 0.2s;
  }
  .btn-dark:hover { background: #1A1A1A; }
  .btn-outline {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent; color: #6B6B6B;
    font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 600;
    padding: 13px 24px; border-radius: 12px;
    border: 1.5px solid #E8E6E1;
    text-decoration: none; transition: all 0.2s;
  }
  .btn-outline:hover { background: #F5F4F1; color: #0F0F0F; }

  /* HERO CARD STACK */
  .hero-visual { position: relative; }
  .card-stack { position: relative; width: 100%; aspect-ratio: 0.85; }
  .hcard {
    position: absolute;
    background: white;
    border: 1px solid #E8E6E1;
    border-radius: 20px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.08);
    overflow: hidden;
  }
  .hcard-main { top: 0; left: 5%; width: 90%; padding: 24px; }
  .hcard-worker { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
  .hcard-avatar {
    width: 52px; height: 52px; border-radius: 50%;
    background: #FFF3EE; color: #FF5C1A;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px;
    flex-shrink: 0;
  }
  .hcard-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; }
  .hcard-skill { font-size: 13px; color: #6B6B6B; margin: 2px 0; }
  .hcard-stars { display: flex; align-items: center; gap: 2px; }
  .hcard-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px; }
  .hstat { background: #F5F4F1; border-radius: 8px; padding: 12px; }
  .hstat-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: #0F0F0F; }
  .hstat-label { font-size: 12px; color: #6B6B6B; margin-top: 2px; }
  .hcard-book {
    display: block; width: 100%; text-align: center;
    background: #FF5C1A; color: white;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px;
    border: none; border-radius: 10px; padding: 12px;
    text-decoration: none; transition: background 0.2s; cursor: pointer;
  }
  .hcard-book:hover { background: #FF7A40; }
  .hcard-notify {
    bottom: 20%; left: -5%; width: 70%;
    padding: 14px 16px;
    display: flex; align-items: center; gap: 12px;
  }
  .notify-dot { width: 10px; height: 10px; background: #22C55E; border-radius: 50%; flex-shrink: 0; }
  .notify-text { font-size: 13px; color: #6B6B6B; }
  .notify-text strong { color: #0F0F0F; font-weight: 600; }
  .hcard-badge {
    bottom: 10%; right: 0; width: 65%;
    padding: 14px 16px;
    display: flex; align-items: center; gap: 12px;
  }
  .badge-icon {
    width: 40px; height: 40px; background: #FFF3EE;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
  }
  .badge-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #0F0F0F; }
  .badge-sub { font-size: 13px; color: #6B6B6B; }

  /* GLOBE STRIP */
  .globe-strip {
    background: #FF5C1A;
    padding: 12px 40px;
    display: flex; flex-wrap: wrap;
    align-items: center; justify-content: center;
    gap: 28px;
  }
  .globe-item { display: flex; align-items: center; gap: 6px; color: rgba(255,255,255,0.9); font-size: 13px; font-weight: 500; }
  .globe-item strong { font-family: 'Syne', sans-serif; font-weight: 700; }

  /* STATS BAR */
  .stats-bar {
    background: white;
    border-top: 1px solid #E8E6E1;
    border-bottom: 1px solid #E8E6E1;
    padding: 32px 40px;
  }
  .stats-inner {
    max-width: 1200px; margin: 0 auto;
    display: flex; flex-wrap: wrap;
    justify-content: space-around; align-items: center;
    gap: 24px;
  }
  .stat-val {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: clamp(28px, 4vw, 40px);
    color: #0F0F0F;
    text-align: center;
  }
  .stat-val em { color: #FF5C1A; font-style: normal; }
  .stat-label { font-size: 14px; color: #6B6B6B; margin-top: 4px; text-align: center; }

  /* SECTION COMMON */
  .section { max-width: 1200px; margin: 0 auto; padding: 80px 40px; }
  .section-label {
    font-family: 'Syne', sans-serif;
    font-size: 12px; font-weight: 600;
    color: #FF5C1A;
    letter-spacing: 2px; text-transform: uppercase;
    margin-bottom: 10px;
  }
  .section-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(28px, 3.5vw, 40px);
    font-weight: 800;
    letter-spacing: -1px;
    color: #0F0F0F;
    margin-bottom: 8px;
  }
  .section-title em { color: #FF5C1A; font-style: normal; }
  .section-sub { font-size: 16px; color: #6B6B6B; font-weight: 300; max-width: 500px; margin-bottom: 48px; }

  /* SERVICES */
  .services-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px; }
  .service-card {
    background: white; border: 1px solid #E8E6E1;
    border-radius: 16px; padding: 24px 16px;
    text-align: center; text-decoration: none; color: inherit;
    transition: all 0.25s; cursor: pointer;
  }
  .service-card:hover { border-color: #FF5C1A; transform: translateY(-3px); box-shadow: 0 8px 30px rgba(255,92,26,0.10); }
  .service-icon {
    width: 52px; height: 52px;
    background: #FFF3EE; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 14px; transition: background 0.2s; color: #FF5C1A;
  }
  .service-card:hover .service-icon { background: #FF5C1A; color: white; }
  .service-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #0F0F0F; margin-bottom: 4px; }
  .service-count { font-size: 12px; color: #6B6B6B; }

  /* HOW IT WORKS */
  .how-wrap {
    background: #0F0F0F; border-radius: 28px;
    padding: 64px; margin: 0 40px 80px;
  }
  .how-label { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; color: rgba(255,92,26,0.8); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
  .how-title { font-family: 'Syne', sans-serif; font-size: clamp(28px,3.5vw,40px); font-weight: 800; letter-spacing: -1px; color: white; margin-bottom: 8px; }
  .how-title em { color: #FF5C1A; font-style: normal; }
  .how-sub { font-size: 16px; color: rgba(255,255,255,0.4); font-weight: 300; max-width: 500px; margin-bottom: 48px; }
  .how-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 40px; }
  .how-step { position: relative; }
  .step-num {
    width: 52px; height: 52px; border-radius: 10px;
    background: rgba(255,92,26,0.15); border: 1px solid rgba(255,92,26,0.3);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px;
    color: #FF5C1A; margin-bottom: 20px;
  }
  .step-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 20px; color: white; margin-bottom: 10px; }
  .step-desc { font-size: 15px; color: rgba(255,255,255,0.5); line-height: 1.75; font-weight: 300; }
  .step-line { position: absolute; top: 28px; right: -20px; width: 40px; height: 1px; background: rgba(255,255,255,0.15); }

  /* WORKERS */
  .workers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
  .worker-card {
    background: white; border: 1px solid #E8E6E1;
    border-radius: 16px; padding: 24px;
    transition: all 0.25s; cursor: pointer;
  }
  .worker-card:hover { border-color: #FF5C1A; transform: translateY(-3px); box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
  .worker-top { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 14px; }
  .worker-avatar {
    width: 54px; height: 54px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 20px;
    flex-shrink: 0;
  }
  .worker-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; }
  .worker-skill-badge {
    display: inline-block; font-size: 11px; font-weight: 600;
    background: #FFF3EE; color: #FF5C1A;
    padding: 3px 10px; border-radius: 100px; margin: 4px 0;
  }
  .worker-loc { display: flex; align-items: center; gap: 4px; font-size: 13px; color: #6B6B6B; }
  .worker-rating { display: flex; align-items: center; gap: 4px; margin-left: auto; flex-shrink: 0; }
  .worker-rating-val { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #0F0F0F; }
  .worker-bio { font-size: 13px; color: #6B6B6B; line-height: 1.65; font-weight: 300; margin-bottom: 16px; }
  .worker-footer { display: flex; align-items: center; justify-content: space-between; }
  .worker-price { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; }
  .worker-book {
    background: #FF5C1A; color: white;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 13px;
    border: none; border-radius: 10px; padding: 8px 16px;
    text-decoration: none; transition: background 0.2s;
  }
  .worker-book:hover { background: #FF7A40; }
  .browse-btn {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 15px;
    color: #6B6B6B; border: 1.5px solid #E8E6E1;
    padding: 13px 32px; border-radius: 12px; text-decoration: none;
    transition: all 0.2s; margin-top: 40px;
  }
  .browse-btn:hover { background: #F5F4F1; color: #0F0F0F; }

  /* TESTIMONIALS */
  .testi-wrap { background: #F5F4F1; padding: 80px 40px; }
  .testi-inner { max-width: 1200px; margin: 0 auto; }
  .testi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
  .testi-card { background: white; border: 1px solid #E8E6E1; border-radius: 16px; padding: 28px; }
  .testi-stars { display: flex; gap: 3px; margin-bottom: 14px; }
  .testi-text { font-size: 15px; color: #0F0F0F; line-height: 1.75; font-style: italic; font-weight: 300; margin-bottom: 20px; }
  .testi-author { display: flex; align-items: center; gap: 12px; }
  .testi-avatar {
    width: 40px; height: 40px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px;
  }
  .testi-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #0F0F0F; }
  .testi-loc { font-size: 12px; color: #6B6B6B; }

  /* APP SECTION */
  .app-wrap {
    margin: 60px 40px 80px;
    background: linear-gradient(135deg, #FFF3EE 0%, #FFF8F5 100%);
    border-radius: 28px;
    padding: 64px;
    display: flex; align-items: center; gap: 60px;
    border: 1px solid rgba(255,92,26,0.1);
  }
  .app-text { flex: 1; }
  .app-title { font-family: 'Syne', sans-serif; font-size: clamp(28px,3vw,40px); font-weight: 800; letter-spacing: -1px; color: #0F0F0F; margin-bottom: 14px; }
  .app-sub { font-size: 16px; color: #6B6B6B; line-height: 1.75; font-weight: 300; margin-bottom: 32px; max-width: 420px; }
  .app-btns { display: flex; flex-wrap: wrap; gap: 14px; }
  .app-btn {
    position: relative;
    display: flex; align-items: center; gap: 12px;
    background: #0F0F0F; color: white;
    border: none; border-radius: 16px; padding: 14px 22px;
    cursor: pointer; transition: all 0.2s;
  }
  .app-btn:hover { background: #1A1A1A; transform: translateY(-2px); }
  .app-btn-icon { font-size: 28px; }
  .app-btn-sub { font-size: 11px; color: rgba(255,255,255,0.6); display: block; }
  .app-btn-label { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; display: block; }
  .app-btn-badge {
    position: absolute; top: 6px; right: 8px;
    background: #FF5C1A; color: white;
    font-size: 9px; font-weight: 700;
    padding: 2px 6px; border-radius: 100px; letter-spacing: 0.5px;
  }
  .app-phone {
    width: 200px; height: 320px; flex-shrink: 0;
    background: white; border-radius: 36px;
    border: 2px solid #E8E6E1;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 20px 60px rgba(0,0,0,0.12);
  }
  .app-phone-inner { text-align: center; padding: 20px; }
  .app-phone-icon { font-size: 48px; margin-bottom: 12px; }
  .app-phone-label { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #6B6B6B; line-height: 1.5; }

  /* RESPONSIVE */
  @media (max-width: 1024px) {
    .hero-inner { grid-template-columns: 1fr; }
    .hero-visual { display: none; }
    .how-grid { grid-template-columns: 1fr; }
    .step-line { display: none; }
    .app-wrap { flex-direction: column; text-align: center; }
    .app-btns { justify-content: center; }
    .app-phone { display: none; }
  }
  @media (max-width: 768px) {
    .hero { padding: 110px 20px 60px; }
    .section { padding: 60px 20px; }
    .how-wrap { margin: 0 20px 60px; padding: 40px 24px; }
    .testi-wrap { padding: 60px 20px; }
    .app-wrap { margin: 40px 20px 60px; padding: 40px 24px; }
    .globe-strip { padding: 12px 20px; gap: 14px; }
    .stats-bar { padding: 24px 20px; }
  }
`


export default function LandingPage() {
  return (
    <>
      <Navbar/>
      <style>{S}</style>
      <div className="page">
      <InstallBanner />
        <section className="hero">
          <div className="hero-glow" />
          <div className="hero-inner">

            <div>
              <div className="hero-badge">
                <span className="hero-badge-dot" />
                The Global Artisan Marketplace
              </div>

              <h1 className="hero-title">
                Find Skilled<br />
                Workers <em>Near</em><br />
                You, Fast
              </h1>

              <p className="hero-sub">
                Connect with verified plumbers, electricians, carpenters & more anywhere in the world. Book in minutes, get the job done right.
              </p>

              <div className="search-box">
                <Search size={18} color="#AFAFAF" style={{ flexShrink: 0, marginRight: 8 }} />
                <input type="text" placeholder="What do you want to fix? e.g. leaking pipe…" />
                <Link href="/explore" className="search-btn">Find Worker →</Link>
              </div>

              <div className="hero-ctas">
                <Link href="/explore" className="btn-dark">
                  <Search size={16} />
                  Find a Worker
                </Link>
                <Link href="/register" className="btn-outline">
                  Become a Worker →
                </Link>
              </div>
            </div>

            <div className="hero-visual">
              <div className="card-stack">
                <div className="hcard hcard-main">
                  <div className="hcard-worker">
                    <div className="hcard-avatar">JM</div>
                    <div>
                      <p className="hcard-name">James Mitchell</p>
                      <p className="hcard-skill">⚡ Electrician · London, UK</p>
                      <div className="hcard-stars">
                        {[...Array(5)].map((_, i) => <Star key={i} size={13} color="#F59E0B" fill="#F59E0B" />)}
                        <span style={{ fontSize: 12, color: '#6B6B6B', marginLeft: 6 }}>4.9 (214 jobs)</span>
                      </div>
                    </div>
                  </div>
                  <div className="hcard-stats">
                    {[{ val: '214', label: 'Jobs Done' }, { val: '9 yrs', label: 'Experience' }].map(s => (
                      <div key={s.label} className="hstat">
                        <div className="hstat-val">{s.val}</div>
                        <div className="hstat-label">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <Link href="/explore" className="hcard-book">Book Now — £45/hr</Link>
                </div>

                <div className="hcard hcard-notify">
                  <span className="notify-dot" />
                  <p className="notify-text">
                    <strong>Maria just booked a plumber</strong> 2 mins ago · Barcelona
                  </p>
                </div>

                <div className="hcard hcard-badge">
                  <div className="badge-icon">🛡️</div>
                  <div>
                    <p className="badge-title">Verified Workers</p>
                    <p className="badge-sub">ID-verified & rated worldwide</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── GLOBE STRIP ── */}
        <div className="globe-strip">
          {regions.map(r => (
            <div key={r.label} className="globe-item">
              <span>{r.flag}</span>
              <strong>{r.label}</strong>
            </div>
          ))}
        </div>

        {/* ── STATS BAR ── */}
        <div className="stats-bar">
          <div className="stats-inner">
            {stats.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div className="stat-val">
                  {s.value.replace('+','').replace('★','')}
                  <em>{s.value.includes('+') ? '+' : '★'}</em>
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SERVICES ── */}
        <section className="section">
          <p className="section-label">Popular Services</p>
          <h2 className="section-title">Whatever Needs <em>Fixing</em>,<br />We&apos;ve Got You</h2>
          <p className="section-sub">Browse by service category and find the right expert in your area, instantly.</p>
          <div className="services-grid">
            {services.map(({ icon: Icon, name, count }) => (
              <Link key={name} href={`/explore?skill=${encodeURIComponent(name)}`} className="service-card">
                <div className="service-icon"><Icon size={22} /></div>
                <p className="service-name">{name}</p>
                <p className="service-count">{count} workers</p>
              </Link>
            ))}
            <Link href="/explore" className="service-card">
              <div className="service-icon" style={{ background: '#F5F4F1', color: '#6B6B6B' }}>
                <ChevronRight size={22} />
              </div>
              <p className="service-name">More</p>
              <p className="service-count">View all 60+</p>
            </Link>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <div className="how-wrap" id="how-it-works">
          <p className="how-label">Simple Process</p>
          <h2 className="how-title">How <em>FixMate</em> Works</h2>
          <p className="how-sub">Get your problem solved in 3 easy steps, wherever you are</p>
          <div className="how-grid">
            {steps.map((step, i) => (
              <div key={step.num} className="how-step">
                {i < steps.length - 1 && <div className="step-line" />}
                <div className="step-num">{step.num}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── FEATURED WORKERS ── */}
        <section className="section">
          <p className="section-label">Featured Workers</p>
          <h2 className="section-title">Top-Rated <em>Artisans</em> Worldwide</h2>
          <p className="section-sub">Hand-picked based on ratings, reliability & job quality across the globe</p>
          <div className="workers-grid">
            {workers.map(w => (
              <div key={w.name} className="worker-card">
                <div className="worker-top">
                  <div className="worker-avatar" style={{ background: w.avatarBg, color: w.avatarColor }}>
                    {w.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="worker-name">{w.name}</p>
                    <span className="worker-skill-badge">{w.skill}</span>
                    <div className="worker-loc">
                      <MapPin size={12} />
                      {w.location}
                    </div>
                  </div>
                  <div className="worker-rating">
                    <Star size={13} color="#F59E0B" fill="#F59E0B" />
                    <span className="worker-rating-val">{w.rating}</span>
                  </div>
                </div>
                <p className="worker-bio">{w.bio}</p>
                <div className="worker-footer">
                  <span className="worker-price">{w.price}</span>
                  <Link href={`/explore/${w.name.toLowerCase().replace(' ', '-')}`} className="worker-book">
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <Link href="/explore" className="browse-btn">
              Browse All Workers <ChevronRight size={16} />
            </Link>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <div className="testi-wrap">
          <div className="testi-inner">
            <p className="section-label">Testimonials</p>
            <h2 className="section-title">Clients <em>Love</em> FixMate</h2>
            <p className="section-sub">From Lagos to London, people trust FixMate to get the job done</p>
            <div className="testi-grid">
              {testimonials.map(t => (
                <div key={t.name} className="testi-card">
                  <div className="testi-stars">
                    {[...Array(5)].map((_, i) => <Star key={i} size={15} color="#F59E0B" fill="#F59E0B" />)}
                  </div>
                  <p className="testi-text">&ldquo;{t.text}&rdquo;</p>
                  <div className="testi-author">
                    <div className="testi-avatar" style={{ background: t.avatarBg, color: t.avatarColor }}>
                      {t.initials}
                    </div>
                    <div>
                      <p className="testi-name">{t.name}</p>
                      <p className="testi-loc">{t.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── DOWNLOAD APP ── */}
        <div className="app-wrap">
          <div className="app-text">
            <p className="section-label">Mobile App</p>
            <h2 className="app-title">FixMate in Your<br />Pocket — Coming Soon</h2>
            <p className="app-sub">
              Get real-time notifications, chat with artisans, and manage bookings on the go.
              Available worldwide on iOS & Android — launching soon.
            </p>
            <div className="app-btns">
              {[
                { icon: '', store: 'App Store', sub: 'Download on the' },
                { icon: '▶', store: 'Google Play', sub: 'Get it on' },
              ].map(btn => (
                <button key={btn.store} className="app-btn">
                  <span className="app-btn-icon">{btn.icon}</span>
                  <span>
                    <span className="app-btn-sub">{btn.sub}</span>
                    <span className="app-btn-label">{btn.store}</span>
                  </span>
                  <span className="app-btn-badge">SOON</span>
                </button>
              ))}
            </div>
          </div>
          <div className="app-phone">
            <div className="app-phone-inner">
              <div className="app-phone-icon">📱</div>
              <p className="app-phone-label">FixMate App<br />Coming Soon</p>
            </div>
          </div>
        </div>

      </div>
      <Footer/>
    </>
  )
}