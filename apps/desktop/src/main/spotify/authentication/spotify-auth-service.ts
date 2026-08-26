import { shell } from 'electron'

import type { SpotifySessionState } from '../../../contracts/music-display-api'
import { getSpotifyEnvironment } from '../../config/spotify-environment'
import { SpotifyAccountsClient, SpotifyAccountsError } from './spotify-accounts-client'
import { waitForSpotifyAuthorizationCode } from './spotify-authorization-callback'
import { createSpotifyAuthorizationUrl, createSpotifyPkceAuthorization } from './spotify-pkce'
import { hasRequiredSpotifyAuthorizationScopes } from './spotify-scopes'
import { SpotifySessionStore } from './spotify-session-store'
import type { SpotifyTokenSession } from './spotify-token-session'

const accessTokenRefreshBufferMs = 60 * 1000

function authenticatedSession(): SpotifySessionState {
  return { status: 'authenticated' }
}

function unauthenticatedSession(): SpotifySessionState {
  return { status: 'unauthenticated' }
}

export class SpotifyAuthService {
  private static loginPromise: Promise<SpotifySessionState> | null = null

  static async getSession(): Promise<SpotifySessionState> {
    const tokenSession = await this.getValidTokenSession()
    return tokenSession ? authenticatedSession() : unauthenticatedSession()
  }

  static async getAccessToken(): Promise<string | null> {
    const tokenSession = await this.getValidTokenSession()
    return tokenSession?.accessToken ?? null
  }

  static login(): Promise<SpotifySessionState> {
    this.loginPromise ??= this.performLogin().finally(() => {
      this.loginPromise = null
    })

    return this.loginPromise
  }

  static async logout(): Promise<SpotifySessionState> {
    await SpotifySessionStore.clear()
    return unauthenticatedSession()
  }

  private static async performLogin(): Promise<SpotifySessionState> {
    const environment = getSpotifyEnvironment()
    const authorization = createSpotifyPkceAuthorization()
    const authorizationUrl = createSpotifyAuthorizationUrl(environment, authorization)
    const code = await waitForSpotifyAuthorizationCode({
      redirectUri: environment.redirectUri,
      expectedState: authorization.state,
      onListening: () => shell.openExternal(authorizationUrl.toString())
    })
    const token = await SpotifyAccountsClient.exchangeAuthorizationCode({
      clientId: environment.clientId,
      code,
      codeVerifier: authorization.codeVerifier,
      redirectUri: environment.redirectUri
    })

    if (!token.refreshToken) {
      throw new Error('O Spotify não retornou um refresh token.')
    }

    const authorizedAt = Date.now()
    await SpotifySessionStore.write({
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      accessTokenExpiresAt: authorizedAt + token.expiresInSeconds * 1000,
      authorizedAt,
      scope: token.scope
    })

    return authenticatedSession()
  }

  private static async getValidTokenSession(): Promise<SpotifyTokenSession | null> {
    const tokenSession = await SpotifySessionStore.read()

    if (!tokenSession) return null

    if (!hasRequiredSpotifyAuthorizationScopes(tokenSession.scope)) {
      await SpotifySessionStore.clear()
      return null
    }

    if (tokenSession.accessTokenExpiresAt > Date.now() + accessTokenRefreshBufferMs) {
      return tokenSession
    }

    try {
      return await this.refreshSession(tokenSession)
    } catch (error) {
      if (error instanceof SpotifyAccountsError && error.code === 'invalid_grant') {
        await SpotifySessionStore.clear()
        return null
      }

      throw error
    }
  }

  private static async refreshSession(session: SpotifyTokenSession): Promise<SpotifyTokenSession> {
    const environment = getSpotifyEnvironment()
    const token = await SpotifyAccountsClient.refreshAccessToken({
      clientId: environment.clientId,
      refreshToken: session.refreshToken
    })

    const refreshedSession: SpotifyTokenSession = {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken ?? session.refreshToken,
      accessTokenExpiresAt: Date.now() + token.expiresInSeconds * 1000,
      authorizedAt: session.authorizedAt,
      scope: token.scope || session.scope
    }

    await SpotifySessionStore.write(refreshedSession)
    return refreshedSession
  }
}
