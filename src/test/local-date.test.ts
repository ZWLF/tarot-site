import { describe, expect, it } from 'vitest'
import {
  buildLocalDateKey,
  formatLocalFileDate,
  getMillisecondsUntilNextLocalDay,
} from '../lib/localDate'

describe('local date helpers', () => {
  it('builds a stable local date key from local calendar values', () => {
    const date = new Date(2026, 2, 8, 0, 30, 0)

    expect(buildLocalDateKey(date)).toBe('2026-03-08')
    expect(formatLocalFileDate(date)).toBe('2026-03-08')
  })

  it('computes the remaining time until the next local day boundary', () => {
    const date = new Date(2026, 2, 8, 23, 59, 30, 0)

    expect(getMillisecondsUntilNextLocalDay(date)).toBe(30_000)
  })
})
