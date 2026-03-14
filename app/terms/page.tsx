'use client'

import { useState } from 'react'
import {
  FileText, Users, Briefcase, CreditCard, Shield,
  AlertTriangle, Scale, Globe, ChevronDown, Mail
} from 'lucide-react'
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

type Section = { id: string; title: string; icon: React.ReactNode; iconBg: string; iconColor: string; content: React.ReactNode }

const S = `
  .terms-page { overflow-x: hidden; }

  .legal-hero { background: #0F0F0F; padding: 140px 40px 72px; position: relative; overflow: hidden; }
  .legal-hero-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px); background-size: 60px 60px; pointer-events: none; }
  .legal-hero-glow { position: absolute; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(255,92,26,0.12) 0%, transparent 70%); top: -120px; right: -100px; pointer-events: none; }
  .legal-hero-inner { max-width: 780px; position: relative; z-index: 1; }
  .legal-label { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,92,26,0.15); border: 1px solid rgba(255,92,26,0.3); color: #FF5C1A; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; padding: 6px 14px; border-radius: 100px; margin-bottom: 22px; }
  .legal-hero-title { font-family: 'Syne', sans-serif; font-size: clamp(32px,5vw,54px); font-weight: 800; letter-spacing: -2px; color: white; margin-bottom: 16px; line-height: 1.1; }
  .legal-hero-title em { color: #FF5C1A; font-style: normal; }
  .legal-hero-sub { font-size: 16px; color: rgba(255,255,255,0.5); font-weight: 300; line-height: 1.75; max-width: 560px; }
  .legal-updated { display: flex; align-items: center; gap: 8px; margin-top: 20px; font-size: 13px; color: rgba(255,255,255,0.35); }
  .legal-updated-dot { width: 6px; height: 6px; border-radius: 50%; background: #22C55E; }

  /* SUMMARY BANNER */
  .terms-summary {
    background: #FFF3EE; border-bottom: 1px solid rgba(255,92,26,0.15);
    padding: 20px 40px;
  }
  .ts-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: flex-start; gap: 16px; }
  .ts-icon { width: 40px; height: 40px; border-radius: 11px; background: #FF5C1A; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .ts-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #FF5C1A; margin-bottom: 4px; }
  .ts-body { font-size: 13px; color: #6B6B6B; font-weight: 300; line-height: 1.65; }

  /* BODY */
  .legal-body { max-width: 1100px; margin: 0 auto; padding: 64px 40px 80px; display: grid; grid-template-columns: 260px 1fr; gap: 48px; align-items: start; }

  /* TOC */
  .toc { position: sticky; top: 88px; background: white; border: 1px solid #E8E6E1; border-radius: 18px; overflow: hidden; }
  .toc-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #AFAFAF; letter-spacing: 1px; text-transform: uppercase; padding: 18px 20px 12px; border-bottom: 1px solid #E8E6E1; }
  .toc-item { display: flex; align-items: center; gap: 10px; padding: 12px 20px; cursor: pointer; transition: background 0.15s; border-left: 2.5px solid transparent; }
  .toc-item:hover { background: #FAFAF8; }
  .toc-item.active { border-left-color: #FF5C1A; background: #FFFBF9; }
  .toc-icon { width: 28px; height: 28px; border-radius: 7px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .toc-label { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #0F0F0F; }
  .toc-item.active .toc-label { color: #FF5C1A; }
  .toc-num { font-size: 11px; color: #AFAFAF; margin-left: auto; font-family: 'Syne', sans-serif; font-weight: 600; }

  /* CONTENT */
  .legal-content { display: flex; flex-direction: column; gap: 28px; }
  .legal-section { background: white; border: 1px solid #E8E6E1; border-radius: 20px; overflow: hidden; }
  .legal-section-head { display: flex; align-items: center; justify-content: space-between; padding: 24px 28px; cursor: pointer; transition: background 0.15s; user-select: none; }
  .legal-section-head:hover { background: #FAFAF8; }
  .legal-section-head-left { display: flex; align-items: center; gap: 14px; }
  .ls-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .ls-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 17px; color: #0F0F0F; }
  .ls-chevron { transition: transform 0.2s; color: #AFAFAF; }
  .ls-chevron.open { transform: rotate(180deg); }

  .legal-section-body { padding: 8px 28px 28px; border-top: 1px solid #E8E6E1; }
  .legal-p { font-size: 14px; color: #3D3D3D; line-height: 1.9; font-weight: 300; margin-bottom: 16px; }
  .legal-p:last-child { margin-bottom: 0; }
  .legal-h3 { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; margin: 20px 0 10px; }
  .legal-list { list-style: none; padding: 0; margin: 0 0 16px; display: flex; flex-direction: column; gap: 10px; }
  .legal-list li { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: #3D3D3D; line-height: 1.7; font-weight: 300; }
  .legal-list li::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #FF5C1A; flex-shrink: 0; margin-top: 8px; }
  .legal-list.dash li::before { background: #6B6B6B; }
  .legal-highlight { background: #FFF3EE; border: 1px solid rgba(255,92,26,0.2); border-radius: 12px; padding: 16px 18px; margin-bottom: 16px; }
  .legal-highlight p { font-size: 14px; color: #0F0F0F; line-height: 1.7; margin: 0; }
  .legal-warning { background: #FFF8EE; border: 1px solid rgba(217,119,6,0.2); border-radius: 12px; padding: 16px 18px; margin-bottom: 16px; display: flex; gap: 12px; }
  .legal-warning-icon { flex-shrink: 0; color: #D97706; margin-top: 1px; }
  .legal-warning p { font-size: 14px; color: #0F0F0F; line-height: 1.7; margin: 0; }
  .legal-contact { background: #F5F4F1; border: 1px solid #E8E6E1; border-radius: 14px; padding: 22px; display: flex; align-items: flex-start; gap: 14px; }
  .lc-icon { width: 40px; height: 40px; border-radius: 11px; background: #FFF3EE; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .lc-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #0F0F0F; margin-bottom: 5px; }
  .lc-body { font-size: 13px; color: #6B6B6B; line-height: 1.65; font-weight: 300; }
  .lc-link { color: #FF5C1A; text-decoration: none; font-weight: 500; }
  .lc-link:hover { text-decoration: underline; }

  @media (max-width: 900px) {
    .legal-hero { padding: 120px 20px 56px; }
    .terms-summary { padding: 16px 20px; }
    .legal-body { grid-template-columns: 1fr; padding: 40px 20px 60px; }
    .toc { position: static; }
  }
`

