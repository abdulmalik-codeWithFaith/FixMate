'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { db, auth } from '@/lib/firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import {
  onAuthStateChanged, signOut, updateProfile,
  updatePassword, reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth'
import toast, { Toaster } from 'react-hot-toast'
import {
  LayoutDashboard, Users, Briefcase, MessageCircle,
  DollarSign, ShieldCheck, Settings, LogOut,
  Menu, X, ChevronRight, Bell, Lock, Eye, EyeOff,
  Globe, Moon, Smartphone, RefreshCw, Save,
  AlertTriangle, Trash2, UserCheck, Mail, Percent,
  ToggleLeft, ToggleRight, Shield, Loader2, Check,
  Edit3, Phone, MapPin
} from 'lucide-react'

const SIDEBAR_CSS = `
  .admin-sidebar { width: 256px; flex-shrink: 0; background: #0F0F0F; display: flex; flex-direction: column; position: fixed; top: 0; left: 0; bottom: 0; z-index: 50; overflow-y: auto; transition: transform 0.3s; }
  .admin-sidebar.sb-open { transform: translateX(0) !important; }
  .sb-logo { display: flex; align-items: center; gap: 11px; padding: 26px 22px 20px; border-bottom: 1px solid rgba(255,255,255,0.07); text-decoration: none; }
  .sb-logo-icon { width: 36px; height: 36px; border-radius: 10px; background: #FF5C1A; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .sb-logo-text { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 17px; color: white; letter-spacing: -0.5px; }
  .sb-logo-text em { color: #FF5C1A; font-style: normal; }
  .sb-logo-badge { margin-left: auto; background: rgba(255,92,26,0.15); border: 1px solid rgba(255,92,26,0.3); color: #FF5C1A; font-family: 'Syne', sans-serif; font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 3px 7px; border-radius: 6px; white-space: nowrap; }
  .sb-section-label { font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.25); padding: 18px 22px 8px; }
  .sb-nav-item { display: flex; align-items: center; gap: 11px; padding: 11px 22px; margin: 1px 10px; border-radius: 10px; cursor: pointer; text-decoration: none; color: rgba(255,255,255,0.5); font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; transition: all 0.15s; }
  .sb-nav-item:hover { background: rgba(255,255,255,0.06); color: white; }
  .sb-nav-item.active { background: rgba(255,92,26,0.15); color: #FF5C1A; border: 1px solid rgba(255,92,26,0.2); }
  .sb-nav-icon { flex-shrink: 0; }
  .sb-nav-badge { margin-left: auto; min-width: 20px; height: 20px; border-radius: 10px; background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.5); font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 5px; }
  .sb-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 10px 22px; }
  .sb-user { padding: 16px 22px; margin-top: auto; border-top: 1px solid rgba(255,255,255,0.07); display: flex; align-items: center; gap: 11px; }
  .sb-user-avatar { width: 36px; height: 36px; border-radius: 10px; background: #FF5C1A; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 14px; color: white; flex-shrink: 0; }
  .sb-user-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sb-user-role { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 1px; }
  .sb-logout { margin-left: auto; background: none; border: none; color: rgba(255,255,255,0.3); cursor: pointer; display: flex; padding: 4px; border-radius: 6px; transition: color 0.2s; }
  .sb-logout:hover { color: #EF4444; }
  .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 49; }
  .sidebar-overlay.show { display: block; }
`

const S = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  ${SIDEBAR_CSS}

  .admin-layout { display: flex; min-height: 100vh; font-family: 'DM Sans', sans-serif; background: #F5F4F1; }
  .admin-main { flex: 1; margin-left: 256px; display: flex; flex-direction: column; }

  .admin-topbar { background: white; border-bottom: 1px solid #E8E6E1; padding: 0 32px; height: 64px; display: flex; align-items: center; gap: 14px; position: sticky; top: 0; z-index: 40; }
  .topbar-hamburger { display: none; background: none; border: none; cursor: pointer; color: #6B6B6B; padding: 6px; border-radius: 8px; }
  .topbar-hamburger:hover { background: #F5F4F1; }
  .topbar-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #0F0F0F; letter-spacing: -0.5px; }
  .topbar-sub { font-size: 13px; color: #6B6B6B; font-weight: 300; }
  .topbar-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
  .topbar-btn { display: flex; align-items: center; gap: 6px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #6B6B6B; background: none; border: 1.5px solid #E8E6E1; border-radius: 9px; padding: 7px 14px; cursor: pointer; transition: all 0.2s; }
  .topbar-btn:hover { border-color: #0F0F0F; color: #0F0F0F; }
  .topbar-btn.primary { background: #FF5C1A; color: white; border-color: #FF5C1A; }
  .topbar-btn.primary:hover { background: #FF7A40; color: white; border-color: #FF7A40; }
  .topbar-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .admin-body { padding: 28px 32px; }
  .settings-grid { display: grid; grid-template-columns: 220px 1fr; gap: 24px; align-items: start; }

  /* SETTINGS NAV */
  .settings-nav { background: white; border: 1px solid #E8E6E1; border-radius: 16px; overflow: hidden; position: sticky; top: 80px; }
  .settings-nav-item { display: flex; align-items: center; gap: 11px; padding: 13px 18px; cursor: pointer; transition: background 0.15s; border-left: 3px solid transparent; color: #6B6B6B; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; border-bottom: 1px solid #F5F4F1; }
  .settings-nav-item:last-child { border-bottom: none; }
  .settings-nav-item:hover { background: #FAFAF8; color: #0F0F0F; }
  .settings-nav-item.active { background: #FFF3EE; color: #FF5C1A; border-left-color: #FF5C1A; }
  .settings-nav-icon { flex-shrink: 0; }

  /* SETTINGS PANEL */
  .settings-panel { display: flex; flex-direction: column; gap: 20px; }

  /* CARD */
  .set-card { background: white; border: 1px solid #E8E6E1; border-radius: 16px; overflow: hidden; }
  .set-card-header { padding: 20px 24px; border-bottom: 1px solid #E8E6E1; display: flex; align-items: center; gap: 12px; }
  .set-card-icon { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .set-card-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; }
  .set-card-sub { font-size: 12px; color: #6B6B6B; margin-top: 2px; }

  /* FIELD */
  .set-field { padding: 18px 24px; border-bottom: 1px solid #F5F4F1; }
  .set-field:last-child { border-bottom: none; }
  .set-field-label { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #0F0F0F; margin-bottom: 8px; display: block; }
  .set-field-sub { font-size: 12px; color: #6B6B6B; margin-bottom: 10px; }
  .set-input-wrap { display: flex; align-items: center; gap: 10px; background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 11px; padding: 11px 14px; transition: border-color 0.2s; }
  .set-input-wrap:focus-within { border-color: #FF5C1A; background: white; box-shadow: 0 0 0 3px rgba(255,92,26,0.08); }
  .set-input-wrap input { flex: 1; border: none; outline: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F; }
  .set-input-wrap input::placeholder { color: #AFAFAF; }
  .set-input-icon { color: #AFAFAF; flex-shrink: 0; }
  .set-eye { background: none; border: none; cursor: pointer; color: #AFAFAF; display: flex; padding: 0; }
  .set-eye:hover { color: #6B6B6B; }
  .set-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .set-select { width: 100%; background: #F5F4F1; border: 1.5px solid #E8E6E1; border-radius: 11px; padding: 11px 14px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F; outline: none; appearance: none; cursor: pointer; }
  .set-select:focus { border-color: #FF5C1A; }

  /* TOGGLE ROW */
  .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-bottom: 1px solid #F5F4F1; }
  .toggle-row:last-child { border-bottom: none; }
  .toggle-info { flex: 1; padding-right: 20px; }
  .toggle-label { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; color: #0F0F0F; margin-bottom: 3px; }
  .toggle-sub { font-size: 12px; color: #6B6B6B; }
  .toggle-track { width: 44px; height: 24px; border-radius: 12px; background: #E8E6E1; position: relative; cursor: pointer; transition: background 0.2s; flex-shrink: 0; }
  .toggle-track.on { background: #FF5C1A; }
  .toggle-thumb { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: white; transition: transform 0.2s; box-shadow: 0 1px 4px rgba(0,0,0,0.15); }
  .toggle-track.on .toggle-thumb { transform: translateX(20px); }

  /* PW STRENGTH */
  .pw-bars { display: flex; gap: 4px; margin-top: 8px; }
  .pw-bar { flex: 1; height: 3px; border-radius: 2px; }

  /* SAVE BUTTON ROW */
  .save-row { padding: 18px 24px; background: #FAFAF8; border-top: 1px solid #E8E6E1; display: flex; align-items: center; justify-content: flex-end; gap: 10px; }
  .save-btn { display: flex; align-items: center; gap: 7px; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; border-radius: 11px; padding: 11px 22px; cursor: pointer; transition: all 0.2s; border: none; }
  .save-btn.primary { background: #FF5C1A; color: white; }
  .save-btn.primary:hover { background: #FF7A40; transform: translateY(-1px); }
  .save-btn.secondary { background: #F5F4F1; color: #6B6B6B; border: 1.5px solid #E8E6E1; }
  .save-btn.secondary:hover { background: #E8E6E1; color: #0F0F0F; }
  .save-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* DANGER ZONE */
  .danger-zone { background: white; border: 1px solid rgba(239,68,68,0.2); border-radius: 16px; overflow: hidden; }
  .danger-zone-header { padding: 16px 24px; border-bottom: 1px solid rgba(239,68,68,0.1); display: flex; align-items: center; gap: 9px; }
  .danger-zone-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #EF4444; }
  .danger-row { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-bottom: 1px solid rgba(239,68,68,0.08); flex-wrap: wrap; gap: 14px; }
  .danger-row:last-child { border-bottom: none; }
  .danger-row-label { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; color: #0F0F0F; margin-bottom: 3px; }
  .danger-row-sub { font-size: 12px; color: #6B6B6B; }
  .danger-btn { display: flex; align-items: center; gap: 6px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; background: #FEF2F2; color: #EF4444; border: 1.5px solid rgba(239,68,68,0.25); border-radius: 9px; padding: 8px 16px; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
  .danger-btn:hover { background: #EF4444; color: white; }

  /* PROFILE HERO */
  .profile-hero { background: #0F0F0F; border-radius: 16px; padding: 28px; margin-bottom: 0; display: flex; align-items: center; gap: 20px; }
  .profile-hero-av { width: 64px; height: 64px; border-radius: 50%; background: #FF5C1A; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: white; flex-shrink: 0; border: 3px solid rgba(255,255,255,0.15); }
  .profile-hero-name { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: white; margin-bottom: 4px; }
  .profile-hero-email { font-size: 13px; color: rgba(255,255,255,0.45); }
  .profile-hero-badge { margin-left: auto; background: rgba(255,92,26,0.15); border: 1px solid rgba(255,92,26,0.3); color: #FF5C1A; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 5px 12px; border-radius: 100px; }

  .loading-screen { height: 100vh; display: flex; align-items: center; justify-content: center; background: #F5F4F1; }
  .loading-spinner { width: 40px; height: 40px; border-radius: 50%; border: 3px solid #E8E6E1; border-top-color: #FF5C1A; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 900px) {
    .admin-sidebar { transform: translateX(-100%); }
    .admin-main { margin-left: 0; }
    .topbar-hamburger { display: flex; }
    .admin-body { padding: 20px 16px; }
    .admin-topbar { padding: 0 16px; }
    .settings-grid { grid-template-columns: 1fr; }
    .settings-nav { position: static; display: flex; flex-wrap: wrap; padding: 8px; gap: 4px; }
    .settings-nav-item { border-left: none; border-bottom: none; border-radius: 9px; padding: 8px 14px; flex: 0; white-space: nowrap; }
    .settings-nav-item.active { background: #0F0F0F; color: white; }
    .set-two-col { grid-template-columns: 1fr; }
  }
`

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users',     label: 'Users',     icon: Users           },
  { href: '/admin/workers',   label: 'Workers',   icon: UserCheck       },
  { href: '/admin/bookings',  label: 'Bookings',  icon: Briefcase       },
  { href: '/admin/messages',  label: 'Messages',  icon: MessageCircle   },
  { href: '/admin/revenue',   label: 'Revenue',   icon: DollarSign      },
  { href: '/admin/settings',  label: 'Settings',  icon: Settings        },
]

type Section = 'profile' | 'platform' | 'notifications' | 'security' | 'danger'

const SETTINGS_NAV: { key: Section; label: string; icon: React.ReactNode }[] = [
  { key: 'profile',       label: 'Admin Profile',     icon: <UserCheck size={15} />   },
  { key: 'platform',      label: 'Platform Config',   icon: <Settings size={15} />    },
  { key: 'notifications', label: 'Notifications',     icon: <Bell size={15} />        },
  { key: 'security',      label: 'Security',          icon: <Shield size={15} />      },
  { key: 'danger',        label: 'Danger Zone',       icon: <AlertTriangle size={15} /> },
]

function getInitials(n: string) { return (n || '').split(' ').slice(0, 2).map(c => c[0]).join('').toUpperCase() || '?' }
function pwStrength(pw: string) {
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

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div className={`toggle-track${on ? ' on' : ''}`} onClick={e => { e.stopPropagation(); onToggle() }}>
      <div className="toggle-thumb" />
    </div>
  )
}

export default function AdminSettingsPage() {
  const router   = useRouter()
  const pathname = usePathname()

  const [authUser, setAuthUser]       = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [section, setSection]         = useState<Section>('profile')

  // Profile
  const [profile, setProfile] = useState({ displayName: '', email: '', phone: '', location: '' })
  const [savingProfile, setSavingProfile] = useState(false)

  // Platform config
  const [platform, setPlatform] = useState({
    commissionRate: '10',
    currency: 'GBP',
    maintenanceMode: false,
    workerRegistration: true,
    clientRegistration: true,
    autoApproveWorkers: false,
    platformName: 'FixMate',
    supportEmail: 'support@fixmate.com',
  })
  const [savingPlatform, setSavingPlatform] = useState(false)

  // Notifications
  const [notifs, setNotifs] = useState({
    newBookings: true,
    disputes: true,
    workerRegistrations: true,
    lowRating: true,
    largeTx: true,
    systemAlerts: true,
    emailDigest: false,
    smsAlerts: false,
  })
  const [savingNotifs, setSavingNotifs] = useState(false)

  // Security / password
  const [pw, setPw]       = useState({ current: '', newPw: '', confirm: '' })
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false })
  const [pwError, setPwError] = useState('')
  const [savingPw, setSavingPw] = useState(false)
  const [mfa, setMfa]           = useState(false)
  const [ipWhitelist, setIpWhitelist] = useState(false)

  // Auth guard + load settings
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push('/admin/login'); return }
      try {
        const snap = await getDoc(doc(db, 'users', u.uid))
        if (!snap.exists() || snap.data().role !== 'admin') { await signOut(auth); router.push('/admin/login'); return }
        const d = snap.data() as any
        setProfile({
          displayName: u.displayName || d.name || d.displayName || '',
          email:       u.email       || d.email || '',
          phone:       d.phone       || '',
          location:    d.location    || '',
        })
        if (d.notifications) setNotifs(prev => ({ ...prev, ...d.notifications }))
      } catch { await signOut(auth); router.push('/admin/login'); return }

      // Load platform settings
      try {
        const ps = await getDoc(doc(db, 'settings', 'platform'))
        if (ps.exists()) setPlatform(prev => ({ ...prev, ...(ps.data() as any) }))
      } catch {}

      setAuthUser(u); setAuthLoading(false)
    })
    return () => unsub()
  }, [router])

  const handleSaveProfile = async () => {
    if (!authUser) return
    setSavingProfile(true)
    try {
      await updateProfile(authUser, { displayName: profile.displayName.trim() })
      await setDoc(doc(db, 'users', authUser.uid), {
        displayName: profile.displayName.trim(),
        name:        profile.displayName.trim(),
        phone:       profile.phone.trim(),
        location:    profile.location.trim(),
        updatedAt:   serverTimestamp(),
      }, { merge: true })
      toast.success('Profile updated.')
    } catch { toast.error('Could not save profile.') }
    finally { setSavingProfile(false) }
  }

  const handleSavePlatform = async () => {
    if (!authUser) return
    setSavingPlatform(true)
    try {
      await setDoc(doc(db, 'settings', 'platform'), {
        ...platform,
        updatedAt: serverTimestamp(),
        updatedBy: authUser.uid,
      }, { merge: true })
      toast.success('Platform settings saved.')
    } catch { toast.error('Could not save settings.') }
    finally { setSavingPlatform(false) }
  }

  const handleSaveNotifs = async () => {
    if (!authUser) return
    setSavingNotifs(true)
    try {
      await setDoc(doc(db, 'users', authUser.uid), { notifications: notifs, updatedAt: serverTimestamp() }, { merge: true })
      toast.success('Notification preferences saved.')
    } catch { toast.error('Could not save.') }
    finally { setSavingNotifs(false) }
  }

  const handleChangePw = async () => {
    if (!authUser) return
    if (!pw.current)          { setPwError('Current password is required'); return }
    if (pw.newPw.length < 6)  { setPwError('New password must be at least 6 characters'); return }
    if (pw.newPw !== pw.confirm) { setPwError('Passwords do not match'); return }
    setSavingPw(true); setPwError('')
    try {
      const cred = EmailAuthProvider.credential(authUser.email, pw.current)
      await reauthenticateWithCredential(authUser, cred)
      await updatePassword(authUser, pw.newPw)
      setPw({ current: '', newPw: '', confirm: '' })
      toast.success('Password updated successfully.')
    } catch (err: any) {
      const code = err.code || ''
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') setPwError('Current password is incorrect.')
      else if (code === 'auth/too-many-requests') setPwError('Too many attempts. Try again later.')
      else setPwError('Could not update password.')
    } finally { setSavingPw(false) }
  }

  const handleSignOut = async () => { await signOut(auth); router.push('/admin/login') }

  if (authLoading) return <><style>{S}</style><div className="loading-screen"><div className="loading-spinner" /></div></>

  const adminInitials = getInitials(authUser?.displayName || authUser?.email || 'A')
  const strength = pwStrength(pw.newPw)

  return (
    <>
      <style>{S}</style>
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />

      <div className="admin-layout">
        <div className={`sidebar-overlay${sidebarOpen ? ' show' : ''}`} onClick={() => setSidebarOpen(false)} />

        {/* SIDEBAR */}
        <aside className={`admin-sidebar${sidebarOpen ? ' sb-open' : ''}`}>
          <Link href="/admin/dashboard" className="sb-logo">
            <div className="sb-logo-icon"><ShieldCheck size={18} color="white" /></div>
            <span className="sb-logo-text">Fix<em>Mate</em></span>
            <span className="sb-logo-badge">Admin</span>
          </Link>
          <div className="sb-section-label">Main</div>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className={`sb-nav-item${pathname === item.href ? ' active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <Icon size={17} className="sb-nav-icon" />{item.label}
              </Link>
            )
          })}
          <div className="sb-user">
            <div className="sb-user-avatar">{adminInitials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sb-user-name">{authUser?.displayName || authUser?.email?.split('@')[0]}</div>
              <div className="sb-user-role">Administrator</div>
            </div>
            <button className="sb-logout" onClick={handleSignOut}><LogOut size={16} /></button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="admin-main">
          <div className="admin-topbar">
            <button className="topbar-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <div className="topbar-title">Settings</div>
              <div className="topbar-sub">Platform configuration and admin preferences</div>
            </div>
            <div className="topbar-right">
              <button className="topbar-btn" onClick={() => window.location.reload()}><RefreshCw size={13} /> Refresh</button>
            </div>
          </div>

          <div className="admin-body">
            <div className="settings-grid">
              {/* LEFT NAV */}
              <div className="settings-nav">
                {SETTINGS_NAV.map(item => (
                  <div
                    key={item.key}
                    className={`settings-nav-item${section === item.key ? ' active' : ''}`}
                    onClick={() => setSection(item.key)}
                  >
                    <span className="settings-nav-icon">{item.icon}</span>
                    {item.label}
                    {item.key === 'danger' && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.4 }} />}
                  </div>
                ))}
              </div>

              {/* RIGHT PANEL */}
              <div className="settings-panel">

                {/* ─── PROFILE ─── */}
                {section === 'profile' && (
                  <>
                    {/* Profile hero */}
                    <div className="set-card">
                      <div className="profile-hero">
                        <div className="profile-hero-av">{adminInitials}</div>
                        <div>
                          <div className="profile-hero-name">{authUser?.displayName || 'Admin'}</div>
                          <div className="profile-hero-email">{authUser?.email}</div>
                        </div>
                        <div className="profile-hero-badge">Super Admin</div>
                      </div>
                      <div className="set-field">
                        <div className="set-two-col">
                          <div>
                            <label className="set-field-label">Display Name</label>
                            <div className="set-input-wrap">
                              <Edit3 size={15} className="set-input-icon" />
                              <input value={profile.displayName} onChange={e => setProfile(p => ({ ...p, displayName: e.target.value }))} placeholder="Admin Name" />
                            </div>
                          </div>
                          <div>
                            <label className="set-field-label">Email</label>
                            <div className="set-input-wrap">
                              <Mail size={15} className="set-input-icon" />
                              <input value={profile.email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="set-field">
                        <div className="set-two-col">
                          <div>
                            <label className="set-field-label">Phone</label>
                            <div className="set-input-wrap">
                              <Phone size={15} className="set-input-icon" />
                              <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+44 7700 900000" />
                            </div>
                          </div>
                          <div>
                            <label className="set-field-label">Location</label>
                            <div className="set-input-wrap">
                              <MapPin size={15} className="set-input-icon" />
                              <input value={profile.location} onChange={e => setProfile(p => ({ ...p, location: e.target.value }))} placeholder="City, Country" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="save-row">
                        <button className="save-btn secondary" onClick={() => {}}>Discard</button>
                        <button className="save-btn primary" onClick={handleSaveProfile} disabled={savingProfile}>
                          {savingProfile ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Save size={14} /> Save Profile</>}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* ─── PLATFORM ─── */}
                {section === 'platform' && (
                  <div className="set-card">
                    <div className="set-card-header">
                      <div className="set-card-icon" style={{ background: '#FFF3EE' }}><Settings size={18} color="#FF5C1A" /></div>
                      <div>
                        <div className="set-card-title">Platform Configuration</div>
                        <div className="set-card-sub">Core settings that affect all users</div>
                      </div>
                    </div>

                    <div className="set-field">
                      <div className="set-two-col">
                        <div>
                          <label className="set-field-label">Platform Name</label>
                          <div className="set-input-wrap">
                            <input value={platform.platformName} onChange={e => setPlatform(p => ({ ...p, platformName: e.target.value }))} />
                          </div>
                        </div>
                        <div>
                          <label className="set-field-label">Support Email</label>
                          <div className="set-input-wrap">
                            <Mail size={15} className="set-input-icon" />
                            <input value={platform.supportEmail} onChange={e => setPlatform(p => ({ ...p, supportEmail: e.target.value }))} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="set-field">
                      <div className="set-two-col">
                        <div>
                          <label className="set-field-label">Commission Rate (%)</label>
                          <div className="set-input-wrap">
                            <Percent size={15} className="set-input-icon" />
                            <input type="number" min="0" max="50" value={platform.commissionRate} onChange={e => setPlatform(p => ({ ...p, commissionRate: e.target.value }))} />
                          </div>
                        </div>
                        <div>
                          <label className="set-field-label">Default Currency</label>
                          <select className="set-select" value={platform.currency} onChange={e => setPlatform(p => ({ ...p, currency: e.target.value }))}>
                            <option value="GBP">GBP (£)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="NGN">NGN (₦)</option>
                            <option value="KES">KES (KSh)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="toggle-row">
                      <div className="toggle-info">
                        <div className="toggle-label">Worker Registration</div>
                        <div className="toggle-sub">Allow new workers to register on the platform</div>
                      </div>
                      <Toggle on={platform.workerRegistration} onToggle={() => setPlatform(p => ({ ...p, workerRegistration: !p.workerRegistration }))} />
                    </div>
                    <div className="toggle-row">
                      <div className="toggle-info">
                        <div className="toggle-label">Client Registration</div>
                        <div className="toggle-sub">Allow new clients to create accounts</div>
                      </div>
                      <Toggle on={platform.clientRegistration} onToggle={() => setPlatform(p => ({ ...p, clientRegistration: !p.clientRegistration }))} />
                    </div>
                    <div className="toggle-row">
                      <div className="toggle-info">
                        <div className="toggle-label">Auto-Approve Workers</div>
                        <div className="toggle-sub">Automatically approve worker profiles without manual review</div>
                      </div>
                      <Toggle on={platform.autoApproveWorkers} onToggle={() => setPlatform(p => ({ ...p, autoApproveWorkers: !p.autoApproveWorkers }))} />
                    </div>
                    <div className="toggle-row">
                      <div className="toggle-info">
                        <div className="toggle-label">Maintenance Mode</div>
                        <div className="toggle-sub">Take the platform offline for all users except admins</div>
                      </div>
                      <Toggle on={platform.maintenanceMode} onToggle={() => setPlatform(p => ({ ...p, maintenanceMode: !p.maintenanceMode }))} />
                    </div>

                    <div className="save-row">
                      <button className="save-btn primary" onClick={handleSavePlatform} disabled={savingPlatform}>
                        {savingPlatform ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Save size={14} /> Save Configuration</>}
                      </button>
                    </div>
                  </div>
                )}

                {/* ─── NOTIFICATIONS ─── */}
                {section === 'notifications' && (
                  <div className="set-card">
                    <div className="set-card-header">
                      <div className="set-card-icon" style={{ background: '#FFF3EE' }}><Bell size={18} color="#FF5C1A" /></div>
                      <div>
                        <div className="set-card-title">Admin Notifications</div>
                        <div className="set-card-sub">Events that trigger alerts to you as admin</div>
                      </div>
                    </div>
                    {[
                      { key: 'newBookings',           label: 'New Bookings',          sub: 'Alert when a new booking is created'            },
                      { key: 'disputes',              label: 'Booking Disputes',      sub: 'Alert when a client raises a dispute'           },
                      { key: 'workerRegistrations',   label: 'Worker Registrations',  sub: 'Alert when a new worker signs up'               },
                      { key: 'lowRating',             label: 'Low Rating Alert',       sub: 'Alert when a worker drops below 3.0 stars'      },
                      { key: 'largeTx',               label: 'Large Transaction',     sub: 'Alert for bookings over £500'                   },
                      { key: 'systemAlerts',          label: 'System Alerts',         sub: 'Critical platform errors and security events'   },
                    ].map(item => (
                      <div key={item.key} className="toggle-row">
                        <div className="toggle-info">
                          <div className="toggle-label">{item.label}</div>
                          <div className="toggle-sub">{item.sub}</div>
                        </div>
                        <Toggle
                          on={notifs[item.key as keyof typeof notifs]}
                          onToggle={() => setNotifs(p => ({ ...p, [item.key]: !p[item.key as keyof typeof notifs] }))}
                        />
                      </div>
                    ))}
                    <div style={{ padding: '12px 24px 0', borderTop: '1px solid #E8E6E1' }}>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 11, fontWeight: 700, color: '#AFAFAF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 0 }}>Channels</div>
                    </div>
                    {[
                      { key: 'emailDigest', label: 'Weekly Email Digest', sub: 'Receive a weekly summary via email' },
                      { key: 'smsAlerts',   label: 'SMS Alerts',          sub: 'Critical alerts sent via SMS'       },
                    ].map(item => (
                      <div key={item.key} className="toggle-row">
                        <div className="toggle-info">
                          <div className="toggle-label">{item.label}</div>
                          <div className="toggle-sub">{item.sub}</div>
                        </div>
                        <Toggle
                          on={notifs[item.key as keyof typeof notifs]}
                          onToggle={() => setNotifs(p => ({ ...p, [item.key]: !p[item.key as keyof typeof notifs] }))}
                        />
                      </div>
                    ))}
                    <div className="save-row">
                      <button className="save-btn primary" onClick={handleSaveNotifs} disabled={savingNotifs}>
                        {savingNotifs ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Check size={14} /> Save Preferences</>}
                      </button>
                    </div>
                  </div>
                )}

                {/* ─── SECURITY ─── */}
                {section === 'security' && (
                  <>
                    <div className="set-card">
                      <div className="set-card-header">
                        <div className="set-card-icon" style={{ background: '#F5F0FF' }}><Lock size={18} color="#7C3AED" /></div>
                        <div>
                          <div className="set-card-title">Change Admin Password</div>
                          <div className="set-card-sub">Update your admin account credentials</div>
                        </div>
                      </div>
                      {(['current', 'newPw', 'confirm'] as const).map(key => (
                        <div key={key} className="set-field">
                          <label className="set-field-label">
                            {key === 'current' ? 'Current Password' : key === 'newPw' ? 'New Password' : 'Confirm New Password'}
                          </label>
                          <div className="set-input-wrap">
                            <Lock size={15} className="set-input-icon" />
                            <input
                              type={showPw[key] ? 'text' : 'password'}
                              placeholder="••••••••"
                              value={pw[key]}
                              onChange={e => { setPw(p => ({ ...p, [key]: e.target.value })); setPwError('') }}
                            />
                            <button className="set-eye" onClick={() => setShowPw(p => ({ ...p, [key]: !p[key] }))}>
                              {showPw[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                          {key === 'newPw' && pw.newPw && (
                            <>
                              <div className="pw-bars">
                                {[1,2,3,4].map(i => <div key={i} className="pw-bar" style={{ background: i <= strength.score ? strength.color : '#E8E6E1' }} />)}
                              </div>
                              {strength.label && <div style={{ fontSize: 11, color: strength.color, marginTop: 5 }}>{strength.label}</div>}
                            </>
                          )}
                        </div>
                      ))}
                      {pwError && <div style={{ padding: '0 24px 12px', fontSize: 12, color: '#EF4444' }}>{pwError}</div>}
                      <div className="save-row">
                        <button className="save-btn primary" onClick={handleChangePw} disabled={savingPw}>
                          {savingPw ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Updating…</> : <><Lock size={14} /> Update Password</>}
                        </button>
                      </div>
                    </div>

                    <div className="set-card">
                      <div className="set-card-header">
                        <div className="set-card-icon" style={{ background: '#EEF6FF' }}><Shield size={18} color="#2563EB" /></div>
                        <div>
                          <div className="set-card-title">Advanced Security</div>
                          <div className="set-card-sub">Additional protection for your admin account</div>
                        </div>
                      </div>
                      <div className="toggle-row">
                        <div className="toggle-info">
                          <div className="toggle-label">Two-Factor Authentication</div>
                          <div className="toggle-sub">Require a second factor when signing in</div>
                        </div>
                        <Toggle on={mfa} onToggle={() => { setMfa(!mfa); toast(!mfa ? 'MFA enabled (configure in Firebase Console)' : 'MFA disabled') }} />
                      </div>
                      <div className="toggle-row">
                        <div className="toggle-info">
                          <div className="toggle-label">IP Whitelist</div>
                          <div className="toggle-sub">Restrict admin access to approved IP addresses only</div>
                        </div>
                        <Toggle on={ipWhitelist} onToggle={() => { setIpWhitelist(!ipWhitelist); toast(ipWhitelist ? 'IP whitelist disabled' : 'Configure IP whitelist in server settings') }} />
                      </div>
                    </div>
                  </>
                )}

                {/* ─── DANGER ZONE ─── */}
                {section === 'danger' && (
                  <div className="danger-zone">
                    <div className="danger-zone-header">
                      <AlertTriangle size={16} color="#EF4444" />
                      <div className="danger-zone-title">Danger Zone</div>
                    </div>
                    {[
                      { label: 'Clear All Bookings',  sub: 'Permanently delete all booking records from the database. This cannot be undone.', action: 'Clear Bookings' },
                      { label: 'Suspend All Workers', sub: 'Immediately suspend all worker accounts. Workers will be unable to accept jobs.', action: 'Suspend Workers' },
                      { label: 'Enable Maintenance',  sub: 'Put the platform into maintenance mode, blocking all client and worker access.', action: 'Enable Maintenance' },
                      { label: 'Export All Data',     sub: 'Download a full export of all platform data in CSV format.', action: 'Export Data' },
                      { label: 'Sign Out All Users',  sub: 'Force-revoke all active sessions. All users will be signed out immediately.', action: 'Sign Out All' },
                    ].map(item => (
                      <div key={item.label} className="danger-row">
                        <div>
                          <div className="danger-row-label">{item.label}</div>
                          <div className="danger-row-sub">{item.sub}</div>
                        </div>
                        <button
                          className="danger-btn"
                          onClick={() => toast.error(`"${item.action}" requires server-side implementation via Cloud Functions.`)}
                        >
                          <AlertTriangle size={13} /> {item.action}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}