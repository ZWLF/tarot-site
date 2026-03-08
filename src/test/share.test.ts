import { describe, expect, it } from 'vitest'
import { createReading } from '../engine/reading'
import { buildReadingPosterSvg, buildReadingShareText } from '../lib/share'

describe('share helpers', () => {
  it('builds readable share text', () => {
    const reading = createReading(
      {
        question: '我该怎样推进关系？',
        topic: 'love',
        spreadId: 'holy-triangle',
        variantId: 'timeline',
      },
      { seed: 'share-text' },
    )

    const text = buildReadingShareText(reading, '爱情')

    expect(text).toContain('浮世占')
    expect(text).toContain('圣三角')
    expect(text).toContain('爱情')
  })

  it('builds an svg poster payload', () => {
    const reading = createReading(
      {
        question: '这个月该重点关注什么？',
        topic: 'general',
        spreadId: 'monthly-five',
      },
      { seed: 'poster' },
    )

    const svg = buildReadingPosterSvg({
      title: '月度海报',
      question: reading.input.question,
      spreadTitle: reading.spread.title,
      summary: reading.summary,
      cards: reading.cards.map((entry) => ({
        label: entry.positionLabel,
        cardName: entry.card.nameZh,
        orientation: entry.drawn.orientation,
      })),
    })

    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg).toContain('月度海报')
    expect(svg).toContain(reading.cards[0].card.nameZh)
  })
})
