import { describe, expect, it } from 'vitest'
import { CARD_BY_ID } from '../data/cards'
import { SPREADS } from '../data/spreads'
import { createReading, drawCards } from '../engine/reading'
import { createSeededRandom } from '../engine/random'

const sequenceRandom = (...values: number[]) => {
  let index = 0

  return () => {
    const value = values[index] ?? values[values.length - 1] ?? 0
    index += 1
    return value
  }
}

describe('tarot reading engine', () => {
  it('draws unique cards with stable seeded output', () => {
    const spread = SPREADS.find((entry) => entry.id === 'past-present-future')
    expect(spread).toBeDefined()

    const first = drawCards(spread!, createSeededRandom('stable-seed'))
    const second = drawCards(spread!, createSeededRandom('stable-seed'))

    expect(first).toEqual(second)
    expect(first).toHaveLength(spread!.cardCount)
    expect(new Set(first.map((entry) => entry.cardId)).size).toBe(spread!.cardCount)
    expect(
      first.every(
        (entry) => entry.orientation === 'up' || entry.orientation === 'down',
      ),
    ).toBe(true)
  })

  it('builds complete readings for all supported spreads', () => {
    for (const spread of SPREADS) {
      const reading = createReading(
        {
          question: '我现在最该调整的方向是什么？',
          topic: 'growth',
          spreadId: spread.id,
        },
        { seed: `seed-${spread.id}` },
      )

      expect(reading.cards).toHaveLength(spread.cardCount)
      expect(reading.positionReadings).toHaveLength(spread.cardCount)
      expect(reading.summary.length).toBeGreaterThan(10)
      expect(reading.advice.length).toBeGreaterThan(0)
      expect(reading.actionPlan).toHaveLength(3)
      expect(reading.actionPlan.every((entry) => entry.title.length > 0)).toBe(true)
      expect(reading.dominantSignals.length).toBeGreaterThan(1)
    }
  })

  it('reflects topic, major arcana, dominant suit, and reversed cards in the summary', () => {
    const reading = createReading(
      {
        question: '这段关系是否值得继续投入？',
        topic: 'love',
        spreadId: 'past-present-future',
      },
      {
        random: sequenceRandom(0, 0.9, 35 / 77, 0.1, 35 / 76, 0.2),
      },
    )

    expect(reading.summary).toContain('爱情')
    expect(reading.summary).toContain('大阿尔卡那')
    expect(reading.summary).toContain('圣杯能量最浓')
    expect(reading.summary).toContain('逆位偏多')
  })

  it('keeps core card copy readable in Chinese', () => {
    expect(CARD_BY_ID['the-fool'].nameZh).toBe('愚者')
    expect(CARD_BY_ID['the-magician'].meaning.up).toContain('想法变成现实')
    expect(CARD_BY_ID['the-fool'].nameZh).not.toContain('�')
    expect(CARD_BY_ID['the-magician'].meaning.down).not.toContain('�')
  })
})
