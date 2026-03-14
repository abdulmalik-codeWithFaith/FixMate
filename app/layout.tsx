import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
// import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'FixMate — Find Skilled Workers Near You',
  description: 'The global marketplace connecting clients with verified plumbers, electricians, carpenters and more. Book skilled artisans near you in minutes.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* <Navbar /> */}
        <main>{children}</main>

        <footer style={{
          background: '#0F0F0F',
          color: 'white',
          padding: '48px 40px 32px',
          display: 'flex',
          flexWrap: 'wrap' as const,
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
        }}>
          <style>{`
            .footer-link {
              color: rgba(255,255,255,0.4);
              font-size: 14px;
              text-decoration: none;
              transition: color 0.2s;
            }
            .footer-link:hover { color: white; }
          `}</style>

          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700 }}>
            Fix<span style={{ color: '#FF5C1A' }}>Mate</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '24px' }}>
            {[
              { label: 'Explore Workers', href: '/explore' },
              { label: 'AI Assistant', href: '/assistant' },
              { label: 'Become a Worker', href: '/register' },
              { label: 'Privacy', href: '/privacy' },
              { label: 'Terms', href: '/terms' },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="footer-link">
                {link.label}
              </Link>
            ))}
          </div>

          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>
            © {new Date().getFullYear()} FixMate. All rights reserved. Available worldwide.
          </p>
        </footer>
      </body>
    </html>
  )
}