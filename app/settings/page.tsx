'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft, ChevronRight, Bell, Shield, Eye, EyeOff,
  Smartphone, Globe, Moon, Trash2, LogOut, Lock,
  MapPin, CreditCard, HelpCircle, FileText, Mail,
  MessageCircle, Check, AlertTriangle,
  Calendar
} from 'lucide-react'

type Section = 'main' | 'notifications' | 'privacy' | 'password' | 'payment'

const S = `
  .settings-page { min-height: 100vh; background: #F5F4F1; }

  .settings-topbar {
    background: white; border-bottom: 1px solid #E8E6E1;
    padding: 0 40px; height: 64px;
    display: flex; align-items: center; gap: 14px;
    position: sticky; top: 0; z-index: 40;
  }
  .topbar-back {
    display: flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; border-radius: 10px;
    color: #6B6B6B; text-decoration: none; transition: all 0.2s;
    border: 1.5px solid #E8E6E1; flex-shrink: 0;
  }
  .topbar-back:hover { border-color: #0F0F0F; color: #0F0F0F; }
  .topbar-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; flex: 1; }

  .settings-body { max-width: 680px; margin: 0 auto; padding: 28px 40px; display: flex; flex-direction: column; gap: 24px; }

  /* SECTION CARD */
  .settings-card { background: white; border: 1px solid #E8E6E1; border-radius: 18px; overflow: hidden; }
  .settings-card-title {
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px;
    color: #AFAFAF; letter-spacing: 1px; text-transform: uppercase;
    padding: 16px 20px 10px;
  }

  /* ROW */
  .settings-row {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 20px; border-bottom: 1px solid #F5F4F1;
    cursor: pointer; transition: background 0.15s; text-decoration: none; color: inherit;
  }
  .settings-row:last-child { border-bottom: none; }
  .settings-row:hover { background: #FAFAF8; }
  .settings-row.danger:hover { background: #FEF2F2; }

  .row-icon {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .row-content { flex: 1; min-width: 0; }
  .row-label { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; color: #0F0F0F; }
  .row-label.danger { color: #EF4444; }
  .row-sub { font-size: 12px; color: #6B6B6B; margin-top: 2px; }
  .row-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; color: #AFAFAF; }
  .row-badge { font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 100px; font-family: 'Syne', sans-serif; }

  /* TOGGLE */
  .toggle-track {
    width: 44px; height: 24px; border-radius: 12px;
    background: #E8E6E1; position: relative; cursor: pointer;
    transition: background 0.2s; flex-shrink: 0;
  }
  .toggle-track.on { background: #FF5C1A; }
  .toggle-thumb {
    position: absolute; top: 3px; left: 3px;
    width: 18px; height: 18px; border-radius: 50%;
    background: white; transition: transform 0.2s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  }
  .toggle-track.on .toggle-thumb { transform: translateX(20px); }

  /* SUBSECTION */
  .subsection-header {
    display: flex; align-items: center; gap: 10px;
    padding: 20px 20px 14px;
    border-bottom: 1px solid #E8E6E1;
  }
  .subsection-back {
    background: none; border: none; cursor: pointer; color: #6B6B6B;
    display: flex; align-items: center; gap: 4px;
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
    transition: color 0.2s; padding: 0;
  }
  .subsection-back:hover { color: #0F0F0F; }
  .subsection-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; }

  /* FIELD */
  .settings-field { padding: 16px 20px; border-bottom: 1px solid #F5F4F1; }
  .settings-field:last-child { border-bottom: none; }
  .field-label { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #0F0F0F; margin-bottom: 8px; display: block; }
  .field-wrap {
    display: flex; align-items: center; gap: 10px;
    background: #F5F4F1; border: 1.5px solid #E8E6E1;
    border-radius: 12px; padding: 12px 16px; transition: border-color 0.2s;
  }
  .field-wrap:focus-within { border-color: #FF5C1A; background: white; box-shadow: 0 0 0 3px rgba(255,92,26,0.08); }
  .field-wrap input {
    flex: 1; border: none; outline: none; background: transparent;
    font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F;
  }
  .field-wrap input::placeholder { color: #AFAFAF; }
  .field-icon { color: #AFAFAF; flex-shrink: 0; }
  .field-action { background: none; border: none; cursor: pointer; color: #AFAFAF; display: flex; padding: 0; }
  .field-action:hover { color: #6B6B6B; }
  .field-hint { font-size: 12px; color: #6B6B6B; margin-top: 6px; }
  .field-error { font-size: 12px; color: #EF4444; margin-top: 5px; }
  .pw-strength { display: flex; gap: 4px; margin-top: 8px; }
  .pw-seg { flex: 1; height: 3px; border-radius: 2px; transition: background 0.3s; }

  /* SAVE BTN */
  .save-btn {
    margin: 16px 20px;
    width: calc(100% - 40px);
    display: flex; align-items: center; justify-content: center; gap: 8px;
    background: #FF5C1A; color: white;
    font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600;
    border: none; border-radius: 12px; padding: 13px;
    cursor: pointer; transition: all 0.2s;
  }
  .save-btn:hover { background: #FF7A40; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,92,26,0.25); }

  /* DANGER ZONE */
  .danger-zone { background: white; border: 1px solid rgba(239,68,68,0.2); border-radius: 18px; overflow: hidden; }
  .danger-zone-title {
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px;
    color: #EF4444; letter-spacing: 1px; text-transform: uppercase;
    padding: 16px 20px 10px; display: flex; align-items: center; gap: 6px;
  }

  /* SUCCESS TOAST */
  .toast {
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: #0F0F0F; color: white;
    display: flex; align-items: center; gap: 10px;
    padding: 12px 20px; border-radius: 12px;
    font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2); z-index: 100;
    animation: slideUp 0.3s ease;
  }
  @keyframes slideUp { from { transform: translateX(-50%) translateY(20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }

  @media (max-width: 768px) {
    .settings-topbar { padding: 0 16px; }
    .settings-body { padding: 20px 16px; }
  }
`

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div className={`toggle-track${on ? ' on' : ''}`} onClick={onToggle}>
      <div className="toggle-thumb" />
    </div>
  )
}

