import Link from 'next/link'
import {
  Users, Globe, Shield, Zap, Star, Award,
  ArrowRight, CheckCircle, Wrench, Heart,
  TrendingUp, ChevronRight
} from 'lucide-react'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

const S = `
  .about-page { overflow-x: hidden; }

  /* HERO */
  .about-hero {
    min-height: 72vh;
    display: flex; align-items: center;
    background: #0F0F0F;
    padding: 140px 40px 80px;
    position: relative; overflow: hidden;
  }
  .about-hero-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
  }
  .about-hero-glow {
    position: absolute; width: 600px; height: 600px; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,92,26,0.15) 0%, transparent 70%);
    top: -150px; right: -150px; pointer-events: none;
  }
  .about-hero-glow2 {
    position: absolute; width: 400px; height: 400px; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,92,26,0.08) 0%, transparent 70%);
    bottom: -100px; left: -100px; pointer-events: none;
  }
  .about-hero-inner { max-width: 900px; margin: 0 auto; position: relative; z-index: 1; text-align: center; }
  .about-label {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(255,92,26,0.15); border: 1px solid rgba(255,92,26,0.3);
    color: #FF5C1A; font-family: 'Syne', sans-serif;
    font-size: 12px; font-weight: 600; letter-spacing: 1.5px;
    text-transform: uppercase; padding: 6px 14px; border-radius: 100px;
    margin-bottom: 28px;
  }
  .about-label-dot { width: 6px; height: 6px; background: #FF5C1A; border-radius: 50%; }
  .about-hero h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(40px, 6vw, 72px);
    font-weight: 800; letter-spacing: -2.5px;
    color: white; line-height: 1.06; margin-bottom: 24px;
  }
  .about-hero h1 em { color: #FF5C1A; font-style: normal; }
  .about-hero-sub {
    font-size: clamp(16px, 2vw, 19px);
    color: rgba(255,255,255,0.5);
    font-weight: 300; line-height: 1.75;
    max-width: 640px; margin: 0 auto 44px;
  }
  .hero-ctas { display: flex; align-items: center; justify-content: center; gap: 14px; flex-wrap: wrap; }
  .btn-orange {
    display: inline-flex; align-items: center; gap: 8px;
    background: #FF5C1A; color: white;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 15px;
    padding: 14px 28px; border-radius: 12px; text-decoration: none;
    transition: all 0.2s;
  }
  .btn-orange:hover { background: #FF7A40; transform: translateY(-1px); box-shadow: 0 8px 28px rgba(255,92,26,0.3); }
  .btn-outline-white {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent; color: rgba(255,255,255,0.7);
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 15px;
    padding: 14px 28px; border-radius: 12px; text-decoration: none;
    border: 1.5px solid rgba(255,255,255,0.15); transition: all 0.2s;
  }
  .btn-outline-white:hover { border-color: rgba(255,255,255,0.4); color: white; }

  /* STATS BAR */
  .stats-bar {
    background: white; border-bottom: 1px solid #E8E6E1;
    padding: 36px 40px;
  }
  .stats-inner {
    max-width: 1000px; margin: 0 auto;
    display: grid; grid-template-columns: repeat(4,1fr); gap: 0;
  }
  .stat-item { text-align: center; padding: 0 20px; border-right: 1px solid #E8E6E1; }
  .stat-item:last-child { border-right: none; }
  .stat-val {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: clamp(32px, 4vw, 44px); color: #0F0F0F; letter-spacing: -1.5px;
  }
  .stat-val em { color: #FF5C1A; font-style: normal; }
  .stat-label { font-size: 14px; color: #6B6B6B; margin-top: 4px; }

  /* SECTION BASE */
  .section { max-width: 1100px; margin: 0 auto; padding: 80px 40px; }
  .section-label {
    font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600;
    color: #FF5C1A; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px;
  }
  .section-title {
    font-family: 'Syne', sans-serif; font-size: clamp(28px, 3.5vw, 44px);
    font-weight: 800; letter-spacing: -1.5px; color: #0F0F0F; margin-bottom: 16px;
  }
  .section-title em { color: #FF5C1A; font-style: normal; }
  .section-sub {
    font-size: 16px; color: #6B6B6B; font-weight: 300;
    line-height: 1.8; max-width: 560px;
  }

  /* MISSION */
  .mission-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
  .mission-text {}
  .mission-body {
    font-size: 16px; color: #3D3D3D; line-height: 1.9;
    font-weight: 300; margin-bottom: 24px;
  }
  .mission-check { display: flex; flex-direction: column; gap: 12px; }
  .mission-check-item { display: flex; align-items: flex-start; gap: 12px; font-size: 15px; color: #0F0F0F; }
  .mission-check-icon { width: 22px; height: 22px; border-radius: 50%; background: #FFF3EE; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }

  .mission-visual {
    background: #F5F4F1; border-radius: 24px; padding: 40px;
    border: 1px solid #E8E6E1;
  }
  .mission-visual-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; margin-bottom: 20px; }
  .mission-stat-row { display: flex; align-items: center; gap: 14px; padding: 16px 0; border-bottom: 1px solid #E8E6E1; }
  .mission-stat-row:last-child { border-bottom: none; }
  .mission-stat-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .mission-stat-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: #0F0F0F; }
  .mission-stat-label { font-size: 13px; color: #6B6B6B; }

  /* VALUES */
  .values-bg { background: #F5F4F1; }
  .values-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 48px; }
  .value-card {
    background: white; border: 1px solid #E8E6E1; border-radius: 20px; padding: 32px;
    transition: all 0.25s;
  }
  .value-card:hover { border-color: #FF5C1A; transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.08); }
  .value-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
  .value-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px; color: #0F0F0F; margin-bottom: 10px; }
  .value-body { font-size: 14px; color: #6B6B6B; line-height: 1.75; font-weight: 300; }

  /* STORY */
  .story-wrap {
    background: #0F0F0F; border-radius: 28px; margin: 0 40px;
    padding: 72px 80px; position: relative; overflow: hidden;
  }
  .story-glow { position: absolute; top: -100px; right: -100px; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(255,92,26,0.12) 0%, transparent 70%); pointer-events: none; }
  .story-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; position: relative; z-index: 1; }
  .story-label { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; color: rgba(255,92,26,0.8); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px; }
  .story-title { font-family: 'Syne', sans-serif; font-size: clamp(28px,3vw,40px); font-weight: 800; letter-spacing: -1px; color: white; margin-bottom: 20px; }
  .story-title em { color: #FF5C1A; font-style: normal; }
  .story-body { font-size: 15px; color: rgba(255,255,255,0.5); line-height: 1.85; font-weight: 300; margin-bottom: 16px; }
  .story-milestones { display: flex; flex-direction: column; gap: 20px; }
  .milestone { display: flex; gap: 18px; }
  .milestone-year { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 15px; color: #FF5C1A; min-width: 44px; padding-top: 2px; }
  .milestone-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: white; margin-bottom: 4px; }
  .milestone-body { font-size: 13px; color: rgba(255,255,255,0.45); line-height: 1.6; font-weight: 300; }
  .milestone-line { width: 1px; background: rgba(255,92,26,0.3); flex-shrink: 0; margin-top: 6px; }

  /* TEAM */
  .team-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; margin-top: 48px; }
  .team-card {
    background: white; border: 1px solid #E8E6E1; border-radius: 20px; padding: 28px; text-align: center;
    transition: all 0.2s;
  }
  .team-card:hover { border-color: #FF5C1A; transform: translateY(-3px); box-shadow: 0 8px 28px rgba(0,0,0,0.08); }
  .team-avatar {
    width: 72px; height: 72px; border-radius: 50%; margin: 0 auto 16px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px;
  }
  .team-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; margin-bottom: 4px; }
  .team-role { font-size: 13px; color: #FF5C1A; font-weight: 600; margin-bottom: 10px; }
  .team-bio { font-size: 13px; color: #6B6B6B; line-height: 1.6; font-weight: 300; }

  /* CTA */
  .about-cta {
    background: linear-gradient(135deg, #FFF3EE 0%, #FFF8F5 100%);
    border-radius: 28px; margin: 0 40px 80px;
    padding: 72px 80px; text-align: center;
    border: 1px solid rgba(255,92,26,0.1);
  }
  .cta-title { font-family: 'Syne', sans-serif; font-size: clamp(28px,4vw,48px); font-weight: 800; letter-spacing: -1.5px; color: #0F0F0F; margin-bottom: 16px; }
  .cta-title em { color: #FF5C1A; font-style: normal; }
  .cta-sub { font-size: 17px; color: #6B6B6B; font-weight: 300; line-height: 1.7; max-width: 520px; margin: 0 auto 40px; }
  .cta-buttons { display: flex; align-items: center; justify-content: center; gap: 14px; flex-wrap: wrap; }
  .btn-dark {
    display: inline-flex; align-items: center; gap: 8px;
    background: #0F0F0F; color: white;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 15px;
    padding: 14px 28px; border-radius: 12px; text-decoration: none; transition: background 0.2s;
  }
  .btn-dark:hover { background: #1A1A1A; }
  .btn-outline-dark {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent; color: #6B6B6B;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 15px;
    padding: 14px 28px; border-radius: 12px; text-decoration: none;
    border: 1.5px solid #E8E6E1; transition: all 0.2s;
  }
  .btn-outline-dark:hover { border-color: #0F0F0F; color: #0F0F0F; }

  @media (max-width: 900px) {
    .about-hero { padding: 120px 20px 60px; }
    .section { padding: 60px 20px; }
    .mission-grid, .story-grid { grid-template-columns: 1fr; gap: 40px; }
    .values-grid { grid-template-columns: 1fr; }
    .stats-inner { grid-template-columns: 1fr 1fr; gap: 24px; }
    .stat-item { border-right: none; border-bottom: 1px solid #E8E6E1; padding-bottom: 24px; }
    .stat-item:last-child { border-bottom: none; }
    .story-wrap { margin: 0 20px; padding: 40px 24px; }
    .about-cta { margin: 0 20px 60px; padding: 48px 24px; }
  }
`

