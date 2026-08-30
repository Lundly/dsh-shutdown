/** Browser prefs and closed-page state shared by the Shutdown header action and its settings row. */

import { createSnapshotStore, type SnapshotStore } from '@deepseek-ai/dsh-client-store'

/** localStorage key carrying the "don't ask again" preference. */
const STORAGE_KEY = 'dsh-shutdown.confirmDisabled'

/** dsh-shutdown shared UI state: persistent preference plus ephemeral closed-page flag. */
export interface ShutdownPrefsState {
  /** Once true, closing dsh skips the confirmation dialog. */
  readonly confirmDisabled: boolean
  /** Once true, the page renders the "dsh has shut down" overlay. */
  readonly closed: boolean
}

/** Wrap a localStorage read so an unavailable or denied store degrades to "ask again". */
function readConfirmDisabled(): boolean {
  try {
    return globalThis.localStorage?.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

/** Persist the preference, silencing storage write failures. */
function writeConfirmDisabled(value: boolean): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, String(value))
  } catch {
    // Storage may be unavailable (private mode, quota); the in-memory flag rules this tab.
  }
}

/** Owns the shared shutdown UI state (prefs + closed flag) and its storage side effects. */
export class ShutdownPrefsController {
  /** uSES-safe state source shared by every contribution. */
  readonly store: SnapshotStore<ShutdownPrefsState> = createSnapshotStore<ShutdownPrefsState>({
    confirmDisabled: readConfirmDisabled(),
    closed: false,
  })

  /** Whether the confirmation dialog is currently skipped. */
  confirmDisabled(): boolean {
    return this.store.getSnapshot().confirmDisabled
  }

  /** Set the persistent "don't ask again" preference. @param value - new preference. */
  setConfirmDisabled(value: boolean): void {
    writeConfirmDisabled(value)
    this.store.update(state => ({ ...state, confirmDisabled: value }))
  }

  /** Mark the page as shut down so the overlay renders when the tab does not close. */
  markClosed(): void {
    this.store.update(state => ({ ...state, closed: true }))
  }
}
