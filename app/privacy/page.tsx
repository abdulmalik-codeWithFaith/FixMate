'use client'

import { useState } from 'react'
import { Shield, ChevronRight, Eye, Lock, Database, Globe, Bell, Trash2, Mail, ChevronDown } from 'lucide-react'
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

type Section = { id: string; title: string; icon: React.ReactNode; iconBg: string; iconColor: string; content: React.ReactNode }

const S = `
  .privacy-page { overflow-x: hidden; }

  /* HERO */
  .legal-hero {
    background: #0F0F0F; padding: 140px 40px 72px;
    position: relative; overflow: hidden;
  }
  .legal-hero-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px); background-size: 60px 60px; pointer-events: none; }
  .legal-hero-glow { position: absolute; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(255,92,26,0.12) 0%, transparent 70%); top: -120px; right: -100px; pointer-events: none; }
  .legal-hero-inner { max-width: 780px; position: relative; z-index: 1; }
  .legal-label { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,92,26,0.15); border: 1px solid rgba(255,92,26,0.3); color: #FF5C1A; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; padding: 6px 14px; border-radius: 100px; margin-bottom: 22px; }
  .legal-hero-title { font-family: 'Syne', sans-serif; font-size: clamp(32px, 5vw, 54px); font-weight: 800; letter-spacing: -2px; color: white; margin-bottom: 16px; line-height: 1.1; }
  .legal-hero-title em { color: #FF5C1A; font-style: normal; }
  .legal-hero-sub { font-size: 16px; color: rgba(255,255,255,0.5); font-weight: 300; line-height: 1.75; max-width: 560px; }
  .legal-updated { display: flex; align-items: center; gap: 8px; margin-top: 20px; font-size: 13px; color: rgba(255,255,255,0.35); }
  .legal-updated-dot { width: 6px; height: 6px; border-radius: 50%; background: #22C55E; }

  /* BODY */
  .legal-body { max-width: 1100px; margin: 0 auto; padding: 64px 40px 80px; display: grid; grid-template-columns: 260px 1fr; gap: 48px; align-items: start; }

  /* TOC */
  .toc { position: sticky; top: 88px; background: white; border: 1px solid #E8E6E1; border-radius: 18px; overflow: hidden; }
  .toc-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #AFAFAF; letter-spacing: 1px; text-transform: uppercase; padding: 18px 20px 12px; border-bottom: 1px solid #E8E6E1; }
  .toc-item { display: flex; align-items: center; gap: 10px; padding: 12px 20px; cursor: pointer; transition: background 0.15s; text-decoration: none; color: inherit; border-left: 2.5px solid transparent; }
  .toc-item:hover { background: #FAFAF8; }
  .toc-item.active { border-left-color: #FF5C1A; background: #FFFBF9; }
  .toc-icon { width: 28px; height: 28px; border-radius: 7px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .toc-label { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #0F0F0F; }
  .toc-item.active .toc-label { color: #FF5C1A; }

  /* CONTENT */
  .legal-content { display: flex; flex-direction: column; gap: 32px; }

  /* SECTION */
  .legal-section { background: white; border: 1px solid #E8E6E1; border-radius: 20px; overflow: hidden; }
  .legal-section-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 24px 28px; cursor: pointer; transition: background 0.15s; user-select: none;
  }
  .legal-section-head:hover { background: #FAFAF8; }
  .legal-section-head-left { display: flex; align-items: center; gap: 14px; }
  .ls-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .ls-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 17px; color: #0F0F0F; }
  .ls-chevron { transition: transform 0.2s; color: #AFAFAF; }
  .ls-chevron.open { transform: rotate(180deg); }

  .legal-section-body { padding: 8px 28px 28px; border-top: 1px solid #E8E6E1; }
  .legal-p { font-size: 14px; color: #3D3D3D; line-height: 1.9; font-weight: 300; margin-bottom: 16px; }
  .legal-p:last-child { margin-bottom: 0; }
  .legal-list { list-style: none; padding: 0; margin: 0 0 16px; display: flex; flex-direction: column; gap: 10px; }
  .legal-list li { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: #3D3D3D; line-height: 1.7; font-weight: 300; }
  .legal-list li::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #FF5C1A; flex-shrink: 0; margin-top: 8px; }
  .legal-h3 { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; margin: 20px 0 10px; }
  .legal-highlight { background: #FFF3EE; border: 1px solid rgba(255,92,26,0.2); border-radius: 12px; padding: 16px 18px; margin-bottom: 16px; }
  .legal-highlight p { font-size: 14px; color: #0F0F0F; line-height: 1.7; margin: 0; }
  .legal-highlight strong { color: #FF5C1A; }

  /* CONTACT BOX */
  .legal-contact { background: #F5F4F1; border: 1px solid #E8E6E1; border-radius: 18px; padding: 28px; margin-top: 16px; display: flex; align-items: flex-start; gap: 16px; }
  .lc-icon { width: 44px; height: 44px; border-radius: 12px; background: #FFF3EE; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .lc-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; margin-bottom: 6px; }
  .lc-body { font-size: 13px; color: #6B6B6B; font-weight: 300; line-height: 1.65; }
  .lc-link { color: #FF5C1A; text-decoration: none; font-weight: 500; }
  .lc-link:hover { text-decoration: underline; }

  @media (max-width: 900px) {
    .legal-hero { padding: 120px 20px 56px; }
    .legal-body { grid-template-columns: 1fr; padding: 40px 20px 60px; }
    .toc { position: static; }
  }
`

