import type { SavedReadingRecord } from '../domain/tarot'

const SAVED_READINGS_KEY = 'ukiyo-tarot.saved-readings'
const GUIDE_DISMISSED_KEY = 'ukiyo-tarot.guide-dismissed'

const canUseStorage = () => typeof window !== 'undefined' && window.localStorage !== undefined

const readJson = <T>(key: string, fallback: T) => {
  if (!canUseStorage()) {
    return fallback
  }

  try {
    const rawValue = window.localStorage.getItem(key)

    if (!rawValue) {
      return fallback
    }

    return JSON.parse(rawValue) as T
  } catch {
    return fallback
  }
}

const writeJson = (key: string, value: unknown) => {
  if (!canUseStorage()) {
    return
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore write failures from unavailable or full storage.
  }
}

export const loadSavedReadings = () =>
  readJson<SavedReadingRecord[]>(SAVED_READINGS_KEY, [])

export const storeSavedReadings = (records: SavedReadingRecord[]) => {
  writeJson(SAVED_READINGS_KEY, records)
}

export const loadGuideDismissed = () =>
  readJson<boolean>(GUIDE_DISMISSED_KEY, false)

export const storeGuideDismissed = (value: boolean) => {
  writeJson(GUIDE_DISMISSED_KEY, value)
}