const sections: Section[] = [
  {
    id: 'introduction', title: '1. Introduction', icon: <FileText size={18} />, iconBg: '#FFF3EE', iconColor: '#FF5C1A',
    content: (
      <>
        <div className="legal-highlight"><p>By accessing or using FixMate, you agree to be bound by these Terms of Service. Please read them carefully.</p></div>
        <p className="legal-p">These Terms of Service ("Terms") govern your access to and use of FixMate ("the Platform"), operated by FixMate Ltd, a company registered in England and Wales.</p>
        <p className="legal-p">FixMate is a two-sided marketplace that connects clients who need skilled services with workers and artisans who provide them. We are a technology platform and intermediary — we do not employ workers or provide services directly.</p>
        <p className="legal-p">These Terms apply to all users of the Platform, including clients, workers, and anyone who simply browses our site. If you do not agree with any part of these Terms, you must stop using the Platform immediately.</p>
      </>
    ),
  },
  {
    id: 'accounts', title: '2. User Accounts', icon: <Users size={18} />, iconBg: '#EEF6FF', iconColor: '#2563EB',
    content: (
      <>
        <Navbar/>
        <h3 className="legal-h3">Account Creation</h3>
        <ul className="legal-list">
          <li>You must be at least 18 years old to create an account</li>
          <li>You must provide accurate, current and complete information during registration</li>
          <li>You are responsible for maintaining the confidentiality of your login credentials</li>
          <li>You may not create more than one account per person without our written permission</li>
          <li>Corporate accounts are permitted and subject to additional terms</li>
        </ul>
        <h3 className="legal-h3">Account Responsibilities</h3>
        <p className="legal-p">You are fully responsible for all activity that occurs under your account. If you become aware of any unauthorised use, you must notify us immediately at security@fixmate.com.</p>
        <h3 className="legal-h3">Account Suspension & Termination</h3>
        <p className="legal-p">FixMate reserves the right to suspend or permanently terminate accounts that violate these Terms, engage in fraudulent activity, or pose a risk to other users. We will provide reasonable notice before termination except where immediate action is required for safety reasons.</p>
      </>
    ),
  },
  {
    id: 'workers', title: '3. Workers & Service Providers', icon: <Briefcase size={18} />, iconBg: '#F0FDF4', iconColor: '#16A34A',
    content: (
      <>
        <p className="legal-p">Workers who register on FixMate agree to the following additional terms:</p>
        <h3 className="legal-h3">Verification Requirements</h3>
        <ul className="legal-list">
          <li>Workers must complete identity verification before accepting bookings</li>
          <li>Qualifications, certifications and experience must be accurately represented</li>
          <li>Workers must hold any licences required to legally perform the services they offer in their jurisdiction</li>
          <li>Workers must notify FixMate if their verification status changes</li>
        </ul>
        <h3 className="legal-h3">Independent Contractor Status</h3>
        <div className="legal-warning">
          <AlertTriangle size={16} className="legal-warning-icon" />
          <p>Workers using FixMate are independent contractors, not employees of FixMate. FixMate does not provide worker benefits, insurance, or employment protections. Workers are responsible for their own tax obligations.</p>
        </div>
        <h3 className="legal-h3">Service Standards</h3>
        <ul className="legal-list">
          <li>Workers must perform services professionally, safely and to the standard described in their profile</li>
          <li>Workers must respond to booking requests within their stated response time</li>
          <li>Workers must arrive at the agreed time and location or provide advance notice of any changes</li>
          <li>Workers must not solicit clients to transact outside the FixMate platform</li>
        </ul>
      </>
    ),
  },
  {
    id: 'payments', title: '4. Payments & Fees', icon: <CreditCard size={18} />, iconBg: '#FFF8EE', iconColor: '#D97706',
    content: (
      <>
        <h3 className="legal-h3">Platform Fees</h3>
        <p className="legal-p">FixMate charges a service fee on completed transactions to sustain the platform. The current fee structure is:</p>
        <ul className="legal-list">
          <li>Clients: No booking fee — FixMate is free to use for clients</li>
          <li>Workers: A 12% service fee is deducted from each completed job payment</li>
          <li>Fees are subject to change with 30 days written notice to affected users</li>
        </ul>
        <h3 className="legal-h3">Payment Processing</h3>
        <ul className="legal-list">
          <li>Payments are processed through our secure payment partners</li>
          <li>Funds are held in escrow until the job is marked complete by the client</li>
          <li>Workers receive payment within 5 business days of job completion</li>
          <li>FixMate does not charge clients upfront — payment is authorised at booking and charged only on completion</li>
        </ul>
        <h3 className="legal-h3">Refunds & Disputes</h3>
        <p className="legal-p">If you have a dispute about a payment or the quality of a service, contact our support team within 7 days of the job completion date. We will investigate and provide a resolution within 10 business days. See our Refund Policy for full details.</p>
      </>
    ),
  },
  {
    id: 'conduct', title: '5. Prohibited Conduct', icon: <Shield size={18} />, iconBg: '#F5F0FF', iconColor: '#7C3AED',
    content: (
      <>
        <p className="legal-p">The following activities are strictly prohibited on FixMate:</p>
        <ul className="legal-list">
          <li>Providing false information during registration, verification or on your profile</li>
          <li>Harassing, threatening or abusing other users in any way</li>
          <li>Soliciting clients or workers to conduct transactions outside the FixMate platform</li>
          <li>Posting fake reviews or attempting to manipulate the rating system</li>
          <li>Using the platform for any illegal purpose or in violation of local laws</li>
          <li>Accessing or attempting to access another user&apos;s account without authorisation</li>
          <li>Scraping, data mining or extracting data from the platform without written permission</li>
          <li>Introducing malware, viruses or any harmful code into the platform</li>
          <li>Creating multiple accounts to circumvent suspensions or bans</li>
          <li>Discriminating against any user based on race, gender, religion, nationality, disability or any other protected characteristic</li>
        </ul>
        <p className="legal-p">Violation of these rules may result in immediate account suspension, permanent ban, and/or legal action where appropriate.</p>
      </>
    ),
  },
  {
    id: 'liability', title: '6. Liability & Disputes', icon: <AlertTriangle size={18} />, iconBg: '#FEF2F2', iconColor: '#EF4444',
    content: (
      <>
        <div className="legal-warning">
          <AlertTriangle size={16} className="legal-warning-icon" />
          <p><strong>FixMate is a marketplace platform and intermediary.</strong> We are not a party to the service agreements between clients and workers. We do not guarantee the quality, safety, or legality of services provided.</p>
        </div>
        <h3 className="legal-h3">Limitation of Liability</h3>
        <p className="legal-p">To the maximum extent permitted by applicable law, FixMate shall not be liable for:</p>
        <ul className="legal-list">
          <li>Any indirect, incidental, consequential or punitive damages arising from use of the platform</li>
          <li>The quality, safety or fitness for purpose of services provided by workers</li>
          <li>Loss of data, business, revenue or profits</li>
          <li>Any actions or omissions of workers or clients using the platform</li>
        </ul>
        <h3 className="legal-h3">Dispute Resolution</h3>
        <p className="legal-p">In the event of a dispute between users, we encourage both parties to first attempt resolution through our in-platform messaging system. If unresolved, contact our support team to initiate a formal dispute process. FixMate&apos;s decision on platform-related matters is final.</p>
        <p className="legal-p">For legal disputes with FixMate Ltd, these Terms are governed by the laws of England and Wales, and disputes shall be resolved in the courts of England and Wales.</p>
      </>
    ),
  },
  {
    id: 'intellectual', title: '7. Intellectual Property', icon: <Scale size={18} />, iconBg: '#F5F4F1', iconColor: '#6B6B6B',
    content: (
      <>
        <p className="legal-p">All content on the FixMate platform — including but not limited to the logo, design, text, software, features and interfaces — is the exclusive property of FixMate Ltd and protected by copyright, trademark and other intellectual property laws.</p>
        <h3 className="legal-h3">Your Content</h3>
        <p className="legal-p">By submitting content to FixMate (including profile photos, descriptions, reviews and messages), you grant FixMate a non-exclusive, worldwide, royalty-free licence to use, display and reproduce that content in connection with operating and promoting the platform.</p>
        <h3 className="legal-h3">Restrictions</h3>
        <ul className="legal-list">
          <li>You may not copy, reproduce, or distribute FixMate&apos;s intellectual property without written permission</li>
          <li>You may not use FixMate&apos;s name, logo or branding to misrepresent your relationship with us</li>
          <li>All rights not expressly granted in these Terms are reserved by FixMate Ltd</li>
        </ul>
      </>
    ),
  },
  {
    id: 'changes', title: '8. Changes & Governing Law', icon: <Globe size={18} />, iconBg: '#EEF6FF', iconColor: '#2563EB',
    content: (
      <>
        <h3 className="legal-h3">Changes to These Terms</h3>
        <p className="legal-p">FixMate reserves the right to modify these Terms at any time. We will notify registered users of material changes via email and/or a prominent notice on the platform. Continued use of the platform after changes take effect constitutes acceptance of the new Terms.</p>
        <h3 className="legal-h3">Governing Law</h3>
        <p className="legal-p">These Terms are governed by and construed in accordance with the laws of England and Wales. You agree to submit to the exclusive jurisdiction of the courts of England and Wales for any dispute arising from these Terms or your use of the platform.</p>
        <h3 className="legal-h3">Severability</h3>
        <p className="legal-p">If any provision of these Terms is found to be unenforceable, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.</p>
        <div className="legal-contact">
          <div className="lc-icon"><Mail size={20} color="#FF5C1A" /></div>
          <div>
            <p className="lc-title">Legal Enquiries</p>
            <p className="lc-body">For questions about these Terms, contact our legal team at <a href="mailto:legal@fixmate.com" className="lc-link">legal@fixmate.com</a> or write to: FixMate Ltd, 14 Finsbury Square, London, EC2A 1HP, United Kingdom.</p>
          </div>
        </div>
      </>
    ),
  },
]

