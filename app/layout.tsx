import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FixMate — Find Skilled Workers Near You',
  description:
    'The global marketplace connecting clients with verified plumbers, electricians, carpenters and more. Book skilled artisans near you in minutes.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}