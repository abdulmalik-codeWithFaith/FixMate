'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import toast, { Toaster } from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Loader2, AlertTriangle } from 'lucide-react'

const S = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .admin-login-page {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    font-family: 'DM Sans', sans-serif;
  }

  /* ─── LEFT PANEL ─── */
  .al-left {
    background: #0F0F0F;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 52px;
    overflow: hidden;
  }

  /* dot-grid */
  .al-grid {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      radial-gradient(rgba(255,92,26,0.18) 1.5px, transparent 1.5px);
    background-size: 32px 32px;
  }

  /* orange glow */
  .al-glow {
    position: absolute;
    width: 600px; height: 600px; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,92,26,0.14) 0%, transparent 70%);
    top: -160px; left: -160px; pointer-events: none;
  }

  .al-logo {
    position: relative; z-index: 1;
    display: flex; align-items: center; gap: 12px;
    text-decoration: none;
  }
  .al-logo-icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: #FF5C1A;
    display: flex; align-items: center; justify-content: center;
  }
  .al-logo-text {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 22px; color: white; letter-spacing: -0.5px;
  }
  .al-logo-text em { color: #FF5C1A; font-style: normal; }

  .al-hero { position: relative; z-index: 1; }
  .al-badge {
    display: inline-flex; align-items: center; gap: 7px;
    background: rgba(255,92,26,0.12);
    border: 1px solid rgba(255,92,26,0.3);
    color: #FF5C1A;
    font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700;
    letter-spacing: 1.5px; text-transform: uppercase;
    padding: 7px 14px; border-radius: 100px;
    margin-bottom: 28px;
  }
  .al-title {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: clamp(34px, 3.5vw, 52px);
    letter-spacing: -2px; color: white; line-height: 1.05;
    margin-bottom: 20px;
  }
  .al-title em { color: #FF5C1A; font-style: normal; }
  .al-sub {
    font-size: 15px; color: rgba(255,255,255,0.45);
    font-weight: 300; line-height: 1.8; max-width: 360px;
    margin-bottom: 44px;
  }

  .al-features { display: flex; flex-direction: column; gap: 14px; }
  .al-feature {
    display: flex; align-items: center; gap: 14px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px; padding: 14px 18px;
  }
  .al-feature-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #FF5C1A; flex-shrink: 0;
    box-shadow: 0 0 8px rgba(255,92,26,0.6);
  }
  .al-feature-text {
    font-size: 13px; color: rgba(255,255,255,0.6); font-weight: 300;
  }
  .al-feature-text strong {
    font-family: 'Syne', sans-serif; font-weight: 700;
    color: white; display: block; margin-bottom: 2px;
  }

  .al-footer-stats {
    position: relative; z-index: 1;
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
  }
  .al-stat {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px; padding: 18px 16px; text-align: center;
  }
  .al-stat-val {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 22px; color: white;
  }
  .al-stat-val em { color: #FF5C1A; font-style: normal; }
  .al-stat-label { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 4px; }

  /* ─── RIGHT PANEL ─── */
  .al-right {
    background: #FAFAF8;
    display: flex; align-items: center; justify-content: center;
    padding: 48px 64px;
  }
  .al-form-wrap { width: 100%; max-width: 400px; }

  .al-form-header { margin-bottom: 36px; }
  .al-form-title {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 30px; letter-spacing: -1px; color: #0F0F0F;
    margin-bottom: 6px;
  }
  .al-form-sub { font-size: 14px; color: #6B6B6B; font-weight: 300; }

  /* security notice */
  .al-notice {
    display: flex; align-items: flex-start; gap: 10px;
    background: #FFF8EE; border: 1px solid rgba(217,119,6,0.25);
    border-radius: 12px; padding: 14px; margin-bottom: 28px;
  }
  .al-notice-text { font-size: 12px; color: #92400E; line-height: 1.6; }
  .al-notice-text strong { font-family: 'Syne', sans-serif; font-weight: 700; }

  /* fields */
  .al-field { margin-bottom: 16px; }
  .al-field label {
    display: block; font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 600; color: #0F0F0F; margin-bottom: 7px;
  }
  .al-input-wrap {
    display: flex; align-items: center; gap: 10px;
    background: white; border: 1.5px solid #E8E6E1;
    border-radius: 12px; padding: 12px 16px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .al-input-wrap:focus-within {
    border-color: #FF5C1A;
    box-shadow: 0 0 0 3px rgba(255,92,26,0.1);
  }
  .al-input-wrap.error { border-color: #EF4444; }
  .al-input-wrap input {
    flex: 1; border: none; outline: none; background: transparent;
    font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F;
  }
  .al-input-wrap input::placeholder { color: #AFAFAF; }
  .al-field-icon { color: #AFAFAF; flex-shrink: 0; }
  .al-eye-btn {
    background: none; border: none; cursor: pointer;
    color: #AFAFAF; display: flex; padding: 0; flex-shrink: 0;
  }
  .al-eye-btn:hover { color: #6B6B6B; }

  /* submit */
  .al-submit {
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
    background: #0F0F0F; color: white;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px;
    border: none; border-radius: 12px; padding: 15px;
    cursor: pointer; transition: all 0.2s; margin-top: 8px;
  }
  .al-submit:hover:not(:disabled) { background: #1A1A1A; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.18); }
  .al-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }

  .al-back {
    display: block; text-align: center; margin-top: 22px;
    font-size: 13px; color: #6B6B6B; text-decoration: none;
    font-family: 'Syne', sans-serif; font-weight: 600;
    transition: color 0.2s;
  }
  .al-back:hover { color: #FF5C1A; }

  @media (max-width: 900px) {
    .admin-login-page { grid-template-columns: 1fr; }
    .al-left { display: none; }
    .al-right { padding: 40px 24px; }
  }
`

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Please fill in all fields'); return }
    setLoading(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      // Verify admin role in Firestore
      const snap = await getDoc(doc(db, 'users', cred.user.uid))
      if (!snap.exists() || snap.data().role !== 'admin') {
        await auth.signOut()
        toast.error('Access denied. Admin accounts only.')
        setLoading(false)
        return
      }
      toast.success('Welcome back, Admin!')
      setTimeout(() => router.push('/admin/dashboard'), 600)
    } catch (err: any) {
      const code = err.code || ''
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        toast.error('Invalid email or password.')
      } else if (code === 'auth/too-many-requests') {
        toast.error('Too many attempts. Please try again later.')
      } else {
        toast.error('Login failed. Please try again.')
      }
      setLoading(false)
    }
  }

  return (
    <>
      <style>{S}</style>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <div className="admin-login-page">
        {/* LEFT PANEL */}
        <div className="al-left">
          <div className="al-grid" />
          <div className="al-glow" />

          <Link href="/" className="al-logo">
            <div className="al-logo-icon">
              <ShieldCheck size={22} color="white" />
            </div>
            <span className="al-logo-text">Fix<em>Mate</em></span>
          </Link>

          <div className="al-hero">
            <div className="al-badge">
              <ShieldCheck size={12} /> Admin Control Centre
            </div>
            <h1 className="al-title">
              Platform<br /><em>Command</em><br />Centre
            </h1>
            <p className="al-sub">
              Full visibility and control over every worker, client, booking and transaction on the FixMate platform.
            </p>
            <div className="al-features">
              {[
                { title: 'User Management', desc: 'Approve, suspend or remove workers and clients' },
                { title: 'Booking Oversight', desc: 'Monitor all bookings, disputes and completions' },
                { title: 'Revenue Analytics', desc: 'Track earnings, payouts and platform commissions' },
                { title: 'Platform Health', desc: 'Real-time stats, flags and system alerts' },
              ].map(f => (
                <div key={f.title} className="al-feature">
                  <div className="al-feature-dot" />
                  <div className="al-feature-text">
                    <strong>{f.title}</strong>
                    {f.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="al-footer-stats">
            {[{ v: '50K', l: 'Workers' }, { v: '12K', l: 'Bookings' }, { v: '99.9', l: 'Uptime %' }].map(s => (
              <div key={s.l} className="al-stat">
                <div className="al-stat-val">{s.v}<em>+</em></div>
                <div className="al-stat-label">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="al-right">
          <div className="al-form-wrap">
            <div className="al-form-header">
              <h2 className="al-form-title">Admin Sign In</h2>
              <p className="al-form-sub">Restricted access — authorised personnel only</p>
            </div>

            <div className="al-notice">
              <AlertTriangle size={15} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
              <div className="al-notice-text">
                <strong>Restricted Area.</strong> This portal is for FixMate administrators only. Unauthorised access attempts are logged.
              </div>
            </div>

            <form onSubmit={handleLogin} noValidate>
              <div className="al-field">
                <label>Admin Email</label>
                <div className="al-input-wrap">
                  <Mail size={16} className="al-field-icon" />
                  <input
                    type="email"
                    placeholder="admin@fixmate.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="al-field">
                <label>Password</label>
                <div className="al-input-wrap">
                  <Lock size={16} className="al-field-icon" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button type="button" className="al-eye-btn" onClick={() => setShowPw(!showPw)}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="al-submit" disabled={loading}>
                {loading
                  ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Verifying…</>
                  : <><ShieldCheck size={16} /> Sign In to Admin Panel</>
                }
              </button>
            </form>

            <Link href="/" className="al-back">← Back to FixMate</Link>
          </div>
        </div>
      </div>
    </>
  )
}