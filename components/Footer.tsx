'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import Logo from "@/public/logo.svg"

const HIDDEN_ON = [
  '/dashboard',
  '/orders',
  '/booking',
  '/chat',
  '/assistant',
  '/profile',
  '/settings',
  '/notifications',
  '/worker',
]

const footerLinks = [
  { label: 'Explore Workers', href: '/explore'   },
  { label: 'AI Assistant',    href: '/assistant'  },
  { label: 'Become a Worker', href: '/register'   },
  { label: 'Privacy',         href: '/privacy'    },
  { label: 'Terms',           href: '/terms'      },
]

export default function Footer() {
  const pathname = usePathname()
  const isAppRoute = HIDDEN_ON.some(route => pathname.startsWith(route))
  if (isAppRoute) return null

  return (
    <>
      <style>{`
        .footer {
          background: #0F0F0F;
          color: white;
          padding: 56px 40px 36px;
        }
        .footer-inner {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* TOP ROW */
        .footer-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 48px;
          flex-wrap: wrap;
          padding-bottom: 40px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 32px;
        }

        /* BRAND */
        .footer-brand {}
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          margin-bottom: 14px;
        }
        .footer-logo-icon {
          width: 34px;
          height: 34px;
          background: #FF5C1A;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .footer-logo-text {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: white;
        }
        .footer-logo-text span { color: #FF5C1A; }
        .footer-tagline {
          font-size: 14px;
          color: rgba(255,255,255,0.4);
          font-weight: 300;
          max-width: 240px;
          line-height: 1.65;
        }

        /* LINKS GROUPS */
        .footer-links-grid {
          display: flex;
          gap: 60px;
          flex-wrap: wrap;
        }
        .footer-col {}
        .footer-col-title {
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: rgba(255,255,255,0.35);
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .footer-col-links {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .footer-link {
          font-size: 14px;
          color: rgba(255,255,255,0.55);
          text-decoration: none;
          transition: color 0.2s;
          font-weight: 300;
        }
        .footer-link:hover { color: white; }

        /* BOTTOM ROW */
        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .footer-copy {
          font-size: 13px;
          color: rgba(255,255,255,0.25);
        }
        .footer-bottom-links {
          display: flex;
          gap: 20px;
        }
        .footer-bottom-link {
          font-size: 13px;
          color: rgba(255,255,255,0.3);
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-bottom-link:hover { color: white; }

        /* AVAILABILITY BADGE */
        .footer-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(34,197,94,0.12);
          border: 1px solid rgba(34,197,94,0.2);
          color: #22C55E;
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 600;
          padding: 5px 12px;
          border-radius: 100px;
          margin-top: 16px;
        }
        .footer-badge-dot {
          width: 6px;
          height: 6px;
          background: #22C55E;
          border-radius: 50%;
        }

        @media (max-width: 768px) {
          .footer { padding: 40px 20px 28px; }
          .footer-top { gap: 32px; }
          .footer-links-grid { gap: 32px; }
          .footer-bottom { flex-direction: column; align-items: flex-start; gap: 12px; }
        }
      `}</style>

      <footer className="footer">
        <div className="footer-inner">

          <div className="footer-top">

            <div className="footer-brand">
              <Link href="/" className="footer-logo">
                <Image src={Logo} alt="logo" width={50} />
                <span className="footer-logo-text">Fix<span>Mate</span></span>
              </Link>
              <p className="footer-tagline">
                The global marketplace connecting people with verified skilled workers — anywhere in the world.
              </p>
              <div className="footer-badge">
                <span className="footer-badge-dot" />
                Available in 150+ countries
              </div>
            </div>

            {/* Link columns */}
            <div className="footer-links-grid">
              <div className="footer-col">
                <p className="footer-col-title">Platform</p>
                <div className="footer-col-links">
                  <Link href="/explore"            className="footer-link">Explore Workers</Link>
                  <Link href="/assistant"          className="footer-link">AI Assistant</Link>
                  <Link href="/#how-it-works"      className="footer-link">How it Works</Link>
                  <Link href="/register"           className="footer-link">Sign Up</Link>
                  <Link href="/login"              className="footer-link">Log In</Link>
                </div>
              </div>

              <div className="footer-col">
                <p className="footer-col-title">For Workers</p>
                <div className="footer-col-links">
                  <Link href="/register?role=worker"   className="footer-link">Become a Worker</Link>
                  <Link href="/worker/dashboard"       className="footer-link">Worker Dashboard</Link>
                  <Link href="/worker/earnings"        className="footer-link">Earnings</Link>
                  <Link href="/worker/profile"         className="footer-link">Manage Profile</Link>
                </div>
              </div>

              <div className="footer-col">
                <p className="footer-col-title">Company</p>
                <div className="footer-col-links">
                  <Link href="/about"   className="footer-link">About FixMate</Link>
                  <Link href="/contact" className="footer-link">Contact Us</Link>
                  <Link href="/privacy" className="footer-link">Privacy Policy</Link>
                  <Link href="/terms"   className="footer-link">Terms of Service</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copy">
              © {new Date().getFullYear()} FixMate. All rights reserved. Available worldwide.
            </p>
            <div className="footer-bottom-links">
              <Link href="/privacy"    className="footer-bottom-link">Privacy</Link>
              <Link href="/terms"      className="footer-bottom-link">Terms</Link>
              <Link href="/contact"    className="footer-bottom-link">Contact</Link>
              <Link href="/sitemap"    className="footer-bottom-link">Sitemap</Link>
            </div>
          </div>

        </div>
      </footer>
    </>
  )
}