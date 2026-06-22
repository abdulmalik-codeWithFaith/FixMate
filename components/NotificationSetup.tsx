'use client'

import { useEffect } from 'react'
import { getToken, onMessage, Messaging } from 'firebase/messaging'
import { doc, setDoc } from 'firebase/firestore'
import { messaging, db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { User } from 'firebase/auth'

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY as string

export default function NotificationSetup(): null {
  const { user }: { user: User | null } = useAuth()

  useEffect(() => {
    if (!user || !messaging) return

    const setupNotifications = async (): Promise<void> => {
      try {
        const permission: NotificationPermission = await Notification.requestPermission()
        if (permission !== 'granted') return

        const token: string = await getToken(messaging as Messaging, {
          vapidKey: VAPID_KEY,
        })

        if (token) {
          await setDoc(
            doc(db, 'users', user.uid),
            { fcmToken: token, updatedAt: new Date() },
            { merge: true }
          )
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Notification setup error:', error.message)
        }
      }
    }

    setupNotifications()

    // Handle foreground notifications (app is open)
    const unsubscribe = onMessage(messaging as Messaging, (payload) => {
      console.log('Foreground message received:', payload.notification?.title)
      // You can show a toast here e.g. toast.success(payload.notification?.title)
    })

    return () => unsubscribe()
  }, [user])

  return null
}