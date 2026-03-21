'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { db, auth } from '@/lib/firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import {
  onAuthStateChanged, signOut,
  updatePassword, reauthenticateWithCredential,
  EmailAuthProvider, deleteUser
} from 'firebase/auth'
import toast, { Toaster } from 'react-hot-toast'
import {
  ChevronLeft, ChevronRight, Bell, Shield, Eye, EyeOff,
  Smartphone, Globe, Moon, Trash2, LogOut, Lock,
  MapPin, CreditCard, HelpCircle, FileText, Mail,
  MessageCircle, Check, AlertTriangle, Calendar,
  Loader2, DollarSign, Banknote
} from 'lucide-react'

type Section = 'main' | 'notifications' | 'privacy' | 'password' | 'payout'

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getStrength(pw: string) {
  if (!pw) return { score: 0, color: '', label: '' }
  let s = 0
  if (pw.length >= 8)           s++
  if (/[A-Z]/.test(pw))        s++
  if (/[0-9]/.test(pw))        s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return [
    { score: 1, color: '#EF4444', label: 'Weak'   },
    { score: 2, color: '#F59E0B', label: 'Fair'   },
    { score: 3, color: '#3B82F6', label: 'Good'   },
    { score: 4, color: '#22C55E', label: 'Strong' },
  ][s - 1] ?? { score: 0, color: '', label: '' }
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const S = `
  .settings-page { min-height: 100vh; background: #F5F4F1; }
  .settings-topbar { background: white; border-bottom: 1px solid #E8E6E1; padding: 0 40px; height: 64px; display: flex; align-items: center; gap: 14px; position: sticky; top: 0; z-index: 40; }
  .topbar-back { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; color: #6B6B6B; text-decoration: none; transition: all 0.2s; border: 1.5px solid #E8E6E1; flex-shrink: 0; background: none; cursor: pointer; }
  .topbar-back:hover { border-color: #0F0F0F; color: #0F0F0F; }
  .topbar-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; flex: 1; }
  .settings-body { max-width: 680px; margin: 0 auto; padding: 28px 40px; display: flex; flex-direction: column; gap: 24px; }
  .settings-card { background: white; border: 1px solid #E8E6E1; border-radius: 18px; overflow: hidden; }
  .settings-card-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #AFAFAF; letter-spacing: 1px; text-transform: uppercase; padding: 16px 20px 10px; }
  .settings-row { display: flex; align-items: center; gap: 14px; padding: 14px 20px; border-bottom: 1px solid #F5F4F1; cursor: pointer; transition: background 0.15s; text-decoration: none; color: inherit; }
  .settings-row:last-child { border-bottom: none; }
  .settings-row:hover { background: #FAFAF8; }
  .settings-row.danger:hover { background: #FEF2F2; }
  .row-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .row-content { flex: 1; min-width: 0; }
  .row-label { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; color: #0F0F0F; }
  .row-label.danger { color: #EF4444; }
  .row-sub { font-size: 12px; color: #6B6B6B; margin-top: 2px; }
  .row-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; color: #AFAFAF; }
  .row-badge { font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 100px; font-family: 'Syne', sans-serif; }
  .toggle-track { width: 44px; height: 24px; border-radius: 12px; background: #E8E6E1; position: relative; cursor: pointer; transition: background 0.2s; flex-shrink: 0; }
  .toggle-track.on { background: #FF5C1A; }
  .toggle-thumb { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: white; transition: transform 0.2s; box-shadow: 0 1px 4px rgba(0,0,0,0.15); }
  .toggle-track.on .toggle-thumb { transform: translateX(20px); }
  .settings-field { padding: 16px 20px; border-bottom: 1px solid #F5F4F1; }
  .settings-field:last-child { border-bottom: none; }
  .field-label { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #0F0F0F; margin-bottom: 8px; display: block; }
  .field-sublabel { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 600; color: #AFAFAF; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 7px; display: block; }
  .field-wrap { display: flex; align-items: center; gap: 10px; background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 12px; padding: 12px 16px; transition: border-color 0.2s; }
  .field-wrap:focus-within { border-color: #FF5C1A; background: white; box-shadow: 0 0 0 3px rgba(255,92,26,0.08); }
  .field-wrap input { flex: 1; border: none; outline: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F; }
  .field-wrap input::placeholder { color: #AFAFAF; }
  .field-icon { color: #AFAFAF; flex-shrink: 0; }
  .field-action { background: none; border: none; cursor: pointer; color: #AFAFAF; display: flex; padding: 0; }
  .field-action:hover { color: #6B6B6B; }
  .pw-strength { display: flex; gap: 4px; margin-top: 8px; }
  .pw-seg { flex: 1; height: 3px; border-radius: 2px; }
  .save-btn { margin: 16px 20px; width: calc(100% - 40px); display: flex; align-items: center; justify-content: center; gap: 8px; background: #FF5C1A; color: white; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; border: none; border-radius: 12px; padding: 13px; cursor: pointer; transition: all 0.2s; }
  .save-btn:hover:not(:disabled) { background: #FF7A40; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,92,26,0.25); }
  .save-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .danger-zone { background: white; border: 1px solid rgba(239,68,68,0.2); border-radius: 18px; overflow: hidden; }
  .danger-zone-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #EF4444; letter-spacing: 1px; text-transform: uppercase; padding: 16px 20px 10px; display: flex; align-items: center; gap: 6px; }

  /* PAYOUT HINT */
  .payout-hint { background: #F0FDF4; border: 1px solid rgba(22,163,74,0.2); border-radius: 12px; padding: 14px 16px; margin: 16px 20px 0; display: flex; gap: 10px; align-items: flex-start; }
  .payout-hint-text { font-size: 13px; color: #6B6B6B; line-height: 1.6; }
  .payout-hint-text strong { color: #0F0F0F; font-weight: 600; }

  /* DELETE MODAL */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); }
  .modal { background: white; border-radius: 22px; padding: 40px 36px; max-width: 400px; width: 100%; text-align: center; box-shadow: 0 24px 80px rgba(0,0,0,0.2); animation: popIn 0.3s cubic-bezier(0.175,0.885,0.32,1.275); }
  @keyframes popIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .modal-icon { width: 68px; height: 68px; border-radius: 50%; background: #FEF2F2; border: 2px solid rgba(239,68,68,0.2); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
  .modal-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: #0F0F0F; margin-bottom: 10px; }
  .modal-sub { font-size: 14px; color: #6B6B6B; font-weight: 300; line-height: 1.7; margin-bottom: 24px; }
  .modal-input { width: 100%; background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 12px; padding: 12px 16px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F; outline: none; box-sizing: border-box; margin-bottom: 16px; }
  .modal-input:focus { border-color: #EF4444; background: white; }
  .modal-btns { display: flex; gap: 10px; }
  .modal-cancel { flex: 1; background: transparent; color: #6B6B6B; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; border: 1.5px solid #E8E6E1; border-radius: 11px; padding: 12px; cursor: pointer; }
  .modal-delete { flex: 1; background: #EF4444; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; border: none; border-radius: 11px; padding: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .modal-delete:hover:not(:disabled) { background: #DC2626; }
  .modal-delete:disabled { opacity: 0.6; cursor: not-allowed; }

  .loading-screen { height: 100vh; display: flex; align-items: center; justify-content: center; background: #F5F4F1; }
  .loading-spinner { width: 40px; height: 40px; border-radius: 50%; border: 3px solid #E8E6E1; border-top-color: #FF5C1A; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 768px) {
    .settings-topbar { padding: 0 16px; }
    .settings-body { padding: 20px 16px; }
  }
`

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div className={`toggle-track${on ? ' on' : ''}`} onClick={e => { e.stopPropagation(); onToggle() }}>
      <div className="toggle-thumb" />
    </div>
  )
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function WorkerSettingsPage() {
  const router = useRouter()

  const [authUser, setAuthUser]       = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [section, setSection]         = useState<Section>('main')
  const [prefsLoading, setPrefsLoading] = useState(true)

  // Notification prefs
  const [notifs, setNotifs] = useState({
    newRequests: true, messages: true, payments: true,
    reminders: true, promotions: false, sms: false, email: true,
  })

  // Privacy prefs
  const [privacy, setPrivacy] = useState({
    profileVisible: true, locationSharing: true,
    activityStatus: true, dataCollection: false,
  })

  // Payout details
  const [payout, setPayout] = useState({
    bank: '', accountNum: '', sortCode: '', paypal: '',
  })

  // App prefs
  const [darkMode, setDarkMode]   = useState(false)
  const [savingPrefs, setSavingPrefs] = useState(false)

  // Password
  const [pw, setPw]       = useState({ current: '', newPw: '', confirm: '' })
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false })
  const [pwError, setPwError] = useState('')
  const [savingPw, setSavingPw] = useState(false)

  // Delete modal
  const [showDelete, setShowDelete]     = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleting, setDeleting]         = useState(false)

  const strength = getStrength(pw.newPw)

  // ── 1. Auth ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) { router.push('/login'); return }
      setAuthUser(u)
      setAuthLoading(false)
    })
    return () => unsub()
  }, [router])

  // ── 2. Load prefs from /workers/{uid} ────────────────────────────────────
  useEffect(() => {
    if (!authUser) return
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'workers', authUser.uid))
        if (snap.exists()) {
          const d = snap.data() as any
          if (d.notifications) setNotifs(p => ({ ...p, ...d.notifications }))
          if (d.privacy)        setPrivacy(p => ({ ...p, ...d.privacy }))
          if (d.payout)         setPayout(p => ({ ...p, ...d.payout }))
          if (d.darkMode !== undefined) setDarkMode(d.darkMode)
        }
      } catch (err) {
        console.error('Prefs load error:', err)
      } finally {
        setPrefsLoading(false)
      }
    }
    load()
  }, [authUser])

  // ── 3. Save notification prefs ────────────────────────────────────────────
  const handleSaveNotifs = async () => {
    if (!authUser) return
    setSavingPrefs(true)
    try {
      await setDoc(doc(db, 'workers', authUser.uid), {
        notifications: notifs, updatedAt: serverTimestamp(),
      }, { merge: true })
      setSection('main')
      toast.success('Notification preferences saved!')
    } catch { toast.error('Could not save. Please try again.') }
    finally { setSavingPrefs(false) }
  }

  // ── 4. Save privacy prefs ─────────────────────────────────────────────────
  const handleSavePrivacy = async () => {
    if (!authUser) return
    setSavingPrefs(true)
    try {
      await setDoc(doc(db, 'workers', authUser.uid), {
        privacy: privacy, updatedAt: serverTimestamp(),
      }, { merge: true })
      setSection('main')
      toast.success('Privacy settings saved!')
    } catch { toast.error('Could not save. Please try again.') }
    finally { setSavingPrefs(false) }
  }

  // ── 5. Save payout details ────────────────────────────────────────────────
  const handleSavePayout = async () => {
    if (!authUser) return
    setSavingPrefs(true)
    try {
      await setDoc(doc(db, 'workers', authUser.uid), {
        payout: payout, updatedAt: serverTimestamp(),
      }, { merge: true })
      setSection('main')
      toast.success('Payout details saved!')
    } catch { toast.error('Could not save. Please try again.') }
    finally { setSavingPrefs(false) }
  }

  // ── 6. Change password ────────────────────────────────────────────────────
  const handlePwSave = async () => {
    if (!authUser) return
    if (!pw.current)         { setPwError('Current password is required'); return }
    if (pw.newPw.length < 6) { setPwError('New password must be at least 6 characters'); return }
    if (pw.newPw !== pw.confirm) { setPwError('Passwords do not match'); return }

    setSavingPw(true)
    setPwError('')
    try {
      const credential = EmailAuthProvider.credential(authUser.email, pw.current)
      await reauthenticateWithCredential(authUser, credential)
      await updatePassword(authUser, pw.newPw)
      setPw({ current: '', newPw: '', confirm: '' })
      setSection('main')
      toast.success('Password updated!')
    } catch (err: any) {
      const code = err.code || ''
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setPwError('Current password is incorrect.')
      } else if (code === 'auth/too-many-requests') {
        setPwError('Too many attempts. Please wait a moment.')
      } else {
        setPwError('Could not update password. Please try again.')
      }
    } finally { setSavingPw(false) }
  }

  // ── 7. Sign out ───────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    try {
      await signOut(auth)
      router.push('/')
    } catch { toast.error('Could not sign out.') }
  }

  // ── 8. Delete account ─────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    if (!authUser || !deletePassword) return
    setDeleting(true)
    try {
      const credential = EmailAuthProvider.credential(authUser.email, deletePassword)
      await reauthenticateWithCredential(authUser, credential)
      await setDoc(doc(db, 'workers', authUser.uid), {
        deleted: true, deletedAt: serverTimestamp(),
      }, { merge: true })
      await deleteUser(authUser)
      router.push('/')
    } catch (err: any) {
      const code = err.code || ''
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        toast.error('Incorrect password.')
      } else {
        toast.error('Could not delete account. Please try again.')
      }
    } finally { setDeleting(false) }
  }

  if (authLoading || prefsLoading) {
    return (
      <>
        <style>{S}</style>
        <div className="loading-screen"><div className="loading-spinner" /></div>
      </>
    )
  }

  const mainRows = [
    {
      group: 'Account',
      rows: [
        { icon: <Bell size={16} color="#FF5C1A" />, bg: '#FFF3EE', label: 'Notifications', sub: 'Job alerts, messages, payment updates', section: 'notifications' as Section },
        { icon: <Shield size={16} color="#2563EB" />, bg: '#EEF6FF', label: 'Privacy & Security', sub: 'Profile visibility and data preferences', section: 'privacy' as Section },
        { icon: <Lock size={16} color="#7C3AED" />, bg: '#F5F0FF', label: 'Change Password', sub: 'Update your account credentials', section: 'password' as Section },
        { icon: <Banknote size={16} color="#16A34A" />, bg: '#F0FDF4', label: 'Payout Settings', sub: 'Bank account and payment preferences', section: 'payout' as Section },
      ],
    },
    {
      group: 'Preferences',
      rows: [
        { icon: <Globe size={16} color="#0F0F0F" />, bg: '#F5F4F1', label: 'Language', sub: 'English', section: null as any, right: 'chevron' },
        { icon: <Moon size={16} color="#0F0F0F" />, bg: '#F5F4F1', label: 'Dark Mode', sub: darkMode ? 'On' : 'Off', section: null as any, right: 'toggle' },
        { icon: <MapPin size={16} color="#0F0F0F" />, bg: '#F5F4F1', label: 'Service Area', sub: 'Manage your work radius', section: null as any, href: '/worker/profile', right: 'chevron' },
      ],
    },
    {
      group: 'Support',
      rows: [
        { icon: <HelpCircle size={16} color="#D97706" />, bg: '#FFF8EE', label: 'Help Center', sub: 'FAQs and support guides', section: null as any, right: 'chevron' },
        { icon: <MessageCircle size={16} color="#D97706" />, bg: '#FFF8EE', label: 'Contact Support', sub: 'Chat with the FixMate team', section: null as any, href: '/contact', right: 'chevron' },
        { icon: <FileText size={16} color="#6B6B6B" />, bg: '#F5F4F1', label: 'Terms & Privacy', sub: 'Legal documents', section: null as any, href: '/privacy', right: 'chevron' },
      ],
    },
  ]

  return (
    <>
      <style>{S}</style>
      <Toaster position="bottom-center" toastOptions={{ duration: 2500 }} />

      {/* Delete modal */}
      {showDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-icon"><Trash2 size={28} color="#EF4444" /></div>
            <h2 className="modal-title">Delete Account?</h2>
            <p className="modal-sub">
              This is permanent. Your profile, jobs, and all history will be removed. Enter your password to confirm.
            </p>
            <input
              type="password" className="modal-input"
              placeholder="Your current password"
              value={deletePassword}
              onChange={e => setDeletePassword(e.target.value)}
            />
            <div className="modal-btns">
              <button className="modal-cancel" onClick={() => { setShowDelete(false); setDeletePassword('') }}>Cancel</button>
              <button className="modal-delete" onClick={handleDeleteAccount} disabled={!deletePassword || deleting}>
                {deleting ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Deleting…</> : <><Trash2 size={15} /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="settings-page">
        <div className="settings-topbar">
          {section !== 'main' ? (
            <button className="topbar-back" onClick={() => setSection('main')}>
              <ChevronLeft size={18} />
            </button>
          ) : (
            <Link href="/worker/dashboard" className="topbar-back"><ChevronLeft size={18} /></Link>
          )}
          <p className="topbar-title">
            {section === 'main'          && 'Settings'}
            {section === 'notifications' && 'Notifications'}
            {section === 'privacy'       && 'Privacy & Security'}
            {section === 'password'      && 'Change Password'}
            {section === 'payout'        && 'Payout Settings'}
          </p>
          {section !== 'main' && <div style={{ width: 36 }} />}
        </div>

        <div className="settings-body">

          {/* ── MAIN ── */}
          {section === 'main' && (
            <>
              {mainRows.map(group => (
                <div key={group.group} className="settings-card">
                  <p className="settings-card-title">{group.group}</p>
                  {group.rows.map(row => (
                    <div
                      key={row.label}
                      className="settings-row"
                      onClick={() => {
                        if (row.section) { setSection(row.section); return }
                        if ((row as any).href) { router.push((row as any).href); return }
                        if (row.label === 'Dark Mode') {
                          const next = !darkMode
                          setDarkMode(next)
                          setDoc(doc(db, 'workers', authUser.uid), { darkMode: next, updatedAt: serverTimestamp() }, { merge: true }).catch(() => {})
                        }
                      }}
                    >
                      <div className="row-icon" style={{ background: row.bg }}>{row.icon}</div>
                      <div className="row-content">
                        <p className="row-label">{row.label}</p>
                        <p className="row-sub">{row.sub}</p>
                      </div>
                      <div className="row-right">
                        {row.label === 'Dark Mode'
                          ? <Toggle on={darkMode} onToggle={() => {
                              const next = !darkMode
                              setDarkMode(next)
                              setDoc(doc(db, 'workers', authUser.uid), { darkMode: next, updatedAt: serverTimestamp() }, { merge: true }).catch(() => {})
                            }} />
                          : <ChevronRight size={16} />
                        }
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Danger zone */}
              <div className="danger-zone">
                <p className="danger-zone-title"><AlertTriangle size={14} /> Danger Zone</p>
                <div className="settings-row danger" onClick={handleSignOut}>
                  <div className="row-icon" style={{ background: '#FEF2F2' }}><LogOut size={16} color="#EF4444" /></div>
                  <div className="row-content"><p className="row-label danger">Sign Out</p><p className="row-sub">Sign out of your account</p></div>
                  <ChevronRight size={16} color="#EF4444" />
                </div>
                <div className="settings-row danger" onClick={() => setShowDelete(true)}>
                  <div className="row-icon" style={{ background: '#FEF2F2' }}><Trash2 size={16} color="#EF4444" /></div>
                  <div className="row-content"><p className="row-label danger">Delete Account</p><p className="row-sub">Permanently remove your account and data</p></div>
                  <ChevronRight size={16} color="#EF4444" />
                </div>
              </div>
            </>
          )}

          {/* ── NOTIFICATIONS ── */}
          {section === 'notifications' && (
            <div className="settings-card">
              {[
                { key: 'newRequests', icon: <Bell size={16} color="#FF5C1A" />,          bg: '#FFF3EE', label: 'New Job Requests',  sub: 'Alert when a client sends a booking'   },
                { key: 'messages',    icon: <MessageCircle size={16} color="#2563EB" />,  bg: '#EEF6FF', label: 'Messages',          sub: 'When clients send you a message'       },
                { key: 'payments',    icon: <Banknote size={16} color="#16A34A" />,       bg: '#F0FDF4', label: 'Payments',          sub: 'Payment confirmations and payouts'     },
                { key: 'reminders',   icon: <Bell size={16} color="#7C3AED" />,           bg: '#F5F0FF', label: 'Job Reminders',     sub: 'Upcoming job alerts and schedules'     },
                { key: 'promotions',  icon: <Mail size={16} color="#D97706" />,           bg: '#FFF8EE', label: 'Promotions',        sub: 'Tips and platform news from FixMate'  },
              ].map(item => (
                <div key={item.key} className="settings-row"
                  onClick={() => setNotifs(p => ({ ...p, [item.key]: !p[item.key as keyof typeof notifs] }))}>
                  <div className="row-icon" style={{ background: item.bg }}>{item.icon}</div>
                  <div className="row-content"><p className="row-label">{item.label}</p><p className="row-sub">{item.sub}</p></div>
                  <Toggle on={notifs[item.key as keyof typeof notifs]} onToggle={() => setNotifs(p => ({ ...p, [item.key]: !p[item.key as keyof typeof notifs] }))} />
                </div>
              ))}
              <p className="settings-card-title" style={{ borderTop: '1px solid #E8E6E1', marginTop: 4, paddingTop: 16 }}>Channels</p>
              {[
                { key: 'email', icon: <Mail size={16} color="#6B6B6B" />,       bg: '#F5F4F1', label: 'Email',    sub: 'Receive updates via email'   },
                { key: 'sms',   icon: <Smartphone size={16} color="#6B6B6B" />, bg: '#F5F4F1', label: 'SMS',      sub: 'Text message alerts'         },
              ].map(item => (
                <div key={item.key} className="settings-row"
                  onClick={() => setNotifs(p => ({ ...p, [item.key]: !p[item.key as keyof typeof notifs] }))}>
                  <div className="row-icon" style={{ background: item.bg }}>{item.icon}</div>
                  <div className="row-content"><p className="row-label">{item.label}</p><p className="row-sub">{item.sub}</p></div>
                  <Toggle on={notifs[item.key as keyof typeof notifs]} onToggle={() => setNotifs(p => ({ ...p, [item.key]: !p[item.key as keyof typeof notifs] }))} />
                </div>
              ))}
              <button className="save-btn" onClick={handleSaveNotifs} disabled={savingPrefs}>
                {savingPrefs ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Check size={16} /> Save Preferences</>}
              </button>
            </div>
          )}

          {/* ── PRIVACY ── */}
          {section === 'privacy' && (
            <div className="settings-card">
              {[
                { key: 'profileVisible',  icon: <Eye size={16} color="#2563EB" />,     bg: '#EEF6FF', label: 'Public Profile',    sub: 'Allow clients to find your profile'        },
                { key: 'locationSharing', icon: <MapPin size={16} color="#FF5C1A" />,  bg: '#FFF3EE', label: 'Location Sharing',  sub: 'Show in local search results'              },
                { key: 'activityStatus',  icon: <Check size={16} color="#16A34A" />,   bg: '#F0FDF4', label: 'Activity Status',   sub: 'Show when you were last online'            },
                { key: 'dataCollection',  icon: <Shield size={16} color="#6B6B6B" />,  bg: '#F5F4F1', label: 'Analytics & Data',  sub: 'Help us improve with usage data'           },
              ].map(item => (
                <div key={item.key} className="settings-row"
                  onClick={() => setPrivacy(p => ({ ...p, [item.key]: !p[item.key as keyof typeof privacy] }))}>
                  <div className="row-icon" style={{ background: item.bg }}>{item.icon}</div>
                  <div className="row-content"><p className="row-label">{item.label}</p><p className="row-sub">{item.sub}</p></div>
                  <Toggle on={privacy[item.key as keyof typeof privacy]} onToggle={() => setPrivacy(p => ({ ...p, [item.key]: !p[item.key as keyof typeof privacy] }))} />
                </div>
              ))}
              <button className="save-btn" onClick={handleSavePrivacy} disabled={savingPrefs}>
                {savingPrefs ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Check size={16} /> Save Settings</>}
              </button>
            </div>
          )}

          {/* ── PASSWORD ── */}
          {section === 'password' && (
            <div className="settings-card">
              {(['current', 'newPw', 'confirm'] as const).map(key => (
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
                        {[1,2,3,4].map(i => <div key={i} className="pw-seg" style={{ background: i <= strength.score ? strength.color : '#E8E6E1' }} />)}
                      </div>
                      <p style={{ fontSize: 11, color: strength.color, marginTop: 4 }}>{strength.label}</p>
                    </>
                  )}
                </div>
              ))}
              {pwError && <p style={{ padding: '0 20px', fontSize: 12, color: '#EF4444', marginBottom: 4 }}>{pwError}</p>}
              <button className="save-btn" onClick={handlePwSave} disabled={savingPw}>
                {savingPw ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Updating…</> : <><Lock size={16} /> Update Password</>}
              </button>
            </div>
          )}

          {/* ── PAYOUT ── */}
          {section === 'payout' && (
            <div className="settings-card">
              <div className="payout-hint">
                <Check size={16} color="#16A34A" style={{ flexShrink: 0, marginTop: 2 }} />
                <p className="payout-hint-text">
                  <strong>Payouts every Friday.</strong> Add your bank details below to receive your earnings directly. All data is encrypted and secure.
                </p>
              </div>
              {[
                { key: 'bank',       label: 'Bank Name',              placeholder: 'e.g. Barclays, HSBC',  icon: <Banknote size={15} className="field-icon" />   },
                { key: 'accountNum', label: 'Account Number',         placeholder: '12345678',              icon: <CreditCard size={15} className="field-icon" /> },
                { key: 'sortCode',   label: 'Sort Code',              placeholder: '00-00-00',              icon: <DollarSign size={15} className="field-icon" /> },
                { key: 'paypal',     label: 'PayPal Email (optional)', placeholder: 'you@paypal.com',       icon: <Mail size={15} className="field-icon" />       },
              ].map(f => (
                <div key={f.key} className="settings-field">
                  <label className="field-label">{f.label}</label>
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
              <button className="save-btn" onClick={handleSavePayout} disabled={savingPrefs}>
                {savingPrefs ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Check size={16} /> Save Payout Details</>}
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  )
}