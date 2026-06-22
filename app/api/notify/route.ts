import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminMessaging } from '@/lib/firebaseAdmin'
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'

interface NotifyRequest {
  type: 'job_accepted' | 'new_job' | 'on_the_way' | 'job_completed'
  jobId: string
  clientId?: string
  category?: string
  jobTitle?: string
}

interface UserData {
  fcmToken?: string
  role: 'client' | 'artisan'
  category?: string
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as NotifyRequest
    const { type, jobId, clientId, category, jobTitle } = body

    switch (type) {

      case 'job_accepted': {
        const clientDoc = await adminDb.doc(`users/${clientId}`).get()
        const fcmToken = (clientDoc.data() as UserData | undefined)?.fcmToken
        if (!fcmToken) break

        await adminMessaging.send({
          token: fcmToken,
          notification: {
            title: '🎉 Job Accepted!',
            body: 'An artisan has accepted your job request.',
          },
          data: { url: `/jobs/${jobId}`, jobId },
        })
        break
      }

      case 'new_job': {
        const artisansSnap = await adminDb
          .collection('users')
          .where('role', '==', 'artisan')
          .where('category', '==', category)
          .get()

        const tokens: string[] = artisansSnap.docs
          .map((d: QueryDocumentSnapshot) => (d.data() as UserData).fcmToken)
          .filter((token): token is string => Boolean(token))

        if (tokens.length === 0) break

        await adminMessaging.sendEachForMulticast({
          tokens,
          notification: {
            title: '🔧 New Job Available!',
            body: `A client needs help with: ${jobTitle}`,
          },
          data: { url: `/jobs/${jobId}`, jobId },
        })
        break
      }

      case 'on_the_way': {
        const clientDoc = await adminDb.doc(`users/${clientId}`).get()
        const fcmToken = (clientDoc.data() as UserData | undefined)?.fcmToken
        if (!fcmToken) break

        await adminMessaging.send({
          token: fcmToken,
          notification: {
            title: '🚗 Artisan On The Way!',
            body: 'Your artisan is heading to your location.',
          },
          data: { url: `/jobs/${jobId}`, jobId },
        })
        break
      }

      case 'job_completed': {
        const clientDoc = await adminDb.doc(`users/${clientId}`).get()
        const fcmToken = (clientDoc.data() as UserData | undefined)?.fcmToken
        if (!fcmToken) break

        await adminMessaging.send({
          token: fcmToken,
          notification: {
            title: '✅ Job Completed!',
            body: 'Your job has been completed. Please leave a review.',
          },
          data: { url: `/jobs/${jobId}/review`, jobId },
        })
        break
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    return NextResponse.json({ success: true })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}