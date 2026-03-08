import { describe, expect, it } from 'vitest'
import { buildDailySeed, createDailyReading, formatDailyLabel } from '../lib/daily'

describe('daily tarot helpers', () => {
  it('creates a stable daily seed for the same date', () => {
    const date = new Date('2026-03-08T08:00:00+08:00')

    expect(buildDailySeed(date)).toBe('daily-2026-03-08')
  })

  it('returns the same reading for the same date', () => {
    const date = new Date('2026-03-08T08:00:00+08:00')

    expect(createDailyReading(date)).toEqual(createDailyReading(date))
  })

  it('formats the daily label in Chinese', () => {
    const date = new Date('2026-03-08T08:00:00+08:00')

    expect(formatDailyLabel(date)).toContain('3月')
  })
})