const values = [
  { icon: <Shield size={22} color="#2563EB" />,  bg: '#EEF6FF', title: 'Trust & Safety',     body: 'Every worker on FixMate is ID-verified, background-checked and reviewed by real clients. We never compromise on who we let onto our platform.' },
  { icon: <Zap size={22} color="#FF5C1A" />,     bg: '#FFF3EE', title: 'Speed & Simplicity',  body: 'We built FixMate to be fast. Find a worker, book them, get the job done — in minutes, not days. No phone calls, no guesswork.' },
  { icon: <Globe size={22} color="#16A34A" />,   bg: '#F0FDF4', title: 'Global & Local',       body: 'Whether you\'re in London, Lagos, Mumbai or Miami — FixMate connects you with skilled workers right in your neighbourhood.' },
  { icon: <Heart size={22} color="#EF4444" />,   bg: '#FEF2F2', title: 'Community First',      body: 'We exist to empower artisans. FixMate gives skilled workers the tools, visibility, and client base they need to grow sustainable businesses.' },
  { icon: <Star size={22} color="#D97706" />,    bg: '#FFF8EE', title: 'Quality Guaranteed',   body: 'Transparent ratings, verified reviews and our FixMate Guarantee mean you always know what to expect before booking.' },
  { icon: <TrendingUp size={22} color="#7C3AED" />, bg: '#F5F0FF', title: 'Constant Growth', body: 'We\'re always improving. New features, more cities, smarter AI matching — FixMate is built to get better every single day.' },
]

