import { describe, expect, it } from 'vitest'
import { createDailyReading, buildDailySeed } from '../lib/daily'

describe('daily tarot helpers', () => {
  it('creates a stable daily seed for the same date', () => {
    const date = new Date('2026-03-08T08:00:00+08:00')

    expect(buildDailySeed(date)).toBe('daily-2026-03-08')
  })

  it('returns the same daily reading for the same date', () => {
    const date = new Date('2026-03-08T08:00:00+08:00')

    const first = createDailyReading(date)
    const second = createDailyReading(date)

    expect(first).toEqual(second)
    expect(first.spread.id).toBe('daily-energy')
    expect(first.cards).toHaveLength(1)
  })
})