const sections: Section[] = [
  {
    id: 'overview', title: 'Overview', icon: <Shield size={18} />, iconBg: '#FFF3EE', iconColor: '#FF5C1A',
    content: (
      <>
        <div className="legal-highlight"><p>FixMate is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store and share data when you use our platform.</p></div>
        <p className="legal-p">This policy applies to all users of FixMate — including clients who book services and workers who provide them — across our website, mobile applications, and any related services.</p>
        <p className="legal-p">By using FixMate, you agree to the collection and use of information as described in this policy. If you do not agree, please discontinue use of our platform.</p>
      </>
    ),
  },
  {
    id: 'collect', title: 'Information We Collect', icon: <Database size={18} />, iconBg: '#EEF6FF', iconColor: '#2563EB',
    content: (
      <>
        <Navbar/>
        <p className="legal-p">We collect information in three ways — information you provide directly, information collected automatically, and information from third parties.</p>
        <h3 className="legal-h3">Information You Provide</h3>
        <ul className="legal-list">
          <li>Account details: name, email address, phone number, and password</li>
          <li>Profile information: location, profile photo, bio, skills, and work history (for workers)</li>
          <li>Payment information: processed securely through our payment partners</li>
          <li>Communications: messages sent through our platform between clients and workers</li>
          <li>Reviews and ratings you submit after completing a job</li>
          <li>Identity verification documents submitted during onboarding (workers)</li>
        </ul>
        <h3 className="legal-h3">Automatically Collected Information</h3>
        <ul className="legal-list">
          <li>Device information: IP address, browser type, operating system, device identifiers</li>
          <li>Usage data: pages viewed, features used, search queries, booking patterns</li>
          <li>Location data: approximate location when you search for workers, or precise location if you grant permission</li>
          <li>Cookies and similar tracking technologies</li>
        </ul>
        <h3 className="legal-h3">Information from Third Parties</h3>
        <ul className="legal-list">
          <li>Google account information if you sign in via Google OAuth</li>
          <li>Identity verification from our verification partners</li>
          <li>Payment status updates from our payment processors</li>
        </ul>
      </>
    ),
  },
  {
    id: 'use', title: 'How We Use Your Information', icon: <Eye size={18} />, iconBg: '#F0FDF4', iconColor: '#16A34A',
    content: (
      <>
        <p className="legal-p">We use the information we collect for the following purposes:</p>
        <ul className="legal-list">
          <li><strong>Providing the service:</strong> matching clients with workers, processing bookings, facilitating payments</li>
          <li><strong>Account management:</strong> creating and maintaining your account, verifying your identity</li>
          <li><strong>Communication:</strong> sending booking confirmations, notifications, and support messages</li>
          <li><strong>Safety and security:</strong> detecting fraud, verifying identities, enforcing our terms</li>
          <li><strong>Improving the platform:</strong> analysing usage patterns, testing new features, AI model training</li>
          <li><strong>Legal compliance:</strong> fulfilling legal obligations and responding to lawful requests</li>
          <li><strong>Marketing:</strong> with your consent, sending updates about new features, promotions and news</li>
        </ul>
        <p className="legal-p">We do not sell your personal data to third parties. We never allow advertisers to target you based on your activity on FixMate without your explicit consent.</p>
      </>
    ),
  },
  {
    id: 'sharing', title: 'Sharing Your Information', icon: <Globe size={18} />, iconBg: '#FFF8EE', iconColor: '#D97706',
    content: (
      <>
        <p className="legal-p">FixMate shares your information only in the following circumstances:</p>
        <ul className="legal-list">
          <li><strong>With other users:</strong> when you make or accept a booking, relevant profile information is shared between client and worker</li>
          <li><strong>With service providers:</strong> trusted third-party companies that help us operate (payment processors, cloud storage, ID verification services)</li>
          <li><strong>For legal reasons:</strong> if required by law, court order, or to protect the safety of our users</li>
          <li><strong>Business transfers:</strong> in the event of a merger, acquisition or sale of assets, with appropriate confidentiality protections</li>
        </ul>
        <p className="legal-p">All third-party service providers are contractually required to handle your data in accordance with this Privacy Policy and applicable law.</p>
      </>
    ),
  },
  {
    id: 'security', title: 'Security', icon: <Lock size={18} />, iconBg: '#F5F0FF', iconColor: '#7C3AED',
    content: (
      <>
        <p className="legal-p">We take the security of your data seriously and employ industry-standard measures to protect it:</p>
        <ul className="legal-list">
          <li>All data is encrypted in transit using TLS 1.3</li>
          <li>Passwords are hashed using bcrypt and never stored in plain text</li>
          <li>Payment data is handled by PCI-DSS compliant processors — we never store card numbers</li>
          <li>Two-factor authentication is available and recommended for all accounts</li>
          <li>Regular security audits and penetration testing</li>
          <li>Staff access to user data is strictly limited and logged</li>
        </ul>
        <p className="legal-p">Despite these measures, no system is 100% secure. If you believe your account has been compromised, contact us immediately at security@fixmate.com.</p>
      </>
    ),
  },
  {
    id: 'rights', title: 'Your Rights & Choices', icon: <Bell size={18} />, iconBg: '#FEF2F2', iconColor: '#EF4444',
    content: (
      <>
        <p className="legal-p">Depending on your location, you may have the following rights regarding your personal data:</p>
        <ul className="legal-list">
          <li><strong>Access:</strong> request a copy of all personal data we hold about you</li>
          <li><strong>Correction:</strong> update or correct inaccurate information through your account settings</li>
          <li><strong>Deletion:</strong> request deletion of your account and associated personal data</li>
          <li><strong>Portability:</strong> receive your data in a structured, machine-readable format</li>
          <li><strong>Opt-out:</strong> unsubscribe from marketing communications at any time</li>
          <li><strong>Restriction:</strong> request that we limit the processing of your data in certain circumstances</li>
        </ul>
        <p className="legal-p">To exercise any of these rights, visit your Account Settings or contact our Privacy team at <strong>privacy@fixmate.com</strong>. We will respond within 30 days.</p>
      </>
    ),
  },
  {
    id: 'deletion', title: 'Data Retention & Deletion', icon: <Trash2 size={18} />, iconBg: '#F5F4F1', iconColor: '#6B6B6B',
    content: (
      <>
        <p className="legal-p">We retain your personal data for as long as your account is active or as necessary to provide our services. Specific retention periods:</p>
        <ul className="legal-list">
          <li>Account data: retained until you delete your account</li>
          <li>Transaction records: retained for 7 years for legal and tax compliance</li>
          <li>Communications: retained for 2 years after the related booking is closed</li>
          <li>Usage logs: retained for 12 months</li>
          <li>Identity verification documents: retained per applicable local regulations</li>
        </ul>
        <p className="legal-p">When you delete your account, we will anonymise or delete your personal data within 30 days, except where retention is required by law.</p>
        <div className="legal-contact">
          <div className="lc-icon"><Mail size={20} color="#FF5C1A" /></div>
          <div>
            <p className="lc-title">Privacy Questions?</p>
            <p className="lc-body">Contact our Data Protection Officer at <a href="mailto:privacy@fixmate.com" className="lc-link">privacy@fixmate.com</a>. For EU/UK users, you also have the right to lodge a complaint with your local data protection authority.</p>
          </div>
        </div>
      </>
    ),
  },
]

