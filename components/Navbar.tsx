'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Explore Workers', href: '/explore' },
  { label: 'AI Assistant', href: '/assistant' },
  { label: 'How it Works', href: '/#how-it-works' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <style>{`
        .navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 50;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          background: rgba(250,250,248,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #E8E6E1;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .nav-logo-icon {
          width: 34px; height: 34px;
          background: #FF5C1A;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .nav-logo-text {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #0F0F0F;
        }
        .nav-logo-text span { color: #FF5C1A; }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .nav-link {
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #6B6B6B;
          text-decoration: none;
          padding: 8px 14px;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .nav-link:hover { color: #0F0F0F; background: #F5F4F1; }

        .nav-cta { display: flex; gap: 8px; align-items: center; }
        .btn-login {
          font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 600;
          color: #6B6B6B;
          border: 1.5px solid #E8E6E1;
          padding: 8px 18px;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s;
          background: transparent;
        }
        .btn-login:hover { background: #F5F4F1; color: #0F0F0F; }
        .btn-signup {
          font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 600;
          color: white;
          background: #FF5C1A;
          padding: 8px 18px;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s;
        }
        .btn-signup:hover { background: #FF7A40; }

        .nav-hamburger {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: #0F0F0F;
          padding: 4px;
        }

        .mobile-menu {
          position: absolute;
          top: 68px; left: 0; right: 0;
          background: #FAFAF8;
          border-bottom: 1px solid #E8E6E1;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }
        .mobile-link {
          font-family: 'Syne', sans-serif;
          font-size: 16px; font-weight: 600;
          color: #0F0F0F;
          text-decoration: none;
          padding: 10px 0;
          border-bottom: 1px solid #E8E6E1;
        }
        .mobile-cta { display: flex; gap: 10px; margin-top: 8px; }
        .mobile-login {
          flex: 1; text-align: center;
          font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 600;
          color: #0F0F0F;
          border: 1.5px solid #E8E6E1;
          padding: 10px;
          border-radius: 8px;
          text-decoration: none;
        }
        .mobile-signup {
          flex: 1; text-align: center;
          font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 600;
          color: white;
          background: #FF5C1A;
          padding: 10px;
          border-radius: 8px;
          text-decoration: none;
        }

        @media (max-width: 768px) {
          .navbar { padding: 0 20px; }
          .nav-links, .nav-cta { display: none; }
          .nav-hamburger { display: block; }
        }
      `}</style>

      <nav className="navbar">
        <Link href="/" className="nav-logo">
          <div className="nav-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M13.78 15.3 19.78 21.3 21.89 19.14 15.89 13.14 13.78 15.3M17.5 10.1C17.11 10.1 16.69 10.05 16.36 9.96L4.97 21.25 2.86 19.14 8 14 6 12 7.07 10.93 9.15 13 10.09 12.06 8 10 9.07 8.93 11.15 11 12.09 10.06 10 8 11.07 6.93 13.15 9 14.3 7.85C14.1 7.31 14 6.71 14 6.1 14 3.32 16.24 1.1 19.02 1.1 19.72 1.1 20.34 1.27 20.95 1.52L18.31 4.16 19.95 5.79 22.59 3.15C22.84 3.75 23 4.37 23 5.07 23 7.85 20.78 10.07 18 10.07L17.5 10.1Z"/>
            </svg>
          </div>
          <span className="nav-logo-text">Fix<span>Mate</span></span>
        </Link>

        <div className="nav-links">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link">{l.label}</Link>
          ))}
        </div>

        <div className="nav-cta">
          <Link href="/login" className="btn-login">Login</Link>
          <Link href="/register" className="btn-signup">Sign Up</Link>
        </div>

        <button
          className="nav-hamburger"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        {open && (
          <div className="mobile-menu">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="mobile-link" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <div className="mobile-cta">
              <Link href="/login" className="mobile-login" onClick={() => setOpen(false)}>Login</Link>
              <Link href="/register" className="mobile-signup" onClick={() => setOpen(false)}>Sign Up</Link>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}