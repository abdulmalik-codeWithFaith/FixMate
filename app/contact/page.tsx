'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Mail, Phone, MapPin, MessageCircle, Send,
  CheckCircle, ChevronRight, Clock, Globe,
  HelpCircle, Briefcase, AlertCircle, User
} from 'lucide-react'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

const S = `
  .contact-page { overflow-x: hidden; }

  /* HERO */
  .contact-hero {
    background: #0F0F0F; padding: 140px 40px 80px;
    position: relative; overflow: hidden; text-align: center;
  }
  .contact-hero-grid {
    position: absolute; inset: 0;
    background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 60px 60px; pointer-events: none;
  }
  .contact-hero-glow { position: absolute; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(255,92,26,0.12) 0%, transparent 70%); top: -150px; left: 50%; transform: translateX(-50%); pointer-events: none; }
  .contact-hero-inner { max-width: 680px; margin: 0 auto; position: relative; z-index: 1; }
  .contact-label {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(255,92,26,0.15); border: 1px solid rgba(255,92,26,0.3);
    color: #FF5C1A; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600;
    letter-spacing: 1.5px; text-transform: uppercase; padding: 6px 14px; border-radius: 100px; margin-bottom: 24px;
  }
  .contact-hero h1 { font-family: 'Syne', sans-serif; font-size: clamp(36px,5vw,60px); font-weight: 800; letter-spacing: -2px; color: white; margin-bottom: 20px; line-height: 1.1; }
  .contact-hero h1 em { color: #FF5C1A; font-style: normal; }
  .contact-hero-sub { font-size: 17px; color: rgba(255,255,255,0.5); font-weight: 300; line-height: 1.75; }

  /* BODY */
  .contact-body { max-width: 1100px; margin: 0 auto; padding: 72px 40px; }
  .contact-grid { display: grid; grid-template-columns: 1fr 420px; gap: 48px; align-items: start; }

  /* FORM CARD */
  .form-card { background: white; border: 1px solid #E8E6E1; border-radius: 24px; overflow: hidden; }
  .form-card-head { padding: 32px 36px 24px; border-bottom: 1px solid #E8E6E1; }
  .form-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px; letter-spacing: -0.5px; color: #0F0F0F; margin-bottom: 6px; }
  .form-sub { font-size: 14px; color: #6B6B6B; font-weight: 300; }
  .form-body { padding: 28px 36px; }

  /* TOPIC PILLS */
  .topic-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
  .topic-pill {
    display: flex; align-items: center; gap: 6px;
    font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600;
    border: 1.5px solid #E8E6E1; border-radius: 100px; padding: 7px 14px;
    cursor: pointer; transition: all 0.2s; color: #6B6B6B; background: white;
  }
  .topic-pill:hover { border-color: #FF5C1A; color: #FF5C1A; }
  .topic-pill.active { background: #FF5C1A; border-color: #FF5C1A; color: white; }

  /* FIELDS */
  .field { margin-bottom: 18px; }
  .field-label { display: block; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #0F0F0F; margin-bottom: 7px; }
  .field-label span { color: #FF5C1A; }
  .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .field-input {
    width: 100%; background: #F5F4F1; border: 1.5px solid #E8E6E1;
    border-radius: 12px; padding: 12px 16px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F;
    outline: none; transition: border-color 0.2s; box-sizing: border-box;
  }
  .field-input:focus { border-color: #FF5C1A; background: white; box-shadow: 0 0 0 3px rgba(255,92,26,0.08); }
  .field-input::placeholder { color: #AFAFAF; }
  .field-textarea { min-height: 120px; resize: vertical; font-family: 'DM Sans', sans-serif; }
  .field-wrap {
    display: flex; align-items: center; gap: 10px;
    background: #F5F4F1; border: 1.5px solid #E8E6E1;
    border-radius: 12px; padding: 12px 16px; transition: border-color 0.2s;
  }
  .field-wrap:focus-within { border-color: #FF5C1A; background: white; box-shadow: 0 0 0 3px rgba(255,92,26,0.08); }
  .field-wrap input { flex: 1; border: none; outline: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F; }
  .field-wrap input::placeholder { color: #AFAFAF; }
  .field-icon { color: #AFAFAF; flex-shrink: 0; }
  .field-error { border-color: #EF4444 !important; }
  .error-msg { font-size: 12px; color: #EF4444; margin-top: 5px; }

  .submit-btn {
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
    background: #FF5C1A; color: white; font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 600; border: none; border-radius: 12px;
    padding: 15px; cursor: pointer; transition: all 0.2s; margin-top: 8px;
  }
  .submit-btn:hover { background: #FF7A40; transform: translateY(-1px); box-shadow: 0 8px 28px rgba(255,92,26,0.3); }

  /* SUCCESS */
  .success-state { padding: 48px 36px; text-align: center; }
  .success-icon { width: 80px; height: 80px; border-radius: 50%; background: #F0FDF4; border: 3px solid #22C55E; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; animation: popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275); }
  @keyframes popIn { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .success-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px; color: #0F0F0F; margin-bottom: 10px; }
  .success-sub { font-size: 15px; color: #6B6B6B; font-weight: 300; line-height: 1.7; margin-bottom: 28px; }
  .success-back { display: inline-flex; align-items: center; gap: 8px; background: #0F0F0F; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; border: none; border-radius: 11px; padding: 12px 24px; cursor: pointer; transition: background 0.2s; }
  .success-back:hover { background: #1A1A1A; }

  /* SIDEBAR */
  .contact-sidebar { display: flex; flex-direction: column; gap: 16px; }

  /* INFO CARDS */
  .info-card { background: white; border: 1px solid #E8E6E1; border-radius: 18px; padding: 24px; }
  .info-card-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; margin-bottom: 18px; }
  .info-item { display: flex; align-items: flex-start; gap: 14px; padding: 12px 0; border-bottom: 1px solid #F5F4F1; }
  .info-item:last-child { border-bottom: none; }
  .info-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .info-label { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 13px; color: #0F0F0F; margin-bottom: 3px; }
  .info-value { font-size: 13px; color: #6B6B6B; font-weight: 300; line-height: 1.55; }
  .info-link { font-size: 13px; color: #FF5C1A; text-decoration: none; font-weight: 500; }
  .info-link:hover { text-decoration: underline; }

  /* QUICK LINKS */
  .quick-card { background: white; border: 1px solid #E8E6E1; border-radius: 18px; overflow: hidden; }
  .quick-card-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; padding: 20px 22px 14px; border-bottom: 1px solid #E8E6E1; }
  .quick-link-row { display: flex; align-items: center; gap: 12px; padding: 14px 22px; border-bottom: 1px solid #F5F4F1; text-decoration: none; color: inherit; transition: background 0.15s; }
  .quick-link-row:last-child { border-bottom: none; }
  .quick-link-row:hover { background: #FAFAF8; }
  .ql-icon { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .ql-label { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; color: #0F0F0F; }
  .ql-sub { font-size: 12px; color: #6B6B6B; }

  /* OFFICE */
  .offices-section { max-width: 1100px; margin: 0 auto; padding: 0 40px 80px; }
  .offices-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; letter-spacing: -1px; color: #0F0F0F; margin-bottom: 8px; }
  .offices-sub { font-size: 15px; color: #6B6B6B; font-weight: 300; margin-bottom: 32px; }
  .offices-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
  .office-card { background: white; border: 1px solid #E8E6E1; border-radius: 18px; padding: 24px; transition: all 0.2s; }
  .office-card:hover { border-color: #FF5C1A; transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,0,0,0.07); }
  .office-city { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #0F0F0F; margin-bottom: 4px; }
  .office-badge { display: inline-block; font-size: 11px; font-weight: 600; background: #FFF3EE; color: #FF5C1A; padding: 3px 9px; border-radius: 100px; margin-bottom: 12px; font-family: 'Syne', sans-serif; }
  .office-detail { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: #6B6B6B; margin-bottom: 6px; font-weight: 300; }

  @media (max-width: 900px) {
    .contact-hero { padding: 120px 20px 60px; }
    .contact-body { padding: 48px 20px; }
    .contact-grid { grid-template-columns: 1fr; }
    .field-row { grid-template-columns: 1fr; }
    .offices-section { padding: 0 20px 60px; }
  }
`