const milestones = [
  { year: '2022', title: 'Founded', body: 'FixMate launched in London with 50 verified electricians and plumbers, built around a simple idea: make booking a tradesperson as easy as booking a cab.' },
  { year: '2023', title: 'Expanded to 30 cities', body: 'Grew to 30 cities across the UK, Nigeria, UAE and India. Reached 10,000 completed jobs and launched the AI assistant.' },
  { year: '2024', title: 'Went global', body: 'Opened up to 150+ countries with localised pricing and multi-language support. Crossed 50,000 verified workers worldwide.' },
  { year: '2025', title: 'Building the future', body: 'Launched real-time booking, instant payouts for workers, and the FixMate mobile app (coming soon). 300,000+ jobs and counting.' },
]

const team = [
  { initials: 'AO', name: 'Adewale Obi',    role: 'Co-Founder & CEO',     bio: 'Former civil engineer turned entrepreneur. Passionate about making skilled labour accessible worldwide.', bg: '#FFF3EE', color: '#FF5C1A' },
  { initials: 'SP', name: 'Sophia Patel',   role: 'Co-Founder & CTO',     bio: 'Ex-Google engineer. Built FixMate\'s AI matching engine and global infrastructure from the ground up.', bg: '#EEF6FF', color: '#2563EB' },
  { initials: 'MK', name: 'Marcus Koenig',  role: 'Head of Product',       bio: 'Product leader with 12 years in marketplace platforms. Obsessed with removing friction from every step.', bg: '#F0FDF4', color: '#16A34A' },
  { initials: 'FA', name: 'Fatima Al-Ali',  role: 'Head of Operations',    bio: 'Scaled FixMate\'s worker verification programme across 40+ countries. Zero tolerance for bad actors.', bg: '#FFF8EE', color: '#D97706' },
]

