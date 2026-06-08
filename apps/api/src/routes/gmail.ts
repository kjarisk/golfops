import type { FastifyInstance } from 'fastify'
import { google } from 'googleapis'
import { eq } from 'drizzle-orm'
import { db } from '../db/index'
import { oauthTokens } from '../db/schema'
import { getOAuth2Client, getAuthenticatedClient, isGmailConfigured } from '../lib/gmail'

export async function gmailRoutes(app: FastifyInstance) {
  app.get('/api/auth/gmail/status', async () => {
    if (!isGmailConfigured()) return { connected: false, configured: false }
    const [token] = await db
      .select({ id: oauthTokens.id })
      .from(oauthTokens)
      .where(eq(oauthTokens.provider, 'gmail'))
    return { connected: !!token, configured: true }
  })

  app.get('/api/auth/gmail', async (_request, reply) => {
    if (!isGmailConfigured()) {
      return reply.status(501).send({ error: 'GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set' })
    }
    const oauth2Client = getOAuth2Client()
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
      ],
      prompt: 'consent',
    })
    return reply.redirect(authUrl)
  })

  app.get('/api/auth/gmail/callback', async (request, reply) => {
    const { code } = request.query as { code?: string; error?: string }
    if (!code) return reply.redirect('/drafts?gmailError=access_denied')

    const oauth2Client = getOAuth2Client()
    const { tokens } = await oauth2Client.getToken(code)

    await db
      .insert(oauthTokens)
      .values({
        provider: 'gmail',
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token!,
        expiresAt: new Date(tokens.expiry_date ?? Date.now() + 3_600_000),
      })
      .onConflictDoUpdate({
        target: oauthTokens.provider,
        set: {
          accessToken: tokens.access_token!,
          ...(tokens.refresh_token ? { refreshToken: tokens.refresh_token } : {}),
          expiresAt: new Date(tokens.expiry_date ?? Date.now() + 3_600_000),
        },
      })

    return reply.redirect('/drafts')
  })

  app.get('/api/gmail/threads', async (_request, reply) => {
    try {
      const auth = await getAuthenticatedClient()
      const gmail = google.gmail({ version: 'v1', auth })

      const { data } = await gmail.users.threads.list({
        userId: 'me',
        q: 'is:inbox',
        maxResults: 20,
      })

      const threads = await Promise.all(
        (data.threads ?? []).map(async (thread) => {
          const { data: t } = await gmail.users.threads.get({
            userId: 'me',
            id: thread.id!,
            format: 'metadata',
            metadataHeaders: ['Subject', 'From', 'Date'],
          })
          const headers = t.messages?.[0]?.payload?.headers ?? []
          const get = (name: string) =>
            headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? ''
          return {
            id: thread.id,
            subject: get('Subject') || '(no subject)',
            from: get('From'),
            date: get('Date'),
            messageCount: t.messages?.length ?? 0,
          }
        })
      )

      return threads
    } catch (err) {
      if ((err as Error).message === 'Gmail not connected') {
        return reply.status(401).send({ error: 'Gmail not connected' })
      }
      throw err
    }
  })
}