export default function PrivacyPage() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['overview']))
  const [activeSection, setActiveSection] = useState('overview')

  const toggle = (id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    setActiveSection(id)
  }

  return (
    <>
      <style>{S}</style>
      <div className="privacy-page">

        <section className="legal-hero">
          <div className="legal-hero-grid" />
          <div className="legal-hero-glow" />
          <div className="legal-hero-inner">
            <div className="legal-label">Legal</div>
            <h1 className="legal-hero-title">Privacy <em>Policy</em></h1>
            <p className="legal-hero-sub">
              We value your privacy and are committed to being transparent about how we collect, use and protect your personal information.
            </p>
            <div className="legal-updated">
              <span className="legal-updated-dot" />
              Last updated: 1 March 2025 · Effective immediately
            </div>
          </div>
        </section>

        <div className="legal-body">

          {/* TOC */}
          <div className="toc">
            <p className="toc-title">Contents</p>
            {sections.map(s => (
              <div
                key={s.id}
                className={`toc-item${activeSection === s.id ? ' active' : ''}`}
                onClick={() => { toggle(s.id); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
              >
                <div className="toc-icon" style={{ background: s.iconBg, color: s.iconColor }}>{s.icon}</div>
                <span className="toc-label">{s.title}</span>
              </div>
            ))}
          </div>

          {/* CONTENT */}
          <div className="legal-content">
            {sections.map(s => (
              <div key={s.id} id={s.id} className="legal-section">
                <div className="legal-section-head" onClick={() => toggle(s.id)}>
                  <div className="legal-section-head-left">
                    <div className="ls-icon" style={{ background: s.iconBg, color: s.iconColor }}>{s.icon}</div>
                    <h2 className="ls-title">{s.title}</h2>
                  </div>
                  <ChevronDown size={18} className={`ls-chevron${openSections.has(s.id) ? ' open' : ''}`} />
                </div>
                {openSections.has(s.id) && (
                  <div className="legal-section-body">{s.content}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer/>
    </>
  )
}