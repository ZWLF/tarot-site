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

  it('supports up-only orientation mode', () => {
    const reading = createReading(
      {
        question: '本次只看正位信息',
        topic: 'general',
        spreadId: 'celtic-cross',
      },
      { seed: 'up-only-test', orientationMode: 'up-only' },
    )

    expect(reading.cards.length).toBeGreaterThan(0)
    expect(reading.cards.every((entry) => entry.drawn.orientation === 'up')).toBe(true)
  })

  it('softens deterministic language for sensitive queries', () => {
    const reading = createReading(
      {
        question: '我会不会因为这个病很快去世？',
        topic: 'general',
        spreadId: 'holy-triangle',
      },
      { seed: 'sensitive-query' },
    )

    expect(reading.interpretation.softenedForSafety).toBe(true)
    expect(reading.interpretation.queryFlags.length).toBeGreaterThan(0)
    expect(reading.summary).toContain('塔罗更适合帮助你看清状态与行动选项')
    expect(reading.interpretation.ruleHits).toContain('R_VAL_SOFTEN')
  })

  it('detects elemental conflicts and marks related positions', () => {
    const reading = createReading(
      {
        question: '这个月该重点关注什么？',
        topic: 'general',
        spreadId: 'monthly-five',
      },
      { seed: 'element-conflict' },
    )

    expect(reading.interpretation.elementalDynamics.conflicts.length).toBeGreaterThan(0)
    expect(reading.interpretation.ruleHits).toContain('R_ELM_01')
    expect(
      reading.positionReadings.some((entry) => entry.ruleTags?.includes('Conflict')),
    ).toBe(true)
  })

  it('marks reversed cards as internalized dynamics instead of direct negation', () => {
    const reading = createReading(
      {
        question: '我该如何调整当前状态？',
        topic: 'growth',
        spreadId: 'holy-triangle',
      },
      { seed: 'reverse-marking' },
    )

    const reversedReadings = reading.positionReadings.filter(
      (entry) => entry.orientation === 'down',
    )

    expect(reversedReadings.length).toBeGreaterThan(0)
    expect(
      reversedReadings.every((entry) => entry.ruleTags?.includes('Internalized')),
    ).toBe(true)
  })

  it('reweights summary focus by domain topic', () => {
    const loveReading = createReading(
      {
        question: '我该如何推进这段关系？',
        topic: 'love',
        spreadId: 'holy-triangle',
      },
      { seed: 'domain-focus' },
    )
    const careerReading = createReading(
      {
        question: '我该如何推进这段关系？',
        topic: 'career',
        spreadId: 'holy-triangle',
      },
      { seed: 'domain-focus' },
    )

    expect(loveReading.summary).not.toBe(careerReading.summary)
    expect(loveReading.summary).toContain('沟通质量与边界表达')
    expect(careerReading.summary).toContain('目标与标准')
  })
})