const topics = [
  { icon: <HelpCircle size={13} />,    label: 'General Support'  },
  { icon: <Briefcase size={13} />,     label: 'For Workers'       },
  { icon: <User size={13} />,           label: 'For Clients'       },
  { icon: <AlertCircle size={13} />,   label: 'Report an Issue'  },
  { icon: <Globe size={13} />,          label: 'Partnerships'      },
  { icon: <MessageCircle size={13} />, label: 'Press Enquiry'    },
]

const offices = [
  { city: 'London', badge: 'HQ', address: '14 Finsbury Square, London, EC2A 1HP', email: 'london@fixmate.com', hours: 'Mon–Fri, 9am–6pm GMT' },
  { city: 'Lagos',  badge: 'Africa HQ', address: '5 Ozumba Mbadiwe Ave, Victoria Island, Lagos', email: 'lagos@fixmate.com', hours: 'Mon–Fri, 8am–5pm WAT' },
  { city: 'Dubai',  badge: 'MENA',  address: 'Dubai Internet City, Building 4, Dubai, UAE', email: 'dubai@fixmate.com', hours: 'Sun–Thu, 9am–6pm GST' },
  { city: 'Mumbai', badge: 'Asia',  address: 'Bandra Kurla Complex, Mumbai, MH 400051', email: 'mumbai@fixmate.com', hours: 'Mon–Fri, 9:30am–6:30pm IST' },
]