function getStrength(pw: string) {
  if (!pw) return { score: 0, color: '', label: '' }
  let s = 0
  if (pw.length >= 8)           s++
  if (/[A-Z]/.test(pw))        s++
  if (/[0-9]/.test(pw))        s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  const map = [
    { score: 1, color: '#EF4444', label: 'Weak'   },
    { score: 2, color: '#F59E0B', label: 'Fair'   },
    { score: 3, color: '#3B82F6', label: 'Good'   },
    { score: 4, color: '#22C55E', label: 'Strong' },
  ]
  return map[s - 1] ?? { score: 0, color: '', label: '' }
}

export default function SettingsPage() {
  const [section, setSection] = useState<Section>('main')
  const [toast, setToast]     = useState(false)

  // Notification toggles
  const [notifs, setNotifs] = useState({
    bookingUpdates: true, messages: true, reminders: true,
    reviews: true, promotions: false, sms: false, email: true,
  })

  // Privacy toggles
  const [privacy, setPrivacy] = useState({
    locationSharing: true, profileVisible: true, activityStatus: true,
    dataCollection: false,
  })

  // Password
  const [pw, setPw] = useState({ current: '', newPw: '', confirm: '' })
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false })
  const [pwError, setPwError] = useState('')

  // App preferences
  const [darkMode, setDarkMode]   = useState(false)
  const [language, setLanguage]   = useState('English')

  const showToast = () => {
    setToast(true)
    setTimeout(() => setToast(false), 2500)
  }

  const handlePwSave = () => {
    if (!pw.current)                  { setPwError('Current password is required'); return }
    if (pw.newPw.length < 6)          { setPwError('New password must be at least 6 characters'); return }
    if (pw.newPw !== pw.confirm)      { setPwError('Passwords do not match'); return }
    setPwError('')
    setPw({ current: '', newPw: '', confirm: '' })
    setSection('main')
    showToast()
  }

  const strength = getStrength(pw.newPw)

  const settingRows = [
    {
      group: 'Account',
      rows: [
        { icon: <Bell size={16} color="#FF5C1A" />, iconBg: '#FFF3EE', label: 'Notifications', sub: 'Manage alerts and push notifications', action: () => setSection('notifications'), right: 'chevron' },
        { icon: <Shield size={16} color="#2563EB" />, iconBg: '#EEF6FF', label: 'Privacy & Security', sub: 'Location, visibility and data settings', action: () => setSection('privacy'), right: 'chevron' },
        { icon: <Lock size={16} color="#7C3AED" />, iconBg: '#F5F0FF', label: 'Change Password', sub: 'Update your login credentials', action: () => setSection('password'), right: 'chevron' },
        { icon: <CreditCard size={16} color="#16A34A" />, iconBg: '#F0FDF4', label: 'Payment Methods', sub: 'Manage saved cards and billing', action: () => setSection('payment'), right: 'chevron', badge: { text: 'Coming Soon', bg: '#F5F4F1', color: '#6B6B6B' } },
      ]
    },
    {
      group: 'Preferences',
      rows: [
        { icon: <Globe size={16} color="#0F0F0F" />, iconBg: '#F5F4F1', label: 'Language', sub: language, action: () => {}, right: 'chevron' },
        { icon: <Moon size={16} color="#0F0F0F" />, iconBg: '#F5F4F1', label: 'Dark Mode', sub: 'Switch interface theme', action: () => setDarkMode(!darkMode), right: 'toggle', toggleOn: darkMode },
        { icon: <Smartphone size={16} color="#0F0F0F" />, iconBg: '#F5F4F1', label: 'App Version', sub: 'v1.0.0 — Up to date', action: () => {}, right: 'badge', badge: { text: 'Latest', bg: '#F0FDF4', color: '#16A34A' } },
      ]
    },
    {
      group: 'Support',
      rows: [
        { icon: <HelpCircle size={16} color="#D97706" />, iconBg: '#FFF8EE', label: 'Help Center', sub: 'FAQs and support articles', action: () => {}, right: 'chevron' },
        { icon: <MessageCircle size={16} color="#D97706" />, iconBg: '#FFF8EE', label: 'Contact Support', sub: 'Chat with our team', action: () => {}, right: 'chevron' },
        { icon: <FileText size={16} color="#6B6B6B" />, iconBg: '#F5F4F1', label: 'Terms & Privacy', sub: 'Legal documents and policies', action: () => {}, right: 'chevron' },
      ]
    },
  ]

  return (
    <>
      <style>{S}</style>
      <div className="settings-page">

        {toast && (
          <div className="toast">
            <Check size={16} color="#22C55E" /> Saved successfully
          </div>
        )}

        <div className="settings-topbar">
          {section !== 'main' ? (
            <button className="topbar-back" onClick={() => setSection('main')} style={{ textDecoration: 'none', cursor: 'pointer', background: 'none', border: '1.5px solid #E8E6E1', width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B6B6B', transition: 'all 0.2s' }}>
              <ChevronLeft size={18} />
            </button>
          ) : (
            <Link href="/dashboard" className="topbar-back"><ChevronLeft size={18} /></Link>
          )}
          <p className="topbar-title">
            {section === 'main'          && 'Settings'}
            {section === 'notifications' && 'Notifications'}
            {section === 'privacy'       && 'Privacy & Security'}
            {section === 'password'      && 'Change Password'}
            {section === 'payment'       && 'Payment Methods'}
          </p>
          {section !== 'main' && <div style={{ width: 36 }} />}
        </div>

        <div className="settings-body">

          {/* ── MAIN ── */}
          {section === 'main' && (
            <>
              {settingRows.map(group => (
                <div key={group.group} className="settings-card">
                  <p className="settings-card-title">{group.group}</p>
                  {group.rows.map(row => (
                    <div key={row.label} className="settings-row" onClick={row.action}>
                      <div className="row-icon" style={{ background: row.iconBg }}>{row.icon}</div>
                      <div className="row-content">
                        <p className="row-label">{row.label}</p>
                        <p className="row-sub">{row.sub}</p>
                      </div>
                      <div className="row-right">
                        {row.right === 'chevron'  && <ChevronRight size={16} />}
                        {row.right === 'toggle'   && <Toggle on={row.toggleOn ?? false} onToggle={row.action} />}
                        {row.right === 'badge' && row.badge && (
                          <span className="row-badge" style={{ background: row.badge.bg, color: row.badge.color }}>{row.badge.text}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Danger zone */}
              <div className="danger-zone">
                <p className="danger-zone-title"><AlertTriangle size={14} /> Danger Zone</p>
                <div className="settings-row danger">
                  <div className="row-icon" style={{ background: '#FEF2F2' }}><LogOut size={16} color="#EF4444" /></div>
                  <div className="row-content">
                    <p className="row-label danger">Sign Out</p>
                    <p className="row-sub">Sign out of your account</p>
                  </div>
                  <ChevronRight size={16} color="#EF4444" />
                </div>
                <div className="settings-row danger">
                  <div className="row-icon" style={{ background: '#FEF2F2' }}><Trash2 size={16} color="#EF4444" /></div>
                  <div className="row-content">
                    <p className="row-label danger">Delete Account</p>
                    <p className="row-sub">Permanently remove your account and data</p>
                  </div>
                  <ChevronRight size={16} color="#EF4444" />
                </div>
              </div>
            </>
          )}

          {/* ── NOTIFICATIONS ── */}
          {section === 'notifications' && (
            <div className="settings-card">
              {[
                { key: 'bookingUpdates', label: 'Booking Updates',    sub: 'Accepted, declined and status changes',  icon: <Calendar size={16} color="#FF5C1A" />,    bg: '#FFF3EE' },
                { key: 'messages',       label: 'New Messages',        sub: 'When workers send you a message',        icon: <MessageCircle size={16} color="#2563EB" />, bg: '#EEF6FF' },
                { key: 'reminders',      label: 'Job Reminders',       sub: 'Upcoming job alerts and schedules',      icon: <Bell size={16} color="#7C3AED" />,         bg: '#F5F0FF' },
                { key: 'reviews',        label: 'Review Requests',     sub: 'Prompts to rate completed jobs',         icon: <Check size={16} color="#16A34A" />,        bg: '#F0FDF4' },
                { key: 'promotions',     label: 'Promotions & Offers', sub: 'Deals and discounts from FixMate',       icon: <Mail size={16} color="#D97706" />,         bg: '#FFF8EE' },
              ].map(item => (
                <div key={item.key} className="settings-row" onClick={() => setNotifs(p => ({ ...p, [item.key]: !p[item.key as keyof typeof notifs] }))}>
                  <div className="row-icon" style={{ background: item.bg }}>{item.icon}</div>
                  <div className="row-content">
                    <p className="row-label">{item.label}</p>
                    <p className="row-sub">{item.sub}</p>
                  </div>
                  <Toggle on={notifs[item.key as keyof typeof notifs]} onToggle={() => setNotifs(p => ({ ...p, [item.key]: !p[item.key as keyof typeof notifs] }))} />
                </div>
              ))}
              <p className="settings-card-title" style={{ borderTop: '1px solid #E8E6E1', marginTop: 4, paddingTop: 16 }}>Channels</p>
              {[
                { key: 'email', label: 'Email Notifications', sub: 'Receive updates via email',        icon: <Mail size={16} color="#6B6B6B" />,       bg: '#F5F4F1' },
                { key: 'sms',   label: 'SMS Notifications',   sub: 'Receive text message alerts',      icon: <Smartphone size={16} color="#6B6B6B" />, bg: '#F5F4F1' },
              ].map(item => (
                <div key={item.key} className="settings-row" onClick={() => setNotifs(p => ({ ...p, [item.key]: !p[item.key as keyof typeof notifs] }))}>
                  <div className="row-icon" style={{ background: item.bg }}>{item.icon}</div>
                  <div className="row-content">
                    <p className="row-label">{item.label}</p>
                    <p className="row-sub">{item.sub}</p>
                  </div>
                  <Toggle on={notifs[item.key as keyof typeof notifs]} onToggle={() => setNotifs(p => ({ ...p, [item.key]: !p[item.key as keyof typeof notifs] }))} />
                </div>
              ))}
              <button className="save-btn" onClick={() => { setSection('main'); showToast() }}>
                <Check size={16} /> Save Preferences
              </button>
            </div>
          )}

          {/* ── PRIVACY ── */}
          {section === 'privacy' && (
            <div className="settings-card">
              {[
                { key: 'locationSharing', label: 'Location Sharing',    sub: 'Show your location to nearby workers',   icon: <MapPin size={16} color="#FF5C1A" />,  bg: '#FFF3EE' },
                { key: 'profileVisible',  label: 'Public Profile',      sub: 'Allow workers to view your profile',     icon: <Eye size={16} color="#2563EB" />,      bg: '#EEF6FF' },
                { key: 'activityStatus',  label: 'Activity Status',     sub: 'Show when you were last active',         icon: <Check size={16} color="#16A34A" />,    bg: '#F0FDF4' },
                { key: 'dataCollection',  label: 'Analytics & Data',    sub: 'Help us improve with usage data',        icon: <Shield size={16} color="#6B6B6B" />,   bg: '#F5F4F1' },
              ].map(item => (
                <div key={item.key} className="settings-row" onClick={() => setPrivacy(p => ({ ...p, [item.key]: !p[item.key as keyof typeof privacy] }))}>
                  <div className="row-icon" style={{ background: item.bg }}>{item.icon}</div>
                  <div className="row-content">
                    <p className="row-label">{item.label}</p>
                    <p className="row-sub">{item.sub}</p>
                  </div>
                  <Toggle on={privacy[item.key as keyof typeof privacy]} onToggle={() => setPrivacy(p => ({ ...p, [item.key]: !p[item.key as keyof typeof privacy] }))} />
                </div>
              ))}
              <button className="save-btn" onClick={() => { setSection('main'); showToast() }}>
                <Check size={16} /> Save Settings
              </button>
            </div>
          )}

          {/* ── PASSWORD ── */}
          {section === 'password' && (
            <div className="settings-card">
              {(['current', 'newPw', 'confirm'] as const).map((key) => (
                <div key={key} className="settings-field">
                  <label className="field-label">
                    {key === 'current' ? 'Current password' : key === 'newPw' ? 'New password' : 'Confirm new password'}
                  </label>
                  <div className="field-wrap">
                    <Lock size={16} className="field-icon" />
                    <input
                      type={showPw[key] ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={pw[key]}
                      onChange={e => { setPw(p => ({ ...p, [key]: e.target.value })); setPwError('') }}
                    />
                    <button className="field-action" onClick={() => setShowPw(p => ({ ...p, [key]: !p[key] }))}>
                      {showPw[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {key === 'newPw' && pw.newPw && (
                    <>
                      <div className="pw-strength">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="pw-seg" style={{ background: i <= strength.score ? strength.color : '#E8E6E1' }} />
                        ))}
                      </div>
                      <p style={{ fontSize: 11, color: strength.color, marginTop: 4 }}>{strength.label}</p>
                    </>
                  )}
                </div>
              ))}
              {pwError && <p style={{ padding: '0 20px', fontSize: 12, color: '#EF4444', marginBottom: 4 }}>{pwError}</p>}
              <button className="save-btn" onClick={handlePwSave}>
                <Lock size={16} /> Update Password
              </button>
            </div>
          )}

          {/* ── PAYMENT ── */}
          {section === 'payment' && (
            <div className="settings-card">
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, background: '#F0FDF4', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <CreditCard size={32} color="#16A34A" />
                </div>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: '#0F0F0F', marginBottom: 8 }}>Payment Methods</p>
                <p style={{ fontSize: 14, color: '#6B6B6B', fontWeight: 300, lineHeight: 1.7, marginBottom: 24 }}>
                  Secure payments are coming soon. All transactions will be protected and encrypted.
                </p>
                <span style={{ display: 'inline-block', background: '#F0FDF4', color: '#16A34A', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12, padding: '6px 16px', borderRadius: 100, border: '1px solid rgba(22,163,74,0.2)' }}>
                  Coming Soon
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}