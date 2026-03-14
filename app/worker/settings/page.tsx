'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft, ChevronRight, Bell, Shield, Lock,
  Eye, EyeOff, Moon, Globe, Smartphone, Mail,
  CreditCard, HelpCircle, FileText, MessageCircle,
  Check, AlertTriangle, Trash2, LogOut, DollarSign,
  Banknote, MapPin, ToggleLeft, ToggleRight, X
} from 'lucide-react'

type Section = 'main' | 'notifications' | 'privacy' | 'password' | 'payout'

const S = `
  .ws-page { min-height: 100vh; background: #F5F4F1; }
  .ws-topbar { background: white; border-bottom: 1px solid #E8E6E1; padding: 0 40px; height: 64px; display: flex; align-items: center; gap: 14px; position: sticky; top: 0; z-index: 40; }
  .tb-back { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; color: #6B6B6B; text-decoration: none; transition: all 0.2s; border: 1.5px solid #E8E6E1; flex-shrink: 0; }
  .tb-back:hover { border-color: #0F0F0F; color: #0F0F0F; }
  .tb-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; flex: 1; }
  .ws-body { max-width: 680px; margin: 0 auto; padding: 28px 40px; display: flex; flex-direction: column; gap: 24px; }

  /* CARDS */
  .s-card { background: white; border: 1px solid #E8E6E1; border-radius: 18px; overflow: hidden; }
  .s-card-label { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px; color: #AFAFAF; letter-spacing: 1px; text-transform: uppercase; padding: 16px 20px 10px; }

  /* ROWS */
  .s-row { display: flex; align-items: center; gap: 14px; padding: 14px 20px; border-bottom: 1px solid #F5F4F1; cursor: pointer; transition: background 0.15s; text-decoration: none; color: inherit; }
  .s-row:last-child { border-bottom: none; }
  .s-row:hover { background: #FAFAF8; }
  .s-row.danger:hover { background: #FEF2F2; }
  .s-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .s-label { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; color: #0F0F0F; }
  .s-label.danger { color: #EF4444; }
  .s-sub { font-size: 12px; color: #6B6B6B; margin-top: 2px; }
  .s-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; color: #AFAFAF; margin-left: auto; }
  .s-badge { font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 100px; font-family: 'Syne', sans-serif; }

  /* TOGGLE */
  .tog { width: 44px; height: 24px; border-radius: 12px; background: #E8E6E1; position: relative; cursor: pointer; transition: background 0.2s; flex-shrink: 0; }
  .tog.on { background: #FF5C1A; }
  .tog-thumb { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: white; transition: transform 0.2s; box-shadow: 0 1px 4px rgba(0,0,0,0.15); }
  .tog.on .tog-thumb { transform: translateX(20px); }

  /* SUBSECTION */
  .sub-field { padding: 16px 20px; border-bottom: 1px solid #F5F4F1; }
  .sub-field:last-child { border-bottom: none; }
  .sub-field-label { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #0F0F0F; margin-bottom: 8px; display: block; }
  .field-wrap { display: flex; align-items: center; gap: 10px; background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 12px; padding: 12px 16px; transition: border-color 0.2s; }
  .field-wrap:focus-within { border-color: #FF5C1A; background: white; box-shadow: 0 0 0 3px rgba(255,92,26,0.08); }
  .field-wrap input { flex: 1; border: none; outline: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F; }
  .field-wrap input::placeholder { color: #AFAFAF; }
  .field-icon { color: #AFAFAF; flex-shrink: 0; }
  .field-eye { background: none; border: none; cursor: pointer; color: #AFAFAF; display: flex; padding: 0; }
  .pw-strength { display: flex; gap: 4px; margin-top: 8px; }
  .pw-seg { flex: 1; height: 3px; border-radius: 2px; }
  .save-btn { margin: 16px 20px; width: calc(100% - 40px); display: flex; align-items: center; justify-content: center; gap: 8px; background: #FF5C1A; color: white; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; border: none; border-radius: 12px; padding: 13px; cursor: pointer; transition: all 0.2s; }
  .save-btn:hover { background: #FF7A40; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,92,26,0.25); }

  /* PAYOUT FORM */
  .payout-form { padding: 20px; display: flex; flex-direction: column; gap: 14px; }
  .payout-hint { background: #F0FDF4; border: 1px solid rgba(22,163,74,0.2); border-radius: 12px; padding: 14px 16px; display: flex; gap: 10px; align-items: flex-start; }
  .payout-hint-icon { flex-shrink: 0; margin-top: 1px; }
  .payout-hint-text { font-size: 13px; color: #6B6B6B; line-height: 1.6; }
  .payout-hint-text strong { color: '#0F0F0F'; font-weight: 600; }
  .payout-field { display: flex; flex-direction: column; gap: 6px; }
  .payout-field label { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; color: #6B6B6B; text-transform: uppercase; letter-spacing: .5px; }

  /* DANGER ZONE */
  .danger-card { background: white; border: 1px solid rgba(239,68,68,0.2); border-radius: 18px; overflow: hidden; }
  .danger-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #EF4444; letter-spacing: 1px; text-transform: uppercase; padding: 16px 20px 10px; display: flex; align-items: center; gap: 6px; }

  /* TOAST */
  .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #0F0F0F; color: white; display: flex; align-items: center; gap: 10px; padding: 12px 20px; border-radius: 12px; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; box-shadow: 0 8px 32px rgba(0,0,0,0.2); z-index: 100; animation: slideUp 0.3s ease; }
  @keyframes slideUp { from { transform: translateX(-50%) translateY(20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }

  @media (max-width: 768px) {
    .ws-topbar { padding: 0 16px; }
    .ws-body { padding: 20px 16px; }
  }
`

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <div className={`tog${on ? ' on' : ''}`} onClick={onClick}>
      <div className="tog-thumb" />
    </div>
  )
}

