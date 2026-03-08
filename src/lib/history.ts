import type { SavedReadingEntry } from '../domain/history'
import type { ReadingResult } from '../domain/tarot'

const HISTORY_STORAGE_KEY = 'ukiyo-tarot:reading-history'
const MAX_HISTORY_ENTRIES = 12

const isBrowser = () => typeof window !== 'undefined'

const hashContent = (value: string) => {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }

  return hash.toString(36)
}

export const buildSavedReadingEntry = (
  reading: ReadingResult,
  topicLabel: string,
  now: Date = new Date(),
): SavedReadingEntry => {
  const fingerprint = [
    reading.input.question.trim(),
    reading.input.topic,
    reading.spread.id,
    reading.spread.activeVariantId ?? '',
    ...reading.cards.map(
      (entry) =>
        `${entry.drawn.positionKey}:${entry.card.id}:${entry.drawn.orientation}`,
    ),
  ].join('|')

  return {
    id: `reading-${hashContent(fingerprint)}`,
    createdAt: now.toISOString(),
    question: reading.input.question,
    topicId: reading.input.topic,
    topicLabel,
    spreadId: reading.spread.id,
    spreadTitle: reading.spread.title,
    tone: reading.tone,
    summary: reading.summary,
    advice: [...reading.advice],
    dominantSignals: [...reading.dominantSignals],
    cards: reading.cards.map((entry) => ({
      positionLabel: entry.positionLabel,
      cardName: entry.card.nameZh,
      orientation: entry.drawn.orientation,
    })),
  }
}

export const loadReadingHistory = (): SavedReadingEntry[] => {
  if (!isBrowser()) {
    return []
  }

  const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY)

  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw)

    return Array.isArray(parsed) ? (parsed as SavedReadingEntry[]) : []
  } catch {
    return []
  }
}

export const saveReadingHistoryEntry = (entry: SavedReadingEntry) => {
  if (!isBrowser()) {
    return []
  }

  const nextHistory = [
    entry,
    ...loadReadingHistory().filter((item) => item.id !== entry.id),
  ].slice(0, MAX_HISTORY_ENTRIES)

  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(nextHistory))

  return nextHistory
}

export const clearReadingHistory = () => {
  if (!isBrowser()) {
    return
  }

  window.localStorage.removeItem(HISTORY_STORAGE_KEY)
}
