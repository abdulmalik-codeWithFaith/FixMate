import * as admin from 'firebase-admin'
import {
  onDocumentCreated,
  onDocumentUpdated,
  FirestoreEvent,
  QueryDocumentSnapshot,
  Change,
} from 'firebase-functions/v2/firestore'
import { MulticastMessage } from 'firebase-admin/messaging'

admin.initializeApp()

// ———————————————————————————————
// Types
// ———————————————————————————————

interface JobData {
  status: string
  clientId: string
  artisanId: string
  title: string
  category: string
}

interface UserData {
  fcmToken?: string
  role: 'client' | 'artisan'
  category?: string
}

// ———————————————————————————————
// 1. Notify CLIENT when artisan accepts their job
// ———————————————————————————————

export const onJobAccepted = onDocumentUpdated(
  'jobs/{jobId}',
  async (event: FirestoreEvent<Change<QueryDocumentSnapshot> | undefined>): Promise<void> => {
    if (!event.data) return

    const before = event.data.before.data() as JobData
    const after = event.data.after.data() as JobData

    if (before.status !== 'accepted' && after.status === 'accepted') {
      const clientDoc = await admin.firestore()
        .doc(`users/${after.clientId}`)
        .get()

      const clientData = clientDoc.data() as UserData | undefined
      const fcmToken = clientData?.fcmToken
      if (!fcmToken) return

      await admin.messaging().send({
        token: fcmToken,
        notification: {
          title: '🎉 Job Accepted!',
          body: 'An artisan has accepted your job request.',
        },
        data: {
          url: `/jobs/${event.params.jobId}`,
          jobId: event.params.jobId,
        },
      })
    }
  }
)

// ———————————————————————————————
// 2. Notify ARTISANS when a new job is posted
// ———————————————————————————————

export const onNewJob = onDocumentCreated(
  'jobs/{jobId}',
  async (event: FirestoreEvent<QueryDocumentSnapshot | undefined>): Promise<void> => {
    if (!event.data) return

    const job = event.data.data() as JobData

    const artisansSnap = await admin.firestore()
      .collection('users')
      .where('role', '==', 'artisan')
      .where('category', '==', job.category)
      .get()

    const tokens: string[] = artisansSnap.docs
      .map((doc) => (doc.data() as UserData).fcmToken)
      .filter((token): token is string => Boolean(token))

    if (tokens.length === 0) return

    const message: MulticastMessage = {
      tokens,
      notification: {
        title: '🔧 New Job Available!',
        body: `A client needs help with: ${job.title}`,
      },
      data: {
        url: `/jobs/${event.params.jobId}`,
        jobId: event.params.jobId,
      },
    }

    await admin.messaging().sendEachForMulticast(message)
  }
)

// ———————————————————————————————
// 3. Notify CLIENT when artisan is on the way
// ———————————————————————————————

export const onArtisanOnTheWay = onDocumentUpdated(
  'jobs/{jobId}',
  async (event: FirestoreEvent<Change<QueryDocumentSnapshot> | undefined>): Promise<void> => {
    if (!event.data) return

    const before = event.data.before.data() as JobData
    const after = event.data.after.data() as JobData

    if (before.status !== 'on_the_way' && after.status === 'on_the_way') {
      const clientDoc = await admin.firestore()
        .doc(`users/${after.clientId}`)
        .get()

      const clientData = clientDoc.data() as UserData | undefined
      const fcmToken = clientData?.fcmToken
      if (!fcmToken) return

      await admin.messaging().send({
        token: fcmToken,
        notification: {
          title: '🚗 Artisan On The Way!',
          body: 'Your artisan is heading to your location.',
        },
        data: {
          url: `/jobs/${event.params.jobId}`,
          jobId: event.params.jobId,
        },
      })
    }
  }
)

// ———————————————————————————————
// 4. Notify CLIENT when job is completed
// ———————————————————————————————

export const onJobCompleted = onDocumentUpdated(
  'jobs/{jobId}',
  async (event: FirestoreEvent<Change<QueryDocumentSnapshot> | undefined>): Promise<void> => {
    if (!event.data) return

    const before = event.data.before.data() as JobData
    const after = event.data.after.data() as JobData

    if (before.status !== 'completed' && after.status === 'completed') {
      const clientDoc = await admin.firestore()
        .doc(`users/${after.clientId}`)
        .get()

      const clientData = clientDoc.data() as UserData | undefined
      const fcmToken = clientData?.fcmToken
      if (!fcmToken) return

      await admin.messaging().send({
        token: fcmToken,
        notification: {
          title: '✅ Job Completed!',
          body: 'Your job has been completed. Please leave a review.',
        },
        data: {
          url: `/jobs/${event.params.jobId}/review`,
          jobId: event.params.jobId,
        },
      })
    }
  }
)