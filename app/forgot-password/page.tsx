'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowRight, ArrowLeft, CheckCircle, RefreshCw, Shield, Zap, Lock } from 'lucide-react'

type Screen = 'request' | 'sent' | 'verify'

const S = `
  .fp-page {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  /* ── LEFT ── */
  .fp-left {
    background: #0F0F0F;
    position: relative;
    display: flex; flex-direction: column;
    justify-content: space-between;
    padding: 48px; overflow: hidden;
  }
  .fp-glow1 {
    position: absolute; width: 500px; height: 500px; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,92,26,0.15) 0%, transparent 70%);
    top: -100px; left: -100px; pointer-events: none;
  }
  .fp-glow2 {
    position: absolute; width: 350px; height: 350px; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,92,26,0.08) 0%, transparent 70%);
    bottom: -60px; right: -60px; pointer-events: none;
  }
  .fp-grid {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  .fp-logo {
    display: flex; align-items: center; gap: 10px;
    text-decoration: none; position: relative; z-index: 1;
  }
  .fp-logo-icon {
    width: 38px; height: 38px; background: #FF5C1A;
    border-radius: 11px; display: flex; align-items: center; justify-content: center;
  }
  .fp-logo-text { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; color: white; }
  .fp-logo-text span { color: #FF5C1A; }

  /* Left illustration area */
  .fp-illustration {
    position: relative; z-index: 1;
    display: flex; flex-direction: column; align-items: center;
    text-align: center; padding: 20px 0;
  }
  .fp-lock-wrap {
    position: relative; margin-bottom: 40px;
  }
  .fp-lock-bg {
    width: 140px; height: 140px; border-radius: 50%;
    background: rgba(255,92,26,0.1); border: 1px solid rgba(255,92,26,0.2);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto;
  }
  .fp-lock-inner {
    width: 90px; height: 90px; border-radius: 50%;
    background: rgba(255,92,26,0.2); border: 1px solid rgba(255,92,26,0.35);
    display: flex; align-items: center; justify-content: center;
  }
  .fp-orbit {
    position: absolute; top: -12px; right: -12px;
    width: 36px; height: 36px; border-radius: 50%;
    background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
    display: flex; align-items: center; justify-content: center;
  }
  .fp-orbit2 {
    position: absolute; bottom: 0px; left: -16px;
    width: 28px; height: 28px; border-radius: 50%;
    background: rgba(255,92,26,0.15); border: 1px solid rgba(255,92,26,0.3);
    display: flex; align-items: center; justify-content: center;
  }

  .fp-ill-title {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: clamp(24px, 3vw, 36px); letter-spacing: -1px;
    color: white; line-height: 1.15; margin-bottom: 16px;
  }
  .fp-ill-title em { color: #FF5C1A; font-style: normal; }
  .fp-ill-sub {
    font-size: 15px; color: rgba(255,255,255,0.45);
    font-weight: 300; line-height: 1.75; max-width: 340px;
  }

  /* Steps */
  .fp-steps { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 14px; }
  .fp-step {
    display: flex; align-items: flex-start; gap: 14px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px; padding: 16px;
  }
  .fp-step-num {
    width: 32px; height: 32px; border-radius: 9px;
    background: rgba(255,92,26,0.15); border: 1px solid rgba(255,92,26,0.3);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 14px;
    color: #FF5C1A; flex-shrink: 0;
  }
  .fp-step-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: white; margin-bottom: 3px; }
  .fp-step-sub { font-size: 12px; color: rgba(255,255,255,0.4); font-weight: 300; line-height: 1.5; }

  /* ── RIGHT ── */
  .fp-right {
    background: #FAFAF8;
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    padding: 48px 64px;
  }
  .fp-form-wrap { width: 100%; max-width: 400px; }

  /* REQUEST SCREEN */
  .fp-back-link {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
    color: #6B6B6B; text-decoration: none; margin-bottom: 36px;
    transition: color 0.2s;
  }
  .fp-back-link:hover { color: #0F0F0F; }

  .fp-form-icon {
    width: 60px; height: 60px; border-radius: 16px;
    background: #FFF3EE; border: 1px solid rgba(255,92,26,0.2);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 20px;
  }
  .fp-form-title {
    font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800;
    letter-spacing: -1px; color: #0F0F0F; margin-bottom: 8px;
  }
  .fp-form-sub { font-size: 15px; color: #6B6B6B; font-weight: 300; line-height: 1.65; margin-bottom: 32px; }
  .fp-form-sub strong { color: #0F0F0F; font-weight: 600; }

  /* Field */
  .field { margin-bottom: 20px; }
  .field-label {
    display: block; font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 600; color: #0F0F0F; margin-bottom: 7px;
  }
  .field-wrap {
    display: flex; align-items: center; gap: 10px;
    background: white; border: 1.5px solid #E8E6E1;
    border-radius: 12px; padding: 13px 16px;
    transition: border-color 0.2s;
  }
  .field-wrap:focus-within { border-color: #FF5C1A; box-shadow: 0 0 0 3px rgba(255,92,26,0.08); }
  .field-wrap input {
    flex: 1; border: none; outline: none; background: transparent;
    font-family: 'DM Sans', sans-serif; font-size: 15px; color: #0F0F0F;
  }
  .field-wrap input::placeholder { color: #AFAFAF; }
  .field-icon { color: #AFAFAF; flex-shrink: 0; }
  .error-msg { font-size: 12px; color: #EF4444; margin-top: 5px; }
  .field-error { border-color: #EF4444 !important; }

  /* Submit */
  .fp-submit {
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
    background: #FF5C1A; color: white;
    font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 600;
    border: none; border-radius: 12px; padding: 14px;
    cursor: pointer; transition: all 0.2s; margin-bottom: 20px;
  }
  .fp-submit:hover { background: #FF7A40; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(255,92,26,0.25); }

  .fp-footer { text-align: center; font-size: 14px; color: #6B6B6B; }
  .fp-footer a { font-family: 'Syne', sans-serif; font-weight: 700; color: #FF5C1A; text-decoration: none; }
  .fp-footer a:hover { text-decoration: underline; }

  /* SENT SCREEN */
  .fp-sent-icon {
    width: 80px; height: 80px; border-radius: 50%;
    background: #F0FDF4; border: 2px solid #22C55E;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 24px;
    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  @keyframes popIn {
    from { transform: scale(0.5); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }
  .fp-sent-title {
    font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800;
    letter-spacing: -1px; color: #0F0F0F; margin-bottom: 10px; text-align: center;
  }
  .fp-sent-sub {
    font-size: 15px; color: #6B6B6B; font-weight: 300;
    line-height: 1.7; text-align: center; margin-bottom: 32px;
  }
  .fp-sent-sub strong { color: #0F0F0F; font-weight: 600; }

  .fp-email-preview {
    background: white; border: 1px solid #E8E6E1;
    border-radius: 14px; padding: 20px;
    display: flex; gap: 14px; align-items: flex-start;
    margin-bottom: 28px;
  }
  .fp-email-icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: #FFF3EE; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .fp-email-from { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; color: #0F0F0F; margin-bottom: 3px; }
  .fp-email-subject { font-size: 12px; color: #6B6B6B; margin-bottom: 6px; }
  .fp-email-body { font-size: 12px; color: #AFAFAF; line-height: 1.5; }

  .fp-resend-btn {
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
    background: transparent; color: #6B6B6B;
    font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600;
    border: 1.5px solid #E8E6E1; border-radius: 12px; padding: 13px;
    cursor: pointer; transition: all 0.2s; margin-bottom: 16px;
  }
  .fp-resend-btn:hover { background: #F5F4F1; color: #0F0F0F; border-color: #0F0F0F; }
  .fp-resend-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .fp-tip {
    background: #F5F4F1; border-radius: 12px; padding: 16px;
    display: flex; gap: 10px; align-items: flex-start; margin-bottom: 24px;
  }
  .fp-tip-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
  .fp-tip-text { font-size: 13px; color: #6B6B6B; line-height: 1.6; }
  .fp-tip-text strong { color: #0F0F0F; font-weight: 600; }

  .fp-back-login {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    width: 100%; background: #0F0F0F; color: white;
    font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 600;
    border: none; border-radius: 12px; padding: 14px;
    text-decoration: none; transition: background 0.2s; cursor: pointer;
  }
  .fp-back-login:hover { background: #1A1A1A; }

  /* Countdown */
  .countdown { color: #FF5C1A; font-weight: 700; }

  @media (max-width: 900px) {
    .fp-page { grid-template-columns: 1fr; }
    .fp-left { display: none; }
    .fp-right { padding: 40px 24px; min-height: 100vh; }
    .fp-form-wrap { max-width: 100%; }
  }
`

