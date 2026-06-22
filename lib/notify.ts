interface NotifyPayload {
  type: 'job_accepted' | 'new_job' | 'on_the_way' | 'job_completed'
  jobId: string
  clientId?: string
  category?: string
  jobTitle?: string
}

export async function sendNotification(payload: NotifyPayload): Promise<void> {
  try {
    await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Failed to send notification:', error.message)
    }
  }
}