import { describe, expect, it, beforeEach } from 'vitest'
import { createReading } from '../engine/reading'
import {
  buildSavedReadingEntry,
  loadReadingHistory,
  saveReadingHistoryEntry,
} from '../lib/history'

describe('reading history helpers', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('builds history entries and de-duplicates by deterministic id', () => {
    const reading = createReading(
      {
        question: '我现在最适合把力气放在哪里？',
        topic: 'growth',
        spreadId: 'weekly-flow',
      },
      { seed: 'history-seed' },
    )

    const entry = buildSavedReadingEntry(reading, '自我成长', new Date('2026-03-08T08:00:00+08:00'))

    expect(entry.question).toBe('我现在最适合把力气放在哪里？')
    expect(entry.cards).toHaveLength(5)
    expect(entry.summary).not.toContain('�')

    saveReadingHistoryEntry(entry)
    saveReadingHistoryEntry(entry)

    const history = loadReadingHistory()

    expect(history).toHaveLength(1)
    expect(history[0].id).toBe(entry.id)
  })
})
