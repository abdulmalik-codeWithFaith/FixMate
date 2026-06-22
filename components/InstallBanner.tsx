'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallBanner(): React.ReactElement | null {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState<boolean>(false)
  const [isInstalled, setIsInstalled] = useState<boolean>(false)

  useEffect(() => {
    // Don't show if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Don't show if user already dismissed
    const dismissed = localStorage.getItem('pwa-banner-dismissed')
    if (dismissed) return

    const handler = (e: Event): void => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async (): Promise<void> => {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setShowBanner(false)
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = (): void => {
    setShowBanner(false)
    localStorage.setItem('pwa-banner-dismissed', 'true')
  }

  if (isInstalled || !showBanner) return null

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-50
        transform transition-transform duration-500 ease-in-out
        ${showBanner ? 'translate-y-0' : 'translate-y-full'}
      `}
    >
      {/* Backdrop blur edge */}
      <div className="bg-white border-t border-gray-200 shadow-2xl rounded-t-2xl px-5 pt-5 pb-8">

        {/* Drag handle */}
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

        <div className="flex items-center gap-4">
          {/* App Icon */}
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md flex-shrink-0">
            <Image
              src="/icons/icon-192x192.png"
              alt="FixMate"
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Text */}
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900">Add FixMate to Home Screen</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Get instant access to skilled artisans near you.
            </p>
          </div>

          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 self-start"
            aria-label="Dismiss"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Install Button */}
        <button
          onClick={handleInstall}
          className="mt-4 w-full bg-black text-white font-semibold text-sm py-3.5 rounded-xl hover:bg-gray-800 active:scale-95 transition-all duration-200"
        >
          Add to Home Screen
        </button>

        {/* iOS hint */}
        <p className="text-center text-xs text-gray-400 mt-3">
          On iPhone? Tap <span className="font-medium">Share</span> → <span className="font-medium">Add to Home Screen</span>
        </p>
      </div>
    </div>
  )
}