export default function TermsPage() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['introduction']))
  const [activeSection, setActiveSection] = useState('introduction')

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
      <div className="terms-page">

        <section className="legal-hero">
          <div className="legal-hero-grid" />
          <div className="legal-hero-glow" />
          <div className="legal-hero-inner">
            <div className="legal-label">Legal</div>
            <h1 className="legal-hero-title">Terms of <em>Service</em></h1>
            <p className="legal-hero-sub">
              These Terms govern your use of the FixMate platform. By using FixMate, you agree to these terms. Please read them carefully.
            </p>
            <div className="legal-updated">
              <span className="legal-updated-dot" />
              Last updated: 1 March 2025 · Effective immediately
            </div>
          </div>
        </section>

        {/* Summary banner */}
        <div className="terms-summary">
          <div className="ts-inner">
            <div className="ts-icon"><FileText size={20} color="white" /></div>
            <div>
              <p className="ts-title">Plain English Summary</p>
              <p className="ts-body">
                FixMate connects clients with skilled workers. We&apos;re a platform — not an employer. Workers are independent contractors. Payments are protected until jobs complete. Be honest, be professional, don&apos;t abuse the platform. Full details in the sections below.
              </p>
            </div>
          </div>
        </div>

        <div className="legal-body">

          {/* TOC */}
          <div className="toc">
            <p className="toc-title">Sections</p>
            {sections.map((s, i) => (
              <div
                key={s.id}
                className={`toc-item${activeSection === s.id ? ' active' : ''}`}
                onClick={() => { toggle(s.id); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
              >
                <div className="toc-icon" style={{ background: s.iconBg, color: s.iconColor }}>{s.icon}</div>
                <span className="toc-label">{s.title.replace(/^\d+\.\s/, '')}</span>
                <span className="toc-num">{String(i + 1).padStart(2, '0')}</span>
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