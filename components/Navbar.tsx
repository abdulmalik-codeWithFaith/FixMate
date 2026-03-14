'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import Logo from "@/public/logo.svg"
import Image from 'next/image'


const navLinks = [
  { label: 'Home',   href: '/' },
  { label: 'Explore Workers', href: '/explore' },
  { label: 'AI Assistant',    href: '/assistant' },
]

const HIDDEN_ON = [
  '/dashboard',
  '/orders',
  '/booking',
  '/chat',
  '/assistant',
  '/profile',
  '/settings',
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Hide navbar if current route starts with any app route
  const isAppRoute = HIDDEN_ON.some(route => pathname.startsWith(route))
  if (isAppRoute) return null

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
          display: flex; align-items: center; gap: 10px; text-decoration: none;
        }
        .nav-logo-icon {
          width: 34px; height: 34px; background: #FF5C1A;
          border-radius: 10px; display: flex; align-items: center; justify-content: center;
        }
        .nav-logo-text {
          font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; color: #0F0F0F;
        }
        .nav-logo-text span { color: #FF5C1A; }
        .nav-links { display: flex; align-items: center; gap: 4px; }
        .nav-link {
          font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600;
          color: #6B6B6B; text-decoration: none; padding: 8px 14px;
          border-radius: 8px; transition: all 0.2s;
        }
        .nav-link:hover { color: #0F0F0F; background: #F5F4F1; }
        .nav-cta { display: flex; gap: 8px; align-items: center; }
        .btn-login {
          font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600;
          color: #6B6B6B; border: 1.5px solid #E8E6E1; padding: 8px 18px;
          border-radius: 8px; text-decoration: none; transition: all 0.2s; background: transparent;
        }
        .btn-login:hover { background: #F5F4F1; color: #0F0F0F; }
        .btn-signup {
          font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600;
          color: white; background: #FF5C1A; padding: 8px 18px;
          border-radius: 8px; text-decoration: none; transition: all 0.2s;
        }
        .btn-signup:hover { background: #FF7A40; }
        .nav-hamburger {
          display: none; background: none; border: none;
          cursor: pointer; color: #0F0F0F; padding: 4px;
        }
        .mobile-menu {
          position: absolute; top: 68px; left: 0; right: 0;
          background: #FAFAF8; border-bottom: 1px solid #E8E6E1;
          padding: 20px; display: flex; flex-direction: column; gap: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }
        .mobile-link {
          font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 600;
          color: #0F0F0F; text-decoration: none; padding: 10px 0;
          border-bottom: 1px solid #E8E6E1;
        }
        .mobile-cta { display: flex; gap: 10px; margin-top: 8px; }
        .mobile-login {
          flex: 1; text-align: center;
          font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600;
          color: #0F0F0F; border: 1.5px solid #E8E6E1; padding: 10px;
          border-radius: 8px; text-decoration: none;
        }
        .mobile-signup {
          flex: 1; text-align: center;
          font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600;
          color: white; background: #FF5C1A; padding: 10px;
          border-radius: 8px; text-decoration: none;
        }
        @media (max-width: 768px) {
          .navbar { padding: 0 20px; }
          .nav-links, .nav-cta { display: none; }
          .nav-hamburger { display: block; }
        }
      `}</style>

      <nav className="navbar">
        <Link href="/" className="nav-logo">
          <Image src={Logo} alt='logo' width={60}/>
          <span className="nav-logo-text">Fix<span>Mate</span></span>
        </Link>

        <div className="nav-links">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} className="nav-link">{l.label}</Link>
          ))}
        </div>

        <div className="nav-cta">
          <Link href="/login"    className="btn-login">Login</Link>
          <Link href="/register" className="btn-signup">Sign Up</Link>
        </div>

        <button className="nav-hamburger" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        {open && (
          <div className="mobile-menu">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} className="mobile-link" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <div className="mobile-cta">
              <Link href="/login"    className="mobile-login"  onClick={() => setOpen(false)}>Login</Link>
              <Link href="/register" className="mobile-signup" onClick={() => setOpen(false)}>Sign Up</Link>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}