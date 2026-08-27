export interface SyncedLyricsLine {
  startTimeMs: number
  text: string
}

export type LyricsDisplayState =
  | { status: 'idle'; plainLines: readonly []; syncedLines: readonly [] }
  | { status: 'loading'; plainLines: readonly []; syncedLines: readonly [] }
  | { status: 'error'; errorMessage: string; plainLines: readonly []; syncedLines: readonly [] }
  | { status: 'not-found'; plainLines: readonly []; syncedLines: readonly [] }
  | { status: 'instrumental'; plainLines: readonly []; syncedLines: readonly [] }
  | { status: 'plain'; plainLines: readonly string[]; syncedLines: readonly [] }
  | { status: 'synced'; plainLines: readonly string[]; syncedLines: readonly SyncedLyricsLine[] }
