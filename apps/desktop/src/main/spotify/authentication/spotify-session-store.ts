import { readFile, rename, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { app, safeStorage } from 'electron'

import { spotifyTokenSessionSchema, type SpotifyTokenSession } from './spotify-token-session'

const sessionFileName = 'spotify-session.enc'

function getSessionFilePath(): string {
  return join(app.getPath('userData'), sessionFileName)
}

function assertEncryptionAvailable(): void {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('O armazenamento seguro do sistema operacional não está disponível.')
  }
}

export class SpotifySessionStore {
  static async read(): Promise<SpotifyTokenSession | null> {
    let encryptedSession: string

    try {
      encryptedSession = await readFile(getSessionFilePath(), 'utf8')
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
      throw error
    }

    assertEncryptionAvailable()

    try {
      const decryptedSession = safeStorage.decryptString(Buffer.from(encryptedSession, 'base64'))
      return spotifyTokenSessionSchema.parse(JSON.parse(decryptedSession))
    } catch {
      await this.clear()
      return null
    }
  }

  static async write(session: SpotifyTokenSession): Promise<void> {
    assertEncryptionAvailable()
    const sessionFilePath = getSessionFilePath()
    const temporaryFilePath = `${sessionFilePath}.tmp`
    const encryptedSession = safeStorage.encryptString(JSON.stringify(session)).toString('base64')

    await writeFile(temporaryFilePath, encryptedSession, {
      encoding: 'utf8',
      mode: 0o600
    })
    await rename(temporaryFilePath, sessionFilePath)
  }

  static async clear(): Promise<void> {
    await rm(getSessionFilePath(), { force: true })
  }
}