export default function ContactPage() {
  const [activeTopic, setActiveTopic] = useState('General Support')
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [key]: e.target.value }))
    setErrors(p => ({ ...p, [key]: '' }))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.firstName.trim()) e.firstName = 'Required'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
    if (!form.message.trim()) e.message = 'Please write a message'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (validate()) setSubmitted(true)
  }

  return (
    <>
        <Navbar/>
      <style>{S}</style>
      <div className="contact-page">

        {/* HERO */}
        <section className="contact-hero">
          <div className="contact-hero-grid" />
          <div className="contact-hero-glow" />
          <div className="contact-hero-inner">
            <div className="contact-label">Get in Touch</div>
            <h1>We&apos;d Love to <em>Hear</em> from You</h1>
            <p className="contact-hero-sub">
              Whether you need help, have a question, want to partner with us or just want to say hi — our team is here and we respond fast.
            </p>
          </div>
        </section>

        {/* BODY */}
        <div className="contact-body">
          <div className="contact-grid">

            {/* FORM */}
            <div className="form-card">
              {!submitted ? (
                <>
                  <div className="form-card-head">
                    <h2 className="form-title">Send us a Message</h2>
                    <p className="form-sub">We typically respond within 24 hours on business days.</p>
                  </div>
                  <div className="form-body">
                    {/* Topic */}
                    <div className="field">
                      <label className="field-label">What&apos;s it about?</label>
                      <div className="topic-row">
                        {topics.map(t => (
                          <button
                            key={t.label}
                            type="button"
                            className={`topic-pill${activeTopic === t.label ? ' active' : ''}`}
                            onClick={() => setActiveTopic(t.label)}
                          >
                            {t.icon} {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} noValidate>
                      <div className="field-row">
                        <div className="field">
                          <label className="field-label">First name <span>*</span></label>
                          <div className={`field-wrap${errors.firstName ? ' field-error' : ''}`}>
                            <User size={16} className="field-icon" />
                            <input type="text" placeholder="Jane" value={form.firstName} onChange={set('firstName')} />
                          </div>
                          {errors.firstName && <p className="error-msg">{errors.firstName}</p>}
                        </div>
                        <div className="field">
                          <label className="field-label">Last name</label>
                          <div className="field-wrap">
                            <User size={16} className="field-icon" />
                            <input type="text" placeholder="Smith" value={form.lastName} onChange={set('lastName')} />
                          </div>
                        </div>
                      </div>

                      <div className="field">
                        <label className="field-label">Email address <span>*</span></label>
                        <div className={`field-wrap${errors.email ? ' field-error' : ''}`}>
                          <Mail size={16} className="field-icon" />
                          <input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
                        </div>
                        {errors.email && <p className="error-msg">{errors.email}</p>}
                      </div>

                      <div className="field">
                        <label className="field-label">Message <span>*</span></label>
                        <textarea
                          className={`field-input field-textarea${errors.message ? ' field-error' : ''}`}
                          placeholder={`Tell us about your ${activeTopic.toLowerCase()} enquiry…`}
                          value={form.message}
                          onChange={set('message')}
                        />
                        {errors.message && <p className="error-msg">{errors.message}</p>}
                      </div>

                      <button type="submit" className="submit-btn">
                        <Send size={16} /> Send Message
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="success-state">
                  <div className="success-icon"><CheckCircle size={40} color="#22C55E" /></div>
                  <h2 className="success-title">Message Received!</h2>
                  <p className="success-sub">
                    Thanks for reaching out, <strong>{form.firstName}</strong>. We&apos;ve received your message and will get back to you within 24 hours at <strong>{form.email}</strong>.
                  </p>
                  <button className="success-back" onClick={() => setSubmitted(false)}>
                    Send Another Message
                  </button>
                </div>
              )}
            </div>

            {/* SIDEBAR */}
            <div className="contact-sidebar">

              <div className="info-card">
                <p className="info-card-title">Contact Information</p>
                {[
                  { icon: <Mail size={16} color="#FF5C1A" />, bg: '#FFF3EE', label: 'Email Us', value: 'support@fixmate.com', href: 'mailto:support@fixmate.com' },
                  { icon: <Phone size={16} color="#2563EB" />, bg: '#EEF6FF', label: 'Call Us', value: '+44 20 7946 0300', href: 'tel:+442079460300' },
                  { icon: <MessageCircle size={16} color="#16A34A" />, bg: '#F0FDF4', label: 'Live Chat', value: 'Available Mon–Fri, 9am–6pm GMT', href: null },
                  { icon: <Clock size={16} color="#D97706" />, bg: '#FFF8EE', label: 'Response Time', value: 'We reply within 24 hours on business days', href: null },
                ].map(item => (
                  <div key={item.label} className="info-item">
                    <div className="info-icon" style={{ background: item.bg }}>{item.icon}</div>
                    <div>
                      <p className="info-label">{item.label}</p>
                      {item.href
                        ? <a href={item.href} className="info-link">{item.value}</a>
                        : <p className="info-value">{item.value}</p>
                      }
                    </div>
                  </div>
                ))}
              </div>

              <div className="quick-card">
                <p className="quick-card-title">Quick Help</p>
                {[
                  { icon: <HelpCircle size={15} color="#FF5C1A" />, bg: '#FFF3EE', label: 'Help Centre',     sub: 'Browse FAQs and guides',   href: '/help'    },
                  { icon: <Briefcase size={15} color="#2563EB" />,  bg: '#EEF6FF', label: 'Worker Support',  sub: 'For artisans and workers',  href: '/worker'  },
                  { icon: <AlertCircle size={15} color="#EF4444" />, bg: '#FEF2F2', label: 'Report a Problem',sub: 'Safety or account issues',  href: '/report'  },
                  { icon: <Globe size={15} color="#16A34A" />,      bg: '#F0FDF4', label: 'Partnerships',    sub: 'Work with FixMate',         href: '/partners' },
                ].map(item => (
                  <Link key={item.label} href={item.href} className="quick-link-row">
                    <div className="ql-icon" style={{ background: item.bg }}>{item.icon}</div>
                    <div style={{ flex: 1 }}>
                      <p className="ql-label">{item.label}</p>
                      <p className="ql-sub">{item.sub}</p>
                    </div>
                    <ChevronRight size={15} color="#AFAFAF" />
                  </Link>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* OFFICES */}
        <div className="offices-section">
          <h2 className="offices-title">Our Offices</h2>
          <p className="offices-sub">FixMate operates globally with regional offices across four continents.</p>
          <div className="offices-grid">
            {offices.map(o => (
              <div key={o.city} className="office-card">
                <p className="office-city">{o.city}</p>
                <span className="office-badge">{o.badge}</span>
                <div className="office-detail"><MapPin size={13} color="#AFAFAF" style={{ marginTop: 2, flexShrink: 0 }} />{o.address}</div>
                <div className="office-detail"><Mail size={13} color="#AFAFAF" style={{ flexShrink: 0 }} /><a href={`mailto:${o.email}`} style={{ color: '#FF5C1A', textDecoration: 'none' }}>{o.email}</a></div>
                <div className="office-detail"><Clock size={13} color="#AFAFAF" style={{ flexShrink: 0 }} />{o.hours}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
      <Footer/>
    </>
  )
}