import { describe, expect, it } from 'vitest'
import { SPREADS } from '../data/spreads'
import { createReading } from '../engine/reading'

describe('tarot reading engine', () => {
  it('supports holy triangle variants with different position labels', () => {
    const timeline = createReading(
      {
        question: '我接下来该怎样推进关系？',
        topic: 'love',
        spreadId: 'holy-triangle',
        variantId: 'timeline',
      },
      { seed: 'holy-triangle-timeline' },
    )
    const diagnostic = createReading(
      {
        question: '我接下来该怎样推进关系？',
        topic: 'love',
        spreadId: 'holy-triangle',
        variantId: 'diagnostic',
      },
      { seed: 'holy-triangle-diagnostic' },
    )

    expect(timeline.cards).toHaveLength(3)
    expect(timeline.positionReadings.map((entry) => entry.label)).toEqual([
      '过去',
      '现在',
      '未来',
    ])

    expect(diagnostic.cards).toHaveLength(3)
    expect(diagnostic.positionReadings.map((entry) => entry.label)).toEqual([
      '现状',
      '阻碍',
      '建议',
    ])
  })

  it('enforces card pool rules for monthly and seasonal spreads', () => {
    const monthly = createReading(
      {
        question: '这个月我该关注什么？',
        topic: 'general',
        spreadId: 'monthly-five',
      },
      { seed: 'monthly-five' },
    )
    const seasonal = createReading(
      {
        question: '未来一个季度会怎么发展？',
        topic: 'growth',
        spreadId: 'seasonal-cross',
      },
      { seed: 'seasonal-five' },
    )

    expect(monthly.cards).toHaveLength(5)
    expect(monthly.cards[0].card.arcana).toBe('major')
    expect(monthly.cards.slice(1).map((entry) => entry.card.suit)).toEqual([
      'wands',
      'cups',
      'swords',
      'pentacles',
    ])

    expect(seasonal.cards).toHaveLength(5)
    expect(seasonal.cards[0].card.arcana).toBe('major')
    expect(seasonal.cards.slice(1).map((entry) => entry.card.suit)).toEqual([
      'wands',
      'cups',
      'swords',
      'pentacles',
    ])
  })

  it('builds all supported spreads with correct counts and unique cards', () => {
    for (const spread of SPREADS) {
      const reading = createReading(
        {
          question: `测试牌阵 ${spread.title}`,
          topic: 'career',
          spreadId: spread.id,
          variantId: spread.variants?.[0]?.id,
        },
        { seed: `spread-${spread.id}` },
      )

      expect(reading.cards).toHaveLength(spread.cardCount)
      expect(reading.positionReadings).toHaveLength(spread.cardCount)
      expect(new Set(reading.cards.map((entry) => entry.card.id)).size).toBe(
        spread.cardCount,
      )
      expect(reading.summary.length).toBeGreaterThan(10)
      expect(reading.actionPlan).toHaveLength(3)
    }
  })

  it('exposes the new layout ids for large spreads', () => {
    expect(
      SPREADS.map((entry) => [entry.id, entry.layoutId]),
    ).toEqual(
      expect.arrayContaining([
        ['holy-triangle', 'line-3'],
        ['monthly-five', 'cross-5'],
        ['seasonal-cross', 'cross-5'],
        ['celtic-cross', 'celtic-cross'],
        ['zodiac-wheel', 'zodiac-wheel'],
        ['tree-of-life', 'tree-of-life'],
      ]),
    )
  })
})