function getPwStrength(pw: string) {
  if (!pw) return { score: 0, color: '', label: '' }
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return [
    { score: 1, color: '#EF4444', label: 'Weak'   },
    { score: 2, color: '#F59E0B', label: 'Fair'   },
    { score: 3, color: '#3B82F6', label: 'Good'   },
    { score: 4, color: '#22C55E', label: 'Strong' },
  ][s - 1] ?? { score: 0, color: '', label: '' }
}

export default function WorkerSettingsPage() {
  const [section, setSection] = useState<Section>('main')
  const [toast, setToast]     = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const [notifs, setNotifs] = useState({
    newRequests: true, messages: true, payments: true, reminders: true,
    promotions: false, sms: false, email: true,
  })
  const [privacy, setPrivacy] = useState({
    profileVisible: true, locationSharing: true, activityStatus: true, dataCollection: false,
  })
  const [pw, setPw] = useState({ current: '', newPw: '', confirm: '' })
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false })
  const [pwError, setPwError] = useState('')
  const [payout, setPayout] = useState({ bank: '', accountNum: '', sortCode: '', paypal: '' })

  const showToast = () => { setToast(true); setTimeout(() => setToast(false), 2500) }

  const handlePwSave = () => {
    if (!pw.current)              { setPwError('Current password required'); return }
    if (pw.newPw.length < 6)      { setPwError('New password must be 6+ characters'); return }
    if (pw.newPw !== pw.confirm)  { setPwError('Passwords do not match'); return }
    setPwError(''); setPw({ current: '', newPw: '', confirm: '' })
    setSection('main'); showToast()
  }

  const strength = getPwStrength(pw.newPw)

  const tog = (obj: Record<string, boolean>, key: string, setter: (v: Record<string, boolean>) => void) =>
    setter({ ...obj, [key]: !obj[key] })

  const mainSections = [
    {
      label: 'Account',
      rows: [
        { icon: <Bell size={16} color="#FF5C1A" />, bg: '#FFF3EE', label: 'Notifications', sub: 'Job alerts, messages, payment updates', section: 'notifications' as Section },
        { icon: <Shield size={16} color="#2563EB" />, bg: '#EEF6FF', label: 'Privacy & Security', sub: 'Profile visibility and data preferences', section: 'privacy' as Section },
        { icon: <Lock size={16} color="#7C3AED" />, bg: '#F5F0FF', label: 'Change Password', sub: 'Update your account credentials', section: 'password' as Section },
        { icon: <Banknote size={16} color="#16A34A" />, bg: '#F0FDF4', label: 'Payout Settings', sub: 'Bank account and payment preferences', section: 'payout' as Section },
      ],
    },
    {
      label: 'Preferences',
      rows: [
        { icon: <Globe size={16} color="#0F0F0F" />, bg: '#F5F4F1', label: 'Language', sub: 'English', section: null, badge: null },
        { icon: <Moon size={16} color="#0F0F0F" />, bg: '#F5F4F1', label: 'Dark Mode', sub: 'Switch interface theme', section: null, toggle: { on: darkMode, fn: () => setDarkMode(!darkMode) } },
        { icon: <MapPin size={16} color="#0F0F0F" />, bg: '#F5F4F1', label: 'Service Area', sub: 'Set your work radius', section: null },
        { icon: <DollarSign size={16} color="#0F0F0F" />, bg: '#F5F4F1', label: 'Availability', sub: 'Manage working days & hours', section: null, href: '/worker/profile' },
      ],
    },
    {
      label: 'Support',
      rows: [
        { icon: <HelpCircle size={16} color="#D97706" />, bg: '#FFF8EE', label: 'Help Center', sub: 'FAQs and support guides', section: null },
        { icon: <MessageCircle size={16} color="#D97706" />, bg: '#FFF8EE', label: 'Contact Support', sub: 'Chat with the FixMate team', section: null },
        { icon: <FileText size={16} color="#6B6B6B" />, bg: '#F5F4F1', label: 'Terms & Privacy', sub: 'Legal documents', section: null },
      ],
    },
  ]

  return (
    <>
      <style>{S}</style>
      <div className="ws-page">

        {toast && (
          <div className="toast"><Check size={16} color="#22C55E" /> Saved successfully</div>
        )}

        <div className="ws-topbar">
          {section !== 'main' ? (
            <button className="tb-back" onClick={() => setSection('main')} style={{ background: 'none', cursor: 'pointer' }}>
              <ChevronLeft size={18} />
            </button>
          ) : (
            <Link href="/worker/dashboard" className="tb-back"><ChevronLeft size={18} /></Link>
          )}
          <p className="tb-title">
            {section === 'main'          && 'Settings'}
            {section === 'notifications' && 'Notifications'}
            {section === 'privacy'       && 'Privacy & Security'}
            {section === 'password'      && 'Change Password'}
            {section === 'payout'        && 'Payout Settings'}
          </p>
          {section !== 'main' && <div style={{ width: 36 }} />}
        </div>

        <div className="ws-body">

          {/* ── MAIN ── */}
          {section === 'main' && (
            <>
              {mainSections.map(g => (
                <div key={g.label} className="s-card">
                  <p className="s-card-label">{g.label}</p>
                  {g.rows.map(row => (
                    <div key={row.label} className="s-row"
                      onClick={() => row.section ? setSection(row.section) : row.href ? null : undefined}
                    >
                      <div className="s-icon" style={{ background: row.bg }}>{row.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="s-label">{row.label}</p>
                        <p className="s-sub">{row.sub}</p>
                      </div>
                      <div className="s-right">
                        {(row as any).toggle
                          ? <Toggle on={(row as any).toggle.on} onClick={(row as any).toggle.fn} />
                          : <ChevronRight size={16} />
                        }
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Danger zone */}
              <div className="danger-card">
                <p className="danger-title"><AlertTriangle size={14} /> Danger Zone</p>
                <div className="s-row danger"><div className="s-icon" style={{ background: '#FEF2F2' }}><LogOut size={16} color="#EF4444" /></div><div style={{ flex: 1 }}><p className="s-label danger">Sign Out</p><p className="s-sub">Sign out of your account</p></div><ChevronRight size={16} color="#EF4444" /></div>
                <div className="s-row danger"><div className="s-icon" style={{ background: '#FEF2F2' }}><Trash2 size={16} color="#EF4444" /></div><div style={{ flex: 1 }}><p className="s-label danger">Delete Account</p><p className="s-sub">Permanently remove your account</p></div><ChevronRight size={16} color="#EF4444" /></div>
              </div>
            </>
          )}

          {/* ── NOTIFICATIONS ── */}
          {section === 'notifications' && (
            <div className="s-card">
              {[
                { key: 'newRequests', icon: <Bell size={16} color="#FF5C1A" />,       bg: '#FFF3EE', label: 'New Job Requests',  sub: 'Alert when a client sends you a booking' },
                { key: 'messages',    icon: <MessageCircle size={16} color="#2563EB" />, bg: '#EEF6FF', label: 'Messages',         sub: 'When clients send you a chat message'   },
                { key: 'payments',    icon: <Banknote size={16} color="#16A34A" />,    bg: '#F0FDF4', label: 'Payments',          sub: 'Payment confirmations and payouts'      },
                { key: 'reminders',   icon: <Bell size={16} color="#7C3AED" />,         bg: '#F5F0FF', label: 'Job Reminders',     sub: 'Upcoming job alerts and schedules'      },
                { key: 'promotions',  icon: <Mail size={16} color="#D97706" />,         bg: '#FFF8EE', label: 'Promotions',        sub: 'Tips and platform news from FixMate'    },
              ].map(item => (
                <div key={item.key} className="s-row" onClick={() => tog(notifs as any, item.key, setNotifs as any)}>
                  <div className="s-icon" style={{ background: item.bg }}>{item.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}><p className="s-label">{item.label}</p><p className="s-sub">{item.sub}</p></div>
                  <Toggle on={notifs[item.key as keyof typeof notifs]} onClick={() => tog(notifs as any, item.key, setNotifs as any)} />
                </div>
              ))}
              <p className="s-card-label" style={{ borderTop: '1px solid #E8E6E1', marginTop: 4, paddingTop: 16 }}>Channels</p>
              {[
                { key: 'email', icon: <Mail size={16} color="#6B6B6B" />, bg: '#F5F4F1', label: 'Email',    sub: 'Receive updates via email'        },
                { key: 'sms',   icon: <Smartphone size={16} color="#6B6B6B" />, bg: '#F5F4F1', label: 'SMS', sub: 'Text message alerts to your phone' },
              ].map(item => (
                <div key={item.key} className="s-row" onClick={() => tog(notifs as any, item.key, setNotifs as any)}>
                  <div className="s-icon" style={{ background: item.bg }}>{item.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}><p className="s-label">{item.label}</p><p className="s-sub">{item.sub}</p></div>
                  <Toggle on={notifs[item.key as keyof typeof notifs]} onClick={() => tog(notifs as any, item.key, setNotifs as any)} />
                </div>
              ))}
              <button className="save-btn" onClick={() => { setSection('main'); showToast() }}>
                <Check size={16} /> Save Preferences
              </button>
            </div>
          )}

          {/* ── PRIVACY ── */}
          {section === 'privacy' && (
            <div className="s-card">
              {[
                { key: 'profileVisible',  icon: <Eye size={16} color="#2563EB" />,     bg: '#EEF6FF', label: 'Public Profile',    sub: 'Allow clients to find and view your profile' },
                { key: 'locationSharing', icon: <MapPin size={16} color="#FF5C1A" />,  bg: '#FFF3EE', label: 'Location Sharing',  sub: 'Show you in local search results'            },
                { key: 'activityStatus',  icon: <Check size={16} color="#16A34A" />,   bg: '#F0FDF4', label: 'Activity Status',   sub: 'Show when you were last online'              },
                { key: 'dataCollection',  icon: <Shield size={16} color="#6B6B6B" />,  bg: '#F5F4F1', label: 'Analytics & Data',  sub: 'Help us improve with usage data'             },
              ].map(item => (
                <div key={item.key} className="s-row" onClick={() => tog(privacy as any, item.key, setPrivacy as any)}>
                  <div className="s-icon" style={{ background: item.bg }}>{item.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}><p className="s-label">{item.label}</p><p className="s-sub">{item.sub}</p></div>
                  <Toggle on={privacy[item.key as keyof typeof privacy]} onClick={() => tog(privacy as any, item.key, setPrivacy as any)} />
                </div>
              ))}
              <button className="save-btn" onClick={() => { setSection('main'); showToast() }}>
                <Check size={16} /> Save Settings
              </button>
            </div>
          )}

          {/* ── PASSWORD ── */}
          {section === 'password' && (
            <div className="s-card">
              {(['current','newPw','confirm'] as const).map(key => (
                <div key={key} className="sub-field">
                  <label className="sub-field-label">
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
                    <button className="field-eye" onClick={() => setShowPw(p => ({ ...p, [key]: !p[key] }))}>
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

          {/* ── PAYOUT ── */}
          {section === 'payout' && (
            <div className="s-card">
              <div className="payout-form">
                <div className="payout-hint">
                  <div className="payout-hint-icon"><Check size={16} color="#16A34A" /></div>
                  <p className="payout-hint-text">
                    <strong>Payouts every Friday.</strong> Add your bank details below to receive your earnings directly. All data is encrypted and secure.
                  </p>
                </div>
                {[
                  { key: 'bank',       label: 'Bank Name',       placeholder: 'e.g. Barclays, HSBC', icon: <Banknote size={15} className="field-icon" /> },
                  { key: 'accountNum', label: 'Account Number',  placeholder: '12345678',            icon: <CreditCard size={15} className="field-icon" /> },
                  { key: 'sortCode',   label: 'Sort Code',       placeholder: '00-00-00',            icon: <DollarSign size={15} className="field-icon" /> },
                  { key: 'paypal',     label: 'PayPal Email (optional)', placeholder: 'you@paypal.com', icon: <Mail size={15} className="field-icon" /> },
                ].map(f => (
                  <div key={f.key} className="payout-field">
                    <label>{f.label}</label>
                    <div className="field-wrap">
                      {f.icon}
                      <input
                        type="text"
                        placeholder={f.placeholder}
                        value={payout[f.key as keyof typeof payout]}
                        onChange={e => setPayout(p => ({ ...p, [f.key]: e.target.value }))}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button className="save-btn" onClick={() => { setSection('main'); showToast() }}>
                <Check size={16} /> Save Payout Details
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  )
}