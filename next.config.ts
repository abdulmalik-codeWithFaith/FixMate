import withPWAInit from 'next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  publicExcludes: ['!firebase-messaging-sw.js'],
})

const nextConfig = {
  turbopack: {}, // silences the turbopack/webpack conflict error
}

export default withPWA(nextConfig)