import { google } from 'googleapis'
import { eq } from 'drizzle-orm'
import { db } from '../db/index'
import { oauthTokens } from '../db/schema'

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GMAIL_CALLBACK_URL ?? 'http://localhost:3000/api/auth/gmail/callback'
  )
}

export async function getAuthenticatedClient() {
  const oauth2Client = getOAuth2Client()

  const [token] = await db
    .select()
    .from(oauthTokens)
    .where(eq(oauthTokens.provider, 'gmail'))

  if (!token) throw new Error('Gmail not connected')

  oauth2Client.setCredentials({
    access_token: token.accessToken,
    refresh_token: token.refreshToken,
    expiry_date: token.expiresAt.getTime(),
  })

  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.access_token) {
      await db
        .update(oauthTokens)
        .set({
          accessToken: tokens.access_token,
          expiresAt: new Date(tokens.expiry_date ?? Date.now() + 3_600_000),
        })
        .where(eq(oauthTokens.provider, 'gmail'))
    }
  })

  return oauth2Client
}

export function isGmailConfigured() {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
}