export default function AboutPage() {
  return (
    <>
        <Navbar/>
      <style>{S}</style>
      <div className="about-page">

        {/* HERO */}
        <section className="about-hero">
          <div className="about-hero-grid" />
          <div className="about-hero-glow" />
          <div className="about-hero-glow2" />
          <div className="about-hero-inner">
            <div className="about-label"><span className="about-label-dot" />Our Story</div>
            <h1>We&apos;re Fixing the Way<br />the World Finds <em>Skilled Workers</em></h1>
            <p className="about-hero-sub">
              FixMate was built to solve a universal problem — finding a trustworthy, qualified tradesperson is harder than it should be. We&apos;re changing that, one booking at a time.
            </p>
            <div className="hero-ctas">
              <Link href="/explore" className="btn-orange">Find a Worker <ArrowRight size={16} /></Link>
              <Link href="/register?role=worker" className="btn-outline-white">Join as a Worker <ChevronRight size={16} /></Link>
            </div>
          </div>
        </section>

        {/* STATS */}
        <div className="stats-bar">
          <div className="stats-inner">
            {[
              { val: '50K+',  label: 'Verified Workers'  },
              { val: '300K+', label: 'Jobs Completed'     },
              { val: '150+',  label: 'Countries Served'   },
              { val: '4.8★',  label: 'Platform Rating'    },
            ].map(s => (
              <div key={s.label} className="stat-item">
                <div className="stat-val">
                  {s.val.replace('+','').replace('★','')}
                  <em>{s.val.includes('+') ? '+' : '★'}</em>
                </div>
                <p className="stat-label">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* MISSION */}
        <section className="section">
          <div className="mission-grid">
            <div className="mission-text">
              <p className="section-label">Our Mission</p>
              <h2 className="section-title">Making Skilled Work<br /><em>Accessible</em> to Everyone</h2>
              <p className="mission-body">
                We believe that finding a skilled, trusted worker should be as easy as ordering food or booking a ride. FixMate exists to bridge the gap between the millions of people who need work done and the millions of talented artisans who want to do it.
              </p>
              <p className="mission-body">
                Our platform isn&apos;t just a directory — it&apos;s a complete system for discovery, booking, communication and payment built to work seamlessly across the world.
              </p>
              <div className="mission-check">
                {[
                  'Verified identity for every worker on the platform',
                  'Real reviews from real clients, never fabricated',
                  'AI-powered matching to find the right skill instantly',
                  'Protected payments — only released when job is done',
                ].map(item => (
                  <div key={item} className="mission-check-item">
                    <div className="mission-check-icon"><CheckCircle size={13} color="#FF5C1A" /></div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="mission-visual">
              <p className="mission-visual-title">FixMate by the numbers</p>
              {[
                { icon: <Users size={20} color="#2563EB" />,    bg: '#EEF6FF', val: '50,000+',  label: 'Verified workers globally'   },
                { icon: <Wrench size={20} color="#FF5C1A" />,   bg: '#FFF3EE', val: '300,000+', label: 'Jobs completed to date'       },
                { icon: <Globe size={20} color="#16A34A" />,    bg: '#F0FDF4', val: '150+',     label: 'Countries and territories'    },
                { icon: <Award size={20} color="#D97706" />,    bg: '#FFF8EE', val: '98%',      label: 'Client satisfaction rate'     },
                { icon: <TrendingUp size={20} color="#7C3AED" />, bg: '#F5F0FF', val: '+18%',   label: 'Month-on-month job growth'    },
              ].map(s => (
                <div key={s.label} className="mission-stat-row">
                  <div className="mission-stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                  <div>
                    <p className="mission-stat-val">{s.val}</p>
                    <p className="mission-stat-label">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VALUES */}
        <div className="values-bg">
          <section className="section">
            <p className="section-label">What We Stand For</p>
            <h2 className="section-title">Our Core <em>Values</em></h2>
            <p className="section-sub">Everything we build, every decision we make — it all comes back to these six principles.</p>
            <div className="values-grid">
              {values.map(v => (
                <div key={v.title} className="value-card">
                  <div className="value-icon" style={{ background: v.bg }}>{v.icon}</div>
                  <h3 className="value-title">{v.title}</h3>
                  <p className="value-body">{v.body}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* STORY / TIMELINE */}
        <div style={{ padding: '80px 0' }}>
          <div className="story-wrap">
            <div className="story-glow" />
            <div className="story-grid">
              <div>
                <p className="story-label">Our Journey</p>
                <h2 className="story-title">From a London Garage<br />to a <em>Global Platform</em></h2>
                <p className="story-body">
                  FixMate started with a frustrated phone call. Our founder, Adewale, spent three days trying to find a reliable electrician in London after moving into a new flat. He couldn&apos;t find one he trusted.
                </p>
                <p className="story-body">
                  That night, he called his co-founder Sophia — and they started building. Three years later, FixMate is one of the world&apos;s fastest-growing skilled worker marketplaces.
                </p>
              </div>
              <div className="story-milestones">
                {milestones.map((m, i) => (
                  <div key={m.year} className="milestone">
                    <div>
                      <p className="milestone-year">{m.year}</p>
                      {i < milestones.length - 1 && <div className="milestone-line" style={{ height: 40, margin: '8px auto 0', width: 1 }} />}
                    </div>
                    <div>
                      <p className="milestone-title">{m.title}</p>
                      <p className="milestone-body">{m.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* TEAM */}
        <section className="section" style={{ paddingTop: 20 }}>
          <p className="section-label">The People Behind FixMate</p>
          <h2 className="section-title">Meet the <em>Team</em></h2>
          <p className="section-sub">A small, global team obsessed with making skilled work accessible everywhere.</p>
          <div className="team-grid">
            {team.map(t => (
              <div key={t.name} className="team-card">
                <div className="team-avatar" style={{ background: t.bg, color: t.color }}>{t.initials}</div>
                <p className="team-name">{t.name}</p>
                <p className="team-role">{t.role}</p>
                <p className="team-bio">{t.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="about-cta">
          <h2 className="cta-title">Ready to <em>Get Started?</em></h2>
          <p className="cta-sub">Join over 50,000 verified workers and hundreds of thousands of happy clients on FixMate today.</p>
          <div className="cta-buttons">
            <Link href="/explore" className="btn-orange">Find a Worker <ArrowRight size={16} /></Link>
            <Link href="/register?role=worker" className="btn-dark">Become a Worker <ChevronRight size={16} /></Link>
            <Link href="/contact" className="btn-outline-dark">Contact Us <ChevronRight size={16} /></Link>
          </div>
        </div>

      </div>
      <Footer/>
    </>
  )
}