export default function ForgotPasswordPage() {
  const [screen, setScreen]       = useState<Screen>('request')
  const [email, setEmail]         = useState('')
  const [emailError, setEmailErr] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [resendCount, setResendCount] = useState(0)

  const validate = () => {
    if (!email) { setEmailErr('Email address is required'); return false }
    if (!/\S+@\S+\.\S+/.test(email)) { setEmailErr('Enter a valid email address'); return false }
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    // TODO: Firebase sendPasswordResetEmail(auth, email)
    setScreen('sent')
  }

  const handleResend = () => {
    if (countdown > 0) return
    setResendCount(p => p + 1)
    // TODO: resend email
    let c = 60
    setCountdown(c)
    const interval = setInterval(() => {
      c--
      setCountdown(c)
      if (c === 0) clearInterval(interval)
    }, 1000)
  }

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_: string, a: string, b: string, c: string) => a + '*'.repeat(Math.min(b.length, 4)) + c)
    : 'your email'

  return (
    <>
      <style>{S}</style>
      <div className="fp-page mt-10">

        {/* ── LEFT ── */}
        <div className="fp-left">
          <div className="fp-glow1" /><div className="fp-glow2" /><div className="fp-grid" />

          <Link href="/" className="fp-logo">
            <div className="fp-logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M13.78 15.3 19.78 21.3 21.89 19.14 15.89 13.14 13.78 15.3M17.5 10.1C17.11 10.1 16.69 10.05 16.36 9.96L4.97 21.25 2.86 19.14 8 14 6 12 7.07 10.93 9.15 13 10.09 12.06 8 10 9.07 8.93 11.15 11 12.09 10.06 10 8 11.07 6.93 13.15 9 14.3 7.85C14.1 7.31 14 6.71 14 6.1 14 3.32 16.24 1.1 19.02 1.1 19.72 1.1 20.34 1.27 20.95 1.52L18.31 4.16 19.95 5.79 22.59 3.15C22.84 3.75 23 4.37 23 5.07 23 7.85 20.78 10.07 18 10.07L17.5 10.1Z"/>
              </svg>
            </div>
            <span className="fp-logo-text">Fix<span>Mate</span></span>
          </Link>

          {/* Illustration */}
          <div className="fp-illustration">
            <div className="fp-lock-wrap">
              <div className="fp-lock-bg">
                <div className="fp-lock-inner">
                  <Lock size={36} color="#FF5C1A" />
                </div>
              </div>
              <div className="fp-orbit"><Zap size={14} color="rgba(255,255,255,0.6)" /></div>
              <div className="fp-orbit2"><Shield size={12} color="#FF5C1A" /></div>
            </div>
            <h2 className="fp-ill-title">
              Locked out?<br />No worries,<br />we&apos;ve got <em>you</em>
            </h2>
            <p className="fp-ill-sub">
              Account recovery is quick and secure. A reset link lands in your inbox in seconds.
            </p>
          </div>

          {/* Steps */}
          <div className="fp-steps">
            {[
              { num: '01', title: 'Enter your email', sub: 'Provide the email address linked to your FixMate account' },
              { num: '02', title: 'Check your inbox', sub: 'We\'ll send a secure reset link — check spam if needed' },
              { num: '03', title: 'Set a new password', sub: 'Click the link and create a strong new password' },
            ].map(s => (
              <div key={s.num} className="fp-step">
                <div className="fp-step-num">{s.num}</div>
                <div>
                  <p className="fp-step-title">{s.title}</p>
                  <p className="fp-step-sub">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="fp-right">
          <div className="fp-form-wrap">

            {/* ── REQUEST SCREEN ── */}
            {screen === 'request' && (
              <>
                <Link href="/login" className="fp-back-link">
                  <ArrowLeft size={15} /> Back to login
                </Link>

                <div className="fp-form-icon">
                  <Lock size={26} color="#FF5C1A" />
                </div>
                <h1 className="fp-form-title">Forgot password?</h1>
                <p className="fp-form-sub">
                  No problem. Enter your email and we&apos;ll send you a secure link to reset your password.
                </p>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="field">
                    <label className="field-label">Email address</label>
                    <div className={`field-wrap${emailError ? ' field-error' : ''}`}>
                      <Mail size={17} className="field-icon" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setEmailErr('') }}
                        autoFocus
                      />
                    </div>
                    {emailError && <p className="error-msg">{emailError}</p>}
                  </div>

                  <button type="submit" className="fp-submit">
                    Send Reset Link <ArrowRight size={17} />
                  </button>
                </form>

                <p className="fp-footer">
                  Remember your password? <Link href="/login">Sign in →</Link>
                </p>
              </>
            )}

            {/* ── SENT SCREEN ── */}
            {screen === 'sent' && (
              <>
                <div className="fp-sent-icon">
                  <CheckCircle size={40} color="#22C55E" />
                </div>
                <h1 className="fp-sent-title">Check your email</h1>
                <p className="fp-sent-sub">
                  We sent a password reset link to{' '}
                  <strong>{maskedEmail}</strong>.
                  It expires in 15 minutes.
                </p>

                {/* Email preview card */}
                <div className="fp-email-preview">
                  <div className="fp-email-icon">
                    <Mail size={20} color="#FF5C1A" />
                  </div>
                  <div>
                    <p className="fp-email-from">FixMate &lt;noreply@fixmate.com&gt;</p>
                    <p className="fp-email-subject">Reset your FixMate password</p>
                    <p className="fp-email-body">
                      Hi there! Click the button below to reset your password. This link is valid for 15 minutes…
                    </p>
                  </div>
                </div>

                {/* Tip */}
                <div className="fp-tip">
                  <span className="fp-tip-icon">💡</span>
                  <p className="fp-tip-text">
                    <strong>Can&apos;t find it?</strong> Check your spam or junk folder. The email usually
                    arrives within 60 seconds. Make sure you checked <strong>{maskedEmail}</strong>.
                  </p>
                </div>

                {/* Resend */}
                <button
                  className="fp-resend-btn"
                  onClick={handleResend}
                  disabled={countdown > 0}
                >
                  <RefreshCw size={15} />
                  {countdown > 0
                    ? <span>Resend in <span className="countdown">{countdown}s</span></span>
                    : resendCount > 0 ? 'Resend again' : 'Resend email'
                  }
                </button>

                <Link href="/login" className="fp-back-login">
                  <ArrowLeft size={16} /> Back to Login
                </Link>

                <p style={{ textAlign: 'center', fontSize: 13, color: '#6B6B6B', marginTop: 20 }}>
                  Wrong email?{' '}
                  <button
                    onClick={() => { setScreen('request'); setEmail('') }}
                    style={{ background: 'none', border: 'none', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#FF5C1A', cursor: 'pointer', fontSize: 13 }}
                  >
                    Try again
                  </button>
                </p>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  )